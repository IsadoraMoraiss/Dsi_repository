import React, { memo, useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/Colors';
import { CARD_IMAGE_FALLBACK } from '../../constants/cityDetails';
import { cityDetailsTheme as theme } from '../../theme/cityDetailsTheme';
import type { Restaurant } from '../../types/city';

type RestaurantCardProps = {
  restaurant: Restaurant;
};

export const RestaurantCard = memo(({ restaurant }: RestaurantCardProps) => {
  const source = useMemo(
    () => ({ uri: restaurant.imageUrl?.trim() ? restaurant.imageUrl : CARD_IMAGE_FALLBACK }),
    [restaurant.imageUrl],
  );

  return (
    <View style={styles.container}>
      <Image source={source} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.name}>
          {restaurant.name || 'Restaurante'}
        </Text>
        <Text numberOfLines={1} style={styles.cuisine}>
          {restaurant.cuisine || 'Culinária variada'}
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={theme.colors.accent} />
          <Text style={styles.rating}>{Number(restaurant.rating || 0).toFixed(1)}</Text>
        </View>
      </View>
    </View>
  );
});

RestaurantCard.displayName = 'RestaurantCard';

const styles = StyleSheet.create({
  container: {
    width: 220,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 124,
    backgroundColor: theme.colors.surfaceMuted,
  },
  content: {
    padding: 14,
  },
  name: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: '800',
  },
  cuisine: {
    marginTop: 4,
    color: Colors.textGray,
    fontSize: 13,
    fontWeight: '600',
  },
  ratingRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    color: Colors.textDark,
    fontSize: 13,
    fontWeight: '800',
  },
});
