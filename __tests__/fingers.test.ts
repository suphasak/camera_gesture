import { distance, isFingerExtended } from '../src/vision/fingers';
import { blankHand, setFinger } from './_fixtures';

describe('distance', () => {
  test('3-4-5 triangle', () => {
    expect(distance({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 })).toBe(5);
  });
});

describe('isFingerExtended', () => {
  test('extended index reads as extended', () => {
    const lm = blankHand();
    setFinger(lm, 'index', true, 0, -1);
    expect(isFingerExtended(lm, 'index')).toBe(true);
  });

  test('curled index reads as not extended', () => {
    const lm = blankHand();
    setFinger(lm, 'index', false, 0, -1);
    expect(isFingerExtended(lm, 'index')).toBe(false);
  });
});
