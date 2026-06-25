import * as MediaLibrary from 'expo-media-library';

/** Save a captured photo/video file into the iOS Photos library. */
export async function saveToPhotos(uri: string): Promise<void> {
  const perm = await MediaLibrary.requestPermissionsAsync();
  if (!perm.granted) {
    throw new Error('Photos permission denied');
  }
  await MediaLibrary.saveToLibraryAsync(uri);
}
