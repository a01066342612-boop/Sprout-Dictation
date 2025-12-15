export interface DictationItem {
  id: string;
  text: string;
}

export enum AppView {
  HOME = 'HOME',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  RESULT = 'RESULT'
}

export interface StudentResult {
  itemId: string;
  userAnswer: string;
  isCorrect: boolean;
  playCount: number;
}
