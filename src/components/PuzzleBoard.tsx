import { useGame } from '../store/gameStore';
import PuzzleTile from './PuzzleTile';

export default function PuzzleBoard() {
  const { state, selectTile } = useGame();
  const config = state.config;

  if (!config) return null;

  return (
    <div className="relative w-[85vw] h-[85vw] sm:w-[420px] sm:h-[420px] md:w-[480px] md:h-[480px] lg:w-[520px] lg:h-[520px] max-w-[54vh] max-h-[54vh] aspect-square rounded-2xl p-2 bg-gradient-to-br from-amber-500/30 via-slate-800 to-amber-600/30 border-2 border-amber-400/50 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md">
      {/* Container with overflow-hidden for image and tiles */}
      <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-950">
        {/* Background topic image - complete and uninterrupted underneath */}
        <img
          src={config.topicImage}
          alt="Chủ đề bí ẩn"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
        />

        {/* 3x3 Grid covering the image */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1.5 p-1.5">
          {config.questions.map((question) => {
            const isOpened = state.openedTiles.includes(question.id);
            const isDisabled =
              state.isPaused ||
              state.isGameOver ||
              question.status === 'completed_correct' ||
              question.status === 'completed_failed' ||
              state.activeQuestionId !== null;

            return (
              <div key={question.id} className="relative w-full h-full">
                <PuzzleTile
                  tileNumber={question.id}
                  status={question.status}
                  isOpened={isOpened}
                  onClick={() => selectTile(question.id)}
                  disabled={isDisabled}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
