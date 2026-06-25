import { HandLandmarks, Gesture } from '../types';
import {
  INDEX_MCP,
  INDEX_TIP,
  THUMB_TIP,
  WRIST,
  distance,
  fingersTogether,
  handSize,
  isFingerExtended,
} from './fingers';

// Thumb and index tips within this fraction of the hand size form the heart C.
const HEART_RATIO = 0.5;

/**
 * Classify a single hand's landmarks into one of the known gestures, or null.
 * Pure function — no React or native dependencies. One hand only (hands[0]).
 *
 * All rules are orientation- and chirality-independent so they work whether the
 * palm or the back of the hand faces the (selfie) camera.
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

  const fourExtended = index && middle && ring && pinky;

  // Finger heart 🫰 (photo): thumb and index pinched close, the other three
  // fingers folded. Requiring the three folded fingers keeps it distinct from a
  // salute (where they're up). `indexRaised` keeps it distinct from a fist
  // (index curls *down* into the palm rather than *up* to meet the thumb).
  if (!middle && !ring && !pinky) {
    const scale = handSize(lm);
    const indexRaised =
      distance(lm[INDEX_TIP], lm[WRIST]) > distance(lm[INDEX_MCP], lm[WRIST]);
    if (
      scale > 0 &&
      indexRaised &&
      distance(lm[THUMB_TIP], lm[INDEX_TIP]) < scale * HEART_RATIO
    ) {
      return 'halfHeart';
    }
  }

  // Salute (photo): flat hand, four fingers extended and held together.
  if (fourExtended && fingersTogether(lm)) return 'salute';

  // Three fingers up (video): index, middle, ring extended; pinky folded.
  if (index && middle && ring && !pinky) return 'three';

  // V sign (photo): index + middle extended, ring + pinky curled.
  if (index && middle && !ring && !pinky) return 'v';

  // Thumbs up (photo): only the thumb extended.
  if (thumb && !index && !middle && !ring && !pinky) return 'thumbsUp';

  return null;
}
