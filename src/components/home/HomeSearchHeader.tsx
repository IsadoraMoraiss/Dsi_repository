import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Radius } from '../../constants/Tokens';
import { useResponsive } from '../../utils/responsive';
import SearchBar from '../ui/SearchBar';

type HomeSearchHeaderProps = {
  busca: string;
  onChangeBusca: (value: string) => void;
  onSubmitBusca: () => void;
};

export default function HomeSearchHeader({
  busca,
  onChangeBusca,
  onSubmitBusca,
}: HomeSearchHeaderProps) {
  const r = useResponsive();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.block, { height: r.scaleY(80), paddingHorizontal: r.scaleX(20), paddingBottom: r.scaleY(12), paddingTop: r.scaleY(12) }]}>
        <SearchBar
          value={busca}
          onChangeText={onChangeBusca}
          placeholder="Pesquisar cidade..."
          onSubmitEditing={onSubmitBusca}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.background,
  },
  block: {
    width: '100%',
    backgroundColor: Colors.primary,
    justifyContent: 'flex-end',
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    overflow: 'hidden',
  },
});
