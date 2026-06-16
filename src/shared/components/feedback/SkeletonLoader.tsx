import React from 'react';
import { StyleSheet, View } from 'react-native';

type SkeletonLoaderProps = {
  height?: number;
  width?: number | `${number}%`;
  borderRadius?: number;
};

export default function SkeletonLoader({
  height = 16,
  width = '100%',
  borderRadius = 8,
}: SkeletonLoaderProps) {
  return <View style={[styles.base, { height, width, borderRadius }]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
});
