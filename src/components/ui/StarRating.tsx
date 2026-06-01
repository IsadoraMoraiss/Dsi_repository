import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type StarRatingProps = {
  value: number;          // 0–5
  maxStars?: number;      // default 5
  size?: number;          // icon size, default 20
  color?: string;         // filled color
  emptyColor?: string;    // empty star color
  onPress?: (star: number) => void; // if provided, stars are interactive
};

export default function StarRating({
  value,
  maxStars = 5,
  size = 20,
  color = '#F59E0B',
  emptyColor = '#D1D5DB',
  onPress,
}: StarRatingProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < Math.round(value);
        return onPress ? (
          <TouchableOpacity key={i} onPress={() => onPress(i + 1)} activeOpacity={0.7}>
            <MaterialIcons
              name={filled ? 'star' : 'star-border'}
              size={size}
              color={filled ? color : emptyColor}
            />
          </TouchableOpacity>
        ) : (
          <MaterialIcons
            key={i}
            name={filled ? 'star' : 'star-border'}
            size={size}
            color={filled ? color : emptyColor}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
