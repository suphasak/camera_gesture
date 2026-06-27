import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, GESTURE_EMOJI } from './theme';

const SOLO = [
  { emoji: GESTURE_EMOJI.thumbsUp, label: 'Photo' },
  { emoji: GESTURE_EMOJI.v, label: 'Photo' },
  { emoji: GESTURE_EMOJI.halfHeart, label: 'Photo' },
  { emoji: GESTURE_EMOJI.three, label: '5s video' },
];

const COUPLE = [
  { emoji: GESTURE_EMOJI.coupleHeart, label: 'Heart clip' },
  { emoji: GESTURE_EMOJI.coupleV, label: '🍑 clip' },
];

export function GestureLegend({ couple = false }: { couple?: boolean }) {
  const items = couple ? COUPLE : SOLO;
  return (
    <View style={styles.row}>
      {items.map((g, i) => (
        <Item key={i} emoji={g.emoji} label={g.label} />
      ))}
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
