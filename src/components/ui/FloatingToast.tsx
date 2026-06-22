import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { BorderWidth, Font, Radius, Size, Spacing } from '../../constants/Tokens';

type FloatingToastProps = {
  message: string;
  opacity: Animated.Value;
  type?: 'error' | 'success';
};

export default function FloatingToast({ message, opacity, type = 'error' }: FloatingToastProps) {
  const color = type === 'success' ? '#22C55E' : '#FF4D4D';
  return (
    <Animated.View pointerEvents="none" style={[styles.toast, { opacity, borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: Size.toastOffsetBottom,
    alignSelf: 'center',
    maxWidth: '90%',
    backgroundColor: '#1a1a4e',
    borderWidth: BorderWidth.thin,
    borderColor: '#FF4D4D',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  text: {
    color: '#FF4D4D',
    fontSize: Font.body,
    fontWeight: '600',
    textAlign: 'center',
  },
});
