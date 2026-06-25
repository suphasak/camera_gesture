import { classifyGesture } from '../src/vision/gestures';
import { HandLandmarks } from '../src/types';
import { blankHand, setFinger } from './_fixtures';

function thumbsUpHand(): HandLandmarks {
  const lm = blankHand();
  setFinger(lm, 'thumb', true, 0, -1); // thumb up (negative y)
  setFinger(lm, 'index', false, 0, -1);
  setFinger(lm, 'middle', false, 0, -1);
  setFinger(lm, 'ring', false, 0, -1);
  setFinger(lm, 'pinky', false, 0, -1);
  return lm;
}

function vHand(): HandLandmarks {
  const lm = blankHand();
  setFinger(lm, 'thumb', false, 1, 0);
  setFinger(lm, 'index', true, -0.5, -1);
  setFinger(lm, 'middle', true, 0.5, -1);
  setFinger(lm, 'ring', false, 0, -1);
  setFinger(lm, 'pinky', false, 0, -1);
  return lm;
}

function heartHand(): HandLandmarks {
  const lm = blankHand();
  // thumb + index extended, tips nearly touching
  lm[2] = { x: 0.05, y: -1, z: 0 };
  lm[4] = { x: 0.1, y: -2, z: 0 };
  lm[6] = { x: 0, y: -1, z: 0 };
  lm[8] = { x: 0, y: -2, z: 0 };
  setFinger(lm, 'middle', false, 0, -1);
  setFinger(lm, 'ring', false, 0, -1);
  setFinger(lm, 'pinky', false, 0, -1);
  return lm;
}

function fistHand(): HandLandmarks {
  const lm = blankHand();
  setFinger(lm, 'thumb', false, 1, 0);
  setFinger(lm, 'index', false, 0, -1);
  setFinger(lm, 'middle', false, 0, -1);
  setFinger(lm, 'ring', false, 0, -1);
  setFinger(lm, 'pinky', false, 0, -1);
  return lm;
}

function openHand(): HandLandmarks {
  const lm = blankHand();
  setFinger(lm, 'thumb', true, 1, 0);
  setFinger(lm, 'index', true, -0.6, -1);
  setFinger(lm, 'middle', true, -0.2, -1);
  setFinger(lm, 'ring', true, 0.2, -1);
  setFinger(lm, 'pinky', true, 0.6, -1);
  return lm;
}

test('thumbs up', () => {
  expect(classifyGesture([thumbsUpHand()])).toBe('thumbsUp');
});

test('v sign', () => {
  expect(classifyGesture([vHand()])).toBe('v');
});

test('finger heart', () => {
  expect(classifyGesture([heartHand()])).toBe('heart');
});

test('fist', () => {
  expect(classifyGesture([fistHand()])).toBe('fist');
});

test('open hand is not a gesture', () => {
  expect(classifyGesture([openHand()])).toBeNull();
});

test('heart is not misread as v (middle stays curled)', () => {
  expect(classifyGesture([heartHand()])).not.toBe('v');
});

test('no hands returns null', () => {
  expect(classifyGesture([])).toBeNull();
});
