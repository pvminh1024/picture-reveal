import { createContext, useContext } from 'react';
import type { GameState, GameConfig, Question, QuestionStatus } from '../types/game';

const STORAGE_KEY = 'puzzle-game-state';
const CONFIG_KEY = 'puzzle-game-config';

export function saveGameState(state: GameState): void {
  try {
    const stateToSave = { ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch {
    console.warn('Failed to save game state');
  }
}

export function loadGameState(): GameState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as GameState;
    }
  } catch {
    console.warn('Failed to load game state');
  }
  return null;
}

export function saveGameConfig(config: GameConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    console.warn('Failed to save game config');
  }
}

export function loadGameConfig(): GameConfig | null {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      return JSON.parse(saved) as GameConfig;
    }
  } catch {
    console.warn('Failed to load game config');
  }
  return null;
}

export function clearGameData(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CONFIG_KEY);
}

export function getInitialGameState(): GameState {
  return {
    config: null,
    currentScreen: 'setup',
    activeQuestionId: null,
    openedTiles: [],
    isPaused: false,
    isSoundOn: true,
    isGameOver: false,
    winnerTeam: null,
    guessAttempts: [],
  };
}

export function createQuestionsFromConfig(
  questions: { id: number; text: string; optionA: string; optionB: string; optionC: string; optionD: string; correctAnswer: 'A' | 'B' | 'C' | 'D' }[]
): Question[] {
  return questions.map((q) => ({
    id: q.id,
    text: q.text,
    options: [
      { id: 'A' as const, text: q.optionA },
      { id: 'B' as const, text: q.optionB },
      { id: 'C' as const, text: q.optionC },
      { id: 'D' as const, text: q.optionD },
    ],
    correctAnswer: q.correctAnswer,
    status: 'not_started' as QuestionStatus,
    wrongAnswers: [],
  }));
}

export interface GameContextType {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  selectTile: (tileId: number) => void;
  answerQuestion: (answer: 'A' | 'B' | 'C' | 'D') => 'correct' | 'wrong' | 'failed';
  closeQuestion: () => void;
  resetGame: () => void;
  revealAllTiles: (winnerTeam: string) => void;
  togglePause: () => void;
  toggleSound: () => void;
  revealTopic: () => void;
}

export const GameContext = createContext<GameContextType | null>(null);

export function useGame(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

