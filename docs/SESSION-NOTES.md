# Gesture Camera — Session Notes (v1)

**Date:** 2026-06-25
**Status:** v1 working on-device (iPhone), tagged `v1.0.0`
**Repo:** https://github.com/suphasak/camera_gesture

## What this app is

A native iOS Expo app that captures photos/videos using hand gestures, fully
on-device (no backend, nothing uploaded). Built and tuned live on a real iPhone.

## What was accomplished this session

1. **Design + plan** written and approved (`docs/superpowers/specs`, `docs/superpowers/plans`).
2. **Gesture engine** built as pure, unit-tested TypeScript (`src/vision`).
3. **Native hand detection** via a local Apple Vision frame-processor module
   (`modules/hand-pose`) — after discovering `react-native-mediapipe` has no hand
   support and vision-camera v5 was an unusable rewrite (pinned to **v4**).
4. **Got it running on device** the free way: full Xcode + free Apple ID +
   `npx expo run:ios --device` (no paid Apple Developer account). Fixed several
   first-run issues (missing `babel-preset-expo`, Developer Mode, signing, the
   SDK 56 `expo-media-library` API change to `Asset.create`).
5. **Tuned the gesture set live** over many iterations to what works reliably.
6. **Added wide-angle** via open/closed palm.

## Final gesture set (v1)

| Gesture | Action |
|---|---|
| 👍 Thumbs up | Photo |
| ✌️ V sign | Photo |
| 🫡 Salute (4 fingers up, together) | Photo |
| 🫰 Finger heart (thumb+index pinch, other 3 folded) | Photo |
| 3️⃣ Three fingers up (index+middle+ring, pinky down) | 5-second video |
| ✋ Open palm (spread) | Wide angle (expand to full lens width) |
| ✊ Closed palm / fist | Back to normal view |

- Capture gestures require a ~1.5s steady hold (confirm ring), then fire.
- Capture gestures always take priority over the zoom poses.

## Architecture

```
App.tsx                      permission → camera → review state machine
src/types.ts                 Gesture union + action map
src/vision/fingers.ts        pure finger-state helpers (orientation-independent)
src/vision/gestures.ts       pure gesture classifier
src/confirm/                 hold-to-confirm arming (pure reducer + hook)
src/capture/                 photo + 5s video hooks
src/save/saveToPhotos.ts     Asset.create (SDK 56 media-library API)
src/screens/CameraScreen.tsx camera, frame processor, gesture + zoom logic
src/screens/ReviewScreen.tsx preview + save/retake
src/ui/                      coaching pill, legend, confirm ring, toast, theme
modules/hand-pose/           native Apple Vision frame processor plugin (iOS)
__tests__/                   jest unit tests (22 passing)
```

Key design choice: all gesture/zoom logic lives in **pure functions** over
21-point hand landmarks, so it is unit-testable without a camera. The native
plugin (`modules/hand-pose`) maps Apple Vision's hand joints 1:1 onto the
MediaPipe 21-point order the engine expects.

## How to run / continue next session

The app is already built and installed on the iPhone. To develop:

```bash
cd /Users/suphasak/Documents/camera_gesture
npm install                                   # if needed
npx expo start --dev-client                   # start Metro, open the app on the phone
```

Most changes are **JavaScript and hot-reload instantly** — no rebuild needed.
Only rebuild (`npx expo run:ios --device <udid>`) when you change native code
(`modules/hand-pose`), `app.json` plugins/permissions, or native dependencies.

Run the tests / typecheck:

```bash
npm test          # jest (22 tests)
npm run typecheck # tsc --noEmit
```

Device build prerequisites already set up on this Mac: Xcode, CocoaPods, a free
Apple ID signing team. The dev build expires ~every 7 days — re-run
`npx expo run:ios --device <udid>` to refresh it. The iPhone UDID is
`00008150-0009284034B9401C`.

## Tuning knobs (where to adjust behavior)

- **Gesture thresholds:** `src/vision/gestures.ts` (e.g. `HEART_RATIO`) and
  `src/vision/fingers.ts` (`TOGETHER_RATIO`).
- **Hold duration:** `HOLD_MS` in `src/screens/CameraScreen.tsx`.
- **Video length:** `CLIP_MS` in `src/capture/useVideoCapture.ts`.
- **Wide-angle crop:** `NORMAL_ZOOM_FACTOR` in `src/screens/CameraScreen.tsx`.
- **Native landmark orientation/confidence:** `modules/hand-pose/ios/*.swift`.

## Known limitations / notes

- **Dev debug overlay removed** (commit `064cedf`) — the screen is clean now. If
  you need finger-state readouts again for tuning, re-add a `fingerStates`
  helper over `isFingerExtended` and render it in `CameraScreen`.
- **Front camera can't truly go wider** than its native FOV — the iPhone 17
  "auto-expand" wide sensor is a private Apple feature not exposed by
  react-native-vision-camera. The wide-angle here is a relative expand from a
  1.2× default crop.
- **Thumb detection** is the least reliable landmark; gestures were designed to
  lean on more reliable fingers where possible.
- Single hand only (the phone is held in the other hand).

## Possible next steps

- Add light haptics on detect/capture/save.
- Front/back camera flip.
- Per-gesture sensitivity tuning if any gesture misfires in real use.
- Distribute via TestFlight (needs a paid Apple Developer account).
