import React, { useRef } from 'react';
import { 
  Plus, 
  FolderPlus, 
  Sparkles, 
  CheckCircle2,
  ClipboardPaste
} from 'lucide-react';
import { CropScaleLogo, type LogoVariant } from './CropScaleLogo';

interface EmptyStateProps {
  onAddFiles: (files: File[]) => void;
  onLoadDemo: () => void;
  onPasteFromClipboard: () => void;
  isDraggingOver: boolean;
  logoVariant?: LogoVariant;
  onOpenLogoSelector?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onAddFiles,
  onLoadDemo,
  onPasteFromClipboard,
  isDraggingOver,
  logoVariant = 'brackets',
  onOpenLogoSelector,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <div
      className={`flex-1 h-full flex flex-col items-center justify-center p-6 text-center select-none transition-all ${
        isDraggingOver
          ? 'bg-blue-600/10 border-2 border-dashed border-blue-500/80 scale-[0.99]'
          : 'bg-[#0c0d0e]'
      }`}
    >
      <div className="max-w-md w-full flex flex-col items-center space-y-4">
        {/* Glowing Icon with click to change logo */}
        <div
          onClick={onOpenLogoSelector}
          className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
          title="Bấm để xem và đổi các mẫu Logo & Favicon khác"
        >
          <CropScaleLogo size={72} glow variant={logoVariant} />
        </div>

        {/* Title & Tagline */}
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            CropScale Studio
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cắt (Crop), co giãn (Scale) & đổi kích thước (Resize) ảnh đa năng hàng loạt.<br />
            Khung cố định, di chuyển ảnh phía sau, xuất đúng từng pixel cho mọi ngành.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/bmp,image/svg+xml"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Ảnh</span>
          </button>

          {/* Folder Input */}
          <input
            ref={folderInputRef}
            type="file"
            // @ts-ignore
            webkitdirectory="true"
            // @ts-ignore
            directory="true"
            multiple
            onChange={handleFolderInputChange}
            className="hidden"
          />
          <button
            onClick={() => folderInputRef.current?.click()}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-[#1a1e24] hover:bg-[#242930] text-slate-200 border border-[#2e3642] transition-colors flex items-center justify-center space-x-2"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" />
            <span>Thêm Thư Mục</span>
          </button>

          {/* Paste from Clipboard Button */}
          <button
            onClick={onPasteFromClipboard}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-[#1a2333] hover:bg-[#202d42] text-blue-300 border border-blue-500/30 transition-colors flex items-center justify-center space-x-2"
            title="Dán trực tiếp ảnh vừa copy trong Paint / Snipping Tool (Ctrl+V)"
          >
            <ClipboardPaste className="w-4 h-4 text-blue-400" />
            <span>Dán Ảnh (Ctrl+V)</span>
          </button>
        </div>

        {/* Demo button */}
        <div className="pt-0.5">
          <button
            onClick={onLoadDemo}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 transition-colors flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nạp 3 ảnh mẫu thử nghiệm (Demo)</span>
          </button>
        </div>

        {/* Paste helper hint badge */}
        <div className="p-2.5 rounded-xl bg-[#141619] border border-[#232830] text-xs text-slate-300 flex items-center justify-center space-x-2">
          <kbd className="px-1.5 py-0.5 rounded bg-[#20252d] border border-[#2f3743] font-mono text-[11px] text-blue-400 font-semibold shadow-inner">
            Ctrl + V
          </kbd>
          <span className="text-[11px] text-slate-400">
            Dán trực tiếp ảnh từ bộ nhớ tạm (Paint, Photoshop, Snipping Tool)
          </span>
        </div>

        {/* Features Checklist */}
        <div className="grid grid-cols-2 gap-2 pt-3 w-full border-t border-[#1e2329] text-left text-[11px] text-slate-400">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Khung cố định, kéo zoom tự do</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Tự nhận diện vật thể & căn giữa</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Xuất file ZIP hàng trăm ảnh</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Chạy offline, bảo mật tuyệt đối</span>
          </div>
        </div>

        {/* Drag message */}
        <p className="text-[11px] text-slate-500 pt-0.5">
          Hoặc kéo thả file / thư mục chứa ảnh trực tiếp vào đây
        </p>
      </div>
    </div>
  );
};
