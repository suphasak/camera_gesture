import { HandLandmarks, Landmark } from '../src/types';

const TIP_IDX = { thumb: 4, index: 8, middle: 12, ring: 16, pinky: 20 } as const;
const PIP_IDX = { thumb: 2, index: 6, middle: 10, ring: 14, pinky: 18 } as const;
type Finger = keyof typeof TIP_IDX;

/** 21 zeroed landmarks with wrist at origin and a sensible hand-size point. */
export function blankHand(): HandLandmarks {
  const lm: Landmark[] = Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }));
  lm[9] = { x: 0, y: -1, z: 0 }; // middle_mcp → handSize = 1
  return lm;
}

/**
 * Place a finger's pip/tip along (dirX, dirY). Extended → tip farther from
 * wrist than pip; curled → the reverse.
 */
export function setFinger(
  lm: HandLandmarks,
  finger: Finger,
  extended: boolean,
  dirX: number,
  dirY: number,
): void {
  const pipD = extended ? 1 : 2;
  const tipD = extended ? 2 : 1;
  lm[PIP_IDX[finger]] = { x: dirX * pipD, y: dirY * pipD, z: 0 };
  lm[TIP_IDX[finger]] = { x: dirX * tipD, y: dirY * tipD, z: 0 };
}
