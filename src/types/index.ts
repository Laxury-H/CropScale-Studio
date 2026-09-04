export interface TransformState {
  x: number; // Offset X in frame coordinates
  y: number; // Offset Y in frame coordinates
  scale: number; // Scale multiplier (1 = 100%)
  rotation: number; // Degrees: 0, 90, 180, 270...
  flipX: boolean;
  flipY: boolean;
}

export type ImageStatus = 'not_edited' | 'edited' | 'exported' | 'error';

export interface ContentBoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface ImageItem {
  id: string;
  name: string;
  size: number;
  originalWidth: number;
  originalHeight: number;
  aspectRatio: number;
  file?: File;
  blobUrl: string;
  thumbnailUrl: string;
  transform: TransformState;
  status: ImageStatus;
  errorMessage?: string;
  contentBox?: ContentBoundingBox;
}

export type AspectRatioPreset = '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | 'custom';

export interface FrameSettings {
  width: number;
  height: number;
  ratio: AspectRatioPreset;
}

export type BackgroundType = 'transparent' | 'white' | 'black' | 'custom';

export interface BackgroundSettings {
  type: BackgroundType;
  customColor: string;
}

export type ExportFormat = 'png' | 'jpeg' | 'webp';
export type NamingMode = 'original' | 'prefix' | 'suffix' | 'sequential';

export interface ExportSettings {
  format: ExportFormat;
  quality: number; // 1 - 100
  namingMode: NamingMode;
  prefix: string;
  suffix: string;
  startNumber: number;
  padLength: number;
}

export interface GuideSettings {
  showFrame: boolean;
  showGrid: boolean;
  gridSize: 10 | 20 | 50;
  snapToGrid: boolean;
  showCenterGuide: boolean;
  showSafeArea: boolean;
  safeAreaMargin: number;
}

export interface ContentDetectionSettings {
  threshold: number; // 1 - 100
  ignoreWhite: boolean;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  uniformPadding: boolean;
}

export interface Preset {
  id: string;
  name: string;
  description?: string;
  isBuiltin?: boolean;
  frame: FrameSettings;
  background: BackgroundSettings;
  exportSettings: ExportSettings;
}

export interface ProjectData {
  version: string;
  createdAt: string;
  frame: FrameSettings;
  background: BackgroundSettings;
  exportSettings: ExportSettings;
  images: {
    name: string;
    originalWidth: number;
    originalHeight: number;
    transform: TransformState;
    status: ImageStatus;
  }[];
}
