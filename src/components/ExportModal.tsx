import React, { useState } from 'react';
import { 
  X, 
  FileArchive, 
  CheckCircle2, 
  Download
} from 'lucide-react';
import type { BackgroundSettings, ExportSettings, FrameSettings, ImageItem } from '../types';
import { batchExportZip } from '../utils/exportEngine';
import type { BatchExportProgress } from '../utils/exportEngine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageItem[];
  frame: FrameSettings;
  background: BackgroundSettings;
  exportSettings: ExportSettings;
  onExportSettingsChange: (settings: ExportSettings) => void;
  onMarkImagesExported: (ids: string[]) => void;
  isExportingSelected?: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  images,
  frame,
  background,
  exportSettings,
  onMarkImagesExported,
  isExportingSelected = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<BatchExportProgress | null>(null);
  const [abortController, setAbortController] = useState<{ aborted: boolean }>({ aborted: false });

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsProcessing(true);
    const abortSignal = { aborted: false };
    setAbortController(abortSignal);

    try {
      await batchExportZip(
        images,
        frame,
        background,
        exportSettings,
        (p) => setProgress(p),
        abortSignal
      );
      // Mark images as exported
      onMarkImagesExported(images.map((i) => i.id));
    } catch (err: any) {
      console.error(err);
      setProgress({
        current: 0,
        total: images.length,
        currentFileName: 'Lỗi',
        status: 'error',
        errorMessage: err.message || 'Lỗi khi đóng gói file ZIP',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    abortController.aborted = true;
    setIsProcessing(false);
  };

  const percent = progress && progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg bg-[#171a1d] border border-[#2a3038] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#141618] border-b border-[#22262b] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <FileArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                {isExportingSelected ? 'Xuất Các Ảnh Đã Chọn' : 'Xuất Toàn Bộ Thư Viện'}
              </h3>
              <p className="text-xs text-slate-400">
                Đóng gói {images.length} ảnh thành file .ZIP với chuẩn kích thước
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#20252b] text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Summary Box */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#121416] border border-[#22262b] text-xs">
            <div>
              <span className="text-slate-500 block">Kích thước xuất:</span>
              <span className="font-mono font-semibold text-blue-400 text-sm">
                {frame.width} × {frame.height} px
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Định dạng file:</span>
              <span className="font-mono font-semibold text-slate-200 uppercase text-sm">
                {exportSettings.format === 'jpeg' ? 'JPG' : exportSettings.format}
                {exportSettings.format !== 'png' && ` (${exportSettings.quality}%)`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Nền ảnh (Background):</span>
              <span className="capitalize font-medium text-slate-300">
                {background.type === 'transparent'
                  ? 'Trong suốt (Alpha)'
                  : background.type === 'white'
                  ? 'Trắng'
                  : background.type === 'black'
                  ? 'Đen'
                  : 'Màu tùy chỉnh'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Số lượng ảnh:</span>
              <span className="font-mono font-semibold text-emerald-400 text-sm">
                {images.length} ảnh
              </span>
            </div>
          </div>

          {/* Progress Bar Display */}
          {progress && (
            <div className="p-4 rounded-xl bg-[#121416] border border-[#22262b] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium truncate max-w-[280px]">
                  {progress.status === 'processing' && `Đang xử lý: ${progress.currentFileName}`}
                  {progress.status === 'zipping' && 'Đang nén file ZIP...'}
                  {progress.status === 'completed' && 'Hoàn tất xuất file ZIP!'}
                  {progress.status === 'cancelled' && 'Đã hủy quá trình xuất.'}
                  {progress.status === 'error' && (progress.errorMessage || 'Có lỗi xảy ra')}
                </span>
                <span className="font-mono font-bold text-blue-400">{percent}%</span>
              </div>

              {/* Progress bar line */}
              <div className="w-full h-2 rounded-full bg-[#20252b] overflow-hidden">
                <div
                  className={`h-full transition-all duration-150 ${
                    progress.status === 'completed'
                      ? 'bg-emerald-500'
                      : progress.status === 'error'
                      ? 'bg-rose-500'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{progress.current} / {progress.total} ảnh</span>
                {progress.status === 'completed' && (
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã tải xuống máy</span>
                  </span>
                )}
              </div>

              {progress.status === 'completed' && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-300 space-y-1 mt-2">
                  <div className="flex items-center space-x-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>File: {progress.savedFileName || `CNC_Thumbnails_${frame.width}x${frame.height}.zip`}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    📁 <strong>Vị trí lưu:</strong> File được lưu tự động vào thư mục <strong>Downloads (Tải về)</strong> của Windows. Bạn có thể bấm vào biểu tượng hình thư mục 📁 trong mục Tải xuống của Chrome để mở ngay.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Info note */}
          {!progress && (
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Mỗi ảnh sẽ được căn chỉnh theo đúng tỉ lệ và góc đặt riêng của từng mẫu, sau đó kết xuất trực tiếp từ file gốc ở độ nét cao nhất vào thư mục nén ZIP.
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#141618] border-t border-[#22262b] flex items-center justify-end space-x-2">
          {isProcessing ? (
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-[#22272e] hover:bg-rose-500/20 text-rose-300 transition-colors"
            >
              Hủy Quá Trình
            </button>
          ) : progress?.status === 'completed' ? (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Đóng</span>
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Hủy
              </button>

              <button
                onClick={handleStartExport}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/25 transition-all flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Bắt Đầu Xuất ZIP</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
