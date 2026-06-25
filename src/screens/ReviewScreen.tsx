import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { CaptureKind } from '../types';
import { saveToPhotos } from '../save/saveToPhotos';
import { Toast } from '../ui/Toast';
import { colors } from '../ui/theme';

export function ReviewScreen({
  uri,
  kind,
  onRetake,
  onDone,
}: {
  uri: string;
  kind: CaptureKind;
  onRetake: () => void;
  onDone: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const player = useVideoPlayer(kind === 'video' ? { uri } : null, (p) => {
    p.loop = true;
    p.play();
  });

  const save = async () => {
    try {
      await saveToPhotos(uri);
      setSaved(true);
      setTimeout(onDone, 900);
    } catch (e) {
      setSaved(false);
      Alert.alert('Could not save', e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <View style={styles.root}>
      {kind === 'photo' ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <VideoView
          style={StyleSheet.absoluteFill}
          player={player}
          contentFit="cover"
          nativeControls={false}
        />
      )}

      <View style={styles.actions}>
        <Pressable style={[styles.button, styles.retake]} onPress={onRetake}>
          <Text style={styles.buttonText}>Retake</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.save]} onPress={save}>
          <Text style={styles.buttonText}>Save ✅</Text>
        </Pressable>
      </View>

      <Toast visible={saved} text="Saved to Photos ✅" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  actions: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  button: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 999 },
  retake: { backgroundColor: 'rgba(0,0,0,0.6)' },
  save: { backgroundColor: colors.accent },
  buttonText: { color: colors.text, fontSize: 17, fontWeight: '700' },
});
