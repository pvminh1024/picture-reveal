import { motion, AnimatePresence } from 'motion/react';
import { Lock } from 'lucide-react';
import type { QuestionStatus } from '../types/game';

interface PuzzleTileProps {
  tileNumber: number; // 1-9
  status: QuestionStatus;
  isOpened: boolean;
  onClick: () => void;
  disabled: boolean;
}

export default function PuzzleTile({
  tileNumber,
  status,
  isOpened,
  onClick,
  disabled,
}: PuzzleTileProps) {
  const isFailed = status === 'completed_failed';
  const isClickable = !disabled && !isOpened && !isFailed;

  return (
    <div className="relative w-full h-full select-none">
      <AnimatePresence mode="wait">
        {!isOpened && (
          <motion.button
            key={`tile-${tileNumber}`}
            type="button"
            onClick={isClickable ? onClick : undefined}
            disabled={!isClickable}
            initial={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{
              scale: 0.1,
              opacity: 0,
              rotateY: 180,
              transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
            }}
            whileHover={isClickable ? { scale: 1.04, zIndex: 20 } : undefined}
            whileTap={isClickable ? { scale: 0.96 } : undefined}
            className={`
              w-full h-full flex flex-col items-center justify-center
              rounded-xl border-2 sm:border-[3px] transition-all duration-200
              ${
                isFailed
                  ? 'bg-gradient-to-br from-slate-900/95 via-red-950/90 to-slate-950/95 border-red-800/80 cursor-not-allowed shadow-inner'
                  : 'bg-gradient-to-br from-[#0c1a3a] via-[#102454] to-[#0a162e] border-amber-400/80 cursor-pointer shadow-lg'
              }
              ${
                isClickable
                  ? 'hover:border-yellow-300 hover:shadow-[0_0_25px_rgba(250,204,21,0.5)]'
                  : ''
              }
            `}
            style={{
              boxShadow: isFailed
                ? 'inset 0 0 20px rgba(185, 28, 28, 0.4)'
                : '0 4px 15px rgba(0, 0, 0, 0.5), inset 0 0 15px rgba(251, 191, 36, 0.15)',
            }}
          >
            {/* Background subtle pattern */}
            <div className="absolute inset-0 rounded-xl bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

            {/* Content */}
            {isFailed ? (
              <div className="flex flex-col items-center justify-center gap-1 text-red-400/70">
                <Lock className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="text-xl sm:text-2xl font-bold line-through opacity-40">
                  {tileNumber}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-red-400/80">
                  Khóa
                </span>
              </div>
            ) : (
              <div className="relative flex flex-col items-center justify-center">
                <span
                  className="text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-yellow-500 drop-shadow-md"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                  }}
                >
                  {tileNumber}
                </span>
                <span className="text-[10px] sm:text-xs tracking-widest text-amber-300/70 uppercase font-bold mt-0.5">
                  Mảnh ghép
                </span>
              </div>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
