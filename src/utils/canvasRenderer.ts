import type { BackgroundSettings, FrameSettings, GuideSettings, TransformState } from '../types';

export interface RenderViewportOptions {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  image: HTMLImageElement | ImageBitmap | null;
  transform: TransformState;
  frame: FrameSettings;
  background: BackgroundSettings;
  guides: GuideSettings;
  viewZoom: number; // Viewport zoom scale
  viewportWidth: number;
  viewportHeight: number;
  contentBox?: { minX: number; minY: number; maxX: number; maxY: number };
  showContentBox?: boolean;
}

export function drawCheckerboard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  size = 12
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  const cols = Math.ceil(width / size);
  const rows = Math.ceil(height / size);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#1f2429' : '#171a1d';
      ctx.fillRect(x + c * size, y + r * size, size, size);
    }
  }
  ctx.restore();
}

export function renderCanvasViewport(options: RenderViewportOptions) {
  const {
    canvas,
    ctx,
    image,
    transform,
    frame,
    background,
    guides,
    viewZoom,
    viewportWidth,
    viewportHeight,
    contentBox,
    showContentBox,
  } = options;

  const dpr = window.devicePixelRatio || 1;
  const targetCanvasW = Math.round(viewportWidth * dpr);
  const targetCanvasH = Math.round(viewportHeight * dpr);

  if (canvas.width !== targetCanvasW || canvas.height !== targetCanvasH) {
    canvas.width = targetCanvasW;
    canvas.height = targetCanvasH;
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  // 1. Clear viewport background
  ctx.fillStyle = '#0c0d0e';
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);

  // Calculate frame display position (always centered in viewport)
  const frameDisplayW = Math.round(frame.width * viewZoom);
  const frameDisplayH = Math.round(frame.height * viewZoom);
  const frameX = Math.round((viewportWidth - frameDisplayW) / 2);
  const frameY = Math.round((viewportHeight - frameDisplayH) / 2);

  // 2. Draw Frame Background Area
  if (background.type === 'transparent') {
    drawCheckerboard(ctx, frameX, frameY, frameDisplayW, frameDisplayH, Math.max(8, Math.round(12 * viewZoom)));
  } else if (background.type === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(frameX, frameY, frameDisplayW, frameDisplayH);
  } else if (background.type === 'black') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(frameX, frameY, frameDisplayW, frameDisplayH);
  } else if (background.type === 'custom') {
    ctx.fillStyle = background.customColor || '#ffffff';
    ctx.fillRect(frameX, frameY, frameDisplayW, frameDisplayH);
  }

  // 3. Draw Transformed Image
  const centerX = frameX + frameDisplayW / 2;
  const centerY = frameY + frameDisplayH / 2;

  if (image) {
    ctx.save();
    // Enable high quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.translate(centerX + transform.x * viewZoom, centerY + transform.y * viewZoom);
    ctx.rotate((transform.rotation * Math.PI) / 180);
    ctx.scale(
      (transform.flipX ? -1 : 1) * transform.scale * viewZoom,
      (transform.flipY ? -1 : 1) * transform.scale * viewZoom
    );

    const origW = image.width;
    const origH = image.height;
    ctx.drawImage(image, -origW / 2, -origH / 2, origW, origH);

    // Optional Content Bounding Box debug outline if enabled
    if (showContentBox && contentBox) {
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2 / (transform.scale * viewZoom);
      ctx.strokeRect(
        contentBox.minX - origW / 2,
        contentBox.minY - origH / 2,
        contentBox.maxX - contentBox.minX,
        contentBox.maxY - contentBox.minY
      );
    }

    ctx.restore();
  }

  // 4. Crop Mask: Dim area outside the frame
  ctx.save();
  ctx.fillStyle = 'rgba(12, 13, 15, 0.72)';
  ctx.beginPath();
  // Outer rectangle covering entire canvas
  ctx.rect(0, 0, viewportWidth, viewportHeight);
  // Cutout inner frame (counter-clockwise creates a transparent hole)
  ctx.rect(frameX + frameDisplayW, frameY, -frameDisplayW, frameDisplayH);
  ctx.fill();
  ctx.restore();

  // 5. Grid (if enabled) inside the frame
  if (guides.showGrid && guides.gridSize > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(frameX, frameY, frameDisplayW, frameDisplayH);
    ctx.clip();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    const scaledGrid = guides.gridSize * viewZoom;
    for (let x = frameX; x <= frameX + frameDisplayW; x += scaledGrid) {
      ctx.beginPath();
      ctx.moveTo(x, frameY);
      ctx.lineTo(x, frameY + frameDisplayH);
      ctx.stroke();
    }
    for (let y = frameY; y <= frameY + frameDisplayH; y += scaledGrid) {
      ctx.beginPath();
      ctx.moveTo(frameX, y);
      ctx.lineTo(frameX + frameDisplayW, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 6. Safe Area guides (if enabled)
  if (guides.showSafeArea && guides.safeAreaMargin > 0) {
    const marginScaled = guides.safeAreaMargin * viewZoom;
    if (frameDisplayW > marginScaled * 2 && frameDisplayH > marginScaled * 2) {
      ctx.save();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.strokeRect(
        frameX + marginScaled,
        frameY + marginScaled,
        frameDisplayW - marginScaled * 2,
        frameDisplayH - marginScaled * 2
      );
      ctx.restore();
    }
  }

  // 7. Center Crosshair Guides (if enabled)
  if (guides.showCenterGuide) {
    ctx.save();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;

    // Horizontal center line
    ctx.beginPath();
    ctx.moveTo(frameX, centerY);
    ctx.lineTo(frameX + frameDisplayW, centerY);
    ctx.stroke();

    // Vertical center line
    ctx.beginPath();
    ctx.moveTo(centerX, frameY);
    ctx.lineTo(centerX, frameY + frameDisplayH);
    ctx.stroke();

    ctx.restore();
  }

  // 8. Frame Border & Corner Handles
  if (guides.showFrame) {
    ctx.save();
    // Solid clean frame border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(frameX, frameY, frameDisplayW, frameDisplayH);

    // Subtle outer glow/drop-shadow effect for frame outline
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(frameX - 1, frameY - 1, frameDisplayW + 2, frameDisplayH + 2);

    // Corner L-handles
    const handleLen = Math.min(16, Math.round(frameDisplayW / 8));
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3;
    ctx.lineCap = 'square';

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(frameX, frameY + handleLen);
    ctx.lineTo(frameX, frameY);
    ctx.lineTo(frameX + handleLen, frameY);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(frameX + frameDisplayW - handleLen, frameY);
    ctx.lineTo(frameX + frameDisplayW, frameY);
    ctx.lineTo(frameX + frameDisplayW, frameY + handleLen);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(frameX, frameY + frameDisplayH - handleLen);
    ctx.lineTo(frameX, frameY + frameDisplayH);
    ctx.lineTo(frameX + handleLen, frameY + frameDisplayH);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(frameX + frameDisplayW - handleLen, frameY + frameDisplayH);
    ctx.lineTo(frameX + frameDisplayW, frameY + frameDisplayH);
    ctx.lineTo(frameX + frameDisplayW, frameY + frameDisplayH - handleLen);
    ctx.stroke();

    ctx.restore();
  }

  ctx.restore();
}
