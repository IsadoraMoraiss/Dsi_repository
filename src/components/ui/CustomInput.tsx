
import React from 'react';
import { StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';

type CustomInputProps = TextInputProps & {
  right?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function CustomInput({ right, style, containerStyle, ...props }: CustomInputProps) {
  return (
    <View style={[styles.inputWrapper, containerStyle]}>
      <TextInput
        placeholderTextColor={Colors.textGray}
        style={[styles.input, style]}
        {...props}
      />
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    color: Colors.textGray,
    fontSize: 14,
    paddingHorizontal: 8,
    height: '100%',
  },
  right: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
});