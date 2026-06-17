import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Radius } from '../../constants/Tokens';
import { useResponsive } from '../../utils/responsive';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  onSubmitEditing?: () => void;
};

export default function SearchBar({
  value,
  onChangeText,
  placeholder,
  onSubmitEditing,
}: SearchBarProps) {
  const r = useResponsive();

  return (
    <View style={[styles.inputRow, { paddingHorizontal: r.scaleX(12), height: r.scaleY(42) }]}>
      <MaterialIcons name="search" size={r.scaleX(22)} color="rgba(255,255,255,0.8)" />
      <TextInput
        style={[styles.input, { marginLeft: r.scaleX(8), fontSize: r.font(14) }]}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.55)"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
