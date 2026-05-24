
import React from 'react';
import { StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { BorderWidth, Font, Radius, Size, Spacing } from '../../constants/Tokens';

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
    height: Size.inputHeightMd,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.thin,
    borderColor: Colors.inputBorder,
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: Spacing.xs,
  },
  input: {
    flex: 1,
    color: Colors.textGray,
    fontSize: Font.body,
    paddingHorizontal: Spacing.xs,
    height: '100%',
  },
  right: {
    marginLeft: Spacing.xxs,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
});
