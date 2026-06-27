import { Face, FrameResult, HandLandmarks } from '../types';

// Tunable thresholds (radians / multiples of face size) — expect to adjust
// these live on-device.
const YAW_MAX = 0.6; // |yaw| under this ≈ facing the camera
const HAND_X_FACTOR = 1.6; // hand within this × face width, horizontally
const HAND_ABOVE = 1.6; // up to this × face height above the face center
const HAND_BELOW = 0.6; // down to this × face height below the face center
const SIDE_BY_SIDE = 0.25; // min horizontal gap between the two faces

/** Stable hand center from the wrist + the five knuckles. */
function handCenter(lm: HandLandmarks): { x: number; y: number } {
  const idx = [0, 1, 5, 9, 13, 17];
  let sx = 0;
  let sy = 0;
  for (const i of idx) {
    sx += lm[i].x;
    sy += lm[i].y;
  }
  return { x: sx / idx.length, y: sy / idx.length };
}

function isFrontal(face: Face): boolean {
  return Math.abs(face.yaw) < YAW_MAX;
}

function handBesideFace(c: { x: number; y: number }, face: Face): boolean {
  if (Math.abs(c.x - face.cx) > face.w * HAND_X_FACTOR) return false;
  const dy = c.y - face.cy; // negative == above the face
  return dy > -face.h * HAND_ABOVE && dy < face.h * HAND_BELOW;
}

/**
 * Couple half-heart: two people side by side, both facing the camera, each with
 * a hand raised beside their face. Pure — no React/native dependencies.
 */
export function detectCoupleHeart(frame: FrameResult): boolean {
  const faces = frame.faces.filter(isFrontal);
  if (faces.length < 2) return false;

  // The two largest frontal faces, ordered left → right.
  const [f1, f2] = [...faces]
    .sort((a, b) => b.w * b.h - a.w * a.h)
    .slice(0, 2);
  const [left, right] = f1.cx <= f2.cx ? [f1, f2] : [f2, f1];

  // Must be genuinely side by side, not overlapping / the same face.
  if (Math.abs(left.cx - right.cx) < (left.w + right.w) * SIDE_BY_SIDE) {
    return false;
  }

  const centers = frame.hands.map(handCenter);
  const leftHand = centers.findIndex((c) => handBesideFace(c, left));
  if (leftHand === -1) return false;
  const rightHand = centers.findIndex(
    (c, i) => i !== leftHand && handBesideFace(c, right),
  );
  return rightHand !== -1;
}
