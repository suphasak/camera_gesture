/** A single hand landmark in normalized/image space. y increases downward. */
export type Landmark = { x: number; y: number; z: number };

/** 21 landmarks for one hand, in MediaPipe Hand Landmarker order. */
export type HandLandmarks = Landmark[];

/** A detected face, normalized with a top-left origin. */
export type Face = { cx: number; cy: number; w: number; h: number; yaw: number };

/** One frame's detections from the native Apple Vision plugin. */
export type FrameResult = { hands: HandLandmarks[]; faces: Face[] };

/** Gestures the app recognizes. `coupleHeart` is a two-person pose, not a hand shape. */
export type Gesture =
  | 'thumbsUp'
  | 'v'
  | 'halfHeart'
  | 'three'
  | 'coupleHeart'
  | 'coupleV';

/** What a recognized gesture triggers. */
export type CaptureKind = 'photo' | 'video';

export const GESTURE_ACTION: Record<Gesture, CaptureKind> = {
  thumbsUp: 'photo',
  v: 'photo',
  halfHeart: 'photo',
  three: 'video',
  coupleHeart: 'video',
  coupleV: 'video',
};
