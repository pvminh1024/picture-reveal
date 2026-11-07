import { createContext, useContext } from 'react';
import type { GameState, GameConfig, Question, QuestionStatus, QuestionSet } from '../types/game';
import { DEFAULT_QUESTION_SETS } from '../data/demoData';

const STORAGE_KEY = 'puzzle-game-state';
const CONFIG_KEY = 'puzzle-game-config';
const SETS_KEY = 'puzzle-game-question-sets';
const ACTIVE_SET_ID_KEY = 'puzzle-game-active-set-id';
const RULES_KEY = 'puzzle-game-rules';
const SIGNATURE_KEY = 'puzzle-game-demo-signature';

// Tự động nhận diện khi nội dung các bộ đề trong file JSON thay đổi
const DEMO_SIGNATURE = JSON.stringify(
  DEFAULT_QUESTION_SETS.map((s) => ({
    id: s.id,
    questions: s.questions.map((q) => q.text),
  }))
);

export const DEFAULT_GAME_RULES = `Cấu trúc: 02 Chủ đề (Bức tranh ẩn), mỗi chủ đề gồm 09 mảnh ghép câu hỏi.\n
Giành quyền: Cử 01 đại diện giơ tay nhanh nhất sau hiệu lệnh MC (Mỗi câu mỗi đội có 01 lượt trả lời).\n
Điểm số :
Trả lời ĐÚNG câu hỏi: +5 điểm & mở mảnh ghép. 
Trả lời SAI: Nhường quyền cho đội còn lại (Cả 3 đội sai => Khóa ô).\n
Sau khi trả lời xong 9 câu hỏi các đội có thể giơ tay để trả lời câu chủ đề.
Giải mã ĐÚNG Chủ đề ẩn: +20 điểm/chủ đề.\n

*Lưu ý, kết quả cuối cùng dựa vào BTC!!*`;

export function saveGameRules(rules: string): void {
  try {
    localStorage.setItem(RULES_KEY, rules);
  } catch {
    console.warn('Failed to save game rules');
  }
}

export function loadGameRules(): string {
  try {
    const saved = localStorage.getItem(RULES_KEY);
    if (saved && saved.trim()) {
      return saved;
    }
  } catch {
    console.warn('Failed to load game rules');
  }
  return DEFAULT_GAME_RULES;
}

export function saveQuestionSets(sets: QuestionSet[]): void {
  try {
    localStorage.setItem(SETS_KEY, JSON.stringify(sets));
  } catch {
    console.warn('Failed to save question sets');
  }
}

export function loadQuestionSets(): QuestionSet[] {
  try {
    const signature = localStorage.getItem(SIGNATURE_KEY);
    if (signature === DEMO_SIGNATURE) {
      const saved = localStorage.getItem(SETS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as QuestionSet[];
        }
      }
    }
  } catch {
    console.warn('Failed to load question sets');
  }
  // Initialize with updated default question sets and save signature
  try {
    localStorage.setItem(SIGNATURE_KEY, DEMO_SIGNATURE);
  } catch {
    // ignore
  }
  saveQuestionSets(DEFAULT_QUESTION_SETS);
  return DEFAULT_QUESTION_SETS;
}

export function saveActiveSetId(id: number): void {
  try {
    localStorage.setItem(ACTIVE_SET_ID_KEY, JSON.stringify(id));
  } catch {
    console.warn('Failed to save active set id');
  }
}

export function loadActiveSetId(): number {
  try {
    const saved = localStorage.getItem(ACTIVE_SET_ID_KEY);
    if (saved) {
      return Number(JSON.parse(saved));
    }
  } catch {
    console.warn('Failed to load active set id');
  }
  return 1;
}

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
    const signature = localStorage.getItem(SIGNATURE_KEY);
    if (signature !== DEMO_SIGNATURE) {
      return null;
    }
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
    currentScreen: 'game',
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

export function createConfigFromSet(set: QuestionSet): GameConfig {
  return {
    topicImage: set.topicImage,
    topicKeyword: set.topicKeyword,
    questions: createQuestionsFromConfig(set.questions),
  };
}

export interface GameContextType {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  questionSets: QuestionSet[];
  setQuestionSets: React.Dispatch<React.SetStateAction<QuestionSet[]>>;
  activeSetId: number;
  setActiveSetId: (id: number) => void;
  gameRules: string;
  updateGameRules: (rules: string) => void;
  selectTile: (tileId: number) => void;
  answerQuestion: (answer: 'A' | 'B' | 'C' | 'D') => 'correct' | 'wrong' | 'failed';
  closeQuestion: () => void;
  resetGame: () => void;
  revealAllTiles: (winnerTeam: string) => void;
  togglePause: () => void;
  toggleSound: () => void;
  revealTopic: () => void;
  switchQuestionSet: (setId: number) => void;
  navigateTo: (path: '/' | '/admin') => void;
  currentRoute: '/' | '/admin';
}

export const GameContext = createContext<GameContextType | null>(null);

export function useGame(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
