import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, HelpCircle } from 'lucide-react';
import { useGame } from '../store/gameStore';
import { playCorrectSound, playWrongSound, playFailSound } from '../utils/sounds';

const OPTION_LABELS: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

const optionColors: Record<string, string> = {
  A: 'from-blue-600/90 to-blue-800/90 hover:from-blue-500 hover:to-blue-700 border-blue-400/40',
  B: 'from-emerald-600/90 to-emerald-800/90 hover:from-emerald-500 hover:to-emerald-700 border-emerald-400/40',
  C: 'from-amber-600/90 to-amber-800/90 hover:from-amber-500 hover:to-amber-700 border-amber-400/40',
  D: 'from-purple-600/90 to-purple-800/90 hover:from-purple-500 hover:to-purple-700 border-purple-400/40',
};

export default function QuestionModal() {
  const { state, answerQuestion, closeQuestion } = useGame();

  const question = state.config?.questions.find(
    (q) => q.id === state.activeQuestionId,
  );

  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [resultType, setResultType] = useState<'correct' | 'wrong' | 'failed' | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Reset local state when active question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setResultMessage(null);
    setResultType(null);
    setIsLocked(false);
  }, [state.activeQuestionId]);

  const handleAnswer = useCallback(
    (answer: 'A' | 'B' | 'C' | 'D') => {
      if (isLocked) return;

      setSelectedAnswer(answer);
      setIsLocked(true);

      const result = answerQuestion(answer);

      if (result === 'correct') {
        if (state.isSoundOn) playCorrectSound();
        setResultMessage('CHÍNH XÁC! 🎉');
        setResultType('correct');
        setTimeout(() => {
          closeQuestion();
        }, 1500);
      } else if (result === 'wrong') {
        if (state.isSoundOn) playWrongSound();
        setResultMessage('SAI RỒI! ❌');
        setResultType('wrong');
        setTimeout(() => {
          setResultMessage(null);
          setResultType(null);
          setSelectedAnswer(null);
          setIsLocked(false);
        }, 1200);
      } else if (result === 'failed') {
        if (state.isSoundOn) playFailSound();
        setResultMessage('HẾT LƯỢT! 🔒');
        setResultType('failed');
        setTimeout(() => {
          closeQuestion();
        }, 2000);
      }
    },
    [answerQuestion, closeQuestion, isLocked, state.isSoundOn],
  );

  if (!question) return null;

  const disabledOptions = new Set(question.wrongAnswers);
  const attemptsLeft = 3 - question.wrongAnswers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Dark backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
      />

      {/* Main modal card */}
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative z-10 w-full max-w-4xl bg-gradient-to-br from-[#0c1836] via-[#10234e] to-[#09142b] rounded-3xl border-2 border-amber-400/60 shadow-[0_0_60px_rgba(251,191,36,0.25)] overflow-hidden flex flex-col"
      >
        {/* Top bar with question badge, attempts left, and MC close button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-sm tracking-wider uppercase shadow-md flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" /> MẢNH GHÉP SỐ {question.id}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-300">
              Còn lại:{' '}
              <span className={`font-bold ${attemptsLeft === 1 ? 'text-red-400' : 'text-amber-400'}`}>
                {attemptsLeft} lần thử
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={closeQuestion}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Đóng câu hỏi (MC)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Question text */}
        <div className="px-6 sm:px-10 py-6 sm:py-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-relaxed tracking-wide drop-shadow-md">
            {question.text}
          </h2>
        </div>

        {/* Options grid (2x2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 sm:px-10 pb-8">
          {OPTION_LABELS.map((letter) => {
            const option = question.options.find((o) => o.id === letter);
            if (!option) return null;

            const isDisabled = disabledOptions.has(letter);
            const isSelected = selectedAnswer === letter;
            const isCorrectAnswer = isSelected && resultType === 'correct';
            const isWrongAnswer = isSelected && (resultType === 'wrong' || resultType === 'failed');

            let btnClasses =
              'relative flex items-center gap-4 px-5 py-4 sm:py-5 rounded-2xl border-2 text-left font-bold text-lg sm:text-xl transition-all duration-200 ';

            if (isCorrectAnswer) {
              btnClasses +=
                'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_30px_rgba(16,185,129,0.7)] scale-[1.02]';
            } else if (isWrongAnswer) {
              btnClasses +=
                'bg-red-600 border-red-400 text-white shadow-[0_0_30px_rgba(239,68,68,0.7)] scale-[0.98]';
            } else if (isDisabled) {
              btnClasses +=
                'bg-red-950/60 border-red-900/50 text-red-400/40 cursor-not-allowed opacity-60';
            } else {
              btnClasses += `bg-gradient-to-r ${optionColors[letter]} text-white cursor-pointer hover:border-yellow-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`;
            }

            return (
              <button
                key={letter}
                type="button"
                disabled={isDisabled || isLocked}
                onClick={() => handleAnswer(letter)}
                className={btnClasses}
              >
                {/* Option Letter Badge */}
                <span
                  className={`
                    w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0 shadow-inner
                    ${
                      isCorrectAnswer
                        ? 'bg-white text-emerald-700'
                        : isWrongAnswer
                          ? 'bg-white text-red-700'
                          : isDisabled
                            ? 'bg-red-900/40 text-red-400/50'
                            : 'bg-white/20 text-yellow-300'
                    }
                  `}
                >
                  {letter}
                </span>

                {/* Option text */}
                <span className="flex-1 break-words">{option.text}</span>

                {/* Result Icons */}
                {isCorrectAnswer && <Check className="w-8 h-8 text-white shrink-0" />}
                {(isWrongAnswer || isDisabled) && (
                  <X className="w-8 h-8 text-red-300/80 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Big Animated Result Banner */}
        <AnimatePresence>
          {resultMessage && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none"
            >
              <div
                className={`
                  px-8 py-4 sm:px-12 sm:py-6 rounded-3xl border-4 text-4xl sm:text-6xl font-black tracking-wider uppercase shadow-2xl
                  ${
                    resultType === 'correct'
                      ? 'bg-emerald-950/95 border-emerald-400 text-emerald-300 shadow-[0_0_60px_rgba(16,185,129,0.8)]'
                      : resultType === 'wrong'
                        ? 'bg-red-950/95 border-red-500 text-red-300 shadow-[0_0_60px_rgba(239,68,68,0.8)]'
                        : 'bg-amber-950/95 border-amber-500 text-amber-300 shadow-[0_0_60px_rgba(245,158,11,0.8)]'
                  }
                `}
              >
                {resultMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
