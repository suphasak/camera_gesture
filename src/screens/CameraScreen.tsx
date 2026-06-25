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
import { fingerStates, isClosedPalm, isOpenPalm } from '../vision/fingers';
import { detectHands } from '../vision/detectHands';
import { useGestureArming } from '../confirm/useGestureArming';
import { usePhotoCapture } from '../capture/usePhotoCapture';
import { useVideoCapture } from '../capture/useVideoCapture';
import { CoachingPill } from '../ui/CoachingPill';
import { GestureLegend } from '../ui/GestureLegend';
import { ConfirmRing } from '../ui/ConfirmRing';
import { colors, GESTURE_EMOJI } from '../ui/theme';

const HOLD_MS = 1500;
// Default view is slightly cropped so ✋ open palm can "expand" to the lens's
// full width. Front cameras can't go wider than their native FOV, so this is
// the widest a selfie can get.
const NORMAL_ZOOM_FACTOR = 1.2;

export function CameraScreen({
  onCaptured,
}: {
  onCaptured: (m: { uri: string; kind: CaptureKind }) => void;
}) {
  const device = useCameraDevice('front');
  const cameraRef = useRef<Camera>(null);
  const busyRef = useRef(false);
  const [coach, setCoach] = useState('Show a gesture 👋');
  const [debug, setDebug] = useState('no hand');

  // Wide angle: ✋ open palm → full lens width, ✊ closed palm → normal crop.
  const minZoom = device?.minZoom ?? 1;
  const neutralZoom = device?.neutralZoom ?? 1;
  const normalZoom = neutralZoom * NORMAL_ZOOM_FACTOR;
  const [zoom, setZoom] = useState(normalZoom);
  const [wide, setWide] = useState(false);
  const wideRef = useRef(false);

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
    if (hands.length === 0) {
      setDebug('no hand');
      setCoach('Show a gesture 👋');
      arming.update(null);
      return;
    }

    const lm = hands[0];
    const g = classifyGesture(hands);

    const s = fingerStates(lm);
    const b = (v: boolean) => (v ? '1' : '0');
    setDebug(
      `T${b(s.thumb)} I${b(s.index)} M${b(s.middle)} R${b(s.ring)} P${b(s.pinky)} → ${g ?? '—'}`,
    );

    // Capture gestures always win.
    if (g) {
      setCoach(`Detected: ${GESTURE_EMOJI[g]}`);
      arming.update(g);
      return;
    }

    // No capture gesture: ✋ open palm → wide, ✊ closed palm → normal.
    if (isOpenPalm(lm)) {
      if (!wideRef.current) {
        wideRef.current = true;
        setWide(true);
        setZoom(minZoom);
      }
      setCoach('📐 Wide angle');
    } else if (isClosedPalm(lm)) {
      if (wideRef.current) {
        wideRef.current = false;
        setWide(false);
        setZoom(normalZoom);
      }
      setCoach('Normal view');
    } else {
      setCoach('Show a gesture 👋');
    }
    arming.update(null);
  }, [arming.update, minZoom, normalZoom]);

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
        zoom={zoom}
        frameProcessor={frameProcessor}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="none">
        <View style={styles.top}>
          <CoachingPill text={recording ? 'Recording… 🎥' : coach} />
          {wide && (
            <View style={styles.zoomBadge}>
              <Text style={styles.zoomText}>📐 Wide</Text>
            </View>
          )}
          <Text style={styles.debug}>{debug}</Text>
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
  debug: {
    color: '#0f0',
    fontSize: 14,
    fontFamily: 'Courier',
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  zoomBadge: {
    marginTop: 8,
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  zoomText: { color: colors.text, fontSize: 16, fontWeight: '800' },
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
