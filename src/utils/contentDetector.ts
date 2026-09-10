import type { ContentBoundingBox, ContentDetectionSettings, FrameSettings, TransformState } from '../types';

/**
 * Scans an HTMLImageElement or ImageBitmap to find the bounding box of non-background content
 */
export async function detectContentBoundingBox(
  imageSource: HTMLImageElement | ImageBitmap | HTMLCanvasElement,
  settings: ContentDetectionSettings
): Promise<ContentBoundingBox | null> {
  const origW = imageSource.width;
  const origH = imageSource.height;

  // Downscale for fast pixel processing (max 400px on largest dimension)
  const maxDim = 400;
  const downscale = Math.min(1, maxDim / Math.max(origW, origH));
  const sampleW = Math.max(1, Math.round(origW * downscale));
  const sampleH = Math.max(1, Math.round(origH * downscale));

  const canvas = document.createElement('canvas');
  canvas.width = sampleW;
  canvas.height = sampleH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(imageSource, 0, 0, sampleW, sampleH);
  const imgData = ctx.getImageData(0, 0, sampleW, sampleH);
  const data = imgData.data;

  // Sample background colors from 4 corners
  const corners = [
    0, // top-left
    (sampleW - 1) * 4, // top-right
    ((sampleH - 1) * sampleW) * 4, // bottom-left
    ((sampleH - 1) * sampleW + (sampleW - 1)) * 4, // bottom-right
  ];

  // Average corner background RGB
  let bgR = 0, bgG = 0, bgB = 0, bgCount = 0;
  for (const idx of corners) {
    const a = data[idx + 3];
    if (a > 20) { // not transparent
      bgR += data[idx];
      bgG += data[idx + 1];
      bgB += data[idx + 2];
      bgCount++;
    }
  }

  if (bgCount > 0) {
    bgR = Math.round(bgR / bgCount);
    bgG = Math.round(bgG / bgCount);
    bgB = Math.round(bgB / bgCount);
  } else {
    // Default assumed background white
    bgR = 255;
    bgG = 255;
    bgB = 255;
  }

  const thresholdDelta = settings.threshold * 2.55; // 0..100 -> 0..255

  let minX = sampleW;
  let minY = sampleH;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < sampleH; y++) {
    const rowOffset = y * sampleW * 4;
    for (let x = 0; x < sampleW; x++) {
      const idx = rowOffset + x * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // Transparent pixel is background
      if (a < 25) continue;

      let isBg = false;

      // Ignore white / near-white background
      if (settings.ignoreWhite && r > 240 && g > 240 && b > 240) {
        isBg = true;
      } else {
        // Delta from sampled corner background
        const colorDiff = (Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB)) / 3;
        if (colorDiff <= thresholdDelta) {
          isBg = true;
        }
      }

      if (!isBg) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // If no content found (e.g. blank image), return null
  if (maxX < minX || maxY < minY) {
    return null;
  }

  // Scale back up to original image dimensions
  const scaleBack = 1 / downscale;
  const origMinX = Math.max(0, Math.round(minX * scaleBack));
  const origMinY = Math.max(0, Math.round(minY * scaleBack));
  const origMaxX = Math.min(origW, Math.round(maxX * scaleBack));
  const origMaxY = Math.min(origH, Math.round(maxY * scaleBack));

  return {
    minX: origMinX,
    minY: origMinY,
    maxX: origMaxX,
    maxY: origMaxY,
    width: origMaxX - origMinX,
    height: origMaxY - origMinY,
  };
}

/**
 * Calculates transform to center and/or fit content inside the frame respecting padding
 */
export function calculateContentTransform(
  box: ContentBoundingBox,
  origW: number,
  origH: number,
  frame: FrameSettings,
  padding: { top: number; bottom: number; left: number; right: number },
  fitMode: 'fit' | 'centerOnly',
  currentScale: number = 1
): { x: number; y: number; scale: number } {
  const usableW = Math.max(20, frame.width - (padding.left + padding.right));
  const usableH = Math.max(20, frame.height - (padding.top + padding.bottom));

  const targetCenterX = padding.left + usableW / 2;
  const targetCenterY = padding.top + usableH / 2;

  const frameCenterX = frame.width / 2;
  const frameCenterY = frame.height / 2;

  const contentCenterX = box.minX + box.width / 2;
  const contentCenterY = box.minY + box.height / 2;

  let scale = currentScale;
  if (fitMode === 'fit') {
    scale = Math.min(usableW / box.width, usableH / box.height);
  }

  const x = targetCenterX - frameCenterX - (contentCenterX - origW / 2) * scale;
  const y = targetCenterY - frameCenterY - (contentCenterY - origH / 2) * scale;

  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
    scale: Math.round(scale * 1000) / 1000,
  };
}

/**
 * Automatically fits and centers content or image inside the frame respecting margins/padding
 */
export async function autoDetectAndFitTransform(
  imageElement: HTMLImageElement | ImageBitmap | HTMLCanvasElement,
  origW: number,
  origH: number,
  frame: FrameSettings,
  settings: ContentDetectionSettings
): Promise<{ transform: TransformState; contentBox?: ContentBoundingBox }> {
  const padding = {
    top: settings.paddingTop,
    bottom: settings.paddingBottom,
    left: settings.paddingLeft,
    right: settings.paddingRight,
  };

  const detectedBox = await detectContentBoundingBox(imageElement, settings);
  const targetBox = detectedBox || {
    minX: 0,
    minY: 0,
    maxX: origW,
    maxY: origH,
    width: origW,
    height: origH,
  };

  const fitResult = calculateContentTransform(targetBox, origW, origH, frame, padding, 'fit');

  return {
    transform: {
      x: fitResult.x,
      y: fitResult.y,
      scale: fitResult.scale,
      rotation: 0,
      flipX: false,
      flipY: false,
    },
    contentBox: detectedBox || undefined,
  };
}
