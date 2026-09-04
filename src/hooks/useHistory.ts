import { useState, useCallback } from 'react';
import type { TransformState } from '../types';

export function useTransformHistory(initialState: TransformState) {
  const [history, setHistory] = useState<TransformState[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const pushState = useCallback((newState: TransformState) => {
    setHistory((prev) => {
      // Truncate future if currently in the past
      const updated = prev.slice(0, currentIndex + 1);
      // Limit history depth to 40 steps
      if (updated.length >= 40) {
        updated.shift();
      }
      return [...updated, newState];
    });
    setCurrentIndex((prev) => Math.min(prev + 1, 39));
  }, [currentIndex]);

  const undo = useCallback((): TransformState | null => {
    if (currentIndex > 0) {
      const nextIdx = currentIndex - 1;
      setCurrentIndex(nextIdx);
      return history[nextIdx];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback((): TransformState | null => {
    if (currentIndex < history.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      return history[nextIdx];
    }
    return null;
  }, [currentIndex, history]);

  const resetHistory = useCallback((state: TransformState) => {
    setHistory([state]);
    setCurrentIndex(0);
  }, []);

  return {
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    undo,
    redo,
    pushState,
    resetHistory,
  };
}
