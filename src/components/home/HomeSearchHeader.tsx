import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Radius } from '../../constants/Tokens';
import { useResponsive } from '../../utils/responsive';

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
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.block, { height: r.scaleY(128), paddingHorizontal: r.scaleX(20), paddingBottom: r.scaleY(16) }]}
        onPress={() => null}
      >
        <View style={[styles.inputRow, { paddingHorizontal: r.scaleX(12), height: r.scaleY(42) }]}>
          <MaterialIcons name="search" size={r.scaleX(22)} color="rgba(255,255,255,0.8)" />
          <TextInput
            style={[styles.input, { marginLeft: r.scaleX(8), fontSize: r.font(14) }]}
            placeholder="Pesquisar cidade..."
            placeholderTextColor="rgba(255,255,255,0.55)"
            value={busca}
            onChangeText={onChangeBusca}
            onSubmitEditing={onSubmitBusca}
            returnKeyType="search"
          />
        </View>
      </TouchableOpacity>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: Radius.sm,
  },
  input: {
    flex: 1,
    color: Colors.textWhite,
    height: '100%',
  },
});
