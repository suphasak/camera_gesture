import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';
import * as MediaLibrary from 'expo-media-library';
import { colors } from '../ui/theme';

export function PermissionScreen({ onReady }: { onReady: () => void }) {
  const cam = useCameraPermission();
  const mic = useMicrophonePermission();
  const [, requestLib] = MediaLibrary.usePermissions();
  const [denied, setDenied] = useState(false);

  const request = async () => {
    const c = await cam.requestPermission();
    await mic.requestPermission();
    await requestLib();
    if (c) {
      onReady();
    } else {
      setDenied(true);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>✋</Text>
      <Text style={styles.title}>Gesture Camera</Text>
      <Text style={styles.body}>
        Capture photos and videos with hand gestures. We need access to your
        camera, microphone, and Photos to do this. Everything runs on your
        device — nothing is uploaded.
      </Text>

      {denied ? (
        <Pressable style={styles.button} onPress={() => Linking.openSettings()}>
          <Text style={styles.buttonText}>Open Settings</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.button} onPress={request}>
          <Text style={styles.buttonText}>Enable Camera</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  emoji: { fontSize: 56, marginBottom: 12 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 12 },
  body: {
    color: colors.subtle,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
  },
  buttonText: { color: colors.text, fontSize: 17, fontWeight: '700' },
});
