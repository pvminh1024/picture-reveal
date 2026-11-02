import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, X, Check } from 'lucide-react';
import { useGame } from '../store/gameStore';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  const { gameRules } = useGame();

  if (!isOpen) return null;

  // Split lines / paragraphs to render properly with formatting
  const paragraphs = gameRules.split('\n\n').filter((p) => p.trim());

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal card */}
        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative z-10 w-full max-w-2xl bg-gradient-to-b from-[#0e1d44] via-[#0a1633] to-[#060e22] rounded-3xl border-2 border-amber-400/60 shadow-[0_0_60px_rgba(251,191,36,0.3)] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-slate-900/50">
            <div className="flex items-center gap-2.5 text-amber-400 font-black text-xl tracking-wider">
              <span className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/30">
                <BookOpen className="w-5 h-5 text-amber-300" />
              </span>
              <span>THỂ LỆ TRÒ CHƠI</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-4 max-h-[70vh] overflow-y-auto leading-relaxed text-slate-200 text-base sm:text-lg">
            {paragraphs.map((p, idx) => {
              const isNotice = p.trim().startsWith('*') || p.toLowerCase().includes('lưu ý');

              if (isNotice) {
                // Strip outer markdown asterisks if any
                const cleanText = p.replace(/^\*+|\*+$/g, '').trim();
                return (
                  <div
                    key={idx}
                    className="mt-6 pt-4 border-t border-amber-500/20 bg-amber-500/5 p-4 rounded-2xl border border-amber-400/30"
                  >
                    <p className="italic font-semibold text-amber-300 text-center tracking-wide">
                      *{cleanText}*
                    </p>
                  </div>
                );
              }

              return (
                <p key={idx} className="text-justify font-medium">
                  {p}
                </p>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm transition-all hover:scale-105 shadow-md"
            >
              <Check className="w-4 h-4" /> Đã rõ thể lệ
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

