import { useState, useCallback, useEffect } from 'react';
import type { GameState, QuestionSet } from './types/game';
import {
  GameContext,
  getInitialGameState,
  saveGameState,
  loadGameState,
  loadQuestionSets,
  loadActiveSetId,
  saveActiveSetId,
  createConfigFromSet,
  loadGameRules,
  saveGameRules,
} from './store/gameStore';
import { playTileOpenSound, playClickSound } from './utils/sounds';
import SetupPage from './components/SetupPage';
import GamePage from './components/GamePage';
import { ToastProvider } from './components/Toast';

function App() {
  // Question sets management (1 to 5 sets)
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>(() => loadQuestionSets());
  const [activeSetId, setActiveSetId] = useState<number>(() => {
    const sets = loadQuestionSets();
    const savedId = loadActiveSetId();
    return sets.some((s) => s.id === savedId) ? savedId : sets[0]?.id || 1;
  });

  // Game rules state
  const [gameRules, setGameRules] = useState<string>(() => loadGameRules());
  const updateGameRules = useCallback((rules: string) => {
    setGameRules(rules);
    saveGameRules(rules);
  }, []);

  // Routing: / is Game screen, /admin is Setup/Question editor
  const [currentRoute, setCurrentRoute] = useState<'/' | '/admin'>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('/admin') || hash.includes('admin')) {
      return '/admin';
    }
    return '/';
  });

  // Listen to browser Back/Forward buttons and Hash changes
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash.includes('admin')) {
        setCurrentRoute('/admin');
      } else {
        setCurrentRoute('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateTo = useCallback((path: '/' | '/admin') => {
    try {
      window.history.pushState({}, '', path);
    } catch {
      // In case of restricted file:// or local environment fallback to hash
      window.location.hash = path === '/admin' ? 'admin' : '';
    }
    setCurrentRoute(path);
  }, []);

  // Main game state
  const [state, setState] = useState<GameState>(() => {
    const saved = loadGameState();
    const sets = loadQuestionSets();
    const curId = loadActiveSetId();
    const activeSet = sets.find((s) => s.id === curId) || sets[0];

    if (saved && saved.config && saved.config.questions?.length === 9) {
      return saved;
    }

    const initial = getInitialGameState();
    if (activeSet) {
      initial.config = createConfigFromSet(activeSet);
    }
    return initial;
  });

  // Auto-save game state to localStorage
  useEffect(() => {
    saveGameState(state);
  }, [state]);

  // Switch between question sets (1 to 5)
  const switchQuestionSet = useCallback(
    (targetSetId: number) => {
      const targetSet = questionSets.find((s) => s.id === targetSetId) || questionSets[0];
      if (!targetSet) return;

      setActiveSetId(targetSet.id);
      saveActiveSetId(targetSet.id);

      const newConfig = createConfigFromSet(targetSet);
      setState({
        config: newConfig,
        currentScreen: 'game',
        activeQuestionId: null,
        openedTiles: [],
        isPaused: false,
        isSoundOn: true,
        isGameOver: false,
        winnerTeam: null,
        guessAttempts: [],
      });
    },
    [questionSets]
  );

  const selectTile = useCallback((tileId: number) => {
    setState((prev) => {
      if (!prev.config) return prev;
      const question = prev.config.questions.find((q) => q.id === tileId);
      if (!question) return prev;
      if (question.status === 'completed_correct' || question.status === 'completed_failed') return prev;
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

  const answerQuestion = useCallback(
    (answer: 'A' | 'B' | 'C' | 'D'): 'correct' | 'wrong' | 'failed' => {
      if (!state.config || state.activeQuestionId === null) return 'wrong';
      const questionIndex = state.config.questions.findIndex((q) => q.id === state.activeQuestionId);
      if (questionIndex === -1) return 'wrong';
      const question = state.config.questions[questionIndex];

      if (answer === question.correctAnswer) {
        const updatedQuestions = [...state.config.questions];
        updatedQuestions[questionIndex] = {
          ...question,
          status: 'completed_correct' as const,
        };

        setState((prev) => {
          if (!prev.config) return prev;
          const currentId = question.id;
          const alreadyOpened = prev.openedTiles.includes(currentId);
          return {
            ...prev,
            config: { ...prev.config, questions: updatedQuestions },
            openedTiles: alreadyOpened ? prev.openedTiles : [...prev.openedTiles, currentId],
          };
        });

        return 'correct';
      } else {
        const newWrongAnswers = [...question.wrongAnswers, answer];
        const isFailed = newWrongAnswers.length >= 3;

        const updatedQuestions = [...state.config.questions];
        updatedQuestions[questionIndex] = {
          ...question,
          wrongAnswers: newWrongAnswers,
          status: isFailed ? ('completed_failed' as const) : ('in_progress' as const),
        };

        setState((prev) => {
          if (!prev.config) return prev;
          return {
            ...prev,
            config: { ...prev.config, questions: updatedQuestions },
          };
        });

        return isFailed ? 'failed' : 'wrong';
      }
    },
    [state.config, state.activeQuestionId]
  );

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

  const contextValue = {
    state,
    setState,
    questionSets,
    setQuestionSets,
    activeSetId,
    setActiveSetId,
    gameRules,
    updateGameRules,
    selectTile,
    answerQuestion,
    closeQuestion,
    resetGame,
    revealAllTiles,
    togglePause,
    toggleSound,
    revealTopic,
    switchQuestionSet,
    navigateTo,
    currentRoute,
  };

  return (
    <ToastProvider>
      <GameContext.Provider value={contextValue}>
        {currentRoute === '/admin' ? <SetupPage /> : <GamePage />}
      </GameContext.Provider>
    </ToastProvider>
  );
}

export default App;
