import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Radius, Shadow } from '../constants/Tokens';
import { useAuth } from '../context/AuthContext';
import { getPoolCidadesRecomendadas } from '../data/cidadesRecomendadas';
import { Cidade, categorias } from '../data/mockCidades';
import {
  rankCitiesByPreferences,
  UserPreferences,
} from '../utils/preferences';
import { useResponsive } from '../utils/responsive';

function normalizeText(text: string | undefined | null) {
  return (text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getCategoriaInicial(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return categorias.includes(value ?? '') ? value ?? 'Todas' : 'Todas';
}

function CidadeRow({ cidade }: { cidade: Cidade }) {
  const router = useRouter();
  const r = useResponsive();
  const descricao =
    cidade.descricao?.trim() ||
    'Descubra pontos turisticos, cultura local e experiencias da cidade.';

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      style={styles.cityRow}
      onPress={() => router.push({ pathname: '/detalhes-cidade', params: { id: cidade.id } })}
    >
      <View style={styles.cityIcon}>
        <MaterialIcons name="location-city" size={22} color={Colors.primary} />
      </View>
      <View style={styles.cityBody}>
        <Text style={[styles.cityName, { fontSize: r.font(15) }]} numberOfLines={1}>
          {cidade.nome}, {cidade.estado}
        </Text>
        <Text style={[styles.cityMeta, { fontSize: r.font(12) }]} numberOfLines={1}>
          {cidade.regiao} - {cidade.categoria}
        </Text>
        <Text style={[styles.cityDescription, { fontSize: r.font(12) }]} numberOfLines={2}>
          {descricao}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={Colors.textGray} />
    </TouchableOpacity>
  );
}

export default function CidadesRecomendadasScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoria?: string }>();
  const insets = useSafeAreaInsets();
  const r = useResponsive();
  const { userData } = useAuth();
  const preferencias = (userData?.preferencias ?? {}) as UserPreferences;
  const [busca, setBusca] = useState('');

  const categoriaInicial = useMemo(() => getCategoriaInicial(params.categoria), [params.categoria]);

  const cidades = useMemo(() => {
    const rankeadas = rankCitiesByPreferences(getPoolCidadesRecomendadas(), preferencias);
    const porCategoria =
      categoriaInicial === 'Todas'
        ? rankeadas
        : rankeadas.filter((cidade) => cidade.categoria === categoriaInicial);

    const termo = normalizeText(busca);
    if (!termo) return porCategoria;

    return porCategoria.filter((cidade) => {
      const haystack = normalizeText(`${cidade.nome} ${cidade.estado} ${cidade.regiao}`);
      return haystack.includes(termo);
    });
  }, [busca, categoriaInicial, preferencias]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={[styles.header, { paddingHorizontal: r.scaleX(16), paddingTop: r.scaleY(8) }]}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.title, { fontSize: r.font(20) }]}>Cidades recomendadas</Text>
          <Text style={[styles.subtitle, { fontSize: r.font(13) }]}>
            {cidades.length} cidade{cidades.length === 1 ? '' : 's'}
            {categoriaInicial !== 'Todas' ? ` em ${categoriaInicial}` : ''}
          </Text>
        </View>
      </View>

      <View style={[styles.searchBox, { marginHorizontal: r.scaleX(16), marginTop: r.scaleY(16) }]}>
        <MaterialIcons name="search" size={20} color={Colors.textGray} />
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar por cidade, estado ou regiao"
          placeholderTextColor={Colors.textGray}
          style={[styles.searchInput, { fontSize: r.font(14) }]}
          returnKeyType="search"
        />
        {busca ? (
          <TouchableOpacity activeOpacity={0.8} onPress={() => setBusca('')} style={styles.clearButton}>
            <MaterialIcons name="close" size={18} color={Colors.textGray} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={cidades}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CidadeRow cidade={item} />}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal: r.scaleX(16),
            paddingTop: r.scaleY(16),
            paddingBottom: insets.bottom + r.scaleY(24),
          },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: r.scaleY(10) }} />}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="location-off" size={36} color={Colors.textGray} />
            <Text style={[styles.emptyText, { fontSize: r.font(14) }]}>
              Nenhuma cidade encontrada.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: Colors.textWhite,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    marginTop: 2,
  },
  searchBox: {
    minHeight: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    ...Shadow.subtle,
  },
  searchInput: {
    flex: 1,
    color: Colors.textDark,
    paddingVertical: 10,
  },
  clearButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    flexGrow: 1,
  },
  cityRow: {
    minHeight: 104,
    borderRadius: Radius.md,
    backgroundColor: Colors.inputBackground,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadow.subtle,
  },
  cityIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(121,116,231,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityBody: {
    flex: 1,
  },
  cityName: {
    color: Colors.textDark,
    fontWeight: '700',
    marginBottom: 4,
  },
  cityMeta: {
    color: Colors.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  cityDescription: {
    color: Colors.textGray,
  },
  emptyState: {
    flex: 1,
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    color: Colors.textGray,
    textAlign: 'center',
  },
});