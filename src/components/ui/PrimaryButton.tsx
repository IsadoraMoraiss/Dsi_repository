import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors } from '../../constants/Colors';
import { Font, LetterSpacing, Radius, Shadow, Size } from '../../constants/Tokens';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
};

export default function PrimaryButton({ title, onPress }: PrimaryButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    maxWidth: Size.buttonMaxWidth,
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
