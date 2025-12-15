import { DictationItem } from './types';

export const DEFAULT_ITEMS: DictationItem[] = [
  { id: '1', text: '학교에 갑니다' },
  { id: '2', text: '친구가 좋아요' },
  { id: '3', text: '맛있는 사과' },
];

export const SUCCESS_MESSAGES = [
  "참 잘했어요!",
  "멋져요!",
  "정답입니다!",
  "최고예요!"
];

export const RETRY_MESSAGES = [
  "다시 한번 들어보세요.",
  "아쉽네요, 다시 도전!",
  "힘내세요!"
];
