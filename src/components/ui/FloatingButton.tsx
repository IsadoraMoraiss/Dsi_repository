import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { cityDetailsTheme as theme } from '../../theme/cityDetailsTheme';

type FloatingButtonProps = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
};

export const FloatingButton = memo(({ label, onPress, style }: FloatingButtonProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    onPress={onPress}
    style={({ pressed }) => [styles.button, style, pressed && styles.pressed]}
  >
    <Ionicons name="map" size={20} color="#FFFFFF" />
    <Text numberOfLines={1} style={styles.label}>
      {label}
    </Text>
  </Pressable>
));

FloatingButton.displayName = 'FloatingButton';

const styles = StyleSheet.create({
  button: {
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
