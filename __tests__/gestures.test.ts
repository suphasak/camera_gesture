import { classifyGesture } from '../src/vision/gestures';
import { HandLandmarks } from '../src/types';
import { openHand, curlFinger, curlThumb, togetherFingers } from './_fixtures';

function threeHand(): HandLandmarks {
  const lm = openHand();
  curlFinger(lm, 'pinky'); // index, middle, ring up; pinky down
  return lm;
}

function vHand(): HandLandmarks {
  const lm = openHand();
  curlThumb(lm);
  curlFinger(lm, 'ring');
  curlFinger(lm, 'pinky');
  return lm;
}

function thumbsUpHand(): HandLandmarks {
  const lm = openHand();
  curlFinger(lm, 'index');
  curlFinger(lm, 'middle');
  curlFinger(lm, 'ring');
  curlFinger(lm, 'pinky');
  return lm;
}

function saluteHand(): HandLandmarks {
  const lm = openHand();
  togetherFingers(lm);
  return lm;
}

function halfHeartHand(): HandLandmarks {
  const lm = openHand();
  curlFinger(lm, 'middle'); // 🫰: the other three fingers are folded
  curlFinger(lm, 'ring');
  curlFinger(lm, 'pinky');
  // thumb + index pinched close, index still raised toward the thumb
  lm[4] = { x: 0.42, y: 0.42, z: 0 }; // thumb tip
  lm[8] = { x: 0.46, y: 0.46, z: 0 }; // index tip
  return lm;
}

test('three fingers up (video)', () => {
  expect(classifyGesture([threeHand()])).toBe('three');
});

test('v sign', () => {
  expect(classifyGesture([vHand()])).toBe('v');
});

test('thumbs up', () => {
  expect(classifyGesture([thumbsUpHand()])).toBe('thumbsUp');
});

test('salute (fingers together)', () => {
  expect(classifyGesture([saluteHand()])).toBe('salute');
});

test('half-heart / love sign (thumb + index only)', () => {
  expect(classifyGesture([halfHeartHand()])).toBe('halfHeart');
});

test('v is not misread as three (ring folded)', () => {
  expect(classifyGesture([vHand()])).toBe('v');
});

test('no hands returns null', () => {
  expect(classifyGesture([])).toBeNull();
});
