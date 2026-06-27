import { Gesture } from '../types';

export const colors = {
  bg: '#000000',
  pill: 'rgba(0,0,0,0.55)',
  text: '#FFFFFF',
  subtle: 'rgba(255,255,255,0.7)',
  accent: '#34C759', // iOS green
  rec: '#FF3B30',
  ringTrack: 'rgba(255,255,255,0.25)',
};

export const GESTURE_EMOJI: Record<Gesture, string> = {
  thumbsUp: '👍',
  v: '✌️',
  halfHeart: '🫰',
  three: '3️⃣',
  coupleHeart: '💞',
  coupleV: '✌️✌️',
};

export const GESTURE_LABEL: Record<Gesture, string> = {
  thumbsUp: 'Thumbs up',
  v: 'V sign',
  halfHeart: 'Finger heart',
  three: 'Hold for video',
  coupleHeart: 'Couple heart',
  coupleV: 'Couple V',
};
