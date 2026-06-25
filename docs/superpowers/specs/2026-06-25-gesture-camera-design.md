# Gesture Camera — Design Spec

**Date:** 2026-06-25
**Status:** Approved, pre-implementation
**Owner:** Suphasak

## 1. Summary

A native iOS app that watches the front camera, recognizes hand gestures in
real time (fully on-device), and uses them to capture media:

- 👍 Thumbs up → photo
- ✌️ V sign → photo
- 🫰 Single-hand finger heart → photo
- ✊ One curled hand held up → record a 5-second video

After capture the user reviews the result and either saves it straight to the
iOS Photos library (one tap) or retakes.

No backend. No uploads. Video and images never leave the device.

## 2. Goals / Non-goals

### Goals (v1)
- Real-time, on-device hand-gesture recognition at ~camera frame rate.
- Four gestures mapped to actions (3 photo gestures + 1 video gesture).
- Accidental-trigger resistance via a hold-to-confirm gate.
- Clear live coaching so the user always knows what the app sees.
- One-tap save into the native Photos app.
- Installable on the owner's iPhone via EAS cloud build (TestFlight / QR).

### Non-goals (explicitly out of scope for v1)
- Filters, editing, or effects.
- In-app gallery / capture history.
- Settings screen or customizable timers.
- Android support / tuning.
- Burst capture or multi-shot.
- Trained ML gesture model (geometry rules only for v1).

## 3. Decisions (locked)

| Decision | Choice |
|---|---|
| Platform | Native iOS via Expo (dev build / prebuild) + React Native |
| Detection approach | Geometry rules over MediaPipe hand landmarks (no training) |
| Video gesture | One curled hand (fist) held up → 5s video |
| Heart gesture | Single-hand finger heart 🫰 (not two-hand) |
| Distribution | EAS Build (cloud) → install via TestFlight / QR (A1) |
| Confirm gate | Gesture held stable ~1.5s, then 3·2·1, then capture |
| Video length | 5 seconds, auto-stop |

## 4. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Expo (dev build / prebuild) | Cannot use Expo Go — native modules require a custom build |
| Camera | react-native-vision-camera | Real-time camera + frame processors |
| Frame processing | vision-camera frame processor + react-native-worklets-core | Per-frame vision on a fast thread, throttled |
| Hand tracking | react-native-mediapipe (Hand Landmarker) | 21 landmarks/hand, on-device |
| Gesture logic | Custom TypeScript, pure functions | The core; fully unit-testable |
| Photo capture | vision-camera takePhoto | Returns file URI |
| Video capture | vision-camera startRecording / stopRecording | 5s timer auto-stop |
| Save to Photos | expo-media-library | True one-tap save to camera roll |
| Animation/UI | Reanimated + React Native core | Confirm ring, transitions |
| Unit tests | Jest | Landmark fixtures → expected gesture |

## 5. Screen flow

1. **Permission screen** — explains why camera + photos access is needed;
   triggers the iOS permission prompts. If denied, shows an "Open Settings"
   path.
2. **Live Camera (home)** — mirrored front-cam preview; top coaching pill
   ("Show a gesture 👋" / "Detected: ✌️"); bottom gesture legend
   (👍 ✌️ 🫰 photo · ✊ video). On a detected gesture, a confirm ring fills
   over ~1.5s, then a 3·2·1 cue, then capture.
3. **Review (photo)** — full image preview, [Retake] / [Save ✅].
4. **Review (video)** — looping video preview, [Retake] / [Save ✅].
5. On Save → toast "Saved to Photos ✅" → return to Live Camera.

### Feedback details
- Photo: screen flash + shutter sound.
- Video: red REC dot + 5s countdown ring.
- Haptic tap on gesture detect and on save.

## 6. Architecture

```
App
├─ navigation (Permission → Camera → Review)
├─ camera/
│   ├─ CameraScreen            owns vision-camera, wires frame processor
│   └─ useFrameProcessor       runs hand landmarker per frame, throttled
├─ vision/
│   ├─ handLandmarker.ts       MediaPipe setup, returns 21 landmarks
│   └─ gestures.ts             PURE: landmarks → 'thumbsUp'|'v'|'heart'|'fist'|null
├─ capture/
│   ├─ usePhotoCapture.ts      takePhoto → file uri
│   └─ useVideoCapture.ts      start, auto-stop @5s → file uri
├─ confirm/
│   └─ useGestureArming.ts     debounce: same gesture stable ~1.5s → fire
├─ review/
│   └─ ReviewScreen.tsx        preview + Save (expo-media-library) / Retake
└─ ui/  CoachingPill, ConfirmRing, GestureLegend, Toast
```

**Key boundary:** `vision/gestures.ts` is pure, framework-free functions over
landmark coordinates. Each gesture is classified from finger extended/curled
state and hand geometry. This unit holds all accuracy logic and is testable
with fixed landmark fixtures, no camera required.

### Data flow

```
frame → landmarks → gesture classifier → arming debounce (1.5s stable)
      → capture (photo or 5s video) → review → save to Photos
```

Everything is local. No network, no backend, no storage beyond the user's
Photos library.

## 7. Gesture classification rules (initial heuristics)

For each detected hand, compute per-finger extended/curled state from landmark
positions (tip vs. lower joints), then:

- **thumbsUp:** thumb extended & pointing up; other four fingers curled.
- **v:** index and middle extended & separated; ring, pinky, thumb curled.
- **heart (🫰):** thumb and index tips close together / crossed forming a small
  loop; other fingers curled. Single hand.
- **fist:** all fingers curled, hand roughly upright/held up → arms video.
- **null:** none of the above with sufficient confidence.

Only one gesture arms at a time; highest-confidence single gesture wins; arming
resets if the detected gesture changes or confidence drops. These thresholds
are expected to be tuned on-device after first build.

## 8. Error handling

- **Permissions denied** → dedicated screen with "Open Settings" button.
- **No hand / low light / low confidence** → coaching pill prompts
  ("Move into better light"); never fires capture on low confidence.
- **Multiple gestures at once** → highest-confidence single gesture wins.
- **Recording interrupted** (incoming call / app backgrounded) → discard the
  partial recording, return to Live Camera cleanly.

## 9. Testing strategy

- **Unit (Jest):** `vision/gestures.ts` against landmark fixtures for each
  gesture and for negative/ambiguous cases. This is the primary automated
  safety net.
- **Manual on-device QA checklist:** permission flow, each gesture fires the
  correct action, confirm-ring timing feels right, 5s video auto-stops, save
  lands in Photos, retake works, low-light behavior. The live camera path
  cannot be unit-tested.

## 10. Distribution / how the owner runs it

- Configure EAS Build (cloud). Requires a free Expo account; device install
  requires an Apple ID.
- Owner installs on iPhone via TestFlight or an EAS dev-build QR link — no
  Xcode interaction required by the owner.

## 11. Open items to tune after first build

- Exact landmark thresholds per gesture (lighting/angle sensitivity).
- Confirm-hold duration (start at 1.5s).
- Whether the finger-heart needs a stricter loop test to avoid false positives
  with the V sign.
