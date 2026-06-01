import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/Colors';
import { cityDetailsTheme as theme } from '../../theme/cityDetailsTheme';

type MapPreviewProps = {
  label: string;
};

export const MapPreview = memo(({ label }: MapPreviewProps) => (
  <View style={styles.container}>
    <View style={styles.gridLineOne} />
    <View style={styles.gridLineTwo} />
    <View style={styles.route} />

    <View style={styles.pin}>
      <Ionicons name="location-sharp" size={24} color={Colors.textWhite} />
    </View>

    <View style={styles.labelBox}>
      <Text numberOfLines={1} style={styles.label}>
        {label || 'Localização indisponível'}
      </Text>
    </View>
  </View>
));

MapPreview.displayName = 'MapPreview';

const styles = StyleSheet.create({
  container: {
    height: 188,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.inputBorder,
    borderWidth: 1,
    borderColor: Colors.divisor,
  },
  gridLineOne: {
    position: 'absolute',
    width: 260,
    height: 16,
    top: 42,
    left: -18,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.72)',
    transform: [{ rotate: '-18deg' }],
  },
  gridLineTwo: {
    position: 'absolute',
    width: 260,
    height: 14,
    bottom: 46,
    right: -38,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.64)',
    transform: [{ rotate: '24deg' }],
  },
  route: {
    position: 'absolute',
    width: 210,
    height: 5,
    top: 92,
    left: 54,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    transform: [{ rotate: '10deg' }],
  },
  pin: {
    position: 'absolute',
    top: 66,
    left: '50%',
    width: 54,
    height: 54,
    marginLeft: -27,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 4,
  },
  labelBox: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  label: {
    color: Colors.textDark,
    fontSize: 14,
    fontWeight: '800',
  },
});
