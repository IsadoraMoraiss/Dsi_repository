import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Radius, Shadow } from '../constants/Tokens';
import { useAuth } from '../context/AuthContext';
import { getAllCidadesDataset } from '../data/cidadesDataset';
import type { Cidade } from '../data/mockCidades';
import type { CidadeDataset } from '../types/cidadeDataset';
import { toCidadeLegacy } from '../utils/cidadeDataset';
import {
  rankCitiesByPreferences,
  UserPreferences,
} from '../utils/preferences';
import { useResponsive } from '../utils/responsive';

type RankingCriterion = 'preferencias' | 'infraestrutura' | 'hospedagem' | 'idhm' | 'populacao';

type CriterionConfig = {
  id: RankingCriterion;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

const CRITERIA: CriterionConfig[] = [
  { id: 'preferencias', label: 'Para voce', icon: 'auto-awesome' },
  { id: 'infraestrutura', label: 'Infraestrutura', icon: 'travel-explore' },
  { id: 'hospedagem', label: 'Hospedagem', icon: 'hotel' },
  { id: 'idhm', label: 'IDH', icon: 'insights' },
  { id: 'populacao', label: 'Populacao', icon: 'groups' },
];

const TUR_SCORE: Record<string, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
};

function getRankingValue(cidade: CidadeDataset, criterio: RankingCriterion) {
  if (criterio === 'infraestrutura') return TUR_SCORE[cidade.categoriaTur?.toUpperCase() ?? ''] ?? 0;
  if (criterio === 'hospedagem') return (cidade.hoteis ?? 0) * 1000 + (cidade.leitos ?? 0);
  if (criterio === 'idhm') return cidade.idhm ?? 0;
  if (criterio === 'populacao') return cidade.populacaoEstimada ?? 0;
  return 0;
}

function formatNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return 'Nao informado';
  return Math.round(value).toLocaleString('pt-BR');
}

function formatCriterionValue(cidade: CidadeDataset, criterio: RankingCriterion) {
  if (criterio === 'preferencias') return cidade.categoria;
  if (criterio === 'infraestrutura') {
    return cidade.categoriaTur ? `Categoria ${cidade.categoriaTur}` : 'Sem categoria turistica';
  }
  if (criterio === 'hospedagem') {
    if ((cidade.hoteis ?? 0) <= 0 && (cidade.leitos ?? 0) <= 0) return 'Hospedagem nao informada';
    return `${formatNumber(cidade.hoteis)} hoteis - ${formatNumber(cidade.leitos)} leitos`;
  }
  if (criterio === 'idhm') {
    return cidade.idhm != null ? `IDH ${cidade.idhm.toFixed(3)}` : 'IDH nao informado';
  }
  return `${formatNumber(cidade.populacaoEstimada)} habitantes`;
}

function sortByCriterion(cidades: CidadeDataset[], criterio: RankingCriterion, preferencias: UserPreferences) {
  if (criterio === 'preferencias') {
    const byId = new Map(cidades.map((cidade) => [cidade.id, cidade]));
    return rankCitiesByPreferences(cidades.map(toCidadeLegacy), preferencias)
      .map((cidade: Cidade) => byId.get(cidade.id))
      .filter((cidade): cidade is CidadeDataset => Boolean(cidade));
  }

  return [...cidades]
    .filter((cidade) => getRankingValue(cidade, criterio) > 0)
    .sort((a, b) => {
      const valueDiff = getRankingValue(b, criterio) - getRankingValue(a, criterio);
      if (valueDiff !== 0) return valueDiff;
      return a.nome.localeCompare(b.nome);
    });
}

function RankingRow({
  cidade,
  criterio,
  posicao,
}: {
  cidade: CidadeDataset;
  criterio: RankingCriterion;
  posicao: number;
}) {
  const router = useRouter();
  const r = useResponsive();

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      style={styles.cityRow}
      onPress={() => router.push({ pathname: '/detalhes-cidade', params: { id: cidade.id } })}
    >
      <View style={styles.rankBadge}>
        <Text style={[styles.rankText, { fontSize: r.font(13) }]}>#{posicao}</Text>
      </View>
      <View style={styles.cityBody}>
        <Text style={[styles.cityName, { fontSize: r.font(15) }]} numberOfLines={1}>
          {cidade.nome}, {cidade.estado}
        </Text>
        <Text style={[styles.cityMeta, { fontSize: r.font(12) }]} numberOfLines={1}>
          {cidade.regiao} - {cidade.categoria}
        </Text>
        <Text style={[styles.cityValue, { fontSize: r.font(12) }]} numberOfLines={1}>
          {formatCriterionValue(cidade, criterio)}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={Colors.textGray} />
    </TouchableOpacity>
  );
}

export default function RankingCidadesScreen() {
  const router = useRouter();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const { userData } = useAuth();
  const preferencias = (userData?.preferencias ?? {}) as UserPreferences;
  const [criterio, setCriterio] = useState<RankingCriterion>('preferencias');

  const cidadesRankeadas = useMemo(
    () => sortByCriterion(getAllCidadesDataset(), criterio, preferencias).slice(0, 100),
    [criterio, preferencias],
  );

  const criterioAtual = CRITERIA.find((item) => item.id === criterio) ?? CRITERIA[0];

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={[styles.header, { paddingHorizontal: r.scaleX(16), paddingTop: r.scaleY(8) }]}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.title, { fontSize: r.font(20) }]}>Ranking de cidades</Text>
          <Text style={[styles.subtitle, { fontSize: r.font(13) }]}>
            Top {cidadesRankeadas.length} por {criterioAtual.label.toLowerCase()}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.criteriaScroll,
          { paddingHorizontal: r.scaleX(16), paddingTop: r.scaleY(16), paddingBottom: r.scaleY(10) },
        ]}
      >
        {CRITERIA.map((item) => {
          const selected = item.id === criterio;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.82}
              onPress={() => setCriterio(item.id)}
              style={[
                styles.criterionButton,
                selected && styles.criterionButtonActive,
                { paddingHorizontal: r.scaleX(14), paddingVertical: r.scaleY(9) },
              ]}
            >
              <MaterialIcons
                name={item.icon}
                size={18}
                color={selected ? Colors.textWhite : Colors.primary}
              />
              <Text
                style={[
                  styles.criterionText,
                  selected && styles.criterionTextActive,
                  { fontSize: r.font(13) },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={cidadesRankeadas}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <RankingRow cidade={item} criterio={criterio} posicao={index + 1} />
        )}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal: r.scaleX(16),
            paddingTop: r.scaleY(6),
            paddingBottom: insets.bottom + r.scaleY(24),
          },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: r.scaleY(10) }} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="leaderboard" size={36} color={Colors.textGray} />
            <Text style={[styles.emptyText, { fontSize: r.font(14) }]}>
              Nenhuma cidade com dados para este criterio.
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
  criteriaScroll: {
    gap: 10,
  },
  criterionButton: {
    minHeight: 40,
    borderRadius: Radius.round,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...Shadow.subtle,
  },
  criterionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  criterionText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  criterionTextActive: {
    color: Colors.textWhite,
  },
  listContent: {
    flexGrow: 1,
  },
  cityRow: {
    minHeight: 96,
    borderRadius: Radius.md,
    backgroundColor: Colors.inputBackground,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadow.subtle,
  },
  rankBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(121,116,231,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: Colors.primary,
    fontWeight: '800',
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
    color: Colors.textGray,
    marginBottom: 4,
  },
  cityValue: {
    color: Colors.primary,
    fontWeight: '700',
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