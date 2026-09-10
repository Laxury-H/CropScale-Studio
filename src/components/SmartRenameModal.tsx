import React, { useState, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Hash, 
  Code2, 
  Replace, 
  ArrowRight, 
  Check, 
  HelpCircle
} from 'lucide-react';
import type { FrameSettings, ImageItem } from '../types';

interface SmartRenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageItem[];
  selectedIds: Set<string>;
  frame: FrameSettings;
  onApplyRename: (renamedMap: Map<string, string>) => void;
}

type RenameTab = 'range' | 'template' | 'replace';

export const SmartRenameModal: React.FC<SmartRenameModalProps> = ({
  isOpen,
  onClose,
  images,
  selectedIds,
  frame,
  onApplyRename,
}) => {
  // Scope: 'all' or 'selected'
  const hasSelected = selectedIds.size > 0;
  const [scope, setScope] = useState<'all' | 'selected'>(hasSelected ? 'selected' : 'all');
  const [activeTab, setActiveTab] = useState<RenameTab>('range');

  // Mode 1: Range & Sequence state
  const [rangePrefix, setRangePrefix] = useState('');
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeStep, setRangeStep] = useState(1);
  const [rangePadding, setRangePadding] = useState<number>(1); // 1 = "1", 2 = "01", 3 = "001"
  const [rangeSuffix, setRangeSuffix] = useState('');

  // Mode 2: Template state
  const [templatePattern, setTemplatePattern] = useState('{n}');
  const [templateStart, setTemplateStart] = useState(1);

  // Mode 3: Find & Replace state
  const [findText, setFindText] = useState('Pasted_');
  const [replaceText, setReplaceText] = useState('Item_');
  const [matchCase, setMatchCase] = useState(false);

  // Target images based on scope
  const targetImages = useMemo(() => {
    if (scope === 'selected' && hasSelected) {
      return images.filter((img) => selectedIds.has(img.id));
    }
    return images;
  }, [images, selectedIds, scope, hasSelected]);

  // Compute preview map: imgId -> newName
  const previewMap = useMemo(() => {
    const map = new Map<string, string>();
    const today = new Date();
    const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    const ratioStr = frame.ratio === 'custom' ? `${frame.width}x${frame.height}` : frame.ratio.replace(':', 'x');

    targetImages.forEach((img, idx) => {
      // Extract original base name & extension
      const lastDot = img.name.lastIndexOf('.');
      const baseName = lastDot > 0 ? img.name.substring(0, lastDot) : img.name;
      const ext = lastDot > 0 ? img.name.substring(lastDot) : '';

      let newBase = baseName;

      if (activeTab === 'range') {
        const num = rangeStart + idx * rangeStep;
        const numStr = String(Math.max(0, num)).padStart(rangePadding, '0');
        newBase = `${rangePrefix}${numStr}${rangeSuffix}`;
      } else if (activeTab === 'template') {
        const num = templateStart + idx;
        const nStr = String(num);
        const zeroNStr = String(num).padStart(2, '0');
        const tripleZeroNStr = String(num).padStart(3, '0');

        newBase = templatePattern
          .replace(/{00n}/g, tripleZeroNStr)
          .replace(/{0n}/g, zeroNStr)
          .replace(/{n}/g, nStr)
          .replace(/{name}/g, baseName)
          .replace(/{date}/g, dateStr)
          .replace(/{ratio}/g, ratioStr);
      } else if (activeTab === 'replace') {
        if (findText) {
          if (matchCase) {
            newBase = baseName.replaceAll(findText, replaceText);
          } else {
            const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            newBase = baseName.replace(regex, replaceText);
          }
        }
      }

      // Preserve file extension
      const finalName = newBase.trim() ? `${newBase.trim()}${ext}` : img.name;
      map.set(img.id, finalName);
    });

    return map;
  }, [
    targetImages,
    activeTab,
    rangePrefix,
    rangeStart,
    rangeStep,
    rangePadding,
    rangeSuffix,
    templatePattern,
    templateStart,
    findText,
    replaceText,
    matchCase,
    frame,
  ]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyRename(previewMap);
    onClose();
  };

  const setRangeQuickPreset = (preset: '1-10' | '01-10' | '001-10') => {
    setActiveTab('range');
    setRangeStart(1);
    setRangeStep(1);
    if (preset === '1-10') setRangePadding(1);
    if (preset === '01-10') setRangePadding(2);
    if (preset === '001-10') setRangePadding(3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-3xl bg-[#14171a] border border-[#262c33] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#222830] flex items-center justify-between bg-[#181b20]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
                <span>Đổi Tên Thông Minh</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 font-medium">
                  Hàng loạt
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Đổi tên nhanh theo dải số (1-10, 01-10), mẫu công thức hoặc thay thế từ khóa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#252b33] text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Scope Selector */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#191c21] border border-[#242a32]">
            <span className="text-xs font-medium text-slate-300">Phạm vi áp dụng:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setScope('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  scope === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-[#20252c] text-slate-400 hover:text-slate-200'
                }`}
              >
                Tất cả ảnh ({images.length})
              </button>
              <button
                onClick={() => setScope('selected')}
                disabled={!hasSelected}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30 disabled:pointer-events-none ${
                  scope === 'selected'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-[#20252c] text-slate-400 hover:text-slate-200'
                }`}
              >
                Chỉ ảnh đã chọn ({selectedIds.size})
              </button>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex space-x-1 p-1 bg-[#181b20] border border-[#242a32] rounded-xl">
            <button
              onClick={() => setActiveTab('range')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'range'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#20252c]'
              }`}
            >
              <Hash className="w-4 h-4" />
              <span>Dải số (1-10, 01-10)</span>
            </button>
            <button
              onClick={() => setActiveTab('template')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'template'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#20252c]'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Mẫu công thức {'{n}'}</span>
            </button>
            <button
              onClick={() => setActiveTab('replace')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'replace'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#20252c]'
              }`}
            >
              <Replace className="w-4 h-4" />
              <span>Tìm & Thay thế</span>
            </button>
          </div>

          {/* Mode 1: Range & Sequence Controls */}
          {activeTab === 'range' && (
            <div className="space-y-4 p-4 rounded-xl bg-[#181b20] border border-[#242a32]">
              {/* Quick Presets */}
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                <span className="text-xs text-slate-400">Chọn nhanh chuỗi:</span>
                <button
                  type="button"
                  onClick={() => setRangeQuickPreset('1-10')}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
                    rangePadding === 1 && !rangePrefix
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-[#22272e] border-[#2d3540] text-slate-300 hover:bg-[#2a313a]'
                  }`}
                >
                  1, 2, 3... (1-{targetImages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRangeQuickPreset('01-10')}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
                    rangePadding === 2 && !rangePrefix
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-[#22272e] border-[#2d3540] text-slate-300 hover:bg-[#2a313a]'
                  }`}
                >
                  01, 02... (01-{String(targetImages.length).padStart(2, '0')})
                </button>
                <button
                  type="button"
                  onClick={() => setRangeQuickPreset('001-10')}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
                    rangePadding === 3 && !rangePrefix
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-[#22272e] border-[#2d3540] text-slate-300 hover:bg-[#2a313a]'
                  }`}
                >
                  001, 002...
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Tiền tố (Prefix)
                  </label>
                  <input
                    type="text"
                    value={rangePrefix}
                    onChange={(e) => setRangePrefix(e.target.value)}
                    placeholder="VD: SP_, Anh_"
                    className="w-full px-3 py-1.5 text-xs bg-[#121417] border border-[#2b313a] rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Bắt đầu từ số
                  </label>
                  <input
                    type="number"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 text-xs bg-[#121417] border border-[#2b313a] rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Độ dài số 0 (Padding)
                  </label>
                  <select
                    value={rangePadding}
                    onChange={(e) => setRangePadding(parseInt(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#121417] border border-[#2b313a] rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value={1}>1 chữ số (1, 2, 3...)</option>
                    <option value={2}>2 chữ số (01, 02, 03...)</option>
                    <option value={3}>3 chữ số (001, 002, 003...)</option>
                    <option value={4}>4 chữ số (0001, 0002...)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Hậu tố (Suffix)
                  </label>
                  <input
                    type="text"
                    value={rangeSuffix}
                    onChange={(e) => setRangeSuffix(e.target.value)}
                    placeholder="VD: _cropped"
                    className="w-full px-3 py-1.5 text-xs bg-[#121417] border border-[#2b313a] rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Template Controls */}
          {activeTab === 'template' && (
            <div className="space-y-4 p-4 rounded-xl bg-[#181b20] border border-[#242a32]">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Mẫu định dạng công thức:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={templatePattern}
                    onChange={(e) => setTemplatePattern(e.target.value)}
                    placeholder="VD: SP_{0n} hoặc {name}_{n}"
                    className="flex-1 px-3 py-2 text-xs font-mono bg-[#121417] border border-[#2b313a] rounded-lg text-blue-300 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">Bắt đầu từ:</span>
                    <input
                      type="number"
                      value={templateStart}
                      onChange={(e) => setTemplateStart(parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-2 text-xs bg-[#121417] border border-[#2b313a] rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Tag Chips */}
              <div>
                <div className="text-[11px] text-slate-400 mb-1.5 flex items-center space-x-1">
                  <HelpCircle className="w-3 h-3" />
                  <span>Chạm để chèn nhanh các biến vào công thức:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { tag: '{n}', desc: 'Số 1, 2...' },
                    { tag: '{0n}', desc: 'Số 01, 02...' },
                    { tag: '{00n}', desc: 'Số 001, 002...' },
                    { tag: '{name}', desc: 'Tên gốc' },
                    { tag: '{date}', desc: 'Ngày YYYYMMDD' },
                    { tag: '{ratio}', desc: 'Tỉ lệ khung' },
                  ].map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => setTemplatePattern((prev) => `${prev}${item.tag}`)}
                      className="px-2 py-1 rounded bg-[#22272e] hover:bg-[#2b323c] border border-[#2e3642] text-[11px] font-mono text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
                    >
                      <span className="font-bold">{item.tag}</span>
                      <span className="text-slate-500 text-[10px]">({item.desc})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preset formulas */}
              <div className="pt-1 border-t border-[#232830] flex items-center space-x-2 flex-wrap gap-y-1.5">
                <span className="text-[11px] text-slate-500">Mẫu phổ biến:</span>
                {[
                  { label: '1, 2, 3...', val: '{n}' },
                  { label: '01, 02...', val: '{0n}' },
                  { label: 'SP_{0n}', val: 'SP_{0n}' },
                  { label: 'Mau_{n}', val: 'Mau_{n}' },
                  { label: '{name}_{n}', val: '{name}_{n}' },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setTemplatePattern(preset.val)}
                    className="px-2 py-0.5 rounded text-[11px] bg-[#1f2329] hover:bg-[#282e37] text-slate-300 border border-[#2b313b] transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mode 3: Find & Replace Controls */}
          {activeTab === 'replace' && (
            <div className="space-y-3 p-4 rounded-xl bg-[#181b20] border border-[#242a32]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Tìm kiếm từ khóa (Find)
                  </label>
                  <input
                    type="text"
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                    placeholder="VD: Pasted_ hoặc IMG_"
                    className="w-full px-3 py-1.5 text-xs bg-[#121417] border border-[#2b313a] rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Thay thế bằng (Replace with)
                  </label>
                  <input
                    type="text"
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    placeholder="VD: San_Pham_"
                    className="w-full px-3 py-1.5 text-xs bg-[#121417] border border-[#2b313a] rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="matchCase"
                  checked={matchCase}
                  onChange={(e) => setMatchCase(e.target.checked)}
                  className="rounded bg-[#1a1d22] border-[#2b313a] text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <label htmlFor="matchCase" className="text-xs text-slate-400 cursor-pointer">
                  Phân biệt chữ hoa / chữ thường (Match case)
                </label>
              </div>
            </div>
          )}

          {/* Live Preview List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300 flex items-center space-x-1.5">
                <span>Xem trước kết quả đổi tên ({targetImages.length} ảnh):</span>
              </span>
              <span className="text-slate-500 text-[11px]">
                Đuôi file (.jpg/.png) sẽ được bảo toàn tự động
              </span>
            </div>

            <div className="border border-[#222830] rounded-xl bg-[#111316] max-h-52 overflow-y-auto divide-y divide-[#1e2329]">
              {targetImages.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  Không có ảnh nào trong phạm vi được chọn.
                </div>
              ) : (
                targetImages.map((img, idx) => {
                  const newName = previewMap.get(img.id) || img.name;
                  const isChanged = newName !== img.name;

                  return (
                    <div
                      key={img.id}
                      className="px-3 py-2 flex items-center justify-between text-xs hover:bg-[#161a1e] transition-colors"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-3">
                        <span className="text-[11px] font-mono text-slate-500 w-5 shrink-0 text-right">
                          {idx + 1}.
                        </span>
                        <div className="w-7 h-7 rounded bg-[#1c2026] border border-[#272e38] overflow-hidden shrink-0 flex items-center justify-center">
                          <img
                            src={img.thumbnailUrl}
                            alt=""
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <span className="text-slate-400 font-mono truncate text-[11px]">
                          {img.name}
                        </span>
                      </div>

                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0 mx-2" />

                      <div className="flex items-center space-x-1.5 min-w-0 flex-1 justify-end">
                        <span
                          className={`font-mono truncate text-[11px] font-medium ${
                            isChanged ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          {newName}
                        </span>
                        {isChanged && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#222830] bg-[#181b20] flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center space-x-1.5">
            <Check className="w-3.5 h-3.5 text-blue-400" />
            <span>Sẵn sàng cập nhật {targetImages.length} tên file</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-[#242932] transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleApply}
              disabled={targetImages.length === 0}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Áp dụng đổi tên</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
