import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Home, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../store/gameStore';
import { playVictorySound } from '../utils/sounds';

export default function VictoryScreen() {
  const { state, setState, resetGame } = useGame();
  const confettiFired = useRef(false);

  useEffect(() => {
    if (!state.isGameOver) return;

    if (state.isSoundOn) {
      playVictorySound();
    }

    if (!confettiFired.current) {
      confettiFired.current = true;

      // Realistic continuous confetti fireworks
      const end = Date.now() + 5 * 1000;
      const colors = ['#FFD700', '#FFA500', '#00E5FF', '#FF1744', '#76FF03', '#FFFFFF'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.7 },
          colors,
          zIndex: 9999,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.7 },
          colors,
          zIndex: 9999,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [state.isGameOver, state.isSoundOn]);

  if (!state.isGameOver) return null;

  const topicImage = state.config?.topicImage ?? '';
  const topicKeyword = state.config?.topicKeyword ?? '';

  const handlePlayAgain = () => {
    confettiFired.current = false;
    resetGame();
  };

  const handleGoHome = () => {
    confettiFired.current = false;
    setState((prev) => ({ ...prev, currentScreen: 'setup' }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-lg overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.85, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="relative w-full max-w-4xl bg-gradient-to-b from-[#0e1d44] via-[#091530] to-[#040a18] rounded-3xl border-4 border-amber-400 p-6 sm:p-10 shadow-[0_0_80px_rgba(251,191,36,0.5)] text-center flex flex-col items-center gap-6 my-auto"
      >
        {/* Glow behind modal */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy Header */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.8)] border-4 border-white mb-3"
          >
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-slate-950" />
          </motion.div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-300" />
            CHÚC MỪNG CHIẾN THẮNG!
            <Sparkles className="w-6 h-6 text-amber-300" />
          </h2>

          {state.winnerTeam && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-2 px-6 py-2 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-300 text-lg sm:text-xl font-bold"
            >
              🎉 Đội chiến thắng:{' '}
              <span className="text-white font-black">{state.winnerTeam}</span>
            </motion.div>
          )}
        </div>

        {/* Full Revealed Topic Image */}
        {topicImage && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-lg rounded-2xl overflow-hidden border-4 border-amber-400/80 shadow-[0_0_40px_rgba(0,0,0,0.8)] bg-black"
          >
            <img
              src={topicImage}
              alt={topicKeyword}
              className="w-full h-56 sm:h-72 object-cover"
            />
          </motion.div>
        )}

        {/* Topic Keyword Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-1"
        >
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">
            CHỦ ĐỀ BÍ ẨN CHÍNH LÀ
          </p>
          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(251,191,36,0.6))',
            }}
          >
            {topicKeyword}
          </h1>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <button
            type="button"
            onClick={handlePlayAgain}
            className="flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-lg shadow-xl shadow-blue-900/40 hover:scale-105 active:scale-95 transition-all border border-blue-400/40"
          >
            <RotateCcw className="w-5 h-5" />
            Chơi lại lượt này
          </button>

          <button
            type="button"
            onClick={handleGoHome}
            className="flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all border border-slate-600"
          >
            <Home className="w-5 h-5" />
            Về màn hình thiết lập
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
