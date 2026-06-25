import {
  armingStep,
  armingProgress,
  createArmingState,
} from '../src/confirm/useGestureArming';

const HOLD = 1500;

test('gesture held past holdMs becomes armed', () => {
  let s = createArmingState(0);
  s = armingStep(s, 'v', 0, HOLD);
  expect(s.armed).toBeNull();
  s = armingStep(s, 'v', 1000, HOLD);
  expect(s.armed).toBeNull();
  s = armingStep(s, 'v', 1600, HOLD);
  expect(s.armed).toBe('v');
});

test('changing gesture mid-hold resets progress', () => {
  let s = createArmingState(0);
  s = armingStep(s, 'v', 0, HOLD);
  s = armingStep(s, 'thumbsUp', 1000, HOLD);
  expect(s.gesture).toBe('thumbsUp');
  expect(s.since).toBe(1000);
  expect(armingProgress(s, 1000, HOLD)).toBe(0);
});

test('null input resets state', () => {
  let s = createArmingState(0);
  s = armingStep(s, 'three', 0, HOLD);
  s = armingStep(s, 'three', 1600, HOLD);
  expect(s.armed).toBe('three');
  s = armingStep(s, null, 1700, HOLD);
  expect(s.gesture).toBeNull();
  expect(s.armed).toBeNull();
});

test('armed gesture does not refire while held', () => {
  let s = createArmingState(0);
  s = armingStep(s, 'v', 0, HOLD);
  s = armingStep(s, 'v', 1600, HOLD);
  expect(s.armed).toBe('v');
  const after = armingStep(s, 'v', 2000, HOLD);
  expect(after).toBe(s); // unchanged reference → no rising edge
});

test('progress climbs from 0 to 1', () => {
  let s = createArmingState(0);
  s = armingStep(s, 'salute', 0, HOLD);
  expect(armingProgress(s, 750, HOLD)).toBeCloseTo(0.5);
  expect(armingProgress(s, 3000, HOLD)).toBe(1);
});
