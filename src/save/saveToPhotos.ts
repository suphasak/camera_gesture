import { Asset, requestPermissionsAsync } from 'expo-media-library';

/**
 * Save a captured photo/video file into the iOS Photos library.
 *
 * expo-media-library (SDK 56+) replaced the legacy `saveToLibraryAsync` — which
 * now throws at runtime — with the `Asset.create` API.
 */
export async function saveToPhotos(uri: string): Promise<void> {
  // SDK 56's `Asset.create` needs full read-write access (write-only is not
  // enough), so request full permission here.
  const perm = await requestPermissionsAsync();
  if (!perm.granted) {
    throw new Error(
      'Photos access was not granted. Enable it in Settings → Gesture Camera → Photos → All Photos.',
    );
  }
  await Asset.create(uri);
}
