import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { BackgroundSettings, FrameSettings, GuideSettings, ImageItem, TransformState } from '../types';
import { renderCanvasViewport } from '../utils/canvasRenderer';

interface CanvasViewportProps {
  activeImage: ImageItem | null;
  loadedImageElement: HTMLImageElement | null;
  transform: TransformState;
  frame: FrameSettings;
  background: BackgroundSettings;
  guides: GuideSettings;
  viewZoom: number;
  onTransformChange: (newTransform: TransformState, addToHistory?: boolean) => void;
  onFitToggle: () => void;
  showContentBox?: boolean;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  activeImage,
  loadedImageElement,
  transform,
  frame,
  background,
  guides,
  viewZoom,
  onTransformChange,
  onFitToggle,
  showContentBox = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialX: number; initialY: number } | null>(null);

  // Re-render canvas whenever relevant props change
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    renderCanvasViewport({
      canvas,
      ctx,
      image: loadedImageElement,
      transform,
      frame,
      background,
      guides,
      viewZoom,
      viewportWidth: width,
      viewportHeight: height,
      contentBox: activeImage?.contentBox,
      showContentBox,
    });
  }, [
    loadedImageElement,
    transform,
    frame,
    background,
    guides,
    viewZoom,
    activeImage?.contentBox,
    showContentBox,
  ]);

  // Window resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      renderCanvasViewport({
        canvas,
        ctx,
        image: loadedImageElement,
        transform,
        frame,
        background,
        guides,
        viewZoom,
        viewportWidth: container.clientWidth,
        viewportHeight: container.clientHeight,
        contentBox: activeImage?.contentBox,
        showContentBox,
      });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [loadedImageElement, transform, frame, background, guides, viewZoom, activeImage, showContentBox]);

  // Mouse Drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!loadedImageElement || e.button !== 0) return; // Only left mouse drag

      setIsDragging(true);
      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        initialX: transform.x,
        initialY: transform.y,
      };
    },
    [loadedImageElement, transform]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging || !dragStartRef.current) return;

      const deltaX = (e.clientX - dragStartRef.current.mouseX) / viewZoom;
      const deltaY = (e.clientY - dragStartRef.current.mouseY) / viewZoom;

      let newX = dragStartRef.current.initialX + deltaX;
      let newY = dragStartRef.current.initialY + deltaY;

      // Snap to grid if enabled
      if (guides.snapToGrid && guides.gridSize > 0) {
        newX = Math.round(newX / guides.gridSize) * guides.gridSize;
        newY = Math.round(newY / guides.gridSize) * guides.gridSize;
      }

      onTransformChange(
        {
          ...transform,
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10,
        },
        false // Do not push each mousemove event to history
      );
    },
    [isDragging, viewZoom, transform, guides, onTransformChange]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      // Push the final dragged position to undo history
      onTransformChange({ ...transform }, true);
    }
  }, [isDragging, transform, onTransformChange]);

  // Mouse Wheel Zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      if (!loadedImageElement) return;
      e.preventDefault();

      // Ctrl + wheel: fine zoom, standard wheel: normal zoom
      const zoomFactor = e.ctrlKey ? 0.03 : 0.08;
      const scaleMultiplier = e.deltaY < 0 ? 1 + zoomFactor : 1 - zoomFactor;
      const newScale = Math.max(0.05, Math.min(40.0, transform.scale * scaleMultiplier));

      onTransformChange(
        {
          ...transform,
          scale: Math.round(newScale * 1000) / 1000,
        },
        true
      );
    },
    [loadedImageElement, transform, onTransformChange]
  );

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-full w-full bg-[#0c0d0e] overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={onFitToggle}
        className={`w-full h-full block ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      />

      {/* Floating Info Overlay (Resolution & Scale) */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-2 pointer-events-none">
        <div className="px-2.5 py-1 rounded-md bg-[#141618]/85 backdrop-blur border border-[#262b32] text-[11px] text-slate-300 font-mono shadow-md flex items-center space-x-2">
          <span className="text-slate-500">Khung:</span>
          <span className="text-blue-400 font-semibold">
            {frame.width} × {frame.height} px
          </span>
          {activeImage && (
            <>
              <span className="text-slate-600">|</span>
              <span className="text-slate-500">Ảnh gốc:</span>
              <span className="text-emerald-400">
                {activeImage.originalWidth} × {activeImage.originalHeight} px
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-500">Zoom:</span>
              <span className="text-amber-400 font-semibold">
                {Math.round(transform.scale * 100)}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* Helper guide on how to interact */}
      <div className="absolute top-3 right-3 z-10 pointer-events-none hidden lg:block">
        <div className="px-2.5 py-1 rounded-md bg-[#141618]/70 backdrop-blur border border-[#22262b] text-[10px] text-slate-400 shadow-md">
          <span>Kéo chuột để di chuyển • Cuộn chuột để phóng to/thu nhỏ</span>
        </div>
      </div>
    </div>
  );
};
