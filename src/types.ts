/** A single hand landmark in normalized/image space. y increases downward. */
export type Landmark = { x: number; y: number; z: number };

/** 21 landmarks for one hand, in MediaPipe Hand Landmarker order. */
export type HandLandmarks = Landmark[];

/** Gestures the app recognizes. */
export type Gesture = 'thumbsUp' | 'v' | 'salute' | 'halfHeart' | 'three';

/** What a recognized gesture triggers. */
export type CaptureKind = 'photo' | 'video';

export const GESTURE_ACTION: Record<Gesture, CaptureKind> = {
  thumbsUp: 'photo',
  v: 'photo',
  salute: 'photo',
  halfHeart: 'photo',
  three: 'video',
};
