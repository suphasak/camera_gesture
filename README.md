# Gesture Camera

A native iOS app that captures photos and videos from **hand gestures**, fully
on-device. No backend, no uploads — your camera feed never leaves the phone.

## Gestures

| Gesture | Action |
|---|---|
| 👍 Thumbs up | Photo |
| ✌️ V sign | Photo |
| 🫰 Finger heart | Photo |
| ✊ Curled hand held up | Record 5-second video |

A gesture must be held steady for ~1.5s (a confirm ring fills), then 3·2·1, then
capture. After capture you review and save straight to the iOS Photos library,
or retake.

## Stack

Expo (dev build) · React Native · react-native-vision-camera ·
react-native-mediapipe (Hand Landmarker) · expo-media-library · Reanimated.

## Status

Design approved. See [`docs/superpowers/specs/2026-06-25-gesture-camera-design.md`](docs/superpowers/specs/2026-06-25-gesture-camera-design.md).
Implementation plan next.
