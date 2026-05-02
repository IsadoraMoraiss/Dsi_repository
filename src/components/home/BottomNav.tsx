import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useResponsive } from '../../utils/responsive';

type NavKey = 'explorar' | 'roteiro' | 'mapa' | 'perfil';

type BottomNavProps = {
  activeKey: NavKey;
  onChange: (key: NavKey) => void;
  bottomInset: number;
};

const NAV_ITEMS: Array<{ key: NavKey; label: string; icon: keyof typeof MaterialIcons.glyphMap }> = [
  { key: 'explorar', label: 'Explorar', icon: 'explore' },
  { key: 'roteiro', label: 'Roteiro', icon: 'directions' },
  { key: 'mapa', label: 'Mapa', icon: 'map' },
  { key: 'perfil', label: 'Perfil', icon: 'person' },
];

export default function BottomNav({ activeKey, onChange, bottomInset }: BottomNavProps) {
  const r = useResponsive();

  return (
    <View style={[styles.footer, { height: r.scaleY(72) + bottomInset, paddingBottom: bottomInset, paddingTop: r.scaleY(10) }]}>
      {NAV_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.item}
          onPress={() => onChange(item.key)}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={item.icon}
            size={r.scaleX(24)}
            color={activeKey === item.key ? Colors.primary : Colors.textGray}
          />
          <Text style={[styles.label, { fontSize: r.font(11), marginTop: r.scaleY(3) }, activeKey === item.key && styles.labelActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    backgroundColor: Colors.inputBackground,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: Colors.inputBorder,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: Colors.textGray,
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
