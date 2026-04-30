import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { Font, Spacing } from '../../../constants/Tokens';

type RememberOptionsRowProps = {
  rememberValue: boolean;
  onChangeRemember: (value: boolean) => void;
  onPressForgot: () => void;
};

export default function RememberOptionsRow({
  rememberValue,
  onChangeRemember,
  onPressForgot,
}: RememberOptionsRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.switchContainer}>
        <Switch
          value={rememberValue}
          onValueChange={onChangeRemember}
          trackColor={{ false: '#767577', true: Colors.primary }}
          thumbColor={rememberValue ? Colors.textWhite : '#f4f3f4'}
        />
        <Text style={styles.switchLabel}>Lembrar de mim</Text>
      </View>
      <Pressable onPress={onPressForgot}>
        <Text style={styles.forgot}>Esqueceu sua senha?</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    color: Colors.textWhite,
    marginLeft: Spacing.xs,
    fontSize: Font.body,
  },
  forgot: {
    color: Colors.textWhite,
    fontSize: Font.body,
    textDecorationLine: 'underline',
    opacity: 0.8,
  },
});
