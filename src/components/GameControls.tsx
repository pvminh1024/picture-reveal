import { useState } from 'react';
import { useGame } from '../store/gameStore';
import { useToast } from './Toast';
import ConfirmModal from './ConfirmModal';
import {
  Pause,
  Play,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Settings,
  Eye,
} from 'lucide-react';

interface GameControlsProps {
  onGoHome?: () => void;
}

export default function GameControls({ onGoHome }: GameControlsProps) {
  const { state, togglePause, toggleSound, resetGame, revealTopic, navigateTo } = useGame();
  const { showToast } = useToast();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRevealConfirm, setShowRevealConfirm] = useState(false);
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        showToast('Không thể bật toàn màn hình', 'warning');
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleReset = () => {
    resetGame();
    setShowResetConfirm(false);
    showToast('Đã reset lượt chơi!', 'info');
  };

  const handleRevealTopic = () => {
    revealTopic();
    setShowRevealConfirm(false);
    showToast('Đã công bố chủ đề!', 'success');
  };

  const handleGoHome = () => {
    setShowHomeConfirm(false);
    if (onGoHome) {
      onGoHome();
    } else {
      navigateTo('/admin');
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* Pause/Resume */}
        <button
          onClick={togglePause}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-white font-semibold transition-all hover:scale-105 border border-slate-600"
          title={state.isPaused ? 'Tiếp tục' : 'Tạm dừng'}
        >
          {state.isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          <span className="hidden sm:inline">{state.isPaused ? 'Tiếp tục' : 'Tạm dừng'}</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-white font-semibold transition-all hover:scale-105 border border-slate-600"
          title={state.isSoundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          {state.isSoundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-white font-semibold transition-all hover:scale-105 border border-slate-600"
          title="Toàn màn hình"
        >
          <Maximize className="w-5 h-5" />
        </button>

        {/* Reveal Topic */}
        <button
          onClick={() => setShowRevealConfirm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700/80 hover:bg-amber-600 text-white font-semibold transition-all hover:scale-105 border border-amber-500/50"
          title="Công bố chủ đề"
          disabled={state.isGameOver}
        >
          <Eye className="w-5 h-5" />
          <span className="hidden sm:inline">Công bố</span>
        </button>

        {/* Reset */}
        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-700/80 hover:bg-red-600 text-white font-semibold transition-all hover:scale-105 border border-red-500/50"
          title="Reset lượt chơi"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Go to Admin */}
        <button
          onClick={() => setShowHomeConfirm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-white font-semibold transition-all hover:scale-105 border border-slate-600"
          title="Quản lý bộ đề & chỉnh sửa câu hỏi (/admin)"
        >
          <Settings className="w-5 h-5 text-amber-400" />
          <span className="hidden sm:inline">Thiết lập</span>
        </button>
      </div>

      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset lượt chơi"
        message="Bạn có chắc muốn reset? Toàn bộ tiến trình lượt này sẽ bị xóa."
        confirmText="Reset"
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
        variant="danger"
      />

      <ConfirmModal
        isOpen={showRevealConfirm}
        title="Công bố chủ đề"
        message="Bạn có chắc muốn công bố chủ đề ngay bây giờ? Trò chơi sẽ kết thúc."
        confirmText="Công bố"
        onConfirm={handleRevealTopic}
        onCancel={() => setShowRevealConfirm(false)}
        variant="warning"
      />

      <ConfirmModal
        isOpen={showHomeConfirm}
        title="Vào trang quản lý (/admin)"
        message="Bạn có muốn chuyển sang màn hình quản lý bộ đề (/admin) để chỉnh sửa câu hỏi không?"
        confirmText="Đến /admin"
        onConfirm={handleGoHome}
        onCancel={() => setShowHomeConfirm(false)}
        variant="info"
      />
    </>
  );
}

