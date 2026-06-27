import { Frame, VisionCameraProxy } from 'react-native-vision-camera';
import { FrameResult } from '../types';

// Bridges to the native Apple Vision frame processor plugin (registered in the
// `modules/hand-pose` native module as "detectHands").
const plugin = VisionCameraProxy.initFrameProcessorPlugin('detectHands', {});

/**
 * Worklet. Runs on-device Apple Vision hand + face detection on a camera frame
 * and returns `{ hands, faces }`.
 */
export function detectFrame(frame: Frame): FrameResult {
  'worklet';
  if (plugin == null) {
    throw new Error(
      'detectHands plugin not registered — rebuild the native app (modules/hand-pose).',
    );
  }
  const result = plugin.call(frame) as unknown as Partial<FrameResult> | null;
  return { hands: result?.hands ?? [], faces: result?.faces ?? [] };
}
