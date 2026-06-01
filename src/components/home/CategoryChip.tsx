import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '../../constants/Colors';
import { cityDetailsTheme as theme } from '../../theme/cityDetailsTheme';
import type { CityCategory } from '../../types/city';

type CategoryChipProps = {
  label: CityCategory;
};

export const CategoryChip = memo(({ label }: CategoryChipProps) => (
  <View style={styles.container}>
    <Text numberOfLines={1} style={styles.label}>
      {label}
    </Text>
  </View>
));

CategoryChip.displayName = 'CategoryChip';

const styles = StyleSheet.create({
  container: {
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  label: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '800',
  },
});
