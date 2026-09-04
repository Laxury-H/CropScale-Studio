import { useState, useEffect, useCallback, useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { 
  BackgroundSettings, 
  ContentDetectionSettings, 
  ExportSettings, 
  FrameSettings, 
  GuideSettings, 
  ImageItem, 
  Preset, 
  ProjectData, 
  TransformState 
} from './types';
import { 
  DEFAULT_BACKGROUND_SETTINGS, 
  DEFAULT_CONTENT_DETECTION, 
  loadPresets, 
  loadSavedExport, 
  loadSavedFrame, 
  loadSavedGuides, 
  saveExportSettings, 
  saveFrameSettings, 
  saveGuideSettings, 
  savePresets 
} from './utils/storage';
import { generateDemoImages } from './utils/sampleImages';
import { 
  createImageItemFromFile, 
  exportProjectFile, 
  extractFilesFromDataTransfer, 
  loadProjectFile, 
  revokeImageItem 
} from './utils/fileHelpers';
import { exportSingleImage, copyCroppedImageToClipboard, loadImageElement } from './utils/exportEngine';
import { useTransformHistory } from './hooks/useHistory';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CanvasViewport } from './components/CanvasViewport';
import { CanvasControls } from './components/CanvasControls';
import { SettingsPanel } from './components/SettingsPanel';
import { ExportModal } from './components/ExportModal';
import { PresetsModal } from './components/PresetsModal';
import { EmptyState } from './components/EmptyState';
import { LogoSelectorModal } from './components/LogoSelectorModal';
import { getLogoSvgString, type LogoVariant } from './components/CropScaleLogo';

export function App() {
  // 1. Settings State
  const [frame, setFrame] = useState<FrameSettings>(loadSavedFrame);
  const [background, setBackground] = useState<BackgroundSettings>(DEFAULT_BACKGROUND_SETTINGS);
  const [exportSettings, setExportSettings] = useState<ExportSettings>(loadSavedExport);
  const [guides, setGuides] = useState<GuideSettings>(loadSavedGuides);
  const [detectionSettings, setDetectionSettings] = useState<ContentDetectionSettings>(DEFAULT_CONTENT_DETECTION);
  const [presets, setPresets] = useState<Preset[]>(loadPresets);

  // 2. Images & Selection State
  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedTransform, setCopiedTransform] = useState<TransformState | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 3. Viewport State
  const [viewZoom, setViewZoom] = useState<number>(1.0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showContentBox, setShowContentBox] = useState(false);

  // 4. Modals State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExportingSelected, setIsExportingSelected] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [logoVariant, setLogoVariant] = useState<LogoVariant>(() => {
    return (localStorage.getItem('cropscale_logo_variant') as LogoVariant) || 'brackets';
  });
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  // Sync favicon with chosen logo variant
  useEffect(() => {
    try {
      const svg = getLogoSvgString(logoVariant);
      const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.type = 'image/svg+xml';
      link.href = dataUrl;
    } catch (err) {
      console.warn('Failed to update dynamic favicon', err);
    }
  }, [logoVariant]);

  const handleSelectLogoVariant = useCallback((variant: LogoVariant) => {
    setLogoVariant(variant);
    localStorage.setItem('cropscale_logo_variant', variant);
    setToastMessage(`Đã chuyển sang mẫu Logo & Favicon mới!`);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // 5. Active Image & Loaded HTMLImageElement for canvas rendering
  const activeImage = useMemo(
    () => images.find((i) => i.id === activeImageId) || null,
    [images, activeImageId]
  );

  const [loadedImageElement, setLoadedImageElement] = useState<HTMLImageElement | null>(null);

  // Load active image element whenever activeImage changes
  useEffect(() => {
    if (!activeImage) {
      setLoadedImageElement(null);
      return;
    }

    let isMounted = true;
    loadImageElement(activeImage.blobUrl)
      .then((img) => {
        if (isMounted) setLoadedImageElement(img);
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoadedImageElement(null);
      });

    return () => {
      isMounted = false;
    };
  }, [activeImage?.blobUrl]);

  // Transform History
  const defaultTransform: TransformState = {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    flipX: false,
    flipY: false,
  };

  const {
    canUndo,
    canRedo,
    undo,
    redo,
    pushState,
    resetHistory,
  } = useTransformHistory(activeImage ? activeImage.transform : defaultTransform);

  // Sync transform history when switching active image
  useEffect(() => {
    if (activeImage) {
      resetHistory(activeImage.transform);
    }
  }, [activeImageId]);

  // Persist settings
  useEffect(() => {
    saveFrameSettings(frame);
  }, [frame]);

  useEffect(() => {
    saveExportSettings(exportSettings);
  }, [exportSettings]);

  useEffect(() => {
    saveGuideSettings(guides);
  }, [guides]);

  // Update transform of active image
  const handleTransformChange = useCallback(
    (newTransform: TransformState, addToHistory = false) => {
      if (!activeImageId) return;

      setImages((prev) =>
        prev.map((img) => {
          if (img.id === activeImageId) {
            return {
              ...img,
              transform: newTransform,
              status: 'edited',
            };
          }
          return img;
        })
      );

      if (addToHistory) {
        pushState(newTransform);
      }
    },
    [activeImageId, pushState]
  );

  // Handle Undo / Redo
  const handleUndo = useCallback(() => {
    const prev = undo();
    if (prev && activeImageId) {
      handleTransformChange(prev, false);
    }
  }, [undo, activeImageId, handleTransformChange]);

  const handleRedo = useCallback(() => {
    const next = redo();
    if (next && activeImageId) {
      handleTransformChange(next, false);
    }
  }, [redo, activeImageId, handleTransformChange]);

  // Fit Cover Calculation
  const handleFitCover = useCallback(() => {
    if (!activeImage) return;
    const isRotated90 = Math.abs(activeImage.transform.rotation % 180) === 90;
    const imgW = isRotated90 ? activeImage.originalHeight : activeImage.originalWidth;
    const imgH = isRotated90 ? activeImage.originalWidth : activeImage.originalHeight;

    const scale = Math.max(frame.width / imgW, frame.height / imgH);
    handleTransformChange(
      {
        ...activeImage.transform,
        scale: Math.round(scale * 1000) / 1000,
        x: 0,
        y: 0,
      },
      true
    );
  }, [activeImage, frame, handleTransformChange]);

  // Fit Contain Calculation
  const handleFitContain = useCallback(() => {
    if (!activeImage) return;
    const isRotated90 = Math.abs(activeImage.transform.rotation % 180) === 90;
    const imgW = isRotated90 ? activeImage.originalHeight : activeImage.originalWidth;
    const imgH = isRotated90 ? activeImage.originalWidth : activeImage.originalHeight;

    const scale = Math.min(frame.width / imgW, frame.height / imgH);
    handleTransformChange(
      {
        ...activeImage.transform,
        scale: Math.round(scale * 1000) / 1000,
        x: 0,
        y: 0,
      },
      true
    );
  }, [activeImage, frame, handleTransformChange]);

  // Double click toggle fit
  const handleFitToggle = useCallback(() => {
    if (!activeImage) return;
    const isRotated90 = Math.abs(activeImage.transform.rotation % 180) === 90;
    const imgW = isRotated90 ? activeImage.originalHeight : activeImage.originalWidth;
    const imgH = isRotated90 ? activeImage.originalWidth : activeImage.originalHeight;

    const coverScale = Math.max(frame.width / imgW, frame.height / imgH);
    const isAlreadyCover = Math.abs(activeImage.transform.scale - coverScale) < 0.02;

    if (isAlreadyCover) {
      handleFitContain();
    } else {
      handleFitCover();
    }
  }, [activeImage, frame, handleFitCover, handleFitContain]);

  // Center Both / X / Y
  const handleCenterBoth = useCallback(() => {
    if (!activeImage) return;
    handleTransformChange({ ...activeImage.transform, x: 0, y: 0 }, true);
  }, [activeImage, handleTransformChange]);

  const handleCenterHorizontal = useCallback(() => {
    if (!activeImage) return;
    handleTransformChange({ ...activeImage.transform, x: 0 }, true);
  }, [activeImage, handleTransformChange]);

  const handleCenterVertical = useCallback(() => {
    if (!activeImage) return;
    handleTransformChange({ ...activeImage.transform, y: 0 }, true);
  }, [activeImage, handleTransformChange]);

  // Rotate & Flip
  const handleRotate = useCallback(
    (delta: number) => {
      if (!activeImage) return;
      let newRot = (activeImage.transform.rotation + delta) % 360;
      if (newRot < -180) newRot += 360;
      if (newRot > 180) newRot -= 360;
      handleTransformChange({ ...activeImage.transform, rotation: newRot }, true);
    },
    [activeImage, handleTransformChange]
  );

  const handleFlipHorizontal = useCallback(() => {
    if (!activeImage) return;
    handleTransformChange({ ...activeImage.transform, flipX: !activeImage.transform.flipX }, true);
  }, [activeImage, handleTransformChange]);

  const handleFlipVertical = useCallback(() => {
    if (!activeImage) return;
    handleTransformChange({ ...activeImage.transform, flipY: !activeImage.transform.flipY }, true);
  }, [activeImage, handleTransformChange]);

  // Reset Transform
  const handleResetTransform = useCallback(() => {
    if (!activeImage) return;
    handleTransformChange(defaultTransform, true);
  }, [activeImage, defaultTransform, handleTransformChange]);

  // Navigation: Prev / Next
  const currentIndex = useMemo(
    () => images.findIndex((i) => i.id === activeImageId),
    [images, activeImageId]
  );

  const handlePrevImage = useCallback(() => {
    if (currentIndex > 0) {
      const prevId = images[currentIndex - 1].id;
      setActiveImageId(prevId);
      setSelectedIds(new Set([prevId]));
    }
  }, [currentIndex, images]);

  const handleNextImage = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < images.length - 1) {
      const nextId = images[currentIndex + 1].id;
      setActiveImageId(nextId);
      setSelectedIds(new Set([nextId]));
    }
  }, [currentIndex, images]);

  // Selection & Multiselect
  const handleSelectImage = useCallback(
    (id: string, isShift: boolean, isCtrl: boolean) => {
      setActiveImageId(id);

      if (isCtrl) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      } else if (isShift && activeImageId) {
        const fromIdx = images.findIndex((i) => i.id === activeImageId);
        const toIdx = images.findIndex((i) => i.id === id);
        if (fromIdx !== -1 && toIdx !== -1) {
          const start = Math.min(fromIdx, toIdx);
          const end = Math.max(fromIdx, toIdx);
          const rangeIds = images.slice(start, end + 1).map((i) => i.id);
          setSelectedIds(new Set(rangeIds));
        }
      } else {
        setSelectedIds(new Set([id]));
      }
    },
    [activeImageId, images]
  );

  const handleToggleSelectAll = useCallback(() => {
    if (selectedIds.size === images.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(images.map((i) => i.id)));
    }
  }, [images, selectedIds]);

  // File additions
  const handleAddFiles = useCallback(async (files: File[]) => {
    const newItems: ImageItem[] = [];
    for (const file of files) {
      try {
        const item = await createImageItemFromFile(file);
        newItems.push(item);
      } catch (err) {
        console.error(`Không thể nạp file ${file.name}:`, err);
      }
    }

    if (newItems.length > 0) {
      setImages((prev) => {
        const updated = [...prev, ...newItems];
        return updated;
      });

      // Set active image to first newly imported item if none selected
      setActiveImageId((curr) => curr || newItems[0].id);
      setSelectedIds((curr) => (curr.size > 0 ? curr : new Set([newItems[0].id])));
    }
  }, []);

  // Clipboard Paste helper function (for button or API invocation)
  const handlePasteFromClipboard = useCallback(async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const clipboardItems = await navigator.clipboard.read();
        const pastedFiles: File[] = [];

        for (const item of clipboardItems) {
          for (const type of item.types) {
            if (type.startsWith('image/')) {
              const blob = await item.getType(type);
              const ext = type.split('/')[1] || 'png';
              const now = new Date();
              const timeStr = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
              const customName = `Pasted_${timeStr}.${ext === 'jpeg' ? 'jpg' : ext}`;
              pastedFiles.push(new File([blob], customName, { type }));
            }
          }
        }

        if (pastedFiles.length > 0) {
          await handleAddFiles(pastedFiles);
          setToastMessage(`Đã dán ${pastedFiles.length} ảnh từ Clipboard!`);
          setTimeout(() => setToastMessage(null), 3000);
          return;
        }
      }
      setToastMessage('Hãy copy ảnh (Ctrl+C) từ Paint hoặc Snipping Tool rồi nhấn Ctrl+V!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.warn('Clipboard read failed or permission denied:', err);
      setToastMessage('Hãy nhấn phím Ctrl + V trên bàn phím để dán ảnh!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  }, [handleAddFiles]);

  // Global Clipboard Paste Event Listener (Ctrl + V from anywhere in window)
  useEffect(() => {
    const handleGlobalPaste = async (e: ClipboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
        return;
      }

      if (!e.clipboardData || !e.clipboardData.items) return;

      const items = e.clipboardData.items;
      const pastedFiles: File[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            const ext = file.type.split('/')[1] || 'png';
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
            const customName = `Pasted_${timeStr}.${ext === 'jpeg' ? 'jpg' : ext}`;
            const namedFile = new File([file], customName, { type: file.type });
            pastedFiles.push(namedFile);
          }
        }
      }

      if (pastedFiles.length > 0) {
        e.preventDefault();
        await handleAddFiles(pastedFiles);
        setToastMessage(`Đã dán ${pastedFiles.length} ảnh từ Clipboard thành công!`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [handleAddFiles]);

  // Demo Load
  const handleLoadDemo = useCallback(async () => {
    try {
      const demoItems = await generateDemoImages();
      setImages((prev) => [...prev, ...demoItems]);
      setActiveImageId(demoItems[0].id);
      setSelectedIds(new Set([demoItems[0].id]));
    } catch (err) {
      console.error('Failed to load demo images', err);
    }
  }, []);

  // Remove Images
  const handleRemoveImages = useCallback((idsToRemove: string[]) => {
    const toRemoveSet = new Set(idsToRemove);
    setImages((prev) => {
      const remaining: ImageItem[] = [];
      for (const img of prev) {
        if (toRemoveSet.has(img.id)) {
          revokeImageItem(img);
        } else {
          remaining.push(img);
        }
      }
      return remaining;
    });

    setSelectedIds((prev) => {
      const next = new Set(prev);
      idsToRemove.forEach((id) => next.delete(id));
      return next;
    });

    setActiveImageId((curr) => {
      if (curr && toRemoveSet.has(curr)) {
        return null;
      }
      return curr;
    });
  }, []);

  // Copy / Paste Transform
  const handleCopyTransform = useCallback(() => {
    if (activeImage) {
      setCopiedTransform({ ...activeImage.transform });
    }
  }, [activeImage]);

  const handlePasteTransform = useCallback(() => {
    if (copiedTransform && activeImage) {
      handleTransformChange({ ...copiedTransform }, true);
    }
  }, [copiedTransform, activeImage, handleTransformChange]);

  const handleApplyTransformToAll = useCallback(() => {
    if (!activeImage) return;
    const currentT = { ...activeImage.transform };
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        transform: { ...currentT },
        status: 'edited',
      }))
    );
  }, [activeImage]);

  const handleApplyTransformToSelected = useCallback(() => {
    if (!activeImage || selectedIds.size === 0) return;
    const currentT = { ...activeImage.transform };
    setImages((prev) =>
      prev.map((img) => {
        if (selectedIds.has(img.id)) {
          return {
            ...img,
            transform: { ...currentT },
            status: 'edited',
          };
        }
        return img;
      })
    );
  }, [activeImage, selectedIds]);

  // Single Image Export
  const handleExportSingle = useCallback(async () => {
    if (!activeImage) return;
    try {
      const outName = await exportSingleImage(activeImage, frame, background, exportSettings);
      setImages((prev) =>
        prev.map((img) => (img.id === activeImage.id ? { ...img, status: 'exported' } : img))
      );
      setToastMessage(`Đã lưu file: ${outName}`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to export single image', err);
    }
  }, [activeImage, frame, background, exportSettings]);

  // Copy Cropped Image to Windows Clipboard
  const handleCopyImage = useCallback(async () => {
    if (!activeImage) return;
    try {
      const success = await copyCroppedImageToClipboard(activeImage, frame, background);
      if (success) {
        setToastMessage('Đã sao chép ảnh vào Clipboard! Bạn có thể dán (Ctrl+V) ngay.');
      } else {
        setToastMessage('Không thể sao chép. Vui lòng bấm Xuất Ảnh.');
      }
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  }, [activeImage, frame, background]);

  // Batch Export Trigger
  const handleOpenBatchExport = useCallback((selectedOnly = false) => {
    setIsExportingSelected(selectedOnly);
    setIsExportModalOpen(true);
  }, []);

  const handleMarkImagesExported = useCallback((ids: string[]) => {
    const set = new Set(ids);
    setImages((prev) =>
      prev.map((img) => (set.has(img.id) ? { ...img, status: 'exported' } : img))
    );
  }, []);

  // Project Save & Load
  const handleSaveProject = useCallback(() => {
    const projectData: ProjectData = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      frame,
      background,
      exportSettings,
      images: images.map((img) => ({
        name: img.name,
        originalWidth: img.originalWidth,
        originalHeight: img.originalHeight,
        transform: img.transform,
        status: img.status,
      })),
    };

    exportProjectFile(projectData, `CropScale_Project_${frame.width}x${frame.height}.cropscaleproject`);
  }, [frame, background, exportSettings, images]);

  const handleLoadProject = useCallback(async (file: File) => {
    try {
      const data = await loadProjectFile(file);
      setFrame(data.frame);
      setBackground(data.background);
      setExportSettings(data.exportSettings);
      alert(
        `Đã nạp thiết lập dự án thành công (${data.images.length} mẫu). Hãy nạp thêm ảnh nếu cần đồng bộ hóa.`
      );
    } catch (err: any) {
      alert(`Lỗi khi mở file dự án: ${err.message}`);
    }
  }, []);

  // Presets Management
  const handleApplyPreset = useCallback((p: Preset) => {
    setFrame({ ...p.frame });
    setBackground({ ...p.background });
    setExportSettings({ ...p.exportSettings });
  }, []);

  const handleSaveNewPreset = useCallback((newPreset: Preset) => {
    setPresets((prev) => {
      const updated = [...prev, newPreset];
      savePresets(updated);
      return updated;
    });
  }, []);

  const handleDeletePreset = useCallback((presetId: string) => {
    setPresets((prev) => {
      const updated = prev.filter((p) => p.id !== presetId);
      savePresets(updated);
      return updated;
    });
  }, []);

  // Global Drag & Drop listener for canvas/window
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);

      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        const files = await extractFilesFromDataTransfer(e.dataTransfer.items);
        if (files.length > 0) {
          handleAddFiles(files);
        }
      } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleAddFiles(Array.from(e.dataTransfer.files));
      }
    },
    [handleAddFiles]
  );

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input, select or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;
      const step = e.shiftKey ? 10 : 1;

      // Undo: Ctrl + Z
      if (isCtrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Ctrl + Shift + Z or Ctrl + Y
      if ((isCtrl && e.shiftKey && e.key.toLowerCase() === 'z') || (isCtrl && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (!activeImage) return;

      // Arrow Keys -> Move image
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleTransformChange({ ...activeImage.transform, x: activeImage.transform.x - step }, true);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleTransformChange({ ...activeImage.transform, x: activeImage.transform.x + step }, true);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleTransformChange({ ...activeImage.transform, y: activeImage.transform.y - step }, true);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleTransformChange({ ...activeImage.transform, y: activeImage.transform.y + step }, true);
      }
      // Zoom Keys: + or = / -
      else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleTransformChange(
          { ...activeImage.transform, scale: Math.min(40, activeImage.transform.scale * 1.1) },
          true
        );
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleTransformChange(
          { ...activeImage.transform, scale: Math.max(0.05, activeImage.transform.scale / 1.1) },
          true
        );
      }
      // F -> Fit Cover
      else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handleFitToggle();
      }
      // C -> Center
      else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCenterBoth();
      }
      // R -> Reset
      else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleResetTransform();
      }
      // [ and ] -> Prev and Next image
      else if (e.key === '[') {
        e.preventDefault();
        handlePrevImage();
      } else if (e.key === ']') {
        e.preventDefault();
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeImage,
    handleUndo,
    handleRedo,
    handleTransformChange,
    handleFitToggle,
    handleCenterBoth,
    handleResetTransform,
    handlePrevImage,
    handleNextImage,
  ]);

  return (
    <div 
      className="flex flex-col h-screen w-screen bg-[#0c0d0e] text-slate-200 overflow-hidden font-sans"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Toast Notification for Clipboard Paste & Actions */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-none">
          <div className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold backdrop-blur-md shadow-2xl border border-blue-400/40 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. Top Header */}
      <Header
        imagesCount={images.length}
        selectedImagesCount={selectedIds.size}
        currentFrame={frame}
        onOpenPresets={() => setIsPresetsModalOpen(true)}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        onLoadDemo={handleLoadDemo}
        onCopyImage={handleCopyImage}
        onExportSingle={handleExportSingle}
        onExportBatch={() => handleOpenBatchExport(false)}
        hasActiveImage={!!activeImage}
        logoVariant={logoVariant}
        onOpenLogoSelector={() => setIsLogoModalOpen(true)}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Left Sidebar: Image Library & Thumbnails */}
        <Sidebar
          images={images}
          activeImageId={activeImageId}
          selectedIds={selectedIds}
          onSelectImage={handleSelectImage}
          onAddFiles={handleAddFiles}
          onRemoveImages={handleRemoveImages}
          onApplyTransformToSelected={handleApplyTransformToSelected}
          onExportSelected={() => handleOpenBatchExport(true)}
          onToggleSelectAll={handleToggleSelectAll}
          onPasteFromClipboard={handlePasteFromClipboard}
        />

        {/* Center: Canvas Viewport / Empty State */}
        <main className="flex-1 h-full relative flex flex-col min-w-0 bg-[#0c0d0e]">
          {images.length === 0 ? (
            <EmptyState
              onAddFiles={handleAddFiles}
              onLoadDemo={handleLoadDemo}
              onPasteFromClipboard={handlePasteFromClipboard}
              isDraggingOver={isDraggingOver}
              logoVariant={logoVariant}
              onOpenLogoSelector={() => setIsLogoModalOpen(true)}
            />
          ) : (
            <>
              <CanvasViewport
                activeImage={activeImage}
                loadedImageElement={loadedImageElement}
                transform={activeImage ? activeImage.transform : defaultTransform}
                frame={frame}
                background={background}
                guides={guides}
                viewZoom={viewZoom}
                onTransformChange={handleTransformChange}
                onFitToggle={handleFitToggle}
                showContentBox={showContentBox}
              />

              {/* Bottom Floating Canvas Controls */}
              <CanvasControls
                transform={activeImage ? activeImage.transform : defaultTransform}
                viewZoom={viewZoom}
                onViewZoomChange={setViewZoom}
                onFitCover={handleFitCover}
                onFitContain={handleFitContain}
                onCenterBoth={handleCenterBoth}
                onCenterHorizontal={handleCenterHorizontal}
                onCenterVertical={handleCenterVertical}
                onRotate={handleRotate}
                onFlipHorizontal={handleFlipHorizontal}
                onFlipVertical={handleFlipVertical}
                onResetTransform={handleResetTransform}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={handleUndo}
                onRedo={handleRedo}
                currentIndex={currentIndex}
                totalImages={images.length}
                onPrevImage={handlePrevImage}
                onNextImage={handleNextImage}
                hasActiveImage={!!activeImage}
              />
            </>
          )}
        </main>

        {/* Right Sidebar: Settings & Smart Auto Content Detection */}
        <SettingsPanel
          frame={frame}
          onFrameChange={setFrame}
          background={background}
          onBackgroundChange={setBackground}
          transform={activeImage ? activeImage.transform : defaultTransform}
          onTransformChange={handleTransformChange}
          guides={guides}
          onGuidesChange={setGuides}
          exportSettings={exportSettings}
          onExportSettingsChange={setExportSettings}
          activeImage={activeImage}
          loadedImageElement={loadedImageElement}
          detectionSettings={detectionSettings}
          onDetectionSettingsChange={setDetectionSettings}
          onUpdateContentBox={(box) => {
            if (activeImageId) {
              setImages((prev) =>
                prev.map((i) => (i.id === activeImageId ? { ...i, contentBox: box } : i))
              );
            }
          }}
          showContentBox={showContentBox}
          onToggleShowContentBox={() => setShowContentBox(!showContentBox)}
          onCopyTransform={handleCopyTransform}
          onPasteTransform={handlePasteTransform}
          canPasteTransform={!!copiedTransform}
          onApplyTransformToAll={handleApplyTransformToAll}
        />
      </div>

      {/* 3. Batch Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        images={
          isExportingSelected && selectedIds.size > 0
            ? images.filter((i) => selectedIds.has(i.id))
            : images
        }
        frame={frame}
        background={background}
        exportSettings={exportSettings}
        onExportSettingsChange={setExportSettings}
        onMarkImagesExported={handleMarkImagesExported}
        isExportingSelected={isExportingSelected}
      />

      {/* 4. Presets Modal */}
      <PresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        presets={presets}
        onApplyPreset={handleApplyPreset}
        onSaveNewPreset={handleSaveNewPreset}
        onDeletePreset={handleDeletePreset}
        currentFrame={frame}
        currentBackground={background}
        currentExport={exportSettings}
      />

      {/* 5. Logo & Favicon Selector Modal */}
      <LogoSelectorModal
        isOpen={isLogoModalOpen}
        currentVariant={logoVariant}
        onSelectVariant={handleSelectLogoVariant}
        onClose={() => setIsLogoModalOpen(false)}
      />
    </div>
  );
}

export default App;
