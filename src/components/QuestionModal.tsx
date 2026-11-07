import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Check, X, HelpCircle } from 'lucide-react';
import { useGame } from '../store/gameStore';
import { playCorrectSound, playWrongSound, playFailSound, playTileOpenSound } from '../utils/sounds';

const OPTION_LABELS: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

function getQuestionFontSizeClass(length: number): string {
  if (length > 450) {
    return 'text-sm sm:text-base md:text-lg lg:text-xl xl:text-[22px] leading-relaxed max-w-[1450px]';
  }
  if (length > 280) {
    return 'text-base sm:text-lg md:text-xl lg:text-2xl xl:text-[26px] leading-relaxed max-w-[1350px]';
  }
  if (length > 150) {
    return 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-[32px] leading-relaxed max-w-[1250px]';
  }
  if (length > 80) {
    return 'text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-relaxed max-w-[1150px]';
  }
  return 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-relaxed max-w-[1050px]';
}

export default function QuestionModal() {
  const { state, answerQuestion, closeQuestion } = useGame();

  const question = state.config?.questions.find(
    (q) => q.id === state.activeQuestionId,
  );

  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Reset local state when active question changes
  useEffect(() => {
    setCorrectAnswer(null);
    setIsLocked(false);
  }, [state.activeQuestionId]);

  const handleAnswer = useCallback(
    (answer: 'A' | 'B' | 'C' | 'D') => {
      if (isLocked) return;

      const result = answerQuestion(answer);

      if (result === 'correct') {
        setIsLocked(true);
        setCorrectAnswer(answer);
        if (state.isSoundOn) {
          playCorrectSound();
          playTileOpenSound();
        }
        // Không tự tắt câu hỏi: để người dùng tự bấm nút X góc trên bên phải
      } else if (result === 'wrong') {
        if (state.isSoundOn) playWrongSound();
      } else if (result === 'failed') {
        setIsLocked(true);
        if (state.isSoundOn) playFailSound();
        // Không tự tắt câu hỏi: để người dùng tự bấm nút X góc trên bên phải
      }
    },
    [answerQuestion, isLocked, state.isSoundOn],
  );

  if (!question) return null;

  const rawText = question.text || '';
  const formattedText = rawText
    .replace(/\s*\/n\s*/g, '\n')
    .replace(/\s*\\n\s*/g, '\n')
    .trim();

  const isCompletedCorrect =
    question.status === 'completed_correct' || correctAnswer !== null;
  const isCompletedFailed =
    question.status === 'completed_failed' || question.wrongAnswers.length >= 3;
  const attemptsLeft = Math.max(0, 3 - question.wrongAnswers.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
      {/* Dark backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />

      {/* Main modal card - near full screen layout */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative z-10 w-full max-w-[1550px] h-full max-h-[94vh] bg-gradient-to-br from-[#091329] via-[#0e2148] to-[#060e1d] rounded-2xl sm:rounded-3xl border-2 border-amber-400/60 shadow-[0_0_80px_rgba(251,191,36,0.3)] flex flex-col justify-between overflow-hidden"
      >
        {/* Top bar with question badge, status, and MC close button */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-8 py-2.5 sm:py-3 border-b border-amber-500/20 bg-slate-900/60">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="px-3.5 sm:px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm md:text-base tracking-wider uppercase shadow-md flex items-center gap-1.5 sm:gap-2">
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" /> MẢNH GHÉP SỐ {question.id}
            </span>

            {isCompletedCorrect ? (
              <span className="px-3 sm:px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs sm:text-sm md:text-base flex items-center gap-1.5 animate-fadeIn">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> Trả lời chính xác!
              </span>
            ) : isCompletedFailed ? (
              <span className="px-3 sm:px-4 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-bold text-xs sm:text-sm md:text-base flex items-center gap-1.5 animate-fadeIn">
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" /> Hết lượt!
              </span>
            ) : (
              <span className="text-xs sm:text-sm md:text-base font-semibold text-slate-300">
                Còn lại:{' '}
                <span className={`font-bold ${attemptsLeft === 1 ? 'text-red-400' : 'text-amber-400'}`}>
                  {attemptsLeft} lượt chọn
                </span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={closeQuestion}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all ${isCompletedCorrect || isCompletedFailed
              ? 'bg-amber-400/25 text-amber-300 hover:bg-amber-400/35 border border-amber-400/60 shadow-lg ring-2 ring-amber-400/40 scale-105'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            title="Đóng câu hỏi (MC)"
          >
            {(isCompletedCorrect || isCompletedFailed) && (
              <span className="text-xs sm:text-sm font-bold hidden sm:inline">Đóng</span>
            )}
            <X className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>

        {/* Question text container - centered with dynamic font sizing and smooth overflow handling */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 md:px-14 py-2 sm:py-4 flex">
          <div className="m-auto w-full flex flex-col items-center">
            <h2
              className={`font-extrabold text-white text-center tracking-wide drop-shadow-md select-none whitespace-pre-line ${getQuestionFontSizeClass(
                formattedText.length,
              )}`}
            >
              {formattedText}
            </h2>
          </div>
        </div>

        {/* Options grid (2x2) - filling bottom portion comfortably */}
        <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5 lg:gap-4 px-4 sm:px-8 md:px-14 pb-3 sm:pb-5 pt-1.5">
          {OPTION_LABELS.map((letter) => {
            const option = question.options.find((o) => o.id === letter);
            if (!option) return null;

            const isCorrect =
              correctAnswer === letter ||
              (question.status === 'completed_correct' && question.correctAnswer === letter);
            const isWrong = question.wrongAnswers.includes(letter);
            const isDisabled =
              isWrong || isCorrect || isLocked || isCompletedCorrect || isCompletedFailed;

            let btnClasses =
              'relative flex items-center gap-3 sm:gap-4 px-3.5 sm:px-5 py-2.5 sm:py-3 lg:py-3.5 rounded-xl sm:rounded-2xl border-2 text-left font-bold transition-all duration-150 min-h-[56px] sm:min-h-[64px] lg:min-h-[72px] ';

            if (isCorrect) {
              btnClasses += 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)] cursor-default';
            } else if (isWrong) {
              btnClasses += 'bg-red-700/85 border-red-500 text-white cursor-not-allowed opacity-80';
            } else if (isLocked || isCompletedCorrect || isCompletedFailed) {
              btnClasses += 'bg-slate-800/50 border-slate-700/60 text-slate-400 cursor-not-allowed opacity-60';
            } else {
              btnClasses +=
                'bg-slate-800/95 hover:bg-slate-700/95 border-slate-600/80 hover:border-amber-400 text-white cursor-pointer active:scale-[0.99]';
            }

            return (
              <button
                key={letter}
                type="button"
                disabled={isDisabled}
                onClick={() => handleAnswer(letter)}
                className={btnClasses}
              >
                {/* Option Letter Badge */}
                <span
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center font-black text-base sm:text-lg lg:text-xl shrink-0 shadow-inner
                    ${isCorrect
                      ? 'bg-white text-emerald-700'
                      : isWrong
                        ? 'bg-red-950/70 text-red-200'
                        : isLocked || isCompletedCorrect || isCompletedFailed
                          ? 'bg-white/5 text-slate-500'
                          : 'bg-white/10 text-amber-300'
                    }
                  `}
                >
                  {letter}
                </span>

                {/* Option text */}
                <span className="flex-1 text-sm sm:text-base lg:text-lg font-bold leading-snug break-words">
                  {option.text}
                </span>

                {/* Result Icons */}
                {isCorrect && <Check className="w-6 h-6 sm:w-7 sm:h-7 text-white shrink-0" />}
                {isWrong && <X className="w-6 h-6 sm:w-7 sm:h-7 text-red-200 shrink-0" />}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
