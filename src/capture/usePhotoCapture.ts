import { RefObject, useCallback } from 'react';
import type { Camera } from 'react-native-vision-camera';

function asFileUri(path: string): string {
  return path.startsWith('file://') ? path : `file://${path}`;
}

/** Take a single photo and return a file:// URI. */
export function usePhotoCapture(cameraRef: RefObject<Camera | null>) {
  const takePhoto = useCallback(async (): Promise<string> => {
    const cam = cameraRef.current;
    if (!cam) throw new Error('Camera not ready');
    const photo = await cam.takePhoto();
    return asFileUri(photo.path);
  }, [cameraRef]);

  return { takePhoto };
}
