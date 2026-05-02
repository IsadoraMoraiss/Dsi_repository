import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '../../../constants/Tokens';
import FormErrorText from './FormErrorText';

type FormFieldProps = {
  children: React.ReactNode;
  error?: string;
};

export default function FormField({ children, error }: FormFieldProps) {
  return (
    <View style={styles.container}>
      {children}
      <FormErrorText message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
});
