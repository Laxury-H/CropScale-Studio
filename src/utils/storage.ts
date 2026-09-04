import type { Preset, FrameSettings, BackgroundSettings, ExportSettings, GuideSettings, ContentDetectionSettings } from '../types';

export const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'ecom-800',
    name: 'Shopee / TikTok / Lazada (800 × 800)',
    description: 'Chuẩn vuông 1:1 ảnh sản phẩm sàn thương mại điện tử',
    isBuiltin: true,
    frame: { width: 800, height: 800, ratio: '1:1' },
    background: { type: 'white', customColor: '#ffffff' },
    exportSettings: {
      format: 'png',
      quality: 100,
      namingMode: 'original',
      prefix: '',
      suffix: '_800x800',
      startNumber: 1,
      padLength: 3,
    }
  },
  {
    id: 'thumb-140',
    name: 'Thumbnail Nhỏ (140 × 140)',
    description: 'Icon thu nhỏ & ảnh đại diện danh mục cực nhẹ',
    isBuiltin: true,
    frame: { width: 140, height: 140, ratio: '1:1' },
    background: { type: 'transparent', customColor: '#ffffff' },
    exportSettings: {
      format: 'png',
      quality: 100,
      namingMode: 'original',
      prefix: '',
      suffix: '_140',
      startNumber: 1,
      padLength: 3,
    }
  },
  {
    id: 'thumb-240',
    name: 'Thumbnail Chuẩn (240 × 240)',
    description: 'Chuẩn thumbnail thư viện ảnh & danh mục sản phẩm',
    isBuiltin: true,
    frame: { width: 240, height: 240, ratio: '1:1' },
    background: { type: 'transparent', customColor: '#ffffff' },
    exportSettings: {
      format: 'png',
      quality: 100,
      namingMode: 'original',
      prefix: '',
      suffix: '_thumb',
      startNumber: 1,
      padLength: 3,
    }
  },
  {
    id: 'ecom-500',
    name: 'Ảnh Sản Phẩm Web (500 × 500)',
    description: 'Ảnh chi tiết cho website và catalog',
    isBuiltin: true,
    frame: { width: 500, height: 500, ratio: '1:1' },
    background: { type: 'white', customColor: '#ffffff' },
    exportSettings: {
      format: 'png',
      quality: 100,
      namingMode: 'original',
      prefix: '',
      suffix: '_500',
      startNumber: 1,
      padLength: 3,
    }
  },
  {
    id: 'social-1080',
    name: 'Facebook / Instagram Post (1080 × 1080)',
    description: 'Ảnh bài đăng vuông siêu nét cho mạng xã hội',
    isBuiltin: true,
    frame: { width: 1080, height: 1080, ratio: '1:1' },
    background: { type: 'white', customColor: '#ffffff' },
    exportSettings: {
      format: 'png',
      quality: 100,
      namingMode: 'original',
      prefix: '',
      suffix: '_1080',
      startNumber: 1,
      padLength: 3,
    }
  },
  {
    id: 'social-story',
    name: 'Story / Reel / Shorts (1080 × 1920)',
    description: 'Tỷ lệ dọc 9:16 cho video ngắn & tin mạng xã hội',
    isBuiltin: true,
    frame: { width: 1080, height: 1920, ratio: '9:16' },
    background: { type: 'white', customColor: '#ffffff' },
    exportSettings: {
      format: 'png',
      quality: 100,
      namingMode: 'original',
      prefix: '',
      suffix: '_story',
      startNumber: 1,
      padLength: 3,
    }
  },
  {
    id: 'catalog-3-4',
    name: 'Dáng Dọc 3:4 (600 × 800)',
    description: 'Tỷ lệ dọc 3:4 hiển thị dáng vách, thời trang & nội thất',
    isBuiltin: true,
    frame: { width: 600, height: 800, ratio: '3:4' },
    background: { type: 'transparent', customColor: '#ffffff' },
    exportSettings: {
      format: 'png',
      quality: 100,
      namingMode: 'original',
      prefix: '',
      suffix: '_3x4',
      startNumber: 1,
      padLength: 3,
    }
  },
  {
    id: 'web-banner',
    name: 'Facebook Share / Banner (1200 × 630)',
    description: 'Chuẩn ảnh bìa chia sẻ link Facebook & Website',
    isBuiltin: true,
    frame: { width: 1200, height: 630, ratio: 'custom' },
    background: { type: 'white', customColor: '#ffffff' },
    exportSettings: {
      format: 'png',
      quality: 100,
      namingMode: 'original',
      prefix: '',
      suffix: '_banner',
      startNumber: 1,
      padLength: 3,
    }
  },
  {
    id: 'cnc-square',
    name: 'Vách CNC Chuẩn (240 × 240)',
    description: 'Chuẩn thumbnail thư viện vách & hoa văn CNC',
    isBuiltin: true,
    frame: { width: 240, height: 240, ratio: '1:1' },
    background: { type: 'transparent', customColor: '#ffffff' },
    exportSettings: {
      format: 'png',
      quality: 100,
      namingMode: 'original',
      prefix: 'CNC_',
      suffix: '_thumb',
      startNumber: 1,
      padLength: 3,
    }
  }
];

export const DEFAULT_FRAME_SETTINGS: FrameSettings = {
  width: 240,
  height: 240,
  ratio: '1:1',
};

export const DEFAULT_BACKGROUND_SETTINGS: BackgroundSettings = {
  type: 'transparent',
  customColor: '#ffffff',
};

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  format: 'png',
  quality: 100,
  namingMode: 'original',
  prefix: 'CNC_',
  suffix: '_thumb',
  startNumber: 1,
  padLength: 3,
};

export const DEFAULT_GUIDE_SETTINGS: GuideSettings = {
  showFrame: true,
  showGrid: false,
  gridSize: 20,
  snapToGrid: false,
  showCenterGuide: true,
  showSafeArea: false,
  safeAreaMargin: 20,
};

export const DEFAULT_CONTENT_DETECTION: ContentDetectionSettings = {
  threshold: 25,
  ignoreWhite: true,
  paddingTop: 20,
  paddingBottom: 20,
  paddingLeft: 20,
  paddingRight: 20,
  uniformPadding: true,
};

const STORAGE_KEYS = {
  PRESETS: 'cnc_thumb_presets_v1',
  FRAME: 'cnc_thumb_frame_v1',
  BACKGROUND: 'cnc_thumb_bg_v1',
  EXPORT: 'cnc_thumb_export_v1',
  GUIDES: 'cnc_thumb_guides_v1',
  CONTENT_DETECTION: 'cnc_thumb_detection_v1',
};

export const loadPresets = (): Preset[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESETS);
    if (!raw) return DEFAULT_PRESETS;
    const userPresets = JSON.parse(raw);
    return Array.isArray(userPresets) && userPresets.length > 0 ? userPresets : DEFAULT_PRESETS;
  } catch (err) {
    console.error('Failed to load presets from localStorage', err);
    return DEFAULT_PRESETS;
  }
};

export const savePresets = (presets: Preset[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets));
  } catch (err) {
    console.error('Failed to save presets', err);
  }
};

export const loadSavedFrame = (): FrameSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FRAME);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_FRAME_SETTINGS;
};

export const saveFrameSettings = (frame: FrameSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FRAME, JSON.stringify(frame));
  } catch {}
};

export const loadSavedExport = (): ExportSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPORT);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_EXPORT_SETTINGS;
};

export const saveExportSettings = (settings: ExportSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPORT, JSON.stringify(settings));
  } catch {}
};

export const loadSavedGuides = (): GuideSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GUIDES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_GUIDE_SETTINGS;
};

export const saveGuideSettings = (guides: GuideSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(guides));
  } catch {}
};
