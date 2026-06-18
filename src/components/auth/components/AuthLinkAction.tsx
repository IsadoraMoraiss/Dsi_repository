import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { Font, Spacing } from '../../../constants/Tokens';

type AuthLinkActionProps = {
  label: string;
  onPress: () => void;
};

export default function AuthLinkAction({ label, onPress }: AuthLinkActionProps) {
  return (
    <Pressable onPress={onPress}>
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    color: Colors.textWhite,
    fontSize: Font.body,
    textAlign: 'center',
    marginTop: Spacing.xs,
    textDecorationLine: 'underline',
  },
});
