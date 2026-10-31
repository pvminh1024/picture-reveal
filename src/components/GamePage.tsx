import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../store/gameStore';
import PuzzleBoard from './PuzzleBoard';
import QuestionModal from './QuestionModal';
import TopicGuessModal from './TopicGuessModal';
import GameControls from './GameControls';
import VictoryScreen from './VictoryScreen';
import { HelpCircle, Sparkles } from 'lucide-react';

interface GamePageProps {
  onGoHome: () => void;
}

export default function GamePage({ onGoHome }: GamePageProps) {
  const { state } = useGame();
  const [showGuessModal, setShowGuessModal] = useState(false);

  const openedCount = state.openedTiles.length;
  const totalTiles = 9;

  // Count completed questions (either correct or failed)
  const completedCount = state.config?.questions.filter(
    (q) => q.status === 'completed_correct' || q.status === 'completed_failed'
  ).length ?? 0;

  return (
    <div className="h-screen max-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col justify-between overflow-hidden relative select-none">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 text-center pt-4 pb-2 px-4">
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-black"
        >
          <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
            ✨ LẬT MẢNH GHÉP BÍ ẨN ✨
          </span>
        </motion.h1>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-6 mt-2 text-slate-300"
        >
          <div className="flex items-center gap-2 bg-slate-800/60 px-4 py-1.5 rounded-full border border-slate-700">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-sm">
              Đã mở: <span className="text-amber-400">{openedCount}</span>/{totalTiles}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/60 px-4 py-1.5 rounded-full border border-slate-700">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-sm">
              Đã chơi: <span className="text-blue-400">{completedCount}</span>/{totalTiles}
            </span>
          </div>
        </motion.div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2 gap-4">
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
        >
          <PuzzleBoard />
        </motion.div>

        {/* Guess topic button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => setShowGuessModal(true)}
          disabled={state.isPaused || state.isGameOver || state.activeQuestionId !== null}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 font-bold text-xl shadow-lg shadow-amber-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-2 border-amber-300/50"
        >
          🎯 ĐOÁN CHỦ ĐỀ
        </motion.button>
      </main>

      {/* Footer controls */}
      <footer className="relative z-10 pb-4 px-4">
        <GameControls onGoHome={onGoHome} />
      </footer>

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

