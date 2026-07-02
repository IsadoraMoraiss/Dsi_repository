import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Cidade } from '../../data/mockCidades';
import { useResponsive } from '../../utils/responsive';
import CityCard from './CityCard';

type HomeSectionProps = {
  title: string;
  data: Cidade[];
  emptyText?: string;
  actionLabel?: string;
  onPressAction?: () => void;
};


export default function HomeSection({ title, data, emptyText, actionLabel, onPressAction }: HomeSectionProps) {
  const r = useResponsive();

  return (
    <View style={[styles.section, { marginBottom: r.scaleY(28) }]}>
       <View style={[styles.header, { marginBottom: r.scaleY(12), paddingHorizontal: r.scaleX(16) }]}>
        <Text style={[styles.title, { fontSize: r.font(18) }]}>{title}</Text>
        {actionLabel && onPressAction ? (
          <TouchableOpacity activeOpacity={0.8} onPress={onPressAction} style={styles.actionButton}>
            <Text style={[styles.actionText, { fontSize: r.font(13) }]}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    color: Colors.textWhite,
    fontWeight: '600',
    flex: 1,
  },
  actionButton: {
    minHeight: 32,
    justifyContent: 'center',
  },
  actionText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  empty: {
    color: Colors.textGray,
  },
});
