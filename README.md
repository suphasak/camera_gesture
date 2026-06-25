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

A gesture must be held steady for ~1.5s (a confirm ring fills), then capture.
After capture you review and save straight to the iOS Photos library, or retake.

## Stack

- **Expo** (dev build) + **React Native** + **TypeScript**
- **react-native-vision-camera v4** — camera + frame processors
- **Apple Vision** (`VNDetectHumanHandPoseRequest`) — on-device 21-point hand
  landmarks, via a local native module in [`modules/hand-pose`](modules/hand-pose)
- **expo-media-library** — one-tap save to Photos
- **expo-video** — review playback
- Pure, unit-tested gesture engine in [`src/vision`](src/vision)

> Note: an earlier plan targeted `react-native-mediapipe`, but that package does
> not support hand landmarks, so detection uses Apple's built-in Vision
> framework instead — more robust and no model files to ship.

## Develop & test on your iPhone

This app uses native modules, so it **cannot run in Expo Go** — it needs a dev
build installed on a real device.

```bash
# 1. Install dependencies
npm install

# 2. Log in / set up EAS (free Expo account)
npm i -g eas-cli
eas login

# 3. Build a development client for your iPhone (cloud build)
eas build --profile development --platform ios
#    → follow the link, install the build on your phone via the QR code

# 4. Start the dev server and open the installed app
npx expo start --dev-client
```

For a standalone test build (no dev server needed), use the `preview` profile:

```bash
eas build --profile preview --platform ios
```

## Run the tests

The gesture engine (classifier + hold-to-confirm logic) is fully unit-tested:

```bash
npm test          # jest
npm run typecheck # tsc --noEmit
```

## Project layout

```
App.tsx                      permission → camera → review state machine
src/types.ts                 Landmark / Gesture / action map
src/vision/fingers.ts        pure finger-extension helpers
src/vision/gestures.ts       pure gesture classifier (tested)
src/vision/detectHands.ts    JS bridge to the native frame processor
src/confirm/                 hold-to-confirm arming logic (tested)
src/capture/                 photo + 5s video hooks
src/save/                    save-to-Photos
src/screens/                 Permission / Camera / Review
src/ui/                      coaching pill, legend, confirm ring, toast
modules/hand-pose/           native Apple Vision frame processor plugin (iOS)
__tests__/                   jest unit tests
docs/superpowers/            design spec + implementation plan
```

## First-build verification notes

The native plugin is written to Apple's documented API but can only be verified
on a real device build. Likely tuning points on the first run:

- Frame **orientation** for the front camera (`modules/hand-pose/.../*.swift`,
  currently `.up`; the mirrored front camera may need `.leftMirrored`).
- The generated Swift header import in `HandPosePluginLoader.mm`.
- Gesture thresholds in `src/vision/gestures.ts` (lighting/angle sensitivity).
- Confirm-hold duration (`HOLD_MS` in `src/screens/CameraScreen.tsx`).
