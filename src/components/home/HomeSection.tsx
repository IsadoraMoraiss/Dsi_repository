import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Cidade } from '../../data/mockCidades';
import { useResponsive } from '../../utils/responsive';
import CityCard from './CityCard';

type HomeSectionProps = {
  title: string;
  data: Cidade[];
  emptyText?: string;
};

export default function HomeSection({ title, data, emptyText }: HomeSectionProps) {
  const r = useResponsive();

  return (
    <View style={[styles.section, { marginBottom: r.scaleY(28) }]}>
      <Text style={[styles.title, { fontSize: r.font(18), marginBottom: r.scaleY(12), paddingHorizontal: r.scaleX(16) }]}>
        {title}
      </Text>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CityCard cidade={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: r.scaleX(16) }}
        ListEmptyComponent={
          emptyText ? <Text style={[styles.empty, { fontSize: r.font(14), paddingHorizontal: r.scaleX(16) }]}>{emptyText}</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {},
  title: {
    color: Colors.textWhite,
    fontWeight: '600',
  },
  empty: {
    color: Colors.textGray,
  },
});
