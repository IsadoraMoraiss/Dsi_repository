import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Font, Spacing } from '../../../constants/Tokens';

type FormErrorTextProps = {
  message?: string;
};

export default function FormErrorText({ message }: FormErrorTextProps) {
  if (!message) {
    return null;
  }

  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  error: {
    color: '#FF4D4D',
    fontSize: Font.caption,
    marginTop: Spacing.xxs,
    marginLeft: 2,
  },
});
