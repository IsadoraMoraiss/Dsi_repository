import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useResponsive } from '../../utils/responsive';

export type NavKey = 'explorar' | 'roteiro' | 'mapa' | 'perfil';

type BottomNavProps = {
  activeKey: NavKey;
  onChange: (key: NavKey) => void;
  bottomInset: number;
  onPressCenter?: () => void;
};

type Item = { key: NavKey; label: string; icon: keyof typeof MaterialIcons.glyphMap };

const ITEMS_LEFT: Item[] = [
  { key: 'explorar', label: 'Explorar', icon: 'explore' },
  { key: 'roteiro', label: 'Roteiros', icon: 'calendar-today' },
];

const ITEMS_RIGHT: Item[] = [
  { key: 'mapa', label: 'Mapa', icon: 'place' },
  { key: 'perfil', label: 'Perfil', icon: 'person' },
];

function NavItem({
  item,
  active,
  onPress,
}: {
  item: Item;
  active: boolean;
  onPress: () => void;
}) {
  const r = useResponsive();
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <MaterialIcons
        name={item.icon}
        size={r.scaleX(24)}
        color={active ? Colors.primary : Colors.textGray}
      />
      <Text
        style={[
          styles.label,
          { fontSize: r.font(11), marginTop: r.scaleY(3) },
          active && styles.labelActive,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

export default function BottomNav({ activeKey, onChange, bottomInset, onPressCenter }: BottomNavProps) {
  const r = useResponsive();
  const navHeight = r.scaleY(64) + bottomInset;

  return (
    <View style={[styles.footer, { height: navHeight, paddingBottom: bottomInset }]}>
      {ITEMS_LEFT.map((item) => (
        <NavItem
          key={item.key}
          item={item}
          active={activeKey === item.key}
          onPress={() => onChange(item.key)}
        />
      ))}

      {/* Botao central de criar — inline no rodape, sem flutuar */}
      <TouchableOpacity style={styles.item} onPress={onPressCenter} activeOpacity={0.85}>
        <View style={[styles.centerBtn, { width: r.scaleX(48), height: r.scaleX(48), borderRadius: r.scaleX(24) }]}>
          <MaterialIcons name="add" size={r.scaleX(26)} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {ITEMS_RIGHT.map((item) => (
        <NavItem
          key={item.key}
          item={item}
          active={activeKey === item.key}
          onPress={() => onChange(item.key)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    backgroundColor: Colors.inputBackground,
    flexDirection: 'row',
    alignItems: 'center',
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
  centerBtn: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
