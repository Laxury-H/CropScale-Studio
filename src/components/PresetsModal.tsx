import React, { useState } from 'react';
import { 
  X, 
  SlidersHorizontal, 
  Plus, 
  Check, 
  Trash2
} from 'lucide-react';
import type { BackgroundSettings, ExportSettings, FrameSettings, Preset } from '../types';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: Preset[];
  activePresetId?: string;
  onApplyPreset: (preset: Preset) => void;
  onSaveNewPreset: (preset: Preset) => void;
  onDeletePreset: (presetId: string) => void;
  currentFrame: FrameSettings;
  currentBackground: BackgroundSettings;
  currentExport: ExportSettings;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  presets,
  onApplyPreset,
  onSaveNewPreset,
  onDeletePreset,
  currentFrame,
  currentBackground,
  currentExport,
}) => {
  const [newPresetName, setNewPresetName] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  if (!isOpen) return null;

  const handleCreateFromCurrent = () => {
    if (!newPresetName.trim()) return;

    const newPreset: Preset = {
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      description: `Kích thước ${currentFrame.width}×${currentFrame.height}, định dạng ${currentExport.format.toUpperCase()}`,
      isBuiltin: false,
      frame: { ...currentFrame },
      background: { ...currentBackground },
      exportSettings: { ...currentExport },
    };

    onSaveNewPreset(newPreset);
    setNewPresetName('');
    setIsAddingNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg bg-[#171a1d] border border-[#2a3038] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-[#141618] border-b border-[#22262b] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Quản Lý Presets Kích Thước</h3>
              <p className="text-xs text-slate-400">
                Chọn chuẩn kích thước nhanh cho từng loại thư viện CNC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#20252b] text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {/* Create New Preset Button/Form */}
          {isAddingNew ? (
            <div className="p-3 bg-[#131517] rounded-xl border border-blue-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-400">Lưu cấu hình hiện tại thành Preset mới</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {currentFrame.width}×{currentFrame.height} ({currentExport.format.toUpperCase()})
                </span>
              </div>
              <input
                type="text"
                placeholder="Tên preset (vd: Shopee 800x800, Icon 140x140, CNC 240x240)..."
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[#1a1d20] border border-[#2a3038] rounded text-slate-200 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-slate-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateFromCurrent}
                  disabled={!newPresetName.trim()}
                  className="px-3 py-1 rounded text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white"
                >
                  Lưu Preset
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingNew(true)}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-[#2e3540] hover:border-blue-500/60 bg-[#141618] hover:bg-[#1a1d22] text-xs font-medium text-slate-300 transition-colors flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Thêm Preset từ thiết lập hiện tại ({currentFrame.width}×{currentFrame.height})</span>
            </button>
          )}

          {/* List of presets */}
          <div className="space-y-2 pt-2">
            {presets.map((preset) => {
              const isSelected =
                currentFrame.width === preset.frame.width &&
                currentFrame.height === preset.frame.height &&
                currentExport.format === preset.exportSettings.format;

              return (
                <div
                  key={preset.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600/10 border-blue-500/50'
                      : 'bg-[#141618] border-[#22262b] hover:border-[#2e3540]'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-slate-200">{preset.name}</span>
                      {preset.isBuiltin && (
                        <span className="text-[10px] px-1 rounded bg-[#20252b] text-slate-400">
                          Mặc định
                        </span>
                      )}
                      {isSelected && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center space-x-0.5">
                          <Check className="w-2.5 h-2.5" />
                          <span>Đang dùng</span>
                        </span>
                      )}
                    </div>
                    {preset.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{preset.description}</p>
                    )}
                    <div className="flex items-center space-x-3 mt-1.5 text-[11px] font-mono text-slate-400">
                      <span className="text-blue-400 font-semibold">
                        {preset.frame.width} × {preset.frame.height} px
                      </span>
                      <span>•</span>
                      <span className="uppercase text-slate-300">
                        {preset.exportSettings.format}
                      </span>
                      <span>•</span>
                      <span className="capitalize">
                        {preset.background.type === 'transparent' ? 'Trong suốt' : preset.background.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => {
                        onApplyPreset(preset);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1e2329] hover:bg-blue-600 text-slate-200 hover:text-white transition-colors"
                    >
                      Áp Dụng
                    </button>

                    {!preset.isBuiltin && (
                      <button
                        onClick={() => onDeletePreset(preset.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Xóa preset này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#141618] border-t border-[#22262b] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[#20252b] hover:bg-[#282f37] text-slate-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
