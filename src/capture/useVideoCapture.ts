import { RefObject, useCallback, useState } from 'react';
import type { Camera } from 'react-native-vision-camera';

const CLIP_MS = 5000;

function asFileUri(path: string): string {
  return path.startsWith('file://') ? path : `file://${path}`;
}

/** Record a fixed 5-second clip and resolve with its file:// URI. */
export function useVideoCapture(cameraRef: RefObject<Camera | null>) {
  const [recording, setRecording] = useState(false);

  const startFiveSecondClip = useCallback(
    () =>
      new Promise<string>((resolve, reject) => {
        const cam = cameraRef.current;
        if (!cam) return reject(new Error('Camera not ready'));

        setRecording(true);
        cam.startRecording({
          onRecordingFinished: (video) => {
            setRecording(false);
            resolve(asFileUri(video.path));
          },
          onRecordingError: (error) => {
            setRecording(false);
            reject(error);
          },
        });

        setTimeout(() => {
          try {
            cam.stopRecording();
          } catch {
            // already stopped / interrupted; the error callback handles state
          }
        }, CLIP_MS);
      }),
    [cameraRef],
  );

  return { recording, startFiveSecondClip, clipMs: CLIP_MS };
}
