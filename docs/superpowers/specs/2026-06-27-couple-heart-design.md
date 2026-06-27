# Couple Half-Heart — Design Spec (v1.1)

**Date:** 2026-06-27
**Status:** Approved, building

## Goal

Make the app fun for couples. First couple gesture: two people side by side,
each raising a hand into a half-heart beside their face, both facing the camera
→ capture a short **live motion clip** (preview as a loop before saving).

## Why faces (not the finger curl)

The precise "curved half-heart" finger shape is unreliable to read from hand
landmarks. Apple Vision gives us **faces** (position + yaw/orientation) and
**hand positions** reliably. So the trigger anchors on those:

> **Two frontal faces, side by side, each with a hand raised up beside it**,
> held steady ~1.5s → capture.

This matches the real pose and resists false fires. The finger curl is ignored.

## Trigger rule (`detectCoupleHeart`)

Given `{ hands, faces }` for a frame, return true when:
1. At least **2 faces**, both roughly **facing the camera** (`|yaw| < ~0.6 rad`).
2. The two faces are **side by side** (different horizontal centers).
3. Each face has **a hand raised beside it** — a hand whose center is within
   ~1.5× the face width horizontally and around head height vertically.
4. The two faces use **two different hands**.

All thresholds live as named constants for on-device tuning.

## Capture

- Couple heart → record a **~3-second clip** (kind `video`).
- Review screen plays it as a **looping video** → Save to Photos / Retake.
- (True iOS Live Photo is not supported by react-native-vision-camera, so a
  short looping clip delivers the "alive + preview" experience.)

## UX

- When the couple pose is forming, the coaching pill shows
  **"💞 Couple heart — hold it!"** and the confirm ring fills with the 💞 emoji.
- Single-person gestures are unchanged and still take priority when only one
  hand / no couple pose is present.

## Architecture changes

- **Native** (`modules/hand-pose`): the frame processor also runs
  `VNDetectFaceRectanglesRequest` (revision 3, for yaw) and returns
  `{ hands: [[{x,y,z}×21]], faces: [{cx,cy,w,h,yaw}] }` (top-left normalized).
- **JS:**
  - `src/vision/detectFrame.ts` — worklet wrapper returning `{hands, faces}`.
  - `src/vision/couple.ts` — pure `detectCoupleHeart` + `Face` helpers (tested).
  - `src/types.ts` — `Face`, `FrameResult`; add `coupleHeart` gesture (→ video).
  - `useVideoCapture` — parameterised clip length (couple = 3s, three-fingers = 5s).
  - `CameraScreen` — couple detection branch + couple coach + clip length.

## Testing

- `couple.test.ts`: two frontal faces + a hand beside each → true; one face,
  off-axis faces, hands not beside faces, single shared hand → false.
- Existing gesture tests unchanged.

## Build note

Native change → requires a device rebuild (`expo run:ios --device`), then live
threshold tuning on the phone (face yaw cutoff, hand-beside-face distances).
