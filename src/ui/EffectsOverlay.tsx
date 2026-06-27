import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet } from 'react-native';
import type { ClipEffect } from '../../modules/hand-pose';

const EMOJIS: Record<ClipEffect, string[]> = {
  hearts: ['💕', '💖', '💗', '💞', '❤️'],
  butts: ['🍑', '🍑', '💨'],
};
const COUNT = 14;
const { width: W, height: H } = Dimensions.get('window');

function FloatingHeart({ index }: { index: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const left = useRef(Math.random() * 90).current;
  const size = useRef(22 + Math.random() * 22).current;
  const emoji = useRef(EMOJIS.hearts[index % EMOJIS.hearts.length]).current;
  const delay = useRef(Math.random() * 1500).current;
  const duration = useRef(2600 + Math.random() * 1400).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, { toValue: 1, duration, delay, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress, duration, delay]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [H * 0.95, -80] });
  const translateX = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 18, -10] });
  const opacity = progress.interpolate({ inputRange: [0, 0.12, 0.8, 1], outputRange: [0, 1, 1, 0] });

  return (
    <Animated.Text
      style={[styles.item, { left: `${left}%`, fontSize: size, opacity, transform: [{ translateY }, { translateX }] }]}
    >
      {emoji}
    </Animated.Text>
  );
}

function FlyingButt({ index }: { index: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const top = useRef(15 + Math.random() * 65).current;
  const size = useRef(34 + Math.random() * 26).current;
  const emoji = useRef(EMOJIS.butts[index % EMOJIS.butts.length]).current;
  const fromLeft = useRef(Math.random() > 0.5).current;
  const delay = useRef(Math.random() * 1800).current;
  const duration = useRef(1800 + Math.random() * 1200).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, { toValue: 1, duration, delay, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress, duration, delay]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: fromLeft ? [-80, W + 80] : [W + 80, -80],
  });
  const translateY = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -28, 24] });
  const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', fromLeft ? '360deg' : '-360deg'] });
  const opacity = progress.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] });

  return (
    <Animated.Text
      style={[styles.item, { top: `${top}%`, fontSize: size, opacity, transform: [{ translateX }, { translateY }, { rotate }] }]}
    >
      {emoji}
    </Animated.Text>
  );
}

/** Floating effects over the live preview (real-time; the baked version is native). */
export function EffectsOverlay({ effect }: { effect: ClipEffect | null }) {
  if (!effect) return null;
  return (
    <>
      {Array.from({ length: COUNT }, (_, i) =>
        effect === 'butts' ? <FlyingButt key={i} index={i} /> : <FloatingHeart key={i} index={i} />,
      )}
    </>
  );
}

const styles = StyleSheet.create({
  item: { position: 'absolute', top: 0, left: 0 },
});
