import React, { memo, useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/Colors';
import { CARD_IMAGE_FALLBACK } from '../../constants/cityDetails';
import { cityDetailsTheme as theme } from '../../theme/cityDetailsTheme';
import type { Hotel } from '../../types/city';

type HotelCardProps = {
  hotel: Hotel;
  onReservePress?: (hotelId: string) => void;
};

export const HotelCard = memo(({ hotel, onReservePress }: HotelCardProps) => {
  const source = useMemo(
    () => ({ uri: hotel.imageUrl?.trim() ? hotel.imageUrl : CARD_IMAGE_FALLBACK }),
    [hotel.imageUrl],
  );

  return (
    <View style={styles.container}>
      <Image source={source} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.name}>
          {hotel.name || 'Hotel recomendado'}
        </Text>

        <View style={styles.row}>
          <Text numberOfLines={1} style={styles.price}>
            {hotel.price || 'Preço sob consulta'}
          </Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={theme.colors.accent} />
            <Text style={styles.rating}>{Number(hotel.rating || 0).toFixed(1)}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Reservar ${hotel.name}`}
          onPress={() => onReservePress?.(hotel.id)}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Reservar</Text>
        </Pressable>
      </View>
    </View>
  );
});

HotelCard.displayName = 'HotelCard';

const styles = StyleSheet.create({
  container: {
    width: 248,
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
    height: 132,
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
  row: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  price: {
    flex: 1,
    color: Colors.textDark,
    fontSize: 13,
    fontWeight: '800',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    color: Colors.textDark,
    fontSize: 13,
    fontWeight: '800',
  },
  button: {
    marginTop: 14,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
