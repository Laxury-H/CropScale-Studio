import React, { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  Maximize2, 
  Eye, 
  EyeOff, 
  Info
} from 'lucide-react';
import type { ContentDetectionSettings, FrameSettings, ImageItem, TransformState } from '../types';
import { calculateContentTransform, detectContentBoundingBox } from '../utils/contentDetector';

interface AutoContentPanelProps {
  activeImage: ImageItem | null;
  loadedImageElement: HTMLImageElement | null;
  frame: FrameSettings;
  transform: TransformState;
  detectionSettings: ContentDetectionSettings;
  onDetectionSettingsChange: (settings: ContentDetectionSettings) => void;
  onApplyTransform: (newTransform: TransformState) => void;
  onUpdateContentBox: (box: ImageItem['contentBox']) => void;
  showContentBox: boolean;
  onToggleShowContentBox: () => void;
}

export const AutoContentPanel: React.FC<AutoContentPanelProps> = ({
  activeImage,
  loadedImageElement,
  frame,
  transform,
  detectionSettings,
  onDetectionSettingsChange,
  onApplyTransform,
  onUpdateContentBox,
  showContentBox,
  onToggleShowContentBox,
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionMessage, setDetectionMessage] = useState<string | null>(null);

  const handleRunDetection = async (action: 'fit' | 'centerOnly') => {
    if (!loadedImageElement || !activeImage) return;

    setIsDetecting(true);
    setDetectionMessage(null);

    try {
      const box = await detectContentBoundingBox(loadedImageElement, detectionSettings);

      if (!box) {
        setDetectionMessage('Không tìm thấy họa tiết (ảnh trống hoặc đồng màu).');
        setIsDetecting(false);
        return;
      }

      onUpdateContentBox(box);

      const padding = {
        top: detectionSettings.paddingTop,
        bottom: detectionSettings.paddingBottom,
        left: detectionSettings.paddingLeft,
        right: detectionSettings.paddingRight,
      };

      const result = calculateContentTransform(
        box,
        activeImage.originalWidth,
        activeImage.originalHeight,
        frame,
        padding,
        action,
        transform.scale
      );

      onApplyTransform({
        ...transform,
        x: result.x,
        y: result.y,
        scale: result.scale,
      });

      setDetectionMessage(
        `Đã tìm thấy mẫu (${box.width}×${box.height} px) và căn chỉnh thành công!`
      );
    } catch (err: any) {
      console.error(err);
      setDetectionMessage('Lỗi khi phân tích họa tiết ảnh.');
    } finally {
      setIsDetecting(false);
    }
  };

  const updatePadding = (val: number) => {
    onDetectionSettingsChange({
      ...detectionSettings,
      paddingTop: val,
      paddingBottom: val,
      paddingLeft: val,
      paddingRight: val,
    });
  };

  return (
    <div className="p-3 bg-[#171a1d] rounded-xl border border-[#262b32] space-y-3">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Auto Center Content</span>
        </div>
        <button
          onClick={onToggleShowContentBox}
          className={`p-1 rounded text-xs transition-colors flex items-center space-x-1 ${
            showContentBox
              ? 'text-cyan-400 bg-cyan-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Bật/Tắt hiển thị viền xanh Bounding Box phát hiện được"
        >
          {showContentBox ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span className="text-[10px]">Hiện khung</span>
        </button>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        Tự động lọc bỏ nền trắng/xám thừa, tìm vị trí vật thể / sản phẩm và căn giữa vào khung.
      </p>

      {/* Detection Threshold & Options */}
      <div className="space-y-2 pt-1 border-t border-[#22262b]">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Ngưỡng tách nền (Threshold):</span>
          <span className="font-mono text-slate-200 font-semibold">{detectionSettings.threshold}%</span>
        </div>
        <input
          type="range"
          min="5"
          max="60"
          value={detectionSettings.threshold}
          onChange={(e) =>
            onDetectionSettingsChange({
              ...detectionSettings,
              threshold: parseInt(e.target.value),
            })
          }
          className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#262b32] rounded-lg"
        />

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center space-x-2 text-[11px] text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={detectionSettings.ignoreWhite}
              onChange={(e) =>
                onDetectionSettingsChange({
                  ...detectionSettings,
                  ignoreWhite: e.target.checked,
                })
              }
              className="rounded bg-[#20252b] border-[#303844] text-blue-500 focus:ring-0 cursor-pointer"
            />
            <span>Bỏ qua nền trắng / xám sáng</span>
          </label>
        </div>
      </div>

      {/* Padding Setting */}
      <div className="space-y-2 pt-1 border-t border-[#22262b]">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Lề an toàn (Padding):</span>
          <span className="font-mono text-slate-200 font-semibold">{detectionSettings.paddingTop} px</span>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="0"
            max="120"
            value={detectionSettings.paddingTop}
            onChange={(e) => updatePadding(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-20 px-2 py-1 text-xs bg-[#1a1d20] border border-[#2a3038] rounded text-slate-200 font-mono text-center focus:outline-none focus:border-amber-400"
          />
          <span className="text-[11px] text-slate-500">px 4 phía</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => handleRunDetection('centerOnly')}
          disabled={!activeImage || isDetecting}
          className="py-1.5 px-2 rounded-lg text-xs font-medium bg-[#222830] hover:bg-[#2c3440] disabled:opacity-40 disabled:pointer-events-none text-slate-200 border border-[#303945] transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
          title="Chỉ căn giữa mẫu CNC, giữ nguyên độ phóng đại hiện tại"
        >
          <Target className="w-3.5 h-3.5 text-amber-400" />
          <span>Căn Giữa Mẫu</span>
        </button>

        <button
          onClick={() => handleRunDetection('fit')}
          disabled={!activeImage || isDetecting}
          className="py-1.5 px-2 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-600/80 to-amber-500/80 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 disabled:pointer-events-none text-white transition-all flex items-center justify-center space-x-1.5 shadow-sm"
          title="Tự động thu phóng và căn vừa mẫu CNC vào khung (trừ đi padding)"
        >
          <Maximize2 className="w-3.5 h-3.5 text-white" />
          <span>Fit Mẫu + Lề</span>
        </button>
      </div>

      {/* Feedback message */}
      {detectionMessage && (
        <div className="p-2 rounded bg-[#1e2227] border border-[#2b313a] text-[11px] text-slate-300 flex items-start space-x-1.5">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>{detectionMessage}</span>
        </div>
      )}
    </div>
  );
};
