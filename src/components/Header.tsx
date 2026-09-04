import React, { useRef } from 'react';
import { 
  FolderDown, 
  Download, 
  Sparkles, 
  SlidersHorizontal,
  FileArchive,
  Copy
} from 'lucide-react';
import { CropScaleLogo, type LogoVariant } from './CropScaleLogo';
import type { FrameSettings } from '../types';

interface HeaderProps {
  imagesCount: number;
  selectedImagesCount?: number;
  currentFrame: FrameSettings;
  onOpenPresets: () => void;
  onSaveProject: () => void;
  onLoadProject: (file: File) => void;
  onLoadDemo: () => void;
  onCopyImage?: () => void;
  onExportSingle: () => void;
  onExportBatch: (selectedOnly?: boolean) => void;
  hasActiveImage: boolean;
  logoVariant?: LogoVariant;
  onOpenLogoSelector?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  imagesCount,
  currentFrame,
  onOpenPresets,
  onSaveProject,
  onLoadProject,
  onLoadDemo,
  onCopyImage,
  onExportSingle,
  onExportBatch,
  hasActiveImage,
  logoVariant = 'brackets',
  onOpenLogoSelector,
}) => {
  const projectInputRef = useRef<HTMLInputElement>(null);

  const handleProjectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadProject(file);
      e.target.value = '';
    }
  };

  return (
    <header className="h-14 bg-[#141618] border-b border-[#22262b] px-4 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand & Identity */}
      <div 
        onClick={onOpenLogoSelector}
        className="flex items-center space-x-3 cursor-pointer group"
        title="Bấm vào logo để xem và đổi các mẫu Logo & Favicon khác"
      >
        <div className="transition-transform group-hover:scale-105">
          <CropScaleLogo size={36} glow variant={logoVariant} />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-semibold text-sm text-slate-100 tracking-tight group-hover:text-blue-300 transition-colors">
              CropScale Studio
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              v1.0 Pro
            </span>
          </div>
          <p className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">
            Cắt, Co Giãn & Đổi Kích Thước Ảnh Đa Năng
          </p>
        </div>
      </div>

      {/* Center status / quick badge */}
      <div className="hidden md:flex items-center space-x-2 bg-[#1a1d20] px-3 py-1.5 rounded-lg border border-[#2a3038] text-xs">
        <span className="text-slate-400">Khung xuất:</span>
        <span className="font-mono font-semibold text-blue-400">
          {currentFrame.width} × {currentFrame.height} px
        </span>
        <span className="text-slate-500 font-mono">({currentFrame.ratio})</span>
        <button
          onClick={onOpenPresets}
          className="ml-2 px-2 py-0.5 rounded text-[11px] bg-[#22262b] hover:bg-[#2c323b] text-slate-300 transition-colors flex items-center space-x-1"
          title="Đổi hoặc quản lý Preset"
        >
          <SlidersHorizontal className="w-3 h-3 text-blue-400" />
          <span>Presets</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {/* Load Demo */}
        <button
          onClick={onLoadDemo}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#1e2329] hover:bg-[#282f37] text-slate-300 border border-[#2c333d] transition-colors flex items-center space-x-1.5"
          title="Nạp 3 mẫu vách CNC có sẵn để thử nghiệm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Ảnh Mẫu Demo</span>
        </button>

        {/* Project Load / Save */}
        <input
          ref={projectInputRef}
          type="file"
          accept=".cropscaleproject,.cncproject,.json"
          onChange={handleProjectFileChange}
          className="hidden"
        />
        <button
          onClick={() => projectInputRef.current?.click()}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#1a1d20] hover:bg-[#242930] text-slate-300 border border-[#262b32] transition-colors flex items-center space-x-1"
          title="Mở file dự án đã lưu (.cropscaleproject)"
        >
          <FolderOpenIcon className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Mở Dự Án</span>
        </button>

        <button
          onClick={onSaveProject}
          disabled={imagesCount === 0}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#1a1d20] hover:bg-[#242930] disabled:opacity-40 disabled:pointer-events-none text-slate-300 border border-[#262b32] transition-colors flex items-center space-x-1"
          title="Lưu lại toàn bộ căn chỉnh vào file .cncproject"
        >
          <FolderDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Lưu Dự Án</span>
        </button>

        <div className="h-5 w-[1px] bg-[#262b32] mx-1" />

        {/* Single Export */}
        <button
          onClick={onExportSingle}
          disabled={!hasActiveImage}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#222831] hover:bg-[#2c3440] disabled:opacity-40 disabled:pointer-events-none text-slate-200 border border-[#303844] transition-colors flex items-center space-x-1.5 shadow-sm"
          title="Xuất ảnh đang chọn với kích thước chuẩn"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span>Xuất Ảnh</span>
        </button>

        {/* Copy to Clipboard */}
        {onCopyImage && (
          <button
            onClick={onCopyImage}
            disabled={!hasActiveImage}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#1e2621] hover:bg-[#26332a] disabled:opacity-40 disabled:pointer-events-none text-emerald-300 border border-emerald-500/30 transition-colors flex items-center space-x-1.5 shadow-sm"
            title="Sao chép ảnh đã crop vào bộ nhớ tạm (Clipboard) để dán trực tiếp (Ctrl+V) vào Paint / Corel / Photoshop / Zalo"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Sao Chép Ảnh</span>
          </button>
        )}

        {/* Batch Export ZIP */}
        <button
          onClick={() => onExportBatch(false)}
          disabled={imagesCount === 0}
          className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white shadow-md shadow-blue-600/20 transition-all flex items-center space-x-1.5"
          title="Xuất toàn bộ ảnh thành file ZIP"
        >
          <FileArchive className="w-3.5 h-3.5 text-blue-100" />
          <span className="font-semibold">Xuất Tất Cả ({imagesCount})</span>
        </button>
      </div>
    </header>
  );
};

function FolderOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>
    </svg>
  );
}
