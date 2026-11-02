import { motion, AnimatePresence } from 'motion/react';
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
    <div className="relative w-full h-full select-none overflow-hidden rounded-none p-0 m-0">
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
            whileHover={
              isClickable
                ? {
                    zIndex: 10,
                    boxShadow:
                      'inset 0 0 0 1.5px #fde047, inset 0 0 16px rgba(250, 204, 21, 0.35)',
                  }
                : undefined
            }
            whileTap={isClickable ? { scale: 0.98 } : undefined}
            className={`
              w-full h-full flex items-center justify-center
              rounded-none border-0 p-0 m-0 transition-all duration-200
              ${
                isFailed
                  ? 'bg-[#12141a] cursor-not-allowed opacity-100'
                  : 'bg-gradient-to-br from-[#0c1a38] via-[#102450] to-[#0a162e] cursor-pointer opacity-100'
              }
            `}
            style={{
              boxShadow: isFailed
                ? 'inset 0 0 0 1px #222632'
                : 'inset 0 0 0 1px rgba(251, 191, 36, 0.4)',
            }}
          >
            {/* Content */}
            {isFailed ? (
              <span className="text-3xl sm:text-5xl md:text-6xl font-black text-neutral-600/70 select-none tracking-tight">
                {tileNumber}
              </span>
            ) : (
              <span
                className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-yellow-500 drop-shadow-md select-none"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                }}
              >
                {tileNumber}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
