import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import {
  CATEGORIAS_DESTINO,
  MACRORREGIOES,
  montarRequisitos,
  type CategoriaDestinoId,
  type MacrorregiaoId,
  type PreferenciasViagem,
} from '../../constants/preferencias';
import { useAuth } from '../../context/AuthContext';
import { auth, db, isFirebaseConfigured } from '../../services/firebase';
import { salvarPerfilUsuario } from '../../services/usuarios';
import { useResponsive } from '../../utils/responsive';

type ChipGroupProps = {
  title: string;
  hint?: string;
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
};

function ChipGroup({ title, hint, options, selected, onToggle }: ChipGroupProps) {
  const r = useResponsive();
  return (
    <View style={styles.group}>
      <Text style={[styles.groupTitle, { fontSize: r.font(16) }]}>{title}</Text>
      {hint ? <Text style={[styles.groupHint, { fontSize: r.font(13) }]}>{hint}</Text> : null}
      <View style={styles.chips}>
        {options.map((opt) => {
          const active = selected.includes(opt.id);
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onToggle(opt.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, { fontSize: r.font(14) }, active && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function toggleIn<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function PreferenciasScreen() {
  const router = useRouter();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const { user, userData, refreshUserData } = useAuth();

  const [regioes, setRegioes] = useState<MacrorregiaoId[]>([]);
  const [categorias, setCategorias] = useState<CategoriaDestinoId[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const prefs = (userData?.preferencias ?? {}) as Partial<PreferenciasViagem>;
    if (prefs.regioes?.length) {
      setRegioes(prefs.regioes.filter((r) => MACRORREGIOES.some((m) => m.id === r)));
    }
    if (prefs.categorias?.length) {
      setCategorias(prefs.categorias.filter((c) => CATEGORIAS_DESTINO.some((d) => d.id === c)));
    }
  }, [userData]);

  async function handleSalvar() {
    if (regioes.length === 0 || categorias.length === 0) {
      Alert.alert(
        'Atenção',
        'Selecione pelo menos uma região do Brasil e um tipo de destino para personalizar suas recomendações.',
      );
      return;
    }

    const preferencias: PreferenciasViagem = { regioes, categorias };
    const requisitos = montarRequisitos(preferencias);

    if (!isFirebaseConfigured || !auth || !db || !user) {
      Alert.alert('Modo desenvolvimento', 'Preferências simuladas. Nada foi salvo no Firebase.');
      router.replace('/home');
      return;
    }

    setSalvando(true);
    try {
      await salvarPerfilUsuario(user.uid, {
        preferenciasConcluidas: true,
        preferencias,
        requisitos,
      });
      await refreshUserData();
      router.replace('/home');
    } catch (error: unknown) {
      console.error('[preferencias]', error);
      Alert.alert('Erro', 'Não foi possível salvar suas preferências. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, { paddingTop: r.scaleY(8) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: r.font(20) }]}>Preferências de Viagem</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, { fontSize: r.font(14) }]}>
          Escolha regiões e tipos de destino com base no nosso catálogo de cidades turísticas do Brasil (MTur).
        </Text>

        <ChipGroup
          title="Regiões do Brasil"
          hint="Derivado do estado (UF) de cada cidade no dataset."
          options={MACRORREGIOES.map((m) => ({ id: m.id, label: m.label }))}
          selected={regioes}
          onToggle={(v) => setRegioes((prev) => toggleIn(prev, v as MacrorregiaoId))}
        />

        <ChipGroup
          title="Tipos de destino"
          hint="Inferidos das regiões turísticas oficiais (REGIAO_TUR) do Ministério do Turismo."
          options={CATEGORIAS_DESTINO.map((c) => ({
            id: c.id,
            label: `${c.emoji} ${c.label}`,
          }))}
          selected={categorias}
          onToggle={(v) => setCategorias((prev) => toggleIn(prev, v as CategoriaDestinoId))}
        />

        <TouchableOpacity
          style={[styles.saveBtn, { marginTop: r.scaleY(8) }, salvando && { opacity: 0.6 }]}
          activeOpacity={0.85}
          onPress={handleSalvar}
          disabled={salvando}
        >
          <Text style={[styles.saveBtnText, { fontSize: r.font(16) }]}>
            {salvando ? 'Salvando...' : 'Salvar Preferências'}
          </Text>
        </TouchableOpacity>
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
  content: { paddingHorizontal: 24, paddingTop: 8 },
  subtitle: { color: Colors.textGray, marginBottom: 28, lineHeight: 22 },
  group: { marginBottom: 28 },
  groupTitle: { color: Colors.textWhite, fontWeight: '700', marginBottom: 6 },
  groupHint: { color: Colors.textGray, marginBottom: 12, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(121,116,231,0.2)',
  },
  chipText: { color: Colors.textGray, fontWeight: '500' },
  chipTextActive: { color: Colors.primary },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700' },
});
