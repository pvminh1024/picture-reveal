import type { SetupQuestion, QuestionSet } from '../types/game';
import rawData from './tat-ca-bo-de-gameshow-2-bo.json';

// Danh sách bộ đề mẫu mặc định nạp từ file tat-ca-bo-de-gameshow-2-bo.json
export const DEFAULT_QUESTION_SETS: QuestionSet[] = (rawData.sets as QuestionSet[]).map((s) => ({
  id: s.id,
  name: s.name,
  topicKeyword: s.topicKeyword,
  topicImage: s.topicImage,
  questions: s.questions as SetupQuestion[],
}));

// Bộ đề 1
export const DEMO_QUESTIONS: SetupQuestion[] = DEFAULT_QUESTION_SETS[0].questions;
export const DEMO_TOPIC_KEYWORD: string = DEFAULT_QUESTION_SETS[0].topicKeyword;
export const DEMO_TOPIC_IMAGE: string = DEFAULT_QUESTION_SETS[0].topicImage;

// Bộ đề 2
export const DEMO_QUESTIONS_2: SetupQuestion[] = DEFAULT_QUESTION_SETS[1].questions;
export const DEMO_TOPIC_KEYWORD_2: string = DEFAULT_QUESTION_SETS[1].topicKeyword;
export const DEMO_TOPIC_IMAGE_2: string = DEFAULT_QUESTION_SETS[1].topicImage;
