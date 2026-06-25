import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, GESTURE_EMOJI } from './theme';

const PHOTO = [
  { emoji: GESTURE_EMOJI.thumbsUp, label: 'Photo' },
  { emoji: GESTURE_EMOJI.v, label: 'Photo' },
  { emoji: GESTURE_EMOJI.heart, label: 'Photo' },
];

export function GestureLegend() {
  return (
    <View style={styles.row}>
      {PHOTO.map((g, i) => (
        <Item key={`p${i}`} emoji={g.emoji} label={g.label} />
      ))}
      <Item emoji={GESTURE_EMOJI.fist} label="5s video" />
    </View>
  );
}

function Item({ emoji, label }: { emoji: string; label: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    backgroundColor: colors.pill,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  item: { alignItems: 'center', minWidth: 48 },
  emoji: { fontSize: 24 },
  label: { color: colors.subtle, fontSize: 11, marginTop: 2 },
});
