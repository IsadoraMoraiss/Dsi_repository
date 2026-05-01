import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { Font, Radius, Size, Spacing } from '../../constants/Tokens';

type FloatingToastProps = {
  message: string;
  opacity: Animated.Value;
};

export default function FloatingToast({ message, opacity }: FloatingToastProps) {
  return (
    <Animated.View pointerEvents="none" style={[styles.toast, { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: Size.toastOffsetBottom,
    alignSelf: 'center',
    backgroundColor: '#1a1a4e',
    borderWidth: 1,
    borderColor: '#FF4D4D',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  text: {
    color: '#FF4D4D',
    fontSize: Font.body,
    fontWeight: '600',
  },
});
