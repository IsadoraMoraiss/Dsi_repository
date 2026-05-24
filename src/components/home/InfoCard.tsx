import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { cityDetailsTheme as theme } from '../../theme/cityDetailsTheme';

type InfoCardProps = {
  icon: string;
  label: string;
  value: string;
};

export const InfoCard = memo(({ icon, label, value }: InfoCardProps) => (
  <View style={styles.container}>
    <View style={styles.iconWrap}>
      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={19} color={theme.colors.primary} />
    </View>
    <Text numberOfLines={1} style={styles.label}>
      {label}
    </Text>
    <Text numberOfLines={2} style={styles.value}>
      {value}
    </Text>
  </View>
));

InfoCard.displayName = 'InfoCard';

const styles = StyleSheet.create({
  container: {
    width: 138,
    minHeight: 126,
    padding: 14,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F3EF',
  },
  label: {
    marginTop: 12,
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
});
    
