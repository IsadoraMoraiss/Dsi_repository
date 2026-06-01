import React, { memo, useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/Colors';
import { CARD_IMAGE_FALLBACK } from '../../constants/cityDetails';
import { cityDetailsTheme as theme } from '../../theme/cityDetailsTheme';
import type { RecommendedPlace } from '../../types/city';

type PlaceCardProps = {
  place: RecommendedPlace;
};

export const PlaceCard = memo(({ place }: PlaceCardProps) => {
  const source = useMemo(
    () => ({ uri: place.imageUrl?.trim() ? place.imageUrl : CARD_IMAGE_FALLBACK }),
    [place.imageUrl],
  );

  return (
    <View style={styles.container}>
      <Image source={source} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.name}>
          {place.name || 'Lugar recomendado'}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={theme.colors.accent} />
            <Text style={styles.metaText}>{Number(place.rating || 0).toFixed(1)}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="navigate" size={13} color={theme.colors.textMuted} />
            <Text numberOfLines={1} style={styles.metaText}>
              {place.distance || 'Distância indisponível'}
            </Text>
          </View>
        </View>

        <Text numberOfLines={1} style={styles.category}>
          {place.category}
        </Text>
      </View>
    </View>
  );
});

PlaceCard.displayName = 'PlaceCard';

const styles = StyleSheet.create({
  container: {
    width: 238,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 136,
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
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: Colors.textGray,
    fontSize: 12,
    fontWeight: '700',
  },
  category: {
    marginTop: 10,
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
});
