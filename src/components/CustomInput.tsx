import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

import { Colors } from '../constants/colors';

type CustomInputProps = TextInputProps;

export default function CustomInput(props: CustomInputProps) {
  return <TextInput placeholderTextColor={Colors.textGray} style={styles.input} {...props} />;
}

const styles = StyleSheet.create({
  input: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    backgroundColor: Colors.inputBackground,
    color: Colors.textGray,
    fontSize: 14,
    paddingHorizontal: 16,
  },
});
