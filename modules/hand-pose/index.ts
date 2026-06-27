import { requireNativeModule } from 'expo-modules-core';

// The native module also registers a VisionCamera frame processor plugin
// ("detectHands", used via src/vision/detectFrame.ts). This binding exposes the
// AVFoundation heart-overlay function.
const HandPose = requireNativeModule('HandPose');

/**
 * Bake floating heart balloons into a recorded video clip and return a new
 * file:// URI. Falls back to the original URI if compositing fails.
 */
export function overlayHearts(uri: string): Promise<string> {
  return HandPose.overlayHearts(uri);
}
