import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native';
import {
  Camera,
  runAtTargetFps,
  useCameraDevice,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { useRunOnJS } from 'react-native-worklets-core';
import { CaptureKind, Gesture, GESTURE_ACTION, HandLandmarks } from '../types';
import { classifyGesture } from '../vision/gestures';
import { detectHands } from '../vision/detectHands';
import { useGestureArming } from '../confirm/useGestureArming';
import { usePhotoCapture } from '../capture/usePhotoCapture';
import { useVideoCapture } from '../capture/useVideoCapture';
import { CoachingPill } from '../ui/CoachingPill';
import { GestureLegend } from '../ui/GestureLegend';
import { ConfirmRing } from '../ui/ConfirmRing';
import { colors, GESTURE_EMOJI } from '../ui/theme';

const HOLD_MS = 1500;

export function CameraScreen({
  onCaptured,
}: {
  onCaptured: (m: { uri: string; kind: CaptureKind }) => void;
}) {
  const device = useCameraDevice('front');
  const cameraRef = useRef<Camera>(null);
  const busyRef = useRef(false);
  const [coach, setCoach] = useState('Show a gesture 👋');

  const { takePhoto } = usePhotoCapture(cameraRef);
  const { recording, startFiveSecondClip } = useVideoCapture(cameraRef);

  const fire = useCallback(
    async (g: Gesture) => {
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        if (GESTURE_ACTION[g] === 'photo') {
          const uri = await takePhoto();
          onCaptured({ uri, kind: 'photo' });
        } else {
          const uri = await startFiveSecondClip();
          onCaptured({ uri, kind: 'video' });
        }
      } catch {
        setCoach('Could not capture — try again');
      } finally {
        busyRef.current = false;
      }
    },
    [takePhoto, startFiveSecondClip, onCaptured],
  );

  const arming = useGestureArming(HOLD_MS, fire);

  const onHands = useRunOnJS((hands: HandLandmarks[]) => {
    const g = classifyGesture(hands);
    setCoach(g ? `Detected: ${GESTURE_EMOJI[g]}` : 'Show a gesture 👋');
    arming.update(g);
  }, [arming.update]);

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      runAtTargetFps(6, () => {
        'worklet';
        const hands = detectHands(frame);
        onHands(hands);
      });
    },
    [onHands],
  );

  if (device == null) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>No front camera available</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        video={true}
        audio={true}
        frameProcessor={frameProcessor}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="none">
        <View style={styles.top}>
          <CoachingPill text={recording ? 'Recording… 🎥' : coach} />
        </View>

        <View style={styles.center}>
          {arming.progress > 0 && arming.label && (
            <ConfirmRing
              progress={arming.progress}
              emoji={GESTURE_EMOJI[arming.label]}
            />
          )}
          {recording && <View style={styles.recDot} />}
        </View>

        <View style={styles.bottom}>
          <GestureLegend />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  overlay: { flex: 1, justifyContent: 'space-between' },
  top: { paddingTop: 12, alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  bottom: { paddingBottom: 20, alignItems: 'center' },
  recDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.rec,
    marginTop: 16,
  },
  fallback: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: { color: colors.text, fontSize: 16 },
});
