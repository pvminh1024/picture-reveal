import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Trophy, Sparkles, ArrowRight, Settings, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../store/gameStore';
import { playVictorySound } from '../utils/sounds';

export default function VictoryScreen() {
  const {
    state,
    resetGame,
    questionSets,
    activeSetId,
    switchQuestionSet,
    navigateTo,
  } = useGame();

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

  // Find next question set in circular order
  const currentIndex = questionSets.findIndex((s) => s.id === activeSetId);
  const nextSet =
    questionSets.length > 1
      ? questionSets[(currentIndex + 1) % questionSets.length]
      : null;

  const handleSelectNextSet = (targetId: number) => {
    confettiFired.current = false;
    switchQuestionSet(targetId);
  };

  const handleGoToAdmin = () => {
    confettiFired.current = false;
    navigateTo('/admin');
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
        className="relative w-full max-w-4xl bg-gradient-to-b from-[#0e1d44] via-[#091530] to-[#040a18] rounded-3xl border-4 border-amber-400 p-6 sm:p-8 shadow-[0_0_80px_rgba(251,191,36,0.5)] text-center flex flex-col items-center gap-5 my-auto"
      >
        {/* Glow behind modal */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy Header */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.8)] border-4 border-white mb-2"
          >
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-slate-950" />
          </motion.div>

          <h2 className="text-xl sm:text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            CHÚC MỪNG CHIẾN THẮNG!
            <Sparkles className="w-5 h-5 text-amber-300" />
          </h2>

          {state.winnerTeam && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-1.5 px-5 py-1 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-300 text-base sm:text-lg font-bold"
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
            className="w-full max-w-md rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-[0_0_30px_rgba(0,0,0,0.8)] bg-black"
          >
            <img
              src={topicImage}
              alt={topicKeyword}
              className="w-full h-44 sm:h-56 object-cover"
            />
          </motion.div>
        )}

        {/* Topic Keyword Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-0.5"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            CHỦ ĐỀ BÍ ẨN CHÍNH LÀ
          </p>
          <h1
            className="text-3xl sm:text-5xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 0 25px rgba(251,191,36,0.6))',
            }}
          >
            {topicKeyword}
          </h1>
        </motion.div>

        {/* Selection of Other Sets to Play Next (1 to 5) */}
        {questionSets.length > 1 && (
          <div className="w-full max-w-xl bg-slate-900/80 border border-amber-500/30 rounded-2xl p-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300 flex items-center justify-center gap-1.5 mb-2">
              <Layers className="w-4 h-4" /> CHỌN BỘ ĐỀ TIẾP THEO ĐỂ CHƠI:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {questionSets.map((s, idx) => {
                const isCurrent = s.id === activeSetId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectNextSet(s.id)}
                    className={`
                      px-3 py-1.5 rounded-xl text-xs font-bold transition-all border
                      ${
                        isCurrent
                          ? 'bg-slate-800 text-slate-400 border-slate-700 cursor-default'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 hover:scale-105 shadow-md'
                      }
                    `}
                  >
                    Bộ {idx + 1}: {s.name || `Bộ ${idx + 1}`}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-1"
        >
          {/* Quick Play Next Set Button if available */}
          {nextSet && nextSet.id !== activeSetId && (
            <button
              type="button"
              onClick={() => handleSelectNextSet(nextSet.id)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all border border-amber-300"
            >
              <span>CHƠI TIẾP {nextSet.name || `BỘ ${nextSet.id}`}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          {/* Replay Current Set */}
          <button
            type="button"
            onClick={handlePlayAgain}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-900/40 hover:scale-105 active:scale-95 transition-all border border-blue-400/40"
          >
            <RotateCcw className="w-4 h-4" />
            Chơi lại bộ này
          </button>

          {/* Edit Questions Button (/admin) */}
          <button
            type="button"
            onClick={handleGoToAdmin}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm sm:text-base shadow-md hover:scale-105 active:scale-95 transition-all border border-slate-600"
          >
            <Settings className="w-4 h-4" />
            Quản lý câu hỏi (/admin)
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
