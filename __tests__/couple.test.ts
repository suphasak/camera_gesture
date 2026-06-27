import { detectCoupleHeart } from '../src/vision/couple';
import { Face, FrameResult, HandLandmarks } from '../src/types';

function face(cx: number, cy: number, yaw = 0, w = 0.15, h = 0.2): Face {
  return { cx, cy, w, h, yaw };
}

/** A hand whose every landmark sits at (x, y) — center resolves to (x, y). */
function handAt(x: number, y: number): HandLandmarks {
  return Array.from({ length: 21 }, () => ({ x, y, z: 0 }));
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
