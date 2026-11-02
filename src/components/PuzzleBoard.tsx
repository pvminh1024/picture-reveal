import { useState, useEffect, useRef, useMemo } from 'react';
import { useGame } from '../store/gameStore';
import PuzzleTile from './PuzzleTile';

export default function PuzzleBoard() {
  const { state, selectTile } = useGame();
  const config = state.config;

  const containerRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);

  // Read naturalWidth / naturalHeight of the uploaded image
  useEffect(() => {
    if (!config?.topicImage) return;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      }
    };
    img.src = config.topicImage;
  }, [config?.topicImage]);

  // Monitor available space between title and buttons
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute maximum board size fitting available space while preserving natural aspect ratio
  const boardSize = useMemo(() => {
    if (!naturalSize || !containerSize) return null;
    const { width: cw, height: ch } = containerSize;
    const { width: nw, height: nh } = naturalSize;
    if (cw <= 0 || ch <= 0 || nw <= 0 || nh <= 0) return null;

    const scale = Math.min(cw / nw, ch / nh);
    // Snap to multiple of 3 to eliminate fractional subpixel rounding gaps across the 3x3 grid
    const w = Math.max(3, Math.floor((nw * scale) / 3) * 3);
    const h = Math.max(3, Math.floor((nh * scale) / 3) * 3);

    return { width: w, height: h };
  }, [naturalSize, containerSize]);

  if (!config) return null;

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-0 flex items-center justify-center overflow-hidden"
    >
      <div
        className="relative overflow-hidden rounded-none border border-amber-400/60 shadow-[0_0_40px_rgba(0,0,0,0.8)] bg-slate-950 select-none"
        style={
          boardSize
            ? { width: `${boardSize.width}px`, height: `${boardSize.height}px` }
            : { visibility: 'hidden' }
        }
      >
        {/* Background topic image - complete and uninterrupted underneath */}
        <img
          src={config.topicImage}
          alt="Chủ đề bí ẩn"
          onLoad={(e) => {
            const { naturalWidth, naturalHeight } = e.currentTarget;
            if (naturalWidth && naturalHeight) {
              setNaturalSize({ width: naturalWidth, height: naturalHeight });
            }
          }}
          className="absolute inset-0 w-full h-full block rounded-none select-none pointer-events-none"
          draggable={false}
        />

        {/* 3x3 Grid covering the image with border-radius 0 and gap 0 */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0 p-0 m-0">
          {config.questions.map((question) => {
            const isOpened = state.openedTiles.includes(question.id);
            const isDisabled =
              state.isPaused ||
              state.isGameOver ||
              question.status === 'completed_correct' ||
              question.status === 'completed_failed' ||
              state.activeQuestionId !== null;

            return (
              <div key={question.id} className="relative w-full h-full overflow-hidden p-0 m-0">
                <PuzzleTile
                  tileNumber={question.id}
                  status={question.status}
                  isOpened={isOpened}
                  onClick={() => selectTile(question.id)}
                  disabled={isDisabled}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
