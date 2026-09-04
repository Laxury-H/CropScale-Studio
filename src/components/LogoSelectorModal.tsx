import React from 'react';
import { X, Check } from 'lucide-react';
import { CropScaleLogo, type LogoVariant } from './CropScaleLogo';

interface LogoOption {
  id: LogoVariant;
  name: string;
  subtitle: string;
  description: string;
  tag: string;
}

const LOGO_OPTIONS: LogoOption[] = [
  {
    id: 'brackets',
    name: 'Mẫu 1: Precision Studio Pro (Nâng Cấp)',
    subtitle: 'Đồng điệu, cao cấp & Chuẩn xác từng pixel',
    description: 'Bản nâng cấp toàn diện: dải màu liền mạch (Electric Cyan → Royal Blue → Indigo), lưới căn chỉnh camera siêu mảnh, 4 điểm neo transform cùng mũi tên co giãn đối xứng tinh xảo.',
    tag: 'Khuyên Dùng • Đẳng Cấp',
  },
  {
    id: 'monogram',
    name: 'Mẫu 2: Interlocking "CS" Monogram',
    subtitle: 'Chữ C & S lồng khối 3D công nghệ',
    description: 'Chữ C (Crop) và S (Scale) được thiết kế đan xen tinh tế dạng dải ruy-băng hiện đại, phong cách các startup công cụ đồ họa (Figma, Linear).',
    tag: 'Thương hiệu • Hiện đại',
  },
  {
    id: 'nested',
    name: 'Mẫu 3: Dual Artboard Frames',
    subtitle: 'Hai khung lồng nhau & Căn chỉnh tỉ lệ',
    description: 'Một khung nguồn dáng dọc đang được co giãn và fit vừa vặn vào khung vuông mục tiêu với các điểm neo tỷ lệ bo tròn.',
    tag: 'Tối giản • Phong cách Apple',
  },
  {
    id: 'aperture',
    name: 'Mẫu 4: Studio Shutter & Crosshair',
    subtitle: 'Ống kính khẩu độ & Tâm ngắm căn chỉnh',
    description: '4 lá khẩu geometric tạo thành khung ngắm chữ nhật với tâm ngắm laser màu xanh cyan, phong cách phần mềm studio nhiếp ảnh cao cấp.',
    tag: 'Nhiếp ảnh • Studio Pro',
  },
];

interface LogoSelectorModalProps {
  isOpen: boolean;
  currentVariant: LogoVariant;
  onSelectVariant: (variant: LogoVariant) => void;
  onClose: () => void;
}

export const LogoSelectorModal: React.FC<LogoSelectorModalProps> = ({
  isOpen,
  currentVariant,
  onSelectVariant,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-[#141619] border border-[#262b32] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#22262b] flex items-center justify-between bg-[#171a1d]">
          <div className="flex items-center space-x-2.5">
            <CropScaleLogo size={28} variant={currentVariant} />
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Chọn Mẫu Logo & Favicon Cho CropScale Studio
              </h2>
              <p className="text-[11px] text-slate-400">
                Bấm chọn mẫu logo bạn thích để áp dụng ngay vào thanh Header và biểu tượng app
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#22262b] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LOGO_OPTIONS.map((opt) => {
            const isSelected = currentVariant === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => onSelectVariant(opt.id)}
                className={`group relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center ${
                  isSelected
                    ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/15 ring-1 ring-blue-500'
                    : 'bg-[#181b1f] border-[#262b33] hover:border-slate-500/50 hover:bg-[#1c2025]'
                }`}
              >
                {/* Active Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}

                {/* Tag */}
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#20252c] text-blue-400 border border-blue-500/20 mb-3">
                  {opt.tag}
                </span>

                {/* Big Preview Icon */}
                <div className="my-2 p-2">
                  <CropScaleLogo size={72} variant={opt.id} glow={isSelected} />
                </div>

                {/* Titles */}
                <h3 className="text-xs font-bold text-slate-100 group-hover:text-blue-300 transition-colors mt-2">
                  {opt.name}
                </h3>
                <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                  {opt.subtitle}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-2 text-left bg-[#121417] p-2 rounded-lg border border-[#22272e] w-full">
                  {opt.description}
                </p>

                {/* Apply Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectVariant(opt.id);
                  }}
                  className={`mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-[#22272e] text-slate-300 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  {isSelected ? 'Đang Sử Dụng' : 'Chọn Mẫu Này'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#22262b] bg-[#111315] flex items-center justify-between text-xs text-slate-400">
          <span>Logo được lưu tự động trên trình duyệt của bạn</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1f242b] hover:bg-[#282f38] text-slate-200 font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
