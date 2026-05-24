import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useResponsive } from '../../utils/responsive';

type SettingItemProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress?: () => void;
  danger?: boolean;
};

function SettingItem({ icon, label, onPress, danger }: SettingItemProps) {
  const r = useResponsive();
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <MaterialIcons name={icon} size={r.scaleX(22)} color={danger ? '#EF4444' : Colors.primary} style={styles.itemIcon} />
      <Text style={[styles.itemLabel, { fontSize: r.font(16), color: danger ? '#EF4444' : Colors.textWhite }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

type SettingGroupProps = {
  title: string;
  children: React.ReactNode;
};

function SettingGroup({ title, children }: SettingGroupProps) {
  const r = useResponsive();
  return (
    <View style={styles.group}>
      <Text style={[styles.groupTitle, { fontSize: r.font(16) }]}>{title}</Text>
      <View style={styles.groupBox}>{children}</View>
    </View>
  );
}

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const r = useResponsive();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: r.scaleY(8) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: r.font(20) }]}>Configurações</Text>
        <TouchableOpacity style={{ marginLeft: 'auto' }}>
          <MaterialIcons name="more-vert" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <SettingGroup title="Suporte & Sobre">
          <SettingItem icon="help-outline" label="Ajuda" />
          <SettingItem icon="info-outline" label="Política de Privacidade" />
        </SettingGroup>

        <SettingGroup title="Conta">
          <SettingItem icon="translate" label="Idioma" />
          <SettingItem icon="notifications-none" label="Notificações" />
          <SettingItem icon="lock-outline" label="Gerenciar Senha" onPress={() => router.push('/redefinir')} />
        </SettingGroup>

        <SettingGroup title="Ações">
          <SettingItem icon="flag" label="Reportar Problema" />
          <SettingItem icon="people-outline" label="Trocar de Conta" onPress={() => router.replace('/login')} />
          <SettingItem icon="thumbs-up-down" label="Envie-nos um feedback" />
          <SettingItem icon="delete-forever" label="Deletar Conta" danger />
        </SettingGroup>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: { marginRight: 12 },
  headerTitle: { color: Colors.textWhite, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  group: { marginBottom: 24 },
  groupTitle: { color: Colors.textWhite, fontWeight: '700', marginBottom: 10 },
  groupBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  itemIcon: { marginRight: 14 },
  itemLabel: { color: Colors.textWhite, fontWeight: '500' },
});
