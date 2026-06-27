import { requireNativeModule } from 'expo-modules-core';

// The native module also registers a VisionCamera frame processor plugin
// ("detectHands", used via src/vision/detectFrame.ts). This binding exposes the
// AVFoundation effect-overlay function.
const HandPose = requireNativeModule('HandPose');

export type ClipEffect = 'hearts' | 'butts';

/**
 * Bake an animated effect into a recorded video clip and return a new file://
 * URI. Falls back to the original URI if compositing fails.
 */
export function overlayEffect(uri: string, effect: ClipEffect): Promise<string> {
  return HandPose.overlayEffect(uri, effect);
}
