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
import {
  CATEGORIAS_DESTINO,
  MACRORREGIOES,
  getCategoriaLabel,
  type CategoriaDestinoId,
  type MacrorregiaoId,
} from '../constants/preferencias';
import { useAuth } from '../context/AuthContext';
import { getAllCidadesDataset } from '../data/cidadesDataset';
import type { Cidade } from '../data/mockCidades';
import type { CidadeDataset } from '../types/cidadeDataset';
import { toCidadeLegacy } from '../utils/cidadeDataset';
import {
    gerarTagsCidade,
} from '../utils/cidadeDataset';
import {
  calcularInfraestruturaTuristica,
  calcularPotencialNaoConvertido,
  calcularPotencialTuristico,
} from '../utils/indicadoresCidade';
import {
  getCityDiscoveryScore,
  rankCitiesByPreferences,
  UserPreferences,
} from '../utils/preferences';
import { useResponsive } from '../utils/responsive';

type RankingCriterion = 'preferencias' | 'joias' | 'potencial' | 'estrutura' | 'hospedagem' | 'idhm';
type IntentFilter = 'litoral' | 'serra' | 'natureza';
type InfraFilter = 'alta' | 'media' | 'basica';

type CriterionConfig = {
  id: RankingCriterion;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

const CRITERIA: CriterionConfig[] = [
  { id: 'preferencias', label: 'Para voce', icon: 'auto-awesome' },
  { id: 'joias', label: 'Joias escondidas', icon: 'diamond' },
  { id: 'potencial', label: 'Maior potencial', icon: 'auto-graph' },
  { id: 'estrutura', label: 'Melhor estrutura', icon: 'travel-explore' },
  { id: 'hospedagem', label: 'Hospedagem', icon: 'hotel' },
  { id: 'idhm', label: 'IDH', icon: 'insights' },
];


const INTENT_FILTERS: { id: IntentFilter; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: 'litoral', label: 'Litoral', icon: 'beach-access' },
  { id: 'serra', label: 'Serra', icon: 'terrain' },
  { id: 'natureza', label: 'Natureza', icon: 'park' },
];

const INFRA_FILTERS: { id: InfraFilter; label: string }[] = [
  { id: 'alta', label: 'Infra alta' },
  { id: 'media', label: 'Infra media' },
  { id: 'basica', label: 'Infra basica' },
];

const MAX_RANKING_RESULTS = 100;

function normalizeText(text: string | undefined | null) {
  return (text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getRankingValue(cidade: CidadeDataset, criterio: RankingCriterion) {
  if (criterio === 'joias') return calcularPotencialNaoConvertido(cidade);
  if (criterio === 'potencial') return calcularPotencialTuristico(cidade);
  if (criterio === 'estrutura') return calcularInfraestruturaTuristica(cidade);
  if (criterio === 'hospedagem') return (cidade.hoteis ?? 0) * 1000 + (cidade.leitos ?? 0);
  if (criterio === 'idhm') return cidade.idhm ?? 0;
  return 0;
}

function stableDatasetTiebreaker(cidade: CidadeDataset) {
  return cidade.id.split('').reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) % 1000003;
  }, 7);
}

function formatNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return 'Nao informado';
  return Math.round(value).toLocaleString('pt-BR');
}

function formatCriterionValue(cidade: CidadeDataset, criterio: RankingCriterion) {
  if (criterio === 'preferencias') return cidade.categoria;
  if (criterio === 'joias') return `Joia escondida ${calcularPotencialNaoConvertido(cidade)}/100`;
  if (criterio === 'potencial') return `Potencial turistico ${calcularPotencialTuristico(cidade)}/100`;
  if (criterio === 'estrutura') return `Estrutura turistica ${calcularInfraestruturaTuristica(cidade)}/100`;
  if (criterio === 'hospedagem') {
    if ((cidade.hoteis ?? 0) <= 0 && (cidade.leitos ?? 0) <= 0) return 'Hospedagem nao informada';
    return `${formatNumber(cidade.hoteis)} hoteis - ${formatNumber(cidade.leitos)} leitos`;
  }
  if (criterio === 'idhm') {
    return cidade.idhm != null ? `IDH ${cidade.idhm.toFixed(3)}` : 'IDH nao informado';
  }
  return '';
}

function getCriterionScoreLabel(cidade: CidadeDataset, criterio: RankingCriterion) {
  if (criterio === 'preferencias') return cidade.categoriaTur ? `MTur ${cidade.categoriaTur}` : cidade.categoria;
  if (criterio === 'hospedagem') return `${formatNumber(cidade.leitos)} leitos`;
  if (criterio === 'idhm') return cidade.idhm != null ? cidade.idhm.toFixed(3) : '--';
  return `${getRankingValue(cidade, criterio)}/100`;
}

function explainRanking(cidade: CidadeDataset, criterio: RankingCriterion) {
  const tags = gerarTagsCidade(cidade);
  const categoriaTur = cidade.categoriaTur ? `categoria MTur ${cidade.categoriaTur}` : 'categoria MTur nao informada';

  if (criterio === 'joias') {
    const potencial = calcularPotencialTuristico(cidade);
    const estrutura = calcularInfraestruturaTuristica(cidade);
    return `Potencial ${potencial}/100 e estrutura ${estrutura}/100 indicam oportunidade ainda pouco convertida.`;
  }
  if (criterio === 'potencial') {
    return `Combina IDH, conveniencia urbana, diversidade de categorias e ${categoriaTur}.`;
  }
  if (criterio === 'estrutura') {
    return `Considera hoteis, leitos, agencias, Uber, IDH e ${categoriaTur}.`;
  }
  if (criterio === 'hospedagem') {
    return `${formatNumber(cidade.hoteis)} hoteis e ${formatNumber(cidade.leitos)} leitos registrados.`;
  }
  if (criterio === 'idhm') {
    return cidade.idhm != null
      ? `IDH municipal ${cidade.idhm.toFixed(3)}, com populacao usada como desempate.`
      : 'Cidade sem IDH informado para comparacao.';
  }

  if (tags.length > 0) {
    return `Combina com ${tags.slice(0, 3).join(', ')} e ${cidade.categoria}.`;
  }
  return `Priorizada por regiao, categoria e estilo compativeis com suas preferencias.`;
}

function matchesSearch(cidade: CidadeDataset, termo: string) {
  if (!termo) return true;
  const tags = gerarTagsCidade(cidade).join(' ');
  const categorias = (cidade.categorias ?? []).map(getCategoriaLabel).join(' ');
  const haystack = normalizeText(
    [
      cidade.nome,
      cidade.estado,
      cidade.regiao,
      cidade.regiaoTur,
      cidade.categoria,
      cidade.categoriaTur,
      tags,
      categorias,
    ].join(' '),
  );
  return haystack.includes(termo);
}

function matchesIntentFilter(cidade: CidadeDataset, filtro: IntentFilter) {
  const tags = gerarTagsCidade(cidade).map(normalizeText);
  const regiaoTur = normalizeText(cidade.regiaoTur);
  if (filtro === 'litoral') return tags.includes('litoral') || regiaoTur.includes('litoral') || regiaoTur.includes('praia');
  if (filtro === 'serra') return tags.includes('serra') || (cidade.altitude ?? 0) > 800 || regiaoTur.includes('serra');
  return tags.includes('natureza') || cidade.categorias?.includes('natureza') || regiaoTur.includes('chapada') || regiaoTur.includes('pantanal');
}

function getInfraFilter(categoriaTur: string | null | undefined): InfraFilter | null {
  const categoria = categoriaTur?.toUpperCase();
  if (categoria === 'A' || categoria === 'B') return 'alta';
  if (categoria === 'C') return 'media';
  if (categoria === 'D' || categoria === 'E') return 'basica';
  return null;
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
      const popDiff = (b.populacaoEstimada ?? 0) - (a.populacaoEstimada ?? 0);
      if (popDiff !== 0) return popDiff;
      const discoveryDiff = getCityDiscoveryScore(toCidadeLegacy(b)) - getCityDiscoveryScore(toCidadeLegacy(a));
      if (discoveryDiff !== 0) return discoveryDiff;
      return stableDatasetTiebreaker(a) - stableDatasetTiebreaker(b);
    });
}

function applyFilters(
  cidades: CidadeDataset[],
  busca: string,
  regioes: MacrorregiaoId[],
  categorias: CategoriaDestinoId[],
  intents: IntentFilter[],
  infra: InfraFilter[],
  comHotel: boolean,
  comUber: boolean,
) {
  const termo = normalizeText(busca);

  return cidades.filter((cidade) => {
    if (!matchesSearch(cidade, termo)) return false;
    if (regioes.length > 0 && !regioes.includes(cidade.regiao as MacrorregiaoId)) return false;
    if (categorias.length > 0 && !categorias.some((cat) => cidade.categorias?.includes(cat))) return false;
    if (intents.length > 0 && !intents.some((intent) => matchesIntentFilter(cidade, intent))) return false;
    if (infra.length > 0) {
      const infraCidade = getInfraFilter(cidade.categoriaTur);
      if (!infraCidade || !infra.includes(infraCidade)) return false;
    }
    if (comHotel && (cidade.hoteis ?? 0) <= 0) return false;
    if (comUber && !cidade.uber) return false;
    return true;
  });
}

function toggleValue<T>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
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
        <View style={styles.valueRow}>
          <Text style={[styles.cityValue, { fontSize: r.font(12) }]} numberOfLines={1}>
            {formatCriterionValue(cidade, criterio)}
          </Text>
          <Text style={[styles.scorePill, { fontSize: r.font(11) }]} numberOfLines={1}>
            {getCriterionScoreLabel(cidade, criterio)}
          </Text>
        </View>
        <Text style={[styles.cityReason, { fontSize: r.font(11) }]} numberOfLines={2}>
          {explainRanking(cidade, criterio)}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={Colors.textGray} />
    </TouchableOpacity>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
}) {
  const r = useResponsive();

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[
        styles.filterChip,
        selected && styles.filterChipActive,
        { paddingHorizontal: r.scaleX(12), paddingVertical: r.scaleY(8) },
      ]}
    >
      {icon ? (
        <MaterialIcons name={icon} size={16} color={selected ? Colors.textWhite : Colors.primary} />
      ) : null}
      <Text
        style={[
          styles.filterChipText,
          selected && styles.filterChipTextActive,
          { fontSize: r.font(12) },
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
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
  const [busca, setBusca] = useState('');
  const [regioes, setRegioes] = useState<MacrorregiaoId[]>([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<CategoriaDestinoId[]>([]);
  const [intents, setIntents] = useState<IntentFilter[]>([]);
  const [infra, setInfra] = useState<InfraFilter[]>([]);
  const [comHotel, setComHotel] = useState(false);
  const [comUber, setComUber] = useState(false);

  const cidadesFiltradas = useMemo(
    () =>
      applyFilters(
        getAllCidadesDataset(),
        busca,
        regioes,
        categoriasSelecionadas,
        intents,
        infra,
        comHotel,
        comUber,
      ),
    [busca, regioes, categoriasSelecionadas, intents, infra, comHotel, comUber],
  );
  const cidadesRankeadas = useMemo(
    () => sortByCriterion(cidadesFiltradas, criterio, preferencias).slice(0, MAX_RANKING_RESULTS),
    [criterio, cidadesFiltradas, preferencias],
  );

  const criterioAtual = CRITERIA.find((item) => item.id === criterio) ?? CRITERIA[0];
  const totalFiltros =
    regioes.length +
    categoriasSelecionadas.length +
    intents.length +
    infra.length +
    Number(comHotel) +
    Number(comUber);

  function clearFilters() {
    setBusca('');
    setRegioes([]);
    setCategoriasSelecionadas([]);
    setIntents([]);
    setInfra([]);
    setComHotel(false);
    setComUber(false);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={[styles.header, { paddingHorizontal: r.scaleX(16), paddingTop: r.scaleY(8) }]}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.title, { fontSize: r.font(20) }]}>Ranking de cidades</Text>
          <Text style={[styles.subtitle, { fontSize: r.font(13) }]}>
            {cidadesRankeadas.length} de {cidadesFiltradas.length} por {criterioAtual.label.toLowerCase()}
          </Text>
        </View>
      </View>

      

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
            paddingTop: r.scaleY(4),
            paddingBottom: insets.bottom + r.scaleY(24),
          },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: r.scaleY(10) }} />}
         keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.controlsContainer}>
            <View style={styles.searchBox}>
              <MaterialIcons name="search" size={20} color={Colors.textGray} />
              <TextInput
                value={busca}
                onChangeText={setBusca}
                placeholder="Buscar cidade, estado, regiao, categoria ou tag"
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

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.criteriaViewport}
              contentContainerStyle={styles.criteriaScroll}
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
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.filtersHeader}>
              <Text style={[styles.filtersTitle, { fontSize: r.font(13) }]}>
                Filtros rapidos{totalFiltros > 0 ? ` (${totalFiltros})` : ''}
              </Text>
              {totalFiltros > 0 || busca ? (
                <TouchableOpacity activeOpacity={0.8} onPress={clearFilters}>
                  <Text style={[styles.clearFiltersText, { fontSize: r.font(12) }]}>Limpar</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.filtersWrap}>
              {MACRORREGIOES.map((regiao) => (
                <FilterChip
                  key={regiao.id}
                  label={regiao.label}
                  selected={regioes.includes(regiao.id)}
                  onPress={() => setRegioes((current) => toggleValue(current, regiao.id))}
                />
              ))}
              {CATEGORIAS_DESTINO.slice(0, 8).map((categoria) => (
                <FilterChip
                  key={categoria.id}
                  label={categoria.label}
                  selected={categoriasSelecionadas.includes(categoria.id)}
                  onPress={() => setCategoriasSelecionadas((current) => toggleValue(current, categoria.id))}
                />
              ))}
              {INTENT_FILTERS.map((item) => (
                <FilterChip
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  selected={intents.includes(item.id)}
                  onPress={() => setIntents((current) => toggleValue(current, item.id))}
                />
              ))}
              {INFRA_FILTERS.map((item) => (
                <FilterChip
                  key={item.id}
                  label={item.label}
                  selected={infra.includes(item.id)}
                  onPress={() => setInfra((current) => toggleValue(current, item.id))}
                />
              ))}
              <FilterChip
                label="Com hotel"
                icon="hotel"
                selected={comHotel}
                onPress={() => setComHotel((value) => !value)}
              />
              <FilterChip
                label="Com Uber"
                icon="local-taxi"
                selected={comUber}
                onPress={() => setComUber((value) => !value)}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="leaderboard" size={36} color={Colors.textGray} />
            <Text style={[styles.emptyText, { fontSize: r.font(14) }]}>
              Nenhuma cidade encontrada para este criterio e filtros.
            </Text>
            <TouchableOpacity activeOpacity={0.86} style={styles.emptyButton} onPress={clearFilters}>
              <Text style={[styles.emptyButtonText, { fontSize: r.font(13) }]}>Limpar filtros</Text>
            </TouchableOpacity>
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
  controlsContainer: {
    paddingTop: 16,
    paddingBottom: 14,
    gap: 12,
  },
  criteriaViewport: {
    minHeight: 44,
    maxHeight: 52,
  },
  criteriaScroll: {
    gap: 10,
    alignItems: 'center',
    paddingRight: 4,
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
  filtersHeader: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filtersTitle: {
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '700',
  },
  clearFiltersText: {
    color: Colors.primary,
    fontWeight: '800',
  },
  filtersWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 2,
  },
  filterChip: {
    minHeight: 36,
    maxWidth: 190,
    borderRadius: Radius.round,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
    ...Shadow.subtle,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    color: Colors.textDark,
    fontWeight: '700',
    flexShrink: 1,
  },
  filterChipTextActive: {
    color: Colors.textWhite,
  },
  listContent: {
    flexGrow: 1,
  },
  cityRow: {
    minHeight: 118,
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
   valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cityMeta: {
    color: Colors.textGray,
    marginBottom: 4,
  },
  cityValue: {
    color: Colors.primary,
    fontWeight: '700',
    flex: 1,
  },
  scorePill: {
    color: Colors.primary,
    fontWeight: '800',
    backgroundColor: 'rgba(121,116,231,0.14)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  cityReason: {
    color: Colors.textGray,
    lineHeight: 15,
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
  emptyButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.round,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  emptyButtonText: {
    color: Colors.textWhite,
    fontWeight: '800',
  },
});