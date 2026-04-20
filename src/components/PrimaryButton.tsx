import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors } from '../constants/colors';

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
    maxWidth: 271,
    height: 58,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    color: Colors.textWhite,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
