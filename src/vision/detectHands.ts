import { Frame, VisionCameraProxy } from 'react-native-vision-camera';
import { HandLandmarks } from '../types';

// Bridges to the native Apple Vision hand-pose frame processor plugin
// (registered in the `modules/hand-pose` native module as "detectHands").
const plugin = VisionCameraProxy.initFrameProcessorPlugin('detectHands', {});

/**
 * Worklet. Runs on-device Apple Vision hand detection on a camera frame and
 * returns an array of hands, each a 21-point landmark array in MediaPipe order.
 */
export function detectHands(frame: Frame): HandLandmarks[] {
  'worklet';
  if (plugin == null) {
    throw new Error(
      'detectHands plugin not registered — rebuild the native app (modules/hand-pose).',
    );
  }
  const result = plugin.call(frame) as unknown as HandLandmarks[] | null;
  return result ?? [];
}
