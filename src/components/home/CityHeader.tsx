import React, { memo, useMemo } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { CITY_HEADER_HEIGHT, CITY_IMAGE_FALLBACK } from '../../constants/cityDetails';
import { cityDetailsTheme as theme } from '../../theme/cityDetailsTheme';

type CityHeaderProps = {
  imageUrl?: string | null;
  cityName: string;
  locationLabel: string;
  rating: number;
  isFavorite: boolean;
  onBackPress: () => void;
  onFavoritePress: () => void;
};

const clampRating = (rating: number) => Math.max(0, Math.min(5, rating));

export const CityHeader = memo(
  ({
    imageUrl,
    cityName,
    locationLabel,
    rating,
    isFavorite,
    onBackPress,
    onFavoritePress,
  }: CityHeaderProps) => {
    const safeRating = useMemo(() => clampRating(Number.isFinite(rating) ? rating : 0), [rating]);
    const source = useMemo(
      () => ({ uri: imageUrl?.trim() ? imageUrl : CITY_IMAGE_FALLBACK }),
      [imageUrl],
    );

    return (
      <ImageBackground source={source} style={styles.container} resizeMode="cover">
        <LinearGradient
          colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.72)']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={onBackPress}
            style={styles.iconButton}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            onPress={onFavoritePress}
            style={styles.iconButton}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={23}
              color={isFavorite ? theme.colors.danger : '#FFFFFF'}
            />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text numberOfLines={2} style={styles.title}>
            {cityName || 'Cidade turística'}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={16} color="#FFFFFF" />
            <Text numberOfLines={1} style={styles.location}>
              {locationLabel || 'Brasil'}
            </Text>
          </View>

          <View style={styles.ratingRow}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Ionicons
                key={`star-${index}`}
                name={index < Math.round(safeRating) ? 'star' : 'star-outline'}
                size={16}
                color={theme.colors.accent}
              />
            ))}
            <Text style={styles.ratingText}>{safeRating.toFixed(1)}</Text>
          </View>
        </View>
      </ImageBackground>
    );
  },
);

CityHeader.displayName = 'CityHeader';

const styles = StyleSheet.create({
  container: {
    height: CITY_HEADER_HEIGHT,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0,
  },
  locationRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  location: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  ratingRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    marginLeft: 6,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
