# Gesture Camera Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a native iOS Expo app that captures photos/video from hand gestures, fully on-device.

**Architecture:** Expo dev-build app using react-native-vision-camera for the camera and react-native-mediapipe for on-device hand-landmark detection. A pure, framework-free TypeScript module classifies landmarks into gestures; a debounce hook arms a gesture after it is held steady, then triggers a photo or a 5-second video. Captured media is reviewed and saved to the iOS Photos library via expo-media-library.

**Tech Stack:** Expo (dev build), React Native, TypeScript, react-native-vision-camera, react-native-mediapipe, expo-media-library, react-native-reanimated, Jest.

## Global Constraints

- Platform target: iOS (native), installed via EAS Build → TestFlight/QR. No Expo Go.
- All vision runs on-device. No network calls, no backend, no media upload.
- Gesture classifier (`src/vision/gestures.ts`) MUST be pure functions over landmark arrays — no React/native imports — so it is unit-testable.
- Confirm gate: a gesture must be held stable ~1.5s before firing.
- Video length: exactly 5 seconds, auto-stop.
- Gestures: 👍 thumbsUp → photo, ✌️ v → photo, 🫰 heart → photo, ✊ fist (held up) → 5s video.

---

## File Structure

```
app.json / app.config.ts        Expo config + plugins (vision-camera, mediapipe, media-library)
package.json                    deps + scripts
eas.json                        EAS build profiles
babel.config.js                 reanimated + worklets plugins
tsconfig.json
jest.config.js
App.tsx                         root: permission gate → navigation
src/
  types.ts                      Landmark, HandResult, Gesture types
  vision/
    gestures.ts                 PURE classifier: HandLandmarks[] → Gesture | null
    fingers.ts                  PURE helpers: isFingerExtended, distance, etc.
  confirm/
    useGestureArming.ts         debounce: stable gesture ~1.5s → onArmed
  capture/
    usePhotoCapture.ts          takePhoto → uri
    useVideoCapture.ts          record 5s → uri
  save/
    saveToPhotos.ts             expo-media-library wrapper
  screens/
    PermissionScreen.tsx
    CameraScreen.tsx            vision-camera + mediapipe hook + overlays
    ReviewScreen.tsx            photo/video preview + Save/Retake
  ui/
    CoachingPill.tsx
    GestureLegend.tsx
    ConfirmRing.tsx
    Toast.tsx
__tests__/
  fingers.test.ts
  gestures.test.ts
```

---

### Task 1: Scaffold Expo + TypeScript app, Jest, and run a smoke test

**Files:**
- Create: `package.json`, `tsconfig.json`, `babel.config.js`, `jest.config.js`, `App.tsx`, `app.json`
- Test: `__tests__/smoke.test.ts`

**Interfaces:**
- Produces: a buildable Expo TS app and a working `npm test` command.

- [ ] **Step 1:** Scaffold with `npx create-expo-app@latest . --template blank-typescript` (non-interactive in the existing dir).
- [ ] **Step 2:** Add dev deps: `npm i -D jest @types/jest ts-jest`. Add `"test": "jest"` to package.json scripts. Create `jest.config.js` with `preset: 'ts-jest'`, `testEnvironment: 'node'`.
- [ ] **Step 3:** Write `__tests__/smoke.test.ts`: `test('jest runs', () => expect(1 + 1).toBe(2));`
- [ ] **Step 4:** Run `npm test` → expect PASS.
- [ ] **Step 5:** Commit: `chore: scaffold expo typescript app with jest`.

---

### Task 2: Types + pure finger helpers (TDD)

**Files:**
- Create: `src/types.ts`, `src/vision/fingers.ts`
- Test: `__tests__/fingers.test.ts`

**Interfaces:**
- Produces:
  - `type Landmark = { x: number; y: number; z: number }`
  - `type HandLandmarks = Landmark[]` (21 points, MediaPipe order)
  - `distance(a: Landmark, b: Landmark): number`
  - `isFingerExtended(lm: HandLandmarks, finger: 'thumb'|'index'|'middle'|'ring'|'pinky'): boolean`

- [ ] **Step 1:** Write `__tests__/fingers.test.ts` with fixtures: an extended-index fixture asserts `isFingerExtended(lm,'index')===true`; a curled-index fixture asserts `false`; `distance` returns ~known value for two points.
- [ ] **Step 2:** Run `npm test` → FAIL (module not found).
- [ ] **Step 3:** Implement `src/types.ts` and `src/vision/fingers.ts`. Use MediaPipe's 21-landmark index convention (tips: thumb 4, index 8, middle 12, ring 16, pinky 20; with lower joints). Extended = tip is farther from wrist than the finger's PIP joint along the finger axis.
- [ ] **Step 4:** Run `npm test` → PASS.
- [ ] **Step 5:** Commit: `feat(vision): landmark types and finger-state helpers`.

---

### Task 3: Gesture classifier (TDD — the core)

**Files:**
- Create: `src/vision/gestures.ts`
- Test: `__tests__/gestures.test.ts`

**Interfaces:**
- Consumes: `HandLandmarks`, `isFingerExtended`, `distance` from Task 2.
- Produces:
  - `type Gesture = 'thumbsUp' | 'v' | 'heart' | 'fist'`
  - `classifyGesture(hands: HandLandmarks[]): Gesture | null`

- [ ] **Step 1:** Write `__tests__/gestures.test.ts` with one fixture per gesture asserting the right label, plus a flat-open-hand fixture asserting `null`, and a "heart not misread as v" fixture.
- [ ] **Step 2:** Run `npm test` → FAIL.
- [ ] **Step 3:** Implement `classifyGesture`:
  - thumbsUp: thumb extended & tip above wrist (smaller y), other 4 curled.
  - v: index+middle extended and tips separated, ring+pinky curled.
  - heart: thumb & index extended with their tips close (distance below threshold), middle+ring+pinky curled.
  - fist: all five curled.
  - else null. One hand only (use `hands[0]`).
- [ ] **Step 4:** Run `npm test` → PASS.
- [ ] **Step 5:** Commit: `feat(vision): gesture classifier with unit tests`.

---

### Task 4: Gesture arming debounce hook (TDD with fake timers)

**Files:**
- Create: `src/confirm/useGestureArming.ts`
- Test: `__tests__/useGestureArming.test.ts`

**Interfaces:**
- Consumes: `Gesture` from Task 3.
- Produces: `useGestureArming({ holdMs }): { update(g: Gesture|null): void; progress: number; armed: Gesture|null }` — but to keep it unit-testable, also export a pure reducer `armingStep(state, input, now): state` that the hook wraps.

- [ ] **Step 1:** Write tests for pure `armingStep`: same gesture held past `holdMs` → `armed` set; gesture changing mid-hold → progress resets; null → resets.
- [ ] **Step 2:** Run `npm test` → FAIL.
- [ ] **Step 3:** Implement `armingStep` (pure) and the thin `useGestureArming` React wrapper using `useState`/`useRef`.
- [ ] **Step 4:** Run `npm test` → PASS.
- [ ] **Step 5:** Commit: `feat(confirm): hold-to-confirm arming logic`.

---

### Task 5: Native config — plugins, permissions, EAS (build-config, no unit test)

**Files:**
- Modify: `app.json` (→ rename to `app.config.ts` optional), add plugins + iOS permission strings
- Create: `eas.json`
- Modify: `babel.config.js` (reanimated + worklets-core plugins)
- Modify: `package.json` (install native deps)

**Interfaces:**
- Produces: an installable native configuration consumed by Tasks 6–8.

- [ ] **Step 1:** Install: `npx expo install react-native-vision-camera react-native-worklets-core react-native-reanimated expo-media-library` and `npm i react-native-mediapipe`.
- [ ] **Step 2:** In `app.json` add plugins array: `react-native-vision-camera` (with `cameraPermissionText`, `enableMicrophonePermission: true`, `microphonePermissionText`), `react-native-mediapipe`, `expo-media-library` (with `savePhotosPermission`/`isAccessMediaLocationEnabled`). Add `ios.infoPlist` NSCameraUsageDescription, NSMicrophoneUsageDescription, NSPhotoLibraryAddUsageDescription.
- [ ] **Step 3:** `babel.config.js`: add `react-native-worklets-core/plugin` and `react-native-reanimated/plugin` (reanimated last).
- [ ] **Step 4:** Create `eas.json` with a `development` profile (`developmentClient: true`, `distribution: internal`) and a `preview` profile (`distribution: internal`, iOS simulator false).
- [ ] **Step 5:** Run `npx tsc --noEmit` and `npm test` → expect no regressions.
- [ ] **Step 6:** Commit: `chore(native): vision-camera, mediapipe, media-library config + EAS profiles`.

---

### Task 6: Capture + save hooks (device-verified, no unit test)

**Files:**
- Create: `src/capture/usePhotoCapture.ts`, `src/capture/useVideoCapture.ts`, `src/save/saveToPhotos.ts`

**Interfaces:**
- Produces:
  - `usePhotoCapture(cameraRef): { takePhoto(): Promise<string> }` (returns file uri)
  - `useVideoCapture(cameraRef): { recording: boolean; startFiveSecondClip(): Promise<string> }`
  - `saveToPhotos(uri: string): Promise<void>` using `MediaLibrary.saveToLibraryAsync`.

- [ ] **Step 1:** Implement `saveToPhotos.ts` wrapping `expo-media-library` `saveToLibraryAsync`, requesting permission if needed.
- [ ] **Step 2:** Implement `usePhotoCapture` calling vision-camera `takePhoto()` and returning `file://${path}`.
- [ ] **Step 3:** Implement `useVideoCapture` calling `startRecording`, a 5s `setTimeout` → `stopRecording`, resolving the saved video path.
- [ ] **Step 4:** Run `npx tsc --noEmit` → expect clean.
- [ ] **Step 5:** Commit: `feat(capture): photo, 5s video, and save-to-Photos hooks`.

---

### Task 7: UI overlay components (device-verified)

**Files:**
- Create: `src/ui/CoachingPill.tsx`, `src/ui/GestureLegend.tsx`, `src/ui/ConfirmRing.tsx`, `src/ui/Toast.tsx`

**Interfaces:**
- Produces presentational components:
  - `CoachingPill({ text })`
  - `GestureLegend()` (static legend row)
  - `ConfirmRing({ progress, label })` (0..1 ring via reanimated/SVG)
  - `Toast({ visible, text })`

- [ ] **Step 1:** Implement the four components with React Native primitives; `ConfirmRing` animates stroke by `progress`.
- [ ] **Step 2:** Run `npx tsc --noEmit` → expect clean.
- [ ] **Step 3:** Commit: `feat(ui): coaching pill, legend, confirm ring, toast`.

---

### Task 8: Screens + wiring (device-verified)

**Files:**
- Create: `src/screens/PermissionScreen.tsx`, `src/screens/CameraScreen.tsx`, `src/screens/ReviewScreen.tsx`
- Modify: `App.tsx`

**Interfaces:**
- Consumes: every prior module.
- Produces: the full navigable app.

- [ ] **Step 1:** `PermissionScreen`: request camera + mic via vision-camera and media-library; show "Open Settings" if denied.
- [ ] **Step 2:** `CameraScreen`: front `<Camera>`, register `react-native-mediapipe` hand-landmark hook; on each result call `classifyGesture` → `useGestureArming.update`; render `CoachingPill`, `GestureLegend`, `ConfirmRing`. On `armed`: photo gestures → `takePhoto`; `fist` → `startFiveSecondClip`. Navigate to Review with `{ uri, kind }`.
- [ ] **Step 3:** `ReviewScreen`: show image or looping video; `Save` → `saveToPhotos` + Toast → back to Camera; `Retake` → back.
- [ ] **Step 4:** `App.tsx`: simple state machine permission → camera → review.
- [ ] **Step 5:** Run `npx tsc --noEmit` and `npm test` → expect clean/pass.
- [ ] **Step 6:** Commit: `feat(app): permission, camera, and review screens wired end-to-end`.

---

### Task 9: Docs + EAS build instructions

**Files:**
- Modify: `README.md` (run/build/install instructions)

- [ ] **Step 1:** Document: install deps, `eas build --profile development --platform ios`, install on device, run `npx expo start --dev-client`.
- [ ] **Step 2:** Commit: `docs: how to build and install on iPhone via EAS`.

---

## Self-Review

- **Spec coverage:** permission (Task 8), live camera + coaching + confirm ring (Tasks 4,7,8), four gestures (Task 3), photo + 5s video (Task 6), review + save to Photos (Task 6,8), on-device/no-backend (constraints + architecture), EAS distribution (Tasks 5,9), unit tests on classifier (Tasks 2–4). All covered.
- **Placeholder scan:** none — each task names exact files, interfaces, and commands.
- **Type consistency:** `Gesture`, `HandLandmarks`, `Landmark`, `classifyGesture`, `armingStep`, `saveToPhotos`, `takePhoto`, `startFiveSecondClip` used consistently across tasks.

## Verification reality note

Tasks 2–4 are fully unit-tested and run in CI/locally. Tasks 5–8 involve the native camera and on-device ML, which cannot run in a headless environment — they are verified on first EAS device build. The gesture thresholds in Task 3 are initial heuristics expected to be tuned after on-device testing.
