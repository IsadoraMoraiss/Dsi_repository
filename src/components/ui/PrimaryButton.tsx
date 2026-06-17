import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { Colors } from '../../constants/Colors';
import { Font, LetterSpacing, Radius, Shadow, Size } from '../../constants/Tokens';

type PrimaryButtonProps = {
  title?: string;
  children?: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export default function PrimaryButton({ title, children, onPress, disabled, style }: PrimaryButtonProps) {
  return (
    <Pressable style={[styles.button, style]} onPress={onPress} disabled={disabled}>
      {children ?? <Text style={styles.text}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: Size.buttonHeight,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.button,
  },
  text: {
    fontSize: Font.bodyMd,
    color: Colors.textWhite,
    textTransform: 'uppercase',
    letterSpacing: LetterSpacing.tight,
  },
});
