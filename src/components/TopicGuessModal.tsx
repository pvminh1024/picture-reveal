import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, CheckCircle, XCircle, X, HelpCircle, Users } from 'lucide-react';
import { useGame } from '../store/gameStore';
import { useToast } from './Toast';
import { playWrongSound } from '../utils/sounds';

interface TopicGuessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics for flexible matching option
    .replace(/\s+/g, ' ');
}

function strictNormalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFC')
    .replace(/\s+/g, ' ');
}

export default function TopicGuessModal({ isOpen, onClose }: TopicGuessModalProps) {
  const { state, revealAllTiles } = useGame();
  const { showToast } = useToast();

  const [teamName, setTeamName] = useState('');
  const [guess, setGuess] = useState('');
  const [matchResult, setMatchResult] = useState<boolean | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  const teamInputRef = useRef<HTMLInputElement>(null);
  const keyword = state.config?.topicKeyword ?? '';

  useEffect(() => {
    if (isOpen) {
      setTeamName('');
      setGuess('');
      setMatchResult(null);
      setHasChecked(false);
      setTimeout(() => teamInputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleCheck = () => {
    if (!guess.trim()) return;
    const exactMatch = strictNormalize(guess) === strictNormalize(keyword);
    const softMatch = normalize(guess) === normalize(keyword);
    const isMatch = exactMatch || softMatch;
    setMatchResult(isMatch);
    setHasChecked(true);
  };

  const handleMCCorrect = () => {
    const finalTeam = teamName.trim() || 'Đội chơi xuất sắc';
    revealAllTiles(finalTeam);
    resetAndClose();
  };

  const handleMCWrong = () => {
    if (state.isSoundOn) playWrongSound();
    showToast(`Đội "${teamName.trim() || 'Chơi'}" đoán chưa chính xác!`, 'warning');
    resetAndClose();
  };

  const resetAndClose = () => {
    setTeamName('');
    setGuess('');
    setMatchResult(null);
    setHasChecked(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={resetAndClose}
      />

      {/* Card */}
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative z-10 w-full max-w-lg bg-gradient-to-br from-[#0c1836] via-[#10234e] to-[#09142b] rounded-3xl border-2 border-amber-400/60 shadow-[0_0_50px_rgba(251,191,36,0.3)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-slate-900/50">
          <div className="flex items-center gap-2 text-amber-400 font-black text-xl">
            <HelpCircle className="w-6 h-6" />
            <span>ĐOÁN CHỦ ĐỀ TRÒ CHƠI</span>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-amber-300 mb-2">
              <Users className="w-4 h-4" /> TÊN ĐỘI GIÀNH QUYỀN TRẢ LỜI
            </label>
            <input
              ref={teamInputRef}
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="VD: Đội Rồng Vàng, Đội 1..."
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border-2 border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 text-white placeholder-slate-500 font-semibold outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-amber-300 mb-2">
              DỰ ĐOÁN ĐÁP ÁN CHỦ ĐỀ
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={guess}
                onChange={(e) => {
                  setGuess(e.target.value);
                  setHasChecked(false);
                  setMatchResult(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCheck();
                }}
                placeholder="Nhập câu trả lời của đội..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900/90 border-2 border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 text-white placeholder-slate-500 font-semibold outline-none transition-all"
              />
              <button
                type="button"
                onClick={handleCheck}
                disabled={!guess.trim()}
                className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 transition-all shadow-md shrink-0"
                title="So khớp tự động với đáp án bí mật"
              >
                <Search className="w-4 h-4" /> Kiểm tra
              </button>
            </div>
          </div>

          {/* Assistant check result */}
          <AnimatePresence>
            {hasChecked && matchResult !== null && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-3 rounded-xl text-center font-bold text-base border flex items-center justify-center gap-2 ${
                  matchResult
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-red-950/80 border-red-500 text-red-300'
                }`}
              >
                {matchResult ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>Trùng khớp với từ khóa chủ đề!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span>Chưa trùng khớp (MC có toàn quyền quyết định)</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* MC Decision Header */}
          <div className="pt-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-2 text-center">
              QUYẾT ĐỊNH CỦA MC
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleMCCorrect}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-lg shadow-lg shadow-emerald-900/40 hover:scale-105 active:scale-95 transition-all border border-emerald-400/40"
              >
                <CheckCircle className="w-6 h-6" /> ĐÚNG ✓
              </button>

              <button
                type="button"
                onClick={handleMCWrong}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-lg shadow-lg shadow-red-900/40 hover:scale-105 active:scale-95 transition-all border border-red-400/40"
              >
                <XCircle className="w-6 h-6" /> SAI ✗
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
