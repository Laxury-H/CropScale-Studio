import JSZip from 'jszip';
import type { BackgroundSettings, ExportSettings, FrameSettings, ImageItem } from '../types';

export interface RenderExportOptions {
  imageElement: HTMLImageElement | ImageBitmap;
  transform: ImageItem['transform'];
  frame: FrameSettings;
  background: BackgroundSettings;
  exportSettings: ExportSettings;
}

/**
 * Converts a Blob to a Data URL.
 * Data URLs prevent Chrome's bug where it renames asynchronous blob: downloads to a UUID.
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to data URL'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Downloads a file with 100% reliability on Windows Chrome / Edge:
 * 1. Uses Native Windows "Save As" dialog (showSaveFilePicker) if available so user
 *    can pick the exact destination folder (Desktop, Downloads, CNC folder...)
 *    and see the exact filename.
 * 2. If cancelled by user, returns false.
 * 3. If showSaveFilePicker is not supported or fails, uses Data URL with <a download="...">
 *    which guarantees Chrome cannot fall back to a random blob UUID.
 */
export async function downloadFileSmart(blob: Blob, fileName: string): Promise<boolean> {
  // 1. Try modern File System Access API (Native Windows Explorer Save As)
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      const mime = blob.type || (ext === 'zip' ? 'application/zip' : 'image/png');
      
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: ext === 'zip' ? 'File nén ZIP (*.zip)' : `Ảnh ${ext.toUpperCase()} (*.${ext})`,
            accept: {
              [mime]: [`.${ext}`],
            },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User deliberately clicked Cancel in the Windows Save dialog
        return false;
      }
      console.warn('showSaveFilePicker failed, falling back to data URL download', err);
    }
  }

  // 2. Data URL fallback (immune to Chrome blob UUID renaming bug)
  try {
    const dataUrl = await blobToDataURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 2000);
    return true;
  } catch (err) {
    console.error('Data URL fallback failed, using object URL', err);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
    return true;
  }
}

/**
 * Loads an image from blobUrl into an HTMLImageElement
 */
export function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error(`Failed to load image: ${err}`));
    img.src = url;
  });
}

/**
 * Renders an exact pixel-dimension crop from original image source
 */
export async function renderExportBlob(options: RenderExportOptions): Promise<Blob> {
  const { imageElement, transform, frame, background, exportSettings } = options;

  const targetWidth = Math.round(frame.width);
  const targetHeight = Math.round(frame.height);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d', { alpha: exportSettings.format !== 'jpeg' });
  if (!ctx) {
    throw new Error('Could not get 2D context from export canvas');
  }

  // 1. Draw Background
  if (exportSettings.format === 'jpeg' && background.type === 'transparent') {
    // JPEG does not support transparency -> fallback to white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else if (background.type === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else if (background.type === 'black') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else if (background.type === 'custom') {
    ctx.fillStyle = background.customColor || '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else {
    // Transparent for PNG/WEBP: clear canvas ensures full alpha
    ctx.clearRect(0, 0, targetWidth, targetHeight);
  }

  // 2. High-quality image rendering with transform
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Center of the target frame
  const centerX = targetWidth / 2;
  const centerY = targetHeight / 2;

  ctx.translate(centerX + transform.x, centerY + transform.y);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.scale(
    (transform.flipX ? -1 : 1) * transform.scale,
    (transform.flipY ? -1 : 1) * transform.scale
  );

  const origW = imageElement.width;
  const origH = imageElement.height;
  ctx.drawImage(imageElement, -origW / 2, -origH / 2, origW, origH);
  ctx.restore();

  // 3. Export blob with exact mime type and quality
  let mimeType = 'image/png';
  let quality: number | undefined = undefined;

  if (exportSettings.format === 'jpeg') {
    mimeType = 'image/jpeg';
    quality = Math.max(0.1, Math.min(1.0, exportSettings.quality / 100));
  } else if (exportSettings.format === 'webp') {
    mimeType = 'image/webp';
    quality = Math.max(0.1, Math.min(1.0, exportSettings.quality / 100));
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      },
      mimeType,
      quality
    );
  });
}

/**
 * Generates output filename based on namingMode rules and avoids collisions
 */
export function generateOutputFileName(
  originalName: string,
  index: number,
  exportSettings: ExportSettings,
  usedNames: Set<string>
): string {
  // Strip original extension
  const dotIdx = originalName.lastIndexOf('.');
  const baseName = dotIdx > 0 ? originalName.substring(0, dotIdx) : originalName;
  const ext = exportSettings.format === 'jpeg' ? 'jpg' : exportSettings.format;

  let finalBaseName = baseName;

  switch (exportSettings.namingMode) {
    case 'prefix':
      finalBaseName = `${exportSettings.prefix || ''}${baseName}`;
      break;
    case 'suffix':
      finalBaseName = `${baseName}${exportSettings.suffix || ''}`;
      break;
    case 'sequential': {
      const num = exportSettings.startNumber + index;
      const padded = String(num).padStart(exportSettings.padLength, '0');
      finalBaseName = `${exportSettings.prefix || 'CNC_'}${padded}`;
      break;
    }
    case 'original':
    default:
      finalBaseName = baseName;
      break;
  }

  let candidate = `${finalBaseName}.${ext}`;
  let collisionCount = 1;
  while (usedNames.has(candidate.toLowerCase())) {
    candidate = `${finalBaseName}_${collisionCount}.${ext}`;
    collisionCount++;
  }

  usedNames.add(candidate.toLowerCase());
  return candidate;
}

export interface BatchExportProgress {
  current: number;
  total: number;
  currentFileName: string;
  status: 'processing' | 'zipping' | 'completed' | 'cancelled' | 'error';
  errorMessage?: string;
  savedFileName?: string;
}

/**
 * Batch exports images and bundles them into a ZIP file
 */
export async function batchExportZip(
  images: ImageItem[],
  frame: FrameSettings,
  background: BackgroundSettings,
  exportSettings: ExportSettings,
  onProgress?: (progress: BatchExportProgress) => void,
  abortSignal?: { aborted: boolean }
): Promise<string> {
  const zip = new JSZip();
  const usedNames = new Set<string>();
  const total = images.length;

  for (let i = 0; i < total; i++) {
    if (abortSignal?.aborted) {
      onProgress?.({
        current: i,
        total,
        currentFileName: images[i].name,
        status: 'cancelled',
      });
      return '';
    }

    const item = images[i];
    onProgress?.({
      current: i + 1,
      total,
      currentFileName: item.name,
      status: 'processing',
    });

    try {
      const imgElem = await loadImageElement(item.blobUrl);
      const blob = await renderExportBlob({
        imageElement: imgElem,
        transform: item.transform,
        frame,
        background,
        exportSettings,
      });

      const outName = generateOutputFileName(item.name, i, exportSettings, usedNames);
      zip.file(outName, blob);
    } catch (err: any) {
      console.error(`Error exporting image ${item.name}:`, err);
    }
  }

  if (abortSignal?.aborted) return '';

  onProgress?.({
    current: total,
    total,
    currentFileName: 'Đang nén file ZIP...',
    status: 'zipping',
  });

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const zipFileName = `CropScale_${frame.width}x${frame.height}.zip`;
  const saved = await downloadFileSmart(zipBlob, zipFileName);

  onProgress?.({
    current: total,
    total,
    currentFileName: saved ? 'Hoàn tất!' : 'Đã hủy lưu file',
    status: saved ? 'completed' : 'cancelled',
    savedFileName: zipFileName,
  });

  return zipFileName;
}

/**
 * Downloads a single image directly
 */
export async function exportSingleImage(
  item: ImageItem,
  frame: FrameSettings,
  background: BackgroundSettings,
  exportSettings: ExportSettings
): Promise<string> {
  const imgElem = await loadImageElement(item.blobUrl);
  const blob = await renderExportBlob({
    imageElement: imgElem,
    transform: item.transform,
    frame,
    background,
    exportSettings,
  });

  const outName = generateOutputFileName(item.name, 0, exportSettings, new Set());
  await downloadFileSmart(blob, outName);
  return outName;
}

/**
 * Copies the cropped thumbnail directly to Windows Clipboard as PNG
 */
export async function copyCroppedImageToClipboard(
  item: ImageItem,
  frame: FrameSettings,
  background: BackgroundSettings
): Promise<boolean> {
  try {
    const imgElem = await loadImageElement(item.blobUrl);
    const blob = await renderExportBlob({
      imageElement: imgElem,
      transform: item.transform,
      frame,
      background,
      exportSettings: {
        format: 'png',
        quality: 100,
        namingMode: 'original',
        prefix: '',
        suffix: '',
        startNumber: 1,
        padLength: 3,
      },
    });

    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard write failed', err);
  }
  return false;
}
