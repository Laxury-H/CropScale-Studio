import React, { useRef, useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  FolderPlus, 
  Search, 
  Trash2, 
  Copy, 
  CheckSquare, 
  Square, 
  ArrowUpDown,
  Download,
  ClipboardPaste,
  Pencil,
  Sparkles
} from 'lucide-react';
import type { ImageItem } from '../types';

interface SidebarProps {
  images: ImageItem[];
  activeImageId: string | null;
  selectedIds: Set<string>;
  onSelectImage: (id: string, isShift: boolean, isCtrl: boolean) => void;
  onAddFiles: (files: File[]) => void;
  onRemoveImages: (ids: string[]) => void;
  onApplyTransformToSelected: () => void;
  onExportSelected: () => void;
  onToggleSelectAll: () => void;
  onPasteFromClipboard: () => void;
  onRenameImage: (id: string, newName: string) => void;
  onOpenSmartRename: () => void;
}

type SortField = 'name' | 'size' | 'status';

export const Sidebar: React.FC<SidebarProps> = ({
  images,
  activeImageId,
  selectedIds,
  onSelectImage,
  onAddFiles,
  onRemoveImages,
  onApplyTransformToSelected,
  onExportSelected,
  onToggleSelectAll,
  onPasteFromClipboard,
  onRenameImage,
  onOpenSmartRename,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Inline editing state (Double-click / double-tap rename)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const lastTapRef = useRef<{ id: string; time: number }>({ id: '', time: 0 });

  const startEditing = (img: ImageItem) => {
    setEditingId(img.id);
    setEditingName(img.name);
  };

  const saveEditing = () => {
    if (editingId) {
      const trimmed = editingName.trim();
      const currentImg = images.find((i) => i.id === editingId);
      if (trimmed && currentImg && trimmed !== currentImg.name) {
        onRenameImage(editingId, trimmed);
      }
    }
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      const dotIdx = editInputRef.current.value.lastIndexOf('.');
      if (dotIdx > 0) {
        editInputRef.current.setSelectionRange(0, dotIdx);
      } else {
        editInputRef.current.select();
      }
    }
  }, [editingId]);

  const handleTouchEnd = (img: ImageItem) => {
    const now = Date.now();
    if (lastTapRef.current.id === img.id && now - lastTapRef.current.time < 350) {
      startEditing(img);
    }
    lastTapRef.current = { id: img.id, time: now };
  };

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

  // Filter & Sort
  const filteredImages = useMemo(() => {
    let list = images.filter((img) =>
      img.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );

    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name, undefined, { numeric: true });
      } else if (sortField === 'size') {
        comparison = a.size - b.size;
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortAsc ? comparison : -comparison;
    });

    return list;
  }, [images, searchTerm, sortField, sortAsc]);

  const allSelected = images.length > 0 && selectedIds.size === images.length;
  const isMultiSelecting = selectedIds.size > 1;

  return (
    <aside className="w-72 sm:w-80 bg-[#141618] border-r border-[#22262b] flex flex-col h-full shrink-0 select-none">
      {/* Top Action Buttons */}
      <div className="p-3 border-b border-[#22262b] space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Add Image button */}
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
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-[#1e2329] hover:bg-[#272e37] text-slate-200 border border-[#2b333e] transition-colors shadow-sm"
            title="Chọn một hoặc nhiều file ảnh từ máy"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Thêm Ảnh</span>
          </button>

          {/* Add Folder button */}
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
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-[#1e2329] hover:bg-[#272e37] text-slate-200 border border-[#2b333e] transition-colors shadow-sm"
            title="Import toàn bộ ảnh trong một thư mục"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>Thêm Thư Mục</span>
          </button>
        </div>

        {/* Paste from Clipboard button */}
        <button
          onClick={onPasteFromClipboard}
          className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-medium bg-[#17202c] hover:bg-[#1e2938] text-blue-300 border border-blue-500/30 transition-colors shadow-sm"
          title="Dán ảnh vừa Copy trong Paint hoặc Snipping Tool (Phím Ctrl + V)"
        >
          <ClipboardPaste className="w-3.5 h-3.5 text-blue-400" />
          <span>Dán Ảnh Từ Clipboard (Ctrl+V)</span>
        </button>

        {/* Search & Sort Row */}
        <div className="flex items-center space-x-1.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#1a1d20] border border-[#262b32] rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => {
              if (sortField === 'name') setSortField('status');
              else if (sortField === 'status') setSortField('size');
              else setSortField('name');
            }}
            className="px-2 py-1.5 rounded-md text-[11px] bg-[#1a1d20] hover:bg-[#242930] text-slate-400 border border-[#262b32] transition-colors flex items-center space-x-1"
            title={`Sắp xếp theo: ${sortField}`}
          >
            <ArrowUpDown className="w-3 h-3" />
            <span className="capitalize">{sortField === 'name' ? 'Tên' : sortField === 'status' ? 'Status' : 'Size'}</span>
          </button>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="px-1.5 py-1.5 rounded-md text-[11px] bg-[#1a1d20] hover:bg-[#242930] text-slate-400 border border-[#262b32] transition-colors"
            title={sortAsc ? 'Tăng dần' : 'Giảm dần'}
          >
            {sortAsc ? '↑' : '↓'}
          </button>
        </div>

        {/* Multi-Select Toolbar (When images exist) */}
        {images.length > 0 && (
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
            <div className="flex items-center space-x-2">
              <button
                onClick={onToggleSelectAll}
                className="flex items-center space-x-1.5 hover:text-slate-200 transition-colors"
              >
                {allSelected ? (
                  <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>
                  {selectedIds.size > 0
                    ? `Đã chọn ${selectedIds.size} / ${images.length}`
                    : `Tất cả (${images.length})`}
                </span>
              </button>

              <button
                type="button"
                onClick={onOpenSmartRename}
                className="px-1.5 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-colors flex items-center space-x-1"
                title="Mở công cụ đổi tên thông minh hàng loạt (dải số 1-10, công thức...)"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="font-medium">Đổi tên loạt</span>
              </button>
            </div>

            {selectedIds.size > 0 && (
              <div className="flex items-center space-x-1">
                {isMultiSelecting && (
                  <>
                    <button
                      onClick={onApplyTransformToSelected}
                      className="px-1.5 py-0.5 rounded bg-[#222831] hover:bg-[#2c3440] text-blue-300 border border-blue-500/30 transition-colors flex items-center space-x-1"
                      title="Sao chép căn chỉnh của ảnh hiện tại sang các ảnh đã chọn"
                    >
                      <Copy className="w-2.5 h-2.5" />
                      <span>Áp dụng căn chỉnh</span>
                    </button>

                    <button
                      onClick={onExportSelected}
                      className="px-1.5 py-0.5 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 transition-colors flex items-center space-x-1"
                      title="Xuất file ZIP chỉ những ảnh đã chọn"
                    >
                      <Download className="w-2.5 h-2.5" />
                      <span>Xuất ({selectedIds.size})</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => onRemoveImages(Array.from(selectedIds))}
                  className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Xóa ảnh đã chọn khỏi danh sách"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1e2227] px-2 py-2 space-y-1">
        {filteredImages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
            {images.length === 0 ? (
              <>
                <div className="w-10 h-10 rounded-full bg-[#1c2025] flex items-center justify-center text-slate-500 mb-2">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-slate-400">Chưa có ảnh nào</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Nhấn "Thêm Ảnh" hoặc kéo thả ảnh vào khung làm việc
                </p>
              </>
            ) : (
              <p className="text-xs">Không tìm thấy file phù hợp</p>
            )}
          </div>
        ) : (
          filteredImages.map((img) => {
            const isActive = img.id === activeImageId;
            const isSelected = selectedIds.has(img.id);

            return (
              <div
                key={img.id}
                onClick={(e) => onSelectImage(img.id, e.shiftKey, e.ctrlKey || e.metaKey)}
                className={`group relative flex items-center p-2 rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? 'bg-blue-600/15 border border-blue-500/50 shadow-sm'
                    : isSelected
                    ? 'bg-[#1e2329] border border-[#2e3744]'
                    : 'bg-[#171a1d] hover:bg-[#1c2024] border border-transparent'
                }`}
              >
                {/* Checkbox */}
                <div 
                  className="mr-2 shrink-0 text-slate-500 hover:text-blue-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectImage(img.id, false, true);
                  }}
                >
                  {isSelected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                  )}
                </div>

                {/* Thumbnail Preview with Checkerboard */}
                <div className="w-11 h-11 rounded-md overflow-hidden bg-[#101214] border border-[#262b32] canvas-checkerboard-dense shrink-0 relative flex items-center justify-center">
                  <img
                    src={img.thumbnailUrl}
                    alt={img.name}
                    className="max-w-full max-h-full object-contain pointer-events-none"
                    loading="lazy"
                  />
                  {/* Edited indicator badge */}
                  {img.status === 'edited' && (
                    <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
                  )}
                </div>

                {/* Metadata */}
                <div 
                  className="ml-2.5 flex-1 min-w-0"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startEditing(img);
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    handleTouchEnd(img);
                  }}
                >
                  <div className="flex items-center justify-between">
                    {editingId === img.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          saveEditing();
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full mr-1"
                      >
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={saveEditing}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              e.stopPropagation();
                              cancelEditing();
                            }
                          }}
                          className="w-full px-1.5 py-0.5 text-xs bg-[#101214] border border-blue-500 rounded text-slate-100 focus:outline-none font-medium shadow-inner"
                        />
                      </form>
                    ) : (
                      <div className="flex items-center justify-between w-full group/name">
                        <p 
                          className="text-xs font-medium text-slate-200 truncate group-hover:text-blue-300"
                          title={`${img.name}\n(Nhấn đúp hoặc chạm 2 lần để đổi tên)`}
                        >
                          {img.name}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(img);
                          }}
                          className="opacity-0 group-hover/name:opacity-100 p-0.5 rounded hover:bg-[#252b33] text-slate-400 hover:text-blue-300 transition-opacity ml-1 shrink-0"
                          title="Đổi tên ảnh này"
                        >
                          <Pencil className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-slate-400">
                    <span className="font-mono">
                      {img.originalWidth} × {img.originalHeight}
                    </span>
                    <span>•</span>
                    <span className="capitalize">
                      {img.status === 'edited' ? (
                        <span className="text-emerald-400">Đã căn chỉnh</span>
                      ) : img.status === 'exported' ? (
                        <span className="text-blue-400">Đã xuất</span>
                      ) : (
                        <span className="text-slate-500">Chưa chỉnh</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Single Delete action on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImages([img.id]);
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-1 p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-opacity"
                  title="Xóa ảnh này"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info Counter */}
      <div className="p-2.5 border-t border-[#22262b] bg-[#111315] text-[11px] text-slate-400 flex items-center justify-between">
        <span>Tổng: {images.length} ảnh</span>
        <span className="text-slate-500">
          {images.filter((i) => i.status === 'edited').length} đã chỉnh
        </span>
      </div>
    </aside>
  );
};
