import type { ImageItem, ProjectData } from '../types';

/**
 * Creates an ImageItem from a user-uploaded File
 */
export async function createImageItemFromFile(file: File): Promise<ImageItem> {
  const blobUrl = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const origW = img.naturalWidth || img.width;
      const origH = img.naturalHeight || img.height;

      // Create downscaled thumbnail for memory-friendly sidebar rendering
      const maxThumb = 140;
      const thumbScale = Math.min(1, maxThumb / Math.max(origW, origH));
      const thumbW = Math.max(1, Math.round(origW * thumbScale));
      const thumbH = Math.max(1, Math.round(origH * thumbScale));

      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = thumbW;
      thumbCanvas.height = thumbH;
      const thumbCtx = thumbCanvas.getContext('2d');
      if (thumbCtx) {
        thumbCtx.drawImage(img, 0, 0, thumbW, thumbH);
      }
      const thumbnailUrl = thumbCanvas.toDataURL('image/jpeg', 0.85);

      resolve({
        id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        size: file.size,
        originalWidth: origW,
        originalHeight: origH,
        aspectRatio: origW / origH,
        file,
        blobUrl,
        thumbnailUrl,
        transform: {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          flipX: false,
          flipY: false,
        },
        status: 'not_edited',
      });
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error(`Không thể nạp file ảnh ${file.name}: ${err}`));
    };

    img.src = blobUrl;
  });
}

/**
 * Traverses DataTransferItems (drag & drop) supporting both files and folders
 */
export async function extractFilesFromDataTransfer(items: DataTransferItemList): Promise<File[]> {
  const files: File[] = [];

  const traverseFileTree = async (entry: any): Promise<void> => {
    if (entry.isFile) {
      const file = await new Promise<File>((resolve, reject) => {
        entry.file(resolve, reject);
      });
      if (isSupportedImage(file)) {
        files.push(file);
      }
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const readEntries = async (): Promise<any[]> => {
        return new Promise((resolve, reject) => {
          dirReader.readEntries(resolve, reject);
        });
      };

      let entries = await readEntries();
      while (entries.length > 0) {
        for (const childEntry of entries) {
          await traverseFileTree(childEntry);
        }
        entries = await readEntries();
      }
    }
  };

  const promises: Promise<void>[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'file') {
      const entry = (item as any).webkitGetAsEntry?.();
      if (entry) {
        promises.push(traverseFileTree(entry));
      } else {
        const file = item.getAsFile();
        if (file && isSupportedImage(file)) {
          files.push(file);
        }
      }
    }
  }

  await Promise.all(promises);
  return files;
}

export function isSupportedImage(file: File): boolean {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp', 'image/svg+xml'];
  if (validTypes.includes(file.type.toLowerCase())) return true;
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'svg'].includes(ext || '');
}

export function revokeImageItem(item: ImageItem) {
  if (item.blobUrl && item.blobUrl.startsWith('blob:')) {
    URL.revokeObjectURL(item.blobUrl);
  }
}

/**
 * Saves project data to a downloadable .cncproject JSON file
 */
export function exportProjectFile(projectData: ProjectData, filename = 'project.cropscaleproject') {
  const jsonStr = JSON.stringify(projectData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Loads project data from a .cncproject file
 */
export async function loadProjectFile(file: File): Promise<ProjectData> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!parsed.version || !parsed.images) {
    throw new Error('Định dạng file .cncproject không hợp lệ');
  }
  return parsed as ProjectData;
}
