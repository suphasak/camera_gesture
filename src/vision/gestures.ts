import { HandLandmarks, Gesture } from '../types';
import { TIP, WRIST, distance, handSize, isFingerExtended } from './fingers';

/**
 * Classify a single hand's landmarks into one of the known gestures, or null.
 * Pure function — no React or native dependencies. One hand only (hands[0]).
 *
 * These thresholds are initial heuristics, expected to be tuned on-device.
 */
export function classifyGesture(hands: HandLandmarks[]): Gesture | null {
  if (!hands || hands.length === 0) return null;
  const lm = hands[0];
  if (!lm || lm.length < 21) return null;

  const thumb = isFingerExtended(lm, 'thumb');
  const index = isFingerExtended(lm, 'index');
  const middle = isFingerExtended(lm, 'middle');
  const ring = isFingerExtended(lm, 'ring');
  const pinky = isFingerExtended(lm, 'pinky');

  // Fist: every finger curled.
  if (!thumb && !index && !middle && !ring && !pinky) return 'fist';

  // Thumbs up: only the thumb extended, and the thumb points up (smaller y).
  if (thumb && !index && !middle && !ring && !pinky) {
    return lm[TIP.thumb].y < lm[WRIST].y ? 'thumbsUp' : null;
  }

  // Finger heart: thumb + index extended with their tips nearly touching,
  // the other three fingers curled.
  if (thumb && index && !middle && !ring && !pinky) {
    const scale = handSize(lm);
    const tipGap = distance(lm[TIP.thumb], lm[TIP.index]);
    return scale > 0 && tipGap < scale * 0.5 ? 'heart' : null;
  }

  // V sign: index + middle extended, ring + pinky curled.
  if (index && middle && !ring && !pinky) {
    return 'v';
  }

  return null;
}
