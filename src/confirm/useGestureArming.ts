import { useCallback, useRef, useState } from 'react';
import { Gesture } from '../types';

export type ArmingState = {
  gesture: Gesture | null;
  since: number;
  armed: Gesture | null;
};

export function createArmingState(now: number): ArmingState {
  return { gesture: null, since: now, armed: null };
}

/**
 * Pure state transition for hold-to-confirm. A gesture must be held steady for
 * `holdMs` before it becomes `armed`. Changing or dropping the gesture resets.
 * Once armed, it latches until the gesture changes or clears (so it fires once).
 */
export function armingStep(
  state: ArmingState,
  input: Gesture | null,
  now: number,
  holdMs: number,
): ArmingState {
  if (input === null) return { gesture: null, since: now, armed: null };
  if (input !== state.gesture) return { gesture: input, since: now, armed: null };
  if (state.armed === input) return state; // already fired, hold steady
  if (now - state.since >= holdMs) return { ...state, armed: input };
  return { ...state, armed: null };
}

/** 0..1 progress toward arming the current gesture. */
export function armingProgress(state: ArmingState, now: number, holdMs: number): number {
  if (state.gesture === null || holdMs <= 0) return 0;
  return Math.max(0, Math.min(1, (now - state.since) / holdMs));
}

/**
 * React wrapper. Call `update(gesture)` every frame with the latest
 * classification; `onArmed` fires once when a gesture is held long enough.
 */
export function useGestureArming(holdMs: number, onArmed: (g: Gesture) => void) {
  const stateRef = useRef<ArmingState>(createArmingState(Date.now()));
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState<Gesture | null>(null);

  const update = useCallback(
    (g: Gesture | null) => {
      const now = Date.now();
      const prev = stateRef.current;
      const next = armingStep(prev, g, now, holdMs);
      stateRef.current = next;
      setLabel(next.gesture);
      setProgress(armingProgress(next, now, holdMs));
      if (next.armed && !prev.armed) onArmed(next.armed);
    },
    [holdMs, onArmed],
  );

  return { update, progress, label };
}
