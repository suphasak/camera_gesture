import { RefObject, useCallback, useState } from 'react';
import type { Camera } from 'react-native-vision-camera';

const DEFAULT_CLIP_MS = 5000;

function asFileUri(path: string): string {
  return path.startsWith('file://') ? path : `file://${path}`;
}

/** Record a fixed-length clip (default 5s) and resolve with its file:// URI. */
export function useVideoCapture(cameraRef: RefObject<Camera | null>) {
  const [recording, setRecording] = useState(false);

  const startClip = useCallback(
    (durationMs: number = DEFAULT_CLIP_MS) =>
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
        }, durationMs);
      }),
    [cameraRef],
  );

  return { recording, startClip };
}
