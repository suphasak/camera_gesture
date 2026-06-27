import {
  detectCoupleHeart,
  detectCoupleV,
  isCoupleMode,
} from '../src/vision/couple';
import { Face, FrameResult, HandLandmarks } from '../src/types';
import { openHand, curlFinger, curlThumb } from './_fixtures';

function face(cx: number, cy: number, yaw = 0, w = 0.15, h = 0.2): Face {
  return { cx, cy, w, h, yaw };
}

/** A hand whose every landmark sits at (x, y) — center resolves to (x, y). */
function handAt(x: number, y: number): HandLandmarks {
  return Array.from({ length: 21 }, () => ({ x, y, z: 0 }));
}

const HAND_IDX = [0, 1, 5, 9, 13, 17];
function centerOf(lm: HandLandmarks) {
  let sx = 0;
  let sy = 0;
  for (const i of HAND_IDX) {
    sx += lm[i].x;
    sy += lm[i].y;
  }
  return { x: sx / HAND_IDX.length, y: sy / HAND_IDX.length };
}

/** A ✌️ V-sign hand translated so its center sits at (x, y). */
function vHandAt(x: number, y: number): HandLandmarks {
  const lm = openHand();
  curlThumb(lm);
  curlFinger(lm, 'ring');
  curlFinger(lm, 'pinky');
  const c = centerOf(lm);
  return lm.map((p) => ({ x: p.x + (x - c.x), y: p.y + (y - c.y), z: 0 }));
}

const twoFacesSideBySide = [face(0.3, 0.4), face(0.7, 0.4)];

function frame(faces: Face[], hands: HandLandmarks[]): FrameResult {
  return { faces, hands };
}

test('two frontal faces with a hand beside each → couple heart', () => {
  const f = frame(twoFacesSideBySide, [handAt(0.15, 0.35), handAt(0.85, 0.35)]);
  expect(detectCoupleHeart(f)).toBe(true);
});

test('only one face → not a couple heart', () => {
  const f = frame([face(0.5, 0.4)], [handAt(0.35, 0.35)]);
  expect(detectCoupleHeart(f)).toBe(false);
});

test('faces turned away (large yaw) → not a couple heart', () => {
  const f = frame(
    [face(0.3, 0.4, 1.2), face(0.7, 0.4, 1.2)],
    [handAt(0.15, 0.35), handAt(0.85, 0.35)],
  );
  expect(detectCoupleHeart(f)).toBe(false);
});

test('hands not beside the faces → not a couple heart', () => {
  const f = frame(twoFacesSideBySide, [handAt(0.5, 0.9), handAt(0.5, 0.95)]);
  expect(detectCoupleHeart(f)).toBe(false);
});

test('only one shared hand for two faces → not a couple heart', () => {
  const f = frame(twoFacesSideBySide, [handAt(0.15, 0.35)]);
  expect(detectCoupleHeart(f)).toBe(false);
});

test('two overlapping faces (same spot) → not side by side', () => {
  const f = frame(
    [face(0.5, 0.4), face(0.52, 0.4)],
    [handAt(0.35, 0.35), handAt(0.68, 0.35)],
  );
  expect(detectCoupleHeart(f)).toBe(false);
});

test('isCoupleMode is true with two frontal side-by-side faces', () => {
  expect(isCoupleMode(frame(twoFacesSideBySide, []))).toBe(true);
  expect(isCoupleMode(frame([face(0.5, 0.4)], []))).toBe(false);
});

test('two V-sign hands beside the faces → couple V', () => {
  const f = frame(twoFacesSideBySide, [vHandAt(0.15, 0.4), vHandAt(0.85, 0.4)]);
  expect(detectCoupleV(f)).toBe(true);
});

test('plain hands (not V) beside faces → couple heart but NOT couple V', () => {
  const f = frame(twoFacesSideBySide, [handAt(0.15, 0.4), handAt(0.85, 0.4)]);
  expect(detectCoupleHeart(f)).toBe(true);
  expect(detectCoupleV(f)).toBe(false);
});
