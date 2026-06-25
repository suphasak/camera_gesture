import {
  distance,
  isClosedPalm,
  isFingerExtended,
  isOpenPalm,
} from '../src/vision/fingers';
import { openHand, curlFinger, curlThumb, togetherFingers } from './_fixtures';

function fistHand() {
  const lm = openHand();
  curlFinger(lm, 'index');
  curlFinger(lm, 'middle');
  curlFinger(lm, 'ring');
  curlFinger(lm, 'pinky');
  curlThumb(lm);
  return lm;
}

describe('distance', () => {
  test('3-4-5 triangle', () => {
    expect(distance({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 })).toBe(5);
  });
});

describe('isFingerExtended (non-thumb)', () => {
  test('extended index reads as extended', () => {
    expect(isFingerExtended(openHand(), 'index')).toBe(true);
  });

  test('curled index reads as not extended', () => {
    const lm = openHand();
    curlFinger(lm, 'index');
    expect(isFingerExtended(lm, 'index')).toBe(false);
  });
});

describe('isFingerExtended (thumb)', () => {
  test('open thumb reads as extended', () => {
    expect(isFingerExtended(openHand(), 'thumb')).toBe(true);
  });

  test('tucked thumb reads as not extended', () => {
    const lm = openHand();
    curlThumb(lm);
    expect(isFingerExtended(lm, 'thumb')).toBe(false);
  });
});

describe('isOpenPalm / isClosedPalm (zoom)', () => {
  test('spread open hand is an open palm', () => {
    expect(isOpenPalm(openHand())).toBe(true);
  });

  test('a salute (fingers together) is NOT an open palm', () => {
    const lm = openHand();
    togetherFingers(lm);
    expect(isOpenPalm(lm)).toBe(false);
  });

  test('a fist is a closed palm, not an open palm', () => {
    const lm = fistHand();
    expect(isClosedPalm(lm)).toBe(true);
    expect(isOpenPalm(lm)).toBe(false);
  });

  test('an open hand is not a closed palm', () => {
    expect(isClosedPalm(openHand())).toBe(false);
  });
});
