import React, { useState } from 'react';
import { 
  Ratio, 
  ArrowLeftRight, 
  Paintbrush, 
  Grid, 
  Copy, 
  Check, 
  AlertTriangle,
  FileCheck,
  Compass
} from 'lucide-react';
import type { 
  AspectRatioPreset, 
  BackgroundSettings, 
  ContentDetectionSettings, 
  ExportSettings, 
  FrameSettings, 
  GuideSettings, 
  ImageItem, 
  TransformState 
} from '../types';
import { AutoContentPanel } from './AutoContentPanel';

interface SettingsPanelProps {
  frame: FrameSettings;
  onFrameChange: (newFrame: FrameSettings) => void;
  background: BackgroundSettings;
  onBackgroundChange: (newBg: BackgroundSettings) => void;
  transform: TransformState;
  onTransformChange: (newTransform: TransformState, addToHistory?: boolean) => void;
  guides: GuideSettings;
  onGuidesChange: (newGuides: GuideSettings) => void;
  exportSettings: ExportSettings;
  onExportSettingsChange: (newExport: ExportSettings) => void;
  activeImage: ImageItem | null;
  loadedImageElement: HTMLImageElement | null;
  detectionSettings: ContentDetectionSettings;
  onDetectionSettingsChange: (newDetection: ContentDetectionSettings) => void;
  onUpdateContentBox: (box: ImageItem['contentBox']) => void;
  showContentBox: boolean;
  onToggleShowContentBox: () => void;
  onCopyTransform: () => void;
  onPasteTransform: () => void;
  canPasteTransform: boolean;
  onApplyTransformToAll: () => void;
}

const ASPECT_RATIOS: { label: string; value: AspectRatioPreset; w?: number; h?: number }[] = [
  { label: '140 × 140', value: '1:1', w: 140, h: 140 },
  { label: '240 × 240', value: '1:1', w: 240, h: 240 },
  { label: '500 × 500', value: '1:1', w: 500, h: 500 },
  { label: '800 × 800', value: '1:1', w: 800, h: 800 },
  { label: '1080 × 1080', value: '1:1', w: 1080, h: 1080 },
  { label: '3:4', value: '3:4', w: 600, h: 800 },
  { label: '4:3', value: '4:3', w: 800, h: 600 },
  { label: '16:9', value: '16:9', w: 1920, h: 1080 },
  { label: '9:16', value: '9:16', w: 1080, h: 1920 },
  { label: 'Tùy Chỉnh', value: 'custom' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  frame,
  onFrameChange,
  background,
  onBackgroundChange,
  transform,
  onTransformChange,
  guides,
  onGuidesChange,
  exportSettings,
  onExportSettingsChange,
  activeImage,
  loadedImageElement,
  detectionSettings,
  onDetectionSettingsChange,
  onUpdateContentBox,
  showContentBox,
  onToggleShowContentBox,
  onCopyTransform,
  onPasteTransform,
  canPasteTransform,
  onApplyTransformToAll,
}) => {
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleRatioClick = (item: typeof ASPECT_RATIOS[0]) => {
    if (item.value === 'custom') {
      onFrameChange({ ...frame, ratio: 'custom' });
    } else if (item.w && item.h) {
      onFrameChange({
        width: item.w,
        height: item.h,
        ratio: item.value,
      });
    }
  };

  const handleSwapDimensions = () => {
    onFrameChange({
      ...frame,
      width: frame.height,
      height: frame.width,
      ratio: 'custom',
    });
  };

  const handleCopy = () => {
    onCopyTransform();
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <aside className="w-80 sm:w-84 bg-[#141618] border-l border-[#22262b] flex flex-col h-full shrink-0 select-none overflow-y-auto">
      <div className="p-3.5 space-y-4">
        {/* Section 1: Frame Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200 uppercase tracking-wider">
            <div className="flex items-center space-x-1.5">
              <Ratio className="w-3.5 h-3.5 text-blue-400" />
              <span>Khung Chuẩn (Frame)</span>
            </div>
            <button
              onClick={handleSwapDimensions}
              className="p-1 rounded hover:bg-[#22262b] text-slate-400 hover:text-slate-200 transition-colors"
              title="Đảo chiều Rộng / Cao"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Width & Height inputs */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Rộng (Width - px)</label>
              <input
                type="number"
                min="16"
                max="8000"
                value={frame.width}
                onChange={(e) =>
                  onFrameChange({
                    ...frame,
                    width: Math.max(16, parseInt(e.target.value) || 16),
                    ratio: 'custom',
                  })
                }
                className="w-full px-2.5 py-1.5 text-xs bg-[#1a1d20] border border-[#2a3038] rounded-md text-slate-200 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Cao (Height - px)</label>
              <input
                type="number"
                min="16"
                max="8000"
                value={frame.height}
                onChange={(e) =>
                  onFrameChange({
                    ...frame,
                    height: Math.max(16, parseInt(e.target.value) || 16),
                    ratio: 'custom',
                  })
                }
                className="w-full px-2.5 py-1.5 text-xs bg-[#1a1d20] border border-[#2a3038] rounded-md text-slate-200 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Quick Ratios */}
          <div className="grid grid-cols-3 gap-1.5">
            {ASPECT_RATIOS.map((item) => {
              const isActive =
                item.value === 'custom'
                  ? frame.ratio === 'custom'
                  : frame.width === item.w && frame.height === item.h;

              return (
                <button
                  key={item.label}
                  onClick={() => handleRatioClick(item)}
                  className={`py-1 px-2 rounded text-[11px] font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-semibold'
                      : 'bg-[#1a1d20] text-slate-400 hover:bg-[#22272e] border border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Frame Background */}
        <div className="pt-3 border-t border-[#22262b] space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200 uppercase tracking-wider">
            <Paintbrush className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nền Khung (Background)</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onBackgroundChange({ ...background, type: 'transparent' })}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all ${
                background.type === 'transparent'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                  : 'bg-[#1a1d20] text-slate-300 hover:bg-[#22272e] border border-transparent'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded border border-slate-600 canvas-checkerboard-dense inline-block shrink-0" />
              <span>Trong Suốt</span>
            </button>

            <button
              onClick={() => onBackgroundChange({ ...background, type: 'white' })}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all ${
                background.type === 'white'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                  : 'bg-[#1a1d20] text-slate-300 hover:bg-[#22272e] border border-transparent'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded bg-white border border-slate-300 inline-block shrink-0" />
              <span>Màu Trắng</span>
            </button>

            <button
              onClick={() => onBackgroundChange({ ...background, type: 'black' })}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all ${
                background.type === 'black'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                  : 'bg-[#1a1d20] text-slate-300 hover:bg-[#22272e] border border-transparent'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded bg-black border border-slate-700 inline-block shrink-0" />
              <span>Màu Đen</span>
            </button>

            <div className="flex items-center space-x-1.5 bg-[#1a1d20] rounded-lg p-1 border border-[#2a3038]">
              <input
                type="color"
                value={background.customColor || '#ffffff'}
                onChange={(e) =>
                  onBackgroundChange({ type: 'custom', customColor: e.target.value })
                }
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
              />
              <span className="text-[11px] text-slate-300">Tùy chọn</span>
            </div>
          </div>

          {/* JPEG transparency warning */}
          {exportSettings.format === 'jpeg' && background.type === 'transparent' && (
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
              <span>File JPG không hỗ trợ trong suốt. Nền sẽ tự động đổi sang màu trắng khi xuất.</span>
            </div>
          )}
        </div>

        {/* Section 3: Smart CNC Auto Content Center */}
        <div className="pt-2 border-t border-[#22262b]">
          <AutoContentPanel
            activeImage={activeImage}
            loadedImageElement={loadedImageElement}
            frame={frame}
            transform={transform}
            detectionSettings={detectionSettings}
            onDetectionSettingsChange={onDetectionSettingsChange}
            onApplyTransform={(t) => onTransformChange(t, true)}
            onUpdateContentBox={onUpdateContentBox}
            showContentBox={showContentBox}
            onToggleShowContentBox={onToggleShowContentBox}
          />
        </div>

        {/* Section 4: Manual Transform Parameters */}
        <div className="pt-3 border-t border-[#22262b] space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200 uppercase tracking-wider">
            <div className="flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tọa Độ Căn Chỉnh</span>
            </div>
            {/* Copy / Paste */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleCopy}
                disabled={!activeImage}
                className="px-1.5 py-0.5 rounded text-[11px] bg-[#1e2329] hover:bg-[#282f37] text-slate-300 transition-colors flex items-center space-x-1"
                title="Sao chép thông số căn chỉnh của ảnh này"
              >
                {copiedNotification ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
                <span>{copiedNotification ? 'Đã chép' : 'Chép'}</span>
              </button>

              <button
                onClick={onPasteTransform}
                disabled={!canPasteTransform || !activeImage}
                className="px-1.5 py-0.5 rounded text-[11px] bg-[#1e2329] hover:bg-[#282f37] disabled:opacity-30 disabled:pointer-events-none text-slate-300 transition-colors"
                title="Dán thông số căn chỉnh"
              >
                Dán
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Vị trí X</span>
              <input
                type="number"
                value={Math.round(transform.x)}
                onChange={(e) =>
                  onTransformChange({ ...transform, x: parseFloat(e.target.value) || 0 }, true)
                }
                className="w-full px-2 py-1 bg-[#1a1d20] border border-[#2a3038] rounded text-slate-200 font-mono text-xs focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Vị trí Y</span>
              <input
                type="number"
                value={Math.round(transform.y)}
                onChange={(e) =>
                  onTransformChange({ ...transform, y: parseFloat(e.target.value) || 0 }, true)
                }
                className="w-full px-2 py-1 bg-[#1a1d20] border border-[#2a3038] rounded text-slate-200 font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Scale Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Tỉ lệ Zoom (Scale)</span>
              <span className="font-mono text-amber-400 font-semibold">
                {Math.round(transform.scale * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.01"
              value={transform.scale}
              onChange={(e) =>
                onTransformChange(
                  { ...transform, scale: parseFloat(e.target.value) },
                  true
                )
              }
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#262b32] rounded-lg"
            />
          </div>

          {/* Rotation Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Góc xoay</span>
              <span className="font-mono text-indigo-400 font-semibold">
                {transform.rotation}°
              </span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={transform.rotation}
              onChange={(e) =>
                onTransformChange(
                  { ...transform, rotation: parseInt(e.target.value) },
                  true
                )
              }
              className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-[#262b32] rounded-lg"
            />
          </div>

          {/* Apply to all button */}
          <button
            onClick={onApplyTransformToAll}
            disabled={!activeImage}
            className="w-full py-1.5 px-2 rounded-lg text-xs font-medium bg-[#1e2329] hover:bg-[#262e37] disabled:opacity-40 disabled:pointer-events-none text-slate-300 border border-[#2c3440] transition-colors flex items-center justify-center space-x-1.5"
            title="Áp dụng vị trí và tỉ lệ zoom hiện tại cho tất cả ảnh trong danh sách"
          >
            <Copy className="w-3.5 h-3.5 text-blue-400" />
            <span>Áp dụng thông số cho tất cả ảnh</span>
          </button>
        </div>

        {/* Section 5: Guides & Grid */}
        <div className="pt-3 border-t border-[#22262b] space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200 uppercase tracking-wider">
            <Grid className="w-3.5 h-3.5 text-cyan-400" />
            <span>Đường Gióng & Lưới (Guides)</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="flex items-center justify-between text-slate-300 cursor-pointer">
              <span>Đường tâm chính giữa (Center guide)</span>
              <input
                type="checkbox"
                checked={guides.showCenterGuide}
                onChange={(e) => onGuidesChange({ ...guides, showCenterGuide: e.target.checked })}
                className="rounded bg-[#20252b] border-[#303844] text-blue-500 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-slate-300 cursor-pointer">
              <span>Khung lề an toàn (Safe Area)</span>
              <input
                type="checkbox"
                checked={guides.showSafeArea}
                onChange={(e) => onGuidesChange({ ...guides, showSafeArea: e.target.checked })}
                className="rounded bg-[#20252b] border-[#303844] text-blue-500 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-slate-300 cursor-pointer">
              <span>Hiển thị lưới (Grid)</span>
              <input
                type="checkbox"
                checked={guides.showGrid}
                onChange={(e) => onGuidesChange({ ...guides, showGrid: e.target.checked })}
                className="rounded bg-[#20252b] border-[#303844] text-blue-500 focus:ring-0 cursor-pointer"
              />
            </label>

            {guides.showGrid && (
              <div className="flex items-center justify-between pl-2 pt-1">
                <span className="text-[11px] text-slate-400">Kích thước ô lưới</span>
                <div className="flex items-center space-x-1">
                  {[10, 20, 50].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => onGuidesChange({ ...guides, gridSize: sz as any })}
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        guides.gridSize === sz
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#1a1d20] text-slate-400 hover:bg-[#22262b]'
                      }`}
                    >
                      {sz}px
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 6: Output & Naming Format */}
        <div className="pt-3 border-t border-[#22262b] space-y-2.5 pb-4">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200 uppercase tracking-wider">
            <FileCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>Định Dạng Xuất (Export)</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => onExportSettingsChange({ ...exportSettings, format: fmt })}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold uppercase transition-all ${
                  exportSettings.format === fmt
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                    : 'bg-[#1a1d20] text-slate-400 hover:bg-[#22272e] border border-transparent'
                }`}
              >
                {fmt === 'jpeg' ? 'JPG' : fmt}
              </button>
            ))}
          </div>

          {exportSettings.format !== 'png' && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Chất lượng ảnh</span>
                <span className="font-mono text-slate-200 font-semibold">{exportSettings.quality}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={exportSettings.quality}
                onChange={(e) =>
                  onExportSettingsChange({
                    ...exportSettings,
                    quality: parseInt(e.target.value) || 90,
                  })
                }
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-[#262b32] rounded-lg"
              />
            </div>
          )}

          {/* File naming mode */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">Quy tắc đặt tên file:</label>
            <select
              value={exportSettings.namingMode}
              onChange={(e) =>
                onExportSettingsChange({
                  ...exportSettings,
                  namingMode: e.target.value as any,
                })
              }
              className="w-full px-2.5 py-1.5 text-xs bg-[#1a1d20] border border-[#2a3038] rounded-md text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="original">Giữ nguyên tên gốc (vd: 001.png)</option>
              <option value="prefix">Thêm Tiền tố (Prefix_001.png)</option>
              <option value="suffix">Thêm Hậu tố (001_thumb.png)</option>
              <option value="sequential">Đánh số thứ tự (CNC_001.png)</option>
            </select>

            {exportSettings.namingMode === 'prefix' && (
              <input
                type="text"
                value={exportSettings.prefix}
                onChange={(e) =>
                  onExportSettingsChange({ ...exportSettings, prefix: e.target.value })
                }
                placeholder="Tiền tố (vd: CNC_)"
                className="w-full px-2.5 py-1 text-xs bg-[#1a1d20] border border-[#2a3038] rounded text-slate-200"
              />
            )}

            {exportSettings.namingMode === 'suffix' && (
              <input
                type="text"
                value={exportSettings.suffix}
                onChange={(e) =>
                  onExportSettingsChange({ ...exportSettings, suffix: e.target.value })
                }
                placeholder="Hậu tố (vd: _240x240)"
                className="w-full px-2.5 py-1 text-xs bg-[#1a1d20] border border-[#2a3038] rounded text-slate-200"
              />
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
