import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

export function Toast({ visible, text }: { visible: boolean; text: string }) {
  if (!visible) return null;
  return (
    <View style={styles.toast}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  text: { color: colors.text, fontWeight: '700', fontSize: 15 },
});
