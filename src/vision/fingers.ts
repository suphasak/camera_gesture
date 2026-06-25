import { Landmark, HandLandmarks } from '../types';

export type Finger = 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';

/** MediaPipe Hand Landmarker index convention. */
export const WRIST = 0;
export const MIDDLE_MCP = 9; // used as a hand-size reference point

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
 * Orientation-independent extension test: a finger is extended when its tip is
 * farther from the wrist than its lower joint. Works regardless of how the
 * hand is rotated in frame.
 */
export function isFingerExtended(lm: HandLandmarks, finger: Finger): boolean {
  const wrist = lm[WRIST];
  const tipDist = distance(lm[TIP[finger]], wrist);
  const pipDist = distance(lm[PIP[finger]], wrist);
  return tipDist > pipDist;
}

/** Wrist-to-middle-knuckle length, a stable scale for the hand. */
export function handSize(lm: HandLandmarks): number {
  return distance(lm[WRIST], lm[MIDDLE_MCP]);
}
