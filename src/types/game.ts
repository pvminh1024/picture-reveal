export type QuestionStatus = 'not_started' | 'in_progress' | 'completed_correct' | 'completed_failed';

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: number; // 1-9
  text: string;
  options: QuestionOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  status: QuestionStatus;
  wrongAnswers: ('A' | 'B' | 'C' | 'D')[];
}

export interface GameConfig {
  topicImage: string; // base64 data URL
  topicKeyword: string;
  questions: Question[];
}

export interface GuessAttempt {
  teamName: string;
  guess: string;
  isCorrect: boolean | null;
}

export interface GameState {
  config: GameConfig | null;
  currentScreen: 'setup' | 'game';
  activeQuestionId: number | null;
  openedTiles: number[];
  isPaused: boolean;
  isSoundOn: boolean;
  isGameOver: boolean;
  winnerTeam: string | null;
  guessAttempts: GuessAttempt[];
}

export interface SetupQuestion {
  id: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export interface ExportData {
  topicKeyword: string;
  questions: SetupQuestion[];
  // topicImage is excluded from JSON export due to size
}

