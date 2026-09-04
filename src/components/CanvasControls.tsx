import React from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical, 
  Maximize2, 
  Minimize2, 
  Crosshair, 
  RotateCcw as ResetIcon, 
  ChevronLeft, 
  ChevronRight,
  Undo2,
  Redo2
} from 'lucide-react';
import type { TransformState } from '../types';

interface CanvasControlsProps {
  transform: TransformState;
  viewZoom: number;
  onViewZoomChange: (zoom: number) => void;
  onFitCover: () => void;
  onFitContain: () => void;
  onCenterBoth: () => void;
  onCenterHorizontal: () => void;
  onCenterVertical: () => void;
  onRotate: (delta: number) => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onResetTransform: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  currentIndex: number;
  totalImages: number;
  onPrevImage: () => void;
  onNextImage: () => void;
  hasActiveImage: boolean;
}

const VIEW_ZOOM_PRESETS = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0];

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  transform,
  viewZoom,
  onViewZoomChange,
  onFitCover,
  onFitContain,
  onCenterBoth,
  onCenterHorizontal: _onCenterH,
  onCenterVertical: _onCenterV,
  onRotate,
  onFlipHorizontal,
  onFlipVertical,
  onResetTransform,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  currentIndex,
  totalImages,
  onPrevImage,
  onNextImage,
  hasActiveImage,
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 p-1.5 rounded-xl bg-[#141618]/90 backdrop-blur-md border border-[#2a3038] shadow-2xl text-slate-300 select-none max-w-[95vw] overflow-x-auto">
      {/* Navigation (Prev / Next) */}
      <div className="flex items-center space-x-1 pr-1.5 border-r border-[#242a32]">
        <button
          onClick={onPrevImage}
          disabled={currentIndex <= 0}
          className="p-1.5 rounded-lg hover:bg-[#20252b] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Ảnh trước (Phím ←)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono px-1.5 text-slate-300 shrink-0">
          {totalImages > 0 ? `${currentIndex + 1} / ${totalImages}` : '0 / 0'}
        </span>

        <button
          onClick={onNextImage}
          disabled={currentIndex >= totalImages - 1}
          className="p-1.5 rounded-lg hover:bg-[#20252b] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Ảnh tiếp theo (Phím →)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Undo / Redo */}
      <div className="flex items-center space-x-0.5 px-1 border-r border-[#242a32]">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-lg hover:bg-[#20252b] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded-lg hover:bg-[#20252b] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Làm lại (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Viewport Zoom Controls */}
      <div className="flex items-center space-x-1 px-1 border-r border-[#242a32]">
        <button
          onClick={() => onViewZoomChange(Math.max(0.2, viewZoom - 0.15))}
          className="p-1.5 rounded-lg hover:bg-[#20252b] transition-colors"
          title="Thu nhỏ vùng nhìn (-)"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <select
          value={viewZoom}
          onChange={(e) => onViewZoomChange(parseFloat(e.target.value))}
          className="bg-transparent text-xs font-mono text-blue-400 font-semibold focus:outline-none cursor-pointer py-1 px-1 rounded hover:bg-[#20252b]"
          title="Tỉ lệ hiển thị màn hình"
        >
          {VIEW_ZOOM_PRESETS.map((z) => (
            <option key={z} value={z} className="bg-[#141618] text-slate-200">
              {Math.round(z * 100)}%
            </option>
          ))}
          {!VIEW_ZOOM_PRESETS.includes(viewZoom) && (
            <option value={viewZoom} className="bg-[#141618] text-slate-200">
              {Math.round(viewZoom * 100)}%
            </option>
          )}
        </select>

        <button
          onClick={() => onViewZoomChange(Math.min(4.0, viewZoom + 0.15))}
          className="p-1.5 rounded-lg hover:bg-[#20252b] transition-colors"
          title="Phóng to vùng nhìn (+)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Image Fitting Controls */}
      <div className="flex items-center space-x-0.5 px-1 border-r border-[#242a32]">
        <button
          onClick={onFitCover}
          disabled={!hasActiveImage}
          className="px-2 py-1 rounded-lg text-xs font-medium hover:bg-[#20252b] disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center space-x-1"
          title="Phủ kín khung (Cover - Không để hở khoảng trống) [Phím F]"
        >
          <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Phủ Kín</span>
        </button>

        <button
          onClick={onFitContain}
          disabled={!hasActiveImage}
          className="px-2 py-1 rounded-lg text-xs font-medium hover:bg-[#20252b] disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center space-x-1"
          title="Thu vừa khung (Contain - Thấy trọn vẹn ảnh)"
        >
          <Minimize2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Vừa Khung</span>
        </button>

        <button
          onClick={onCenterBoth}
          disabled={!hasActiveImage}
          className="p-1.5 rounded-lg hover:bg-[#20252b] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Căn giữa cả 2 trục [Phím C]"
        >
          <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
        </button>
      </div>

      {/* Rotation & Flip */}
      <div className="flex items-center space-x-0.5 px-1 border-r border-[#242a32]">
        <button
          onClick={() => onRotate(-90)}
          disabled={!hasActiveImage}
          className="p-1.5 rounded-lg hover:bg-[#20252b] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Xoay ngược chiều kim đồng hồ 90°"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onRotate(90)}
          disabled={!hasActiveImage}
          className="p-1.5 rounded-lg hover:bg-[#20252b] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Xoay theo chiều kim đồng hồ 90°"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onFlipHorizontal}
          disabled={!hasActiveImage}
          className={`p-1.5 rounded-lg hover:bg-[#20252b] disabled:opacity-30 disabled:pointer-events-none transition-colors ${
            transform.flipX ? 'text-blue-400 bg-blue-500/10' : ''
          }`}
          title="Lật ngang (Flip Horizontal)"
        >
          <FlipHorizontal className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onFlipVertical}
          disabled={!hasActiveImage}
          className={`p-1.5 rounded-lg hover:bg-[#20252b] disabled:opacity-30 disabled:pointer-events-none transition-colors ${
            transform.flipY ? 'text-blue-400 bg-blue-500/10' : ''
          }`}
          title="Lật dọc (Flip Vertical)"
        >
          <FlipVertical className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Reset Transform */}
      <button
        onClick={onResetTransform}
        disabled={!hasActiveImage}
        className="px-2 py-1 rounded-lg text-xs hover:bg-rose-500/15 hover:text-rose-300 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center space-x-1"
        title="Đặt lại mọi căn chỉnh về mặc định [Phím R]"
      >
        <ResetIcon className="w-3 h-3" />
        <span className="hidden sm:inline">Đặt Lại</span>
      </button>
    </div>
  );
};
