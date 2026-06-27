import { Landmark, HandLandmarks } from '../types';

export type Finger = 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';

/** MediaPipe Hand Landmarker index convention. */
export const WRIST = 0;
export const THUMB_TIP = 4;
export const THUMB_IP = 3;
export const INDEX_MCP = 5;
export const INDEX_TIP = 8;
export const MIDDLE_TIP = 12;
export const RING_TIP = 16;
export const PINKY_TIP = 20;
export const MIDDLE_MCP = 9; // used as a hand-size reference point
export const PINKY_MCP = 17; // far side of the palm; thumb reference point

// Adjacent fingertips within this fraction of the hand size count as "together".
const TOGETHER_RATIO = 0.25;

export const TIP: Record<Finger, number> = {
  thumb: 4,
  index: 8,
  middle: 12,
  ring: 16,
  pinky: 20,
};

/** Lower joint (PIP for fingers, MCP for thumb) used as the extension reference. */
export const PIP: Record<Finger, number> = {
  thumb: 2,
  index: 6,
  middle: 10,
  ring: 14,
  pinky: 18,
};

export function distance(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Orientation- and chirality-independent extension test.
 *
 * Non-thumb fingers: extended when the tip is farther from the wrist than its
 * lower joint — rotation-invariant, works palm- or back-of-hand-toward-camera.
 *
 * Thumb: the wrist test is unreliable, so instead we check whether the thumb
 * tip is farther from the far side of the palm (the pinky knuckle) than the
 * thumb's IP joint. A tucked thumb moves toward the palm and reads as curled.
 */
export function isFingerExtended(lm: HandLandmarks, finger: Finger): boolean {
  if (finger === 'thumb') {
    const ref = lm[PINKY_MCP];
    return distance(lm[THUMB_TIP], ref) > distance(lm[THUMB_IP], ref);
  }
  const wrist = lm[WRIST];
  const tipDist = distance(lm[TIP[finger]], wrist);
  const pipDist = distance(lm[PIP[finger]], wrist);
  return tipDist > pipDist;
}

/** Wrist-to-middle-knuckle length, a stable scale for the hand. */
export function handSize(lm: HandLandmarks): number {
  return distance(lm[WRIST], lm[MIDDLE_MCP]);
}

/** Open palm (zoom out): the four fingers extended and spread apart. */
export function isOpenPalm(lm: HandLandmarks): boolean {
  const allUp =
    isFingerExtended(lm, 'index') &&
    isFingerExtended(lm, 'middle') &&
    isFingerExtended(lm, 'ring') &&
    isFingerExtended(lm, 'pinky');
  return allUp && !fingersTogether(lm);
}

/** Closed palm / fist (zoom back to normal): the four fingers curled. */
export function isClosedPalm(lm: HandLandmarks): boolean {
  return (
    !isFingerExtended(lm, 'index') &&
    !isFingerExtended(lm, 'middle') &&
    !isFingerExtended(lm, 'ring') &&
    !isFingerExtended(lm, 'pinky')
  );
}

/** True when the four fingers are held close together (e.g. a flat salute). */
export function fingersTogether(lm: HandLandmarks): boolean {
  const scale = handSize(lm);
  if (scale <= 0) return false;
  const g1 = distance(lm[INDEX_TIP], lm[MIDDLE_TIP]);
  const g2 = distance(lm[MIDDLE_TIP], lm[RING_TIP]);
  const g3 = distance(lm[RING_TIP], lm[PINKY_TIP]);
  return Math.max(g1, g2, g3) < scale * TOGETHER_RATIO;
}
