import { useState, useCallback, useEffect } from 'react';
import type { GameState, GameConfig } from './types/game';
import {
  GameContext,
  getInitialGameState,
  saveGameState,
  loadGameState,
  saveGameConfig,
} from './store/gameStore';
import { playTileOpenSound, playClickSound } from './utils/sounds';
import SetupPage from './components/SetupPage';
import GamePage from './components/GamePage';
import { ToastProvider } from './components/Toast';

function App() {
  const [state, setState] = useState<GameState>(() => {
    const saved = loadGameState();
    if (saved && saved.config && saved.currentScreen === 'game') {
      return saved;
    }
    return getInitialGameState();
  });

  // Save state to localStorage on change
  useEffect(() => {
    saveGameState(state);
  }, [state]);

  const selectTile = useCallback((tileId: number) => {
    setState((prev) => {
      if (!prev.config) return prev;
      const question = prev.config.questions.find((q) => q.id === tileId);
      if (!question) return prev;
      if (question.status !== 'not_started') return prev;
      if (prev.activeQuestionId !== null) return prev;
      if (prev.isPaused || prev.isGameOver) return prev;

      if (prev.isSoundOn) playClickSound();

      const updatedQuestions = prev.config.questions.map((q) =>
        q.id === tileId ? { ...q, status: 'in_progress' as const } : q
      );

      return {
        ...prev,
        activeQuestionId: tileId,
        config: { ...prev.config, questions: updatedQuestions },
      };
    });
  }, []);

  const answerQuestion = useCallback((answer: 'A' | 'B' | 'C' | 'D'): 'correct' | 'wrong' | 'failed' => {
    let result: 'correct' | 'wrong' | 'failed' = 'wrong';

    setState((prev) => {
      if (!prev.config || prev.activeQuestionId === null) return prev;
      const questionIndex = prev.config.questions.findIndex((q) => q.id === prev.activeQuestionId);
      if (questionIndex === -1) return prev;
      const question = prev.config.questions[questionIndex];

      if (answer === question.correctAnswer) {
        result = 'correct';
        const updatedQuestions = [...prev.config.questions];
        updatedQuestions[questionIndex] = {
          ...question,
          status: 'completed_correct' as const,
        };

        return {
          ...prev,
          config: { ...prev.config, questions: updatedQuestions },
        };
      } else {
        const newWrongAnswers = [...question.wrongAnswers, answer];

        if (newWrongAnswers.length >= 3) {
          result = 'failed';
          const updatedQuestions = [...prev.config.questions];
          updatedQuestions[questionIndex] = {
            ...question,
            wrongAnswers: newWrongAnswers,
            status: 'completed_failed' as const,
          };
          return {
            ...prev,
            config: { ...prev.config, questions: updatedQuestions },
          };
        } else {
          result = 'wrong';
          const updatedQuestions = [...prev.config.questions];
          updatedQuestions[questionIndex] = {
            ...question,
            wrongAnswers: newWrongAnswers,
          };
          return {
            ...prev,
            config: { ...prev.config, questions: updatedQuestions },
          };
        }
      }
    });

    return result;
  }, []);

  const closeQuestion = useCallback(() => {
    setState((prev) => {
      if (!prev.config || prev.activeQuestionId === null) return prev;
      const question = prev.config.questions.find((q) => q.id === prev.activeQuestionId);
      if (!question) return prev;

      const newOpenedTiles =
        question.status === 'completed_correct'
          ? [...prev.openedTiles, prev.activeQuestionId]
          : prev.openedTiles;

      if (question.status === 'completed_correct' && prev.isSoundOn) {
        playTileOpenSound();
      }

      return {
        ...prev,
        activeQuestionId: null,
        openedTiles: newOpenedTiles,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState((prev) => {
      if (!prev.config) return prev;
      const resetQuestions = prev.config.questions.map((q) => ({
        ...q,
        status: 'not_started' as const,
        wrongAnswers: [] as ('A' | 'B' | 'C' | 'D')[],
      }));
      return {
        ...prev,
        config: { ...prev.config, questions: resetQuestions },
        activeQuestionId: null,
        openedTiles: [],
        isPaused: false,
        isGameOver: false,
        winnerTeam: null,
        guessAttempts: [],
      };
    });
  }, []);

  const revealAllTiles = useCallback((winnerTeam: string) => {
    setState((prev) => {
      if (!prev.config) return prev;
      const allTileIds = prev.config.questions.map((q) => q.id);
      return {
        ...prev,
        openedTiles: allTileIds,
        activeQuestionId: null,
      };
    });

    playTileOpenSound();

    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isGameOver: true,
        winnerTeam,
      }));
    }, 1200);
  }, []);

  const togglePause = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const toggleSound = useCallback(() => {
    setState((prev) => ({ ...prev, isSoundOn: !prev.isSoundOn }));
  }, []);

  const revealTopic = useCallback(() => {
    setState((prev) => {
      if (!prev.config) return prev;
      const allTileIds = prev.config.questions.map((q) => q.id);
      return {
        ...prev,
        openedTiles: allTileIds,
        activeQuestionId: null,
      };
    });

    playTileOpenSound();

    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isGameOver: true,
        winnerTeam: 'Ban Tổ Chức (MC)',
      }));
    }, 1200);
  }, []);

  const handleStartGame = useCallback((config: GameConfig) => {
    saveGameConfig(config);
    setState({
      config,
      currentScreen: 'game',
      activeQuestionId: null,
      openedTiles: [],
      isPaused: false,
      isSoundOn: true,
      isGameOver: false,
      winnerTeam: null,
      guessAttempts: [],
    });
  }, []);

  const handleGoHome = useCallback(() => {
    setState((prev) => ({
      ...getInitialGameState(),
      config: prev.config,
      currentScreen: 'setup',
    }));
  }, []);

  const contextValue = {
    state,
    setState,
    selectTile,
    answerQuestion,
    closeQuestion,
    resetGame,
    revealAllTiles,
    togglePause,
    toggleSound,
    revealTopic,
  };

  return (
    <ToastProvider>
      <GameContext.Provider value={contextValue}>
        {state.currentScreen === 'setup' ? (
          <SetupPage initialConfig={state.config} onStartGame={handleStartGame} />
        ) : (
          <GamePage onGoHome={handleGoHome} />
        )}
      </GameContext.Provider>
    </ToastProvider>
  );
}

export default App;
