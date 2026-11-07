import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../store/gameStore';
import PuzzleBoard from './PuzzleBoard';
import QuestionModal from './QuestionModal';
import TopicGuessModal from './TopicGuessModal';
import GameControls from './GameControls';
import VictoryScreen from './VictoryScreen';
import RulesModal from './RulesModal';
import { Settings, BookOpen } from 'lucide-react';

export default function GamePage() {
  const { state, questionSets, activeSetId, switchQuestionSet, navigateTo } = useGame();
  const [showGuessModal, setShowGuessModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  return (
    <div className="h-screen max-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col justify-between overflow-hidden relative select-none">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      {/* Top Left: Button "Thể lệ" */}
      <button
        type="button"
        onClick={() => setShowRulesModal(true)}
        className="fixed top-2.5 left-4 z-30 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 font-bold text-xs sm:text-sm border border-amber-400/50 shadow-lg backdrop-blur-md transition-all hover:scale-105"
        title="Xem thể lệ trò chơi"
      >
        <BookOpen className="w-4 h-4 text-amber-400" />
        <span>Thể lệ</span>
      </button>

      {/* Header */}
      <header className="relative z-10 text-center pt-2 pb-1 px-4">
        {/* Title */}
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide"
        >
          <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
            ✨ MẢNH GHÉP VĂN HÓA ✨
          </span>
        </motion.h1>

        {/* Question Sets Switcher (1 - 5) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1.5">
          {questionSets.map((s, idx) => {
            const isSelected = s.id === activeSetId;
            const shortName = s.name ? s.name.replace(/^Bộ\s*\d+\s*:\s*/i, '') : `Bộ ${idx + 1}`;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (s.id !== activeSetId) {
                    switchQuestionSet(s.id);
                  }
                }}
                className={`
                  px-3 py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5
                  ${isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)] scale-105'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700 hover:border-slate-500'
                  }
                `}
                title={`Chuyển sang ${s.name || `Bộ ${idx + 1}`}`}
              >
                <span>Bộ {idx + 1}</span>
                {shortName && <span className="opacity-75 font-normal max-w-[130px] truncate">({shortName})</span>}
              </button>
            );
          })}

          {/* Quick link to /admin */}
          <button
            type="button"
            onClick={() => navigateTo('/admin')}
            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-slate-700 flex items-center gap-1 transition-colors"
            title="Chỉnh sửa câu hỏi & quản lý bộ đề (/admin)"
          >
            <Settings className="w-3.5 h-3.5" /> Thiết lập
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-1 gap-2 overflow-hidden">
        {/* Paused overlay */}
        <AnimatePresence>
          {state.isPaused && !state.isGameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="text-center"
              >
                <div className="text-6xl font-black text-yellow-400 mb-4">⏸️ TẠM DỪNG</div>
                <p className="text-2xl text-slate-300">Nhấn nút "Tiếp tục" để chơi tiếp</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Puzzle board */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden"
        >
          <PuzzleBoard />
        </motion.div>
      </main>

      {/* Footer centered controls */}
      <footer className="relative z-10 pb-3 px-4">
        <GameControls />
      </footer>

      {/* Bottom Right: Button "ĐOÁN CHỦ ĐỀ" (bỏ icon, góc dưới bên phải) */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={() => setShowGuessModal(true)}
        disabled={state.isPaused || state.isGameOver || state.activeQuestionId !== null}
        className="fixed bottom-3 right-4 sm:right-6 z-30 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/30 transition-all hover:scale-105 hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-2 border-amber-300 tracking-wider uppercase"
      >
        Đoán chủ đề
      </motion.button>

      {/* Rules Modal */}
      <RulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />

      {/* Question Modal */}
      <AnimatePresence>
        {state.activeQuestionId !== null && <QuestionModal />}
      </AnimatePresence>

      {/* Topic Guess Modal */}
      <TopicGuessModal isOpen={showGuessModal} onClose={() => setShowGuessModal(false)} />

      {/* Victory Screen */}
      <AnimatePresence>
        {state.isGameOver && <VictoryScreen />}
      </AnimatePresence>
    </div>
  );
}
