import React, { useMemo, useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { Font, Radius, Size, Spacing } from '../../../constants/Tokens';

type OtpInputRowProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
};

export default function OtpInputRow({ length = 6, value, onChange }: OtpInputRowProps) {
  const refs = useRef<Array<TextInput | null>>([]);
  const digits = useMemo(() => {
    const result = Array.from({ length }, (_, index) => value[index] ?? '');
    return result;
  }, [length, value]);

  function setDigit(index: number, char: string) {
    const sanitized = char.replace(/\D/g, '').slice(-1);
    const chars = digits.slice();
    chars[index] = sanitized;
    onChange(chars.join(''));

    if (sanitized && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function onBackspace(index: number) {
    if (digits[index] || index <= 0) {
      return;
    }

    refs.current[index - 1]?.focus();
    const chars = digits.slice();
    chars[index - 1] = '';
    onChange(chars.join(''));
  }

  return (
    <View style={styles.container}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            refs.current[index] = ref;
          }}
          style={styles.input}
          value={digit}
          onChangeText={(text) => setDigit(index, text)}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Backspace') {
              onBackspace(index);
            }
          }}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
          returnKeyType="done"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  input: {
    width: Size.otpWidth,
    height: Size.otpHeight,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    backgroundColor: Colors.inputBackground,
    borderRadius: Radius.md,
    fontSize: Font.otp,
    color: Colors.textDark,
  },
});
