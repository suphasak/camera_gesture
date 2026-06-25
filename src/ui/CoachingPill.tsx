import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

export function CoachingPill({ text }: { text: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'center',
    backgroundColor: colors.pill,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  text: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
