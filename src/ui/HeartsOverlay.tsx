import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text } from 'react-native';

const EMOJIS = ['💕', '💖', '💗', '💞', '❤️'];
const COUNT = 14;
const { height: H } = Dimensions.get('window');

function Heart({ index }: { index: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const left = useRef(Math.random() * 90).current; // % from left
  const size = useRef(22 + Math.random() * 22).current;
  const emoji = useRef(EMOJIS[index % EMOJIS.length]).current;
  const delay = useRef(Math.random() * 1500).current;
  const duration = useRef(2600 + Math.random() * 1400).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress, duration, delay]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [H * 0.95, -80],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 18, -10],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.12, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.Text
      style={[
        styles.heart,
        { left: `${left}%`, fontSize: size, opacity, transform: [{ translateY }, { translateX }] },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

/** Floating heart balloons over the live preview (real-time, not baked in). */
export function HeartsOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <>
      {Array.from({ length: COUNT }, (_, i) => (
        <Heart key={i} index={i} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  heart: { position: 'absolute', top: 0 },
});
