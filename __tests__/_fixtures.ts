import { HandLandmarks, Landmark } from '../src/types';

const I = {
  wrist: 0,
  thumbCMC: 1, thumbMP: 2, thumbIP: 3, thumbTip: 4,
  indexMCP: 5, indexPIP: 6, indexDIP: 7, indexTip: 8,
  middleMCP: 9, middlePIP: 10, middleDIP: 11, middleTip: 12,
  ringMCP: 13, ringPIP: 14, ringDIP: 15, ringTip: 16,
  pinkyMCP: 17, pinkyPIP: 18, pinkyDIP: 19, pinkyTip: 20,
} as const;

type NonThumb = 'index' | 'middle' | 'ring' | 'pinky';
const MCP: Record<NonThumb, number> = {
  index: I.indexMCP, middle: I.middleMCP, ring: I.ringMCP, pinky: I.pinkyMCP,
};
const PIP: Record<NonThumb, number> = {
  index: I.indexPIP, middle: I.middlePIP, ring: I.ringPIP, pinky: I.pinkyPIP,
};
const DIP: Record<NonThumb, number> = {
  index: I.indexDIP, middle: I.middleDIP, ring: I.ringDIP, pinky: I.pinkyDIP,
};
const TIP: Record<NonThumb, number> = {
  index: I.indexTip, middle: I.middleTip, ring: I.ringTip, pinky: I.pinkyTip,
};

const p = (x: number, y: number): Landmark => ({ x, y, z: 0 });

/** A realistic open right hand: fingers up (smaller y), wrist at the bottom. */
export function openHand(): HandLandmarks {
  const lm: Landmark[] = Array.from({ length: 21 }, () => p(0, 0));
  lm[I.wrist] = p(0.5, 1.0);
  lm[I.thumbCMC] = p(0.42, 0.85); lm[I.thumbMP] = p(0.34, 0.78);
  lm[I.thumbIP] = p(0.27, 0.72); lm[I.thumbTip] = p(0.2, 0.66);
  // Fingers fanned out (spread), so this reads as an open palm, not a salute.
  lm[I.indexMCP] = p(0.45, 0.6); lm[I.indexPIP] = p(0.42, 0.45);
  lm[I.indexDIP] = p(0.39, 0.34); lm[I.indexTip] = p(0.36, 0.24);
  lm[I.middleMCP] = p(0.5, 0.58); lm[I.middlePIP] = p(0.5, 0.42);
  lm[I.middleDIP] = p(0.5, 0.31); lm[I.middleTip] = p(0.49, 0.2);
  lm[I.ringMCP] = p(0.55, 0.6); lm[I.ringPIP] = p(0.58, 0.45);
  lm[I.ringDIP] = p(0.6, 0.35); lm[I.ringTip] = p(0.61, 0.24);
  lm[I.pinkyMCP] = p(0.6, 0.63); lm[I.pinkyPIP] = p(0.66, 0.5);
  lm[I.pinkyDIP] = p(0.7, 0.42); lm[I.pinkyTip] = p(0.72, 0.32);
  return lm;
}

/** Fold a non-thumb finger down toward its knuckle (curled). */
export function curlFinger(lm: HandLandmarks, finger: NonThumb): void {
  const base = lm[MCP[finger]];
  lm[PIP[finger]] = p(base.x, base.y - 0.06);
  lm[DIP[finger]] = p(base.x, base.y - 0.01);
  lm[TIP[finger]] = p(base.x, base.y + 0.06); // tip tucks below knuckle
}

/** Tuck the thumb across the palm (curled). */
export function curlThumb(lm: HandLandmarks): void {
  lm[I.thumbIP] = p(0.4, 0.7);
  lm[I.thumbTip] = p(0.47, 0.64); // near index knuckle, away from pinky side
}

/** Bring the four fingertips close together while keeping them extended (salute). */
export function togetherFingers(lm: HandLandmarks): void {
  lm[I.indexTip] = p(0.46, 0.22);
  lm[I.middleTip] = p(0.5, 0.2);
  lm[I.ringTip] = p(0.54, 0.21);
  lm[I.pinkyTip] = p(0.58, 0.24);
}
