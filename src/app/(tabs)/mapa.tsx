/**
 * (tabs)/mapa.tsx
 *
 * Tela do Mapa Interativo — aba gerenciada pelo Tab Navigator nativo.
 */

import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  InteractionManager,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import CidadesMapView, {
  type CidadesMapViewHandle,
  type MapRegion,
} from '../../components/map/CidadesMapView';
import { Colors } from '../../constants/Colors';
import type { FiltrosMapa } from '../../types/cidadeDataset';
import type { CidadeDataset } from '../../types/cidadeDataset';
import {
  filtrarCidadesMapa,
  formatPopulacao,
  gerarTagsCidade,
  getGrupoInfraestrutura,
  limitarMarcadoresMapa,
  POPULOSO_MAPA_THRESHOLD,
  toCidadeLegacy,
} from '../../utils/cidadeDataset';
import { useRecentViews } from '../../context/RecentViewsContext';
import { useResponsive } from '../../utils/responsive';

type FiltroRapidoId =
  | 'capitais'
  | 'praias'
  | 'historicas'
  | 'natureza'
  | 'alta-infra'
  | 'com-hotel'
  | 'populosas';

const FILTROS_RAPIDOS: {
  id: FiltroRapidoId;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { id: 'capitais', label: 'Capitais', icon: 'account-balance' },
  { id: 'praias', label: 'Praias', icon: 'beach-access' },
  { id: 'historicas', label: 'Históricas', icon: 'museum' },
  { id: 'natureza', label: 'Natureza', icon: 'park' },
  { id: 'alta-infra', label: 'Alta infraestrutura', icon: 'star' },
  { id: 'com-hotel', label: 'Com hotel', icon: 'hotel' },
  { id: 'populosas', label: 'Mais populosas', icon: 'people' },
];

const FILTROS_SEM_RESTRICAO: FiltrosMapa = {
  ambiente: 'Todas',
  populoso: false,
  infraestrutura: 'Todas',
  comHotel: false,
  capitais: false,
  comUber: false,
};

const INITIAL_REGION: MapRegion = {
  latitude: -14.235,
  longitude: -51.9253,
  latitudeDelta: 32,
  longitudeDelta: 32,
};

function regionForCity(city: CidadeDataset): MapRegion {
  return { latitude: city.latitude, longitude: city.longitude, latitudeDelta: 0.18, longitudeDelta: 0.18 };
}

function distanciaKmEntre(
  origem: Pick<MapRegion, 'latitude' | 'longitude'>,
  destino: Pick<MapRegion, 'latitude' | 'longitude'>,
) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(destino.latitude - origem.latitude);
  const dLon = toRad(destino.longitude - origem.longitude);
  const lat1 = toRad(origem.latitude);
  const lat2 = toRad(destino.latitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function encontrarCidadeMaisProxima(
  cidades: CidadeDataset[],
  latitude: number,
  longitude: number,
) {
  return cidades.reduce<CidadeDataset | null>((maisProxima, cidade) => {
    if (!maisProxima) return cidade;

    const distanciaAtual = distanciaKmEntre({ latitude, longitude }, cidade);
    const menorDistancia = distanciaKmEntre({ latitude, longitude }, maisProxima);
    return distanciaAtual < menorDistancia ? cidade : maisProxima;
  }, null);
}

function normalizarMapa(texto: string | undefined | null) {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function cidadeTemTag(cidade: CidadeDataset, tag: string) {
  const alvo = normalizarMapa(tag);
  return gerarTagsCidade(cidade).some((item) => normalizarMapa(item).includes(alvo));
}

function aplicarFiltroRapido(cidades: CidadeDataset[], filtro: FiltroRapidoId | null) {
  if (!filtro) return cidades;

  return cidades.filter((cidade) => {
    if (filtro === 'capitais') return cidade.capital;
    if (filtro === 'praias') return cidadeTemTag(cidade, 'litoral') || cidade.categorias?.includes('praia-litoral');
    if (filtro === 'historicas') return cidadeTemTag(cidade, 'historico') || cidade.categorias?.includes('cultura-historico');
    if (filtro === 'natureza') return cidadeTemTag(cidade, 'natureza') || cidade.categorias?.includes('natureza');
    if (filtro === 'alta-infra') return getGrupoInfraestrutura(cidade.categoriaTur) === 'Alta';
    if (filtro === 'com-hotel') return (cidade.hoteis ?? 0) > 0;
    if (filtro === 'populosas') return (cidade.populacaoEstimada ?? 0) > POPULOSO_MAPA_THRESHOLD;
    return true;
  });
}

export default function MapaScreen() {
  const router = useRouter();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<CidadesMapViewHandle | null>(null);
  const { addRecentCidade } = useRecentViews();
  const [filtroRapido, setFiltroRapido] = useState<FiltroRapidoId | null>('capitais');
  const [busca, setBusca] = useState('');
  const [todasCidades, setTodasCidades] = useState<CidadeDataset[]>([]);
  const [carregandoCidades, setCarregandoCidades] = useState(true);
  const [selectedCity, setSelectedCity] = useState<CidadeDataset | null>(null);
  const [localizando, setLocalizando] = useState(false);

  useEffect(() => {
    let ativo = true;
    const task = InteractionManager.runAfterInteractions(() => {
      import('../../data/cidadesDataset')
        .then((module) => {
          if (ativo) setTodasCidades(module.getAllCidadesDataset());
        })
        .catch((error) => {
          console.warn('[mapa] Nao foi possivel carregar cidades:', error);
        })
        .finally(() => {
          if (ativo) setCarregandoCidades(false);
        });
    });

    return () => {
      ativo = false;
      task.cancel();
    };
  }, []);

  const {
    cidadesFiltradas,
    cidadesNoMapa,
    mapaLimitado,
    totalFiltradas,
    buscaForaDosFiltros,
  } = useMemo(() => {
    const termoBusca = busca.trim();
    const base = filtrarCidadesMapa(todasCidades, FILTROS_SEM_RESTRICAO, termoBusca);
    const filtradasComSugestao = aplicarFiltroRapido(base, filtroRapido);
    const buscaDireta = Boolean(termoBusca);
    const filtradas = buscaDireta ? base : filtradasComSugestao;
    const { exibidas, totalFiltradas: total, limitado } = limitarMarcadoresMapa(filtradas);
    return {
      cidadesFiltradas: filtradas,
      cidadesNoMapa: exibidas,
      mapaLimitado: limitado,
      totalFiltradas: total,
      buscaForaDosFiltros: buscaDireta && filtroRapido !== null && base.length > filtradasComSugestao.length,
    };
  }, [filtroRapido, busca, todasCidades]);

  useEffect(() => {
    if (!selectedCity && cidadesFiltradas.length > 0) {
      const brasilia = cidadesFiltradas.find((c) => normalizarMapa(c.nome) === 'brasilia');
      setSelectedCity(brasilia ?? cidadesFiltradas[0]);
    }
  }, [cidadesFiltradas, selectedCity]);

  useEffect(() => {
    if (selectedCity && !cidadesFiltradas.some((c) => c.id === selectedCity.id)) {
      setSelectedCity(cidadesFiltradas[0] ?? null);
    }
  }, [cidadesFiltradas, selectedCity]);

  const selectedTags = useMemo(
    () => (selectedCity ? gerarTagsCidade(selectedCity) : []),
    [selectedCity],
  );

  const cidadesRenderizadasNoMapa = useMemo(() => {
    if (!selectedCity || cidadesNoMapa.some((cidade) => cidade.id === selectedCity.id)) {
      return cidadesNoMapa;
    }

    return [...cidadesNoMapa, selectedCity];
  }, [cidadesNoMapa, selectedCity]);

  function focusCity(city: CidadeDataset) {
    setSelectedCity(city);
    mapRef.current?.animateToRegion(regionForCity(city), 450);
  }

  function limparFiltros() {
    setFiltroRapido('capitais');
    setBusca('');
  }

  function verTodas() {
    setFiltroRapido(null);
    setBusca('');
  }

  function handleDetailsPress() {
    if (!selectedCity) return;
    addRecentCidade(toCidadeLegacy(selectedCity));
    router.push({ pathname: '/detalhes-cidade', params: { id: selectedCity.id } });
  }

  async function handleLocalizarUsuario() {
    if (localizando) return;

    setLocalizando(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        Alert.alert(
          'Localizacao desativada',
          'Permita o acesso a localizacao para centralizar o mapa na sua cidade.',
        );
        return;
      }

      const posicao = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = posicao.coords;
      const cidadeAtual = encontrarCidadeMaisProxima(todasCidades, latitude, longitude);

      if (!cidadeAtual) {
        mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.18, longitudeDelta: 0.18 }, 450);
        return;
      }

      setBusca('');
      setFiltroRapido(null);
      setSelectedCity(cidadeAtual);
      mapRef.current?.animateToRegion(regionForCity(cidadeAtual), 450);
    } catch (error) {
      console.warn('[mapa:localizacao]', error);
      Alert.alert('Nao foi possivel localizar', 'Verifique se o GPS esta ativo e tente novamente.');
    } finally {
      setLocalizando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <View style={styles.mapHeaderRow}>
          <TouchableOpacity
            style={styles.mapBackBtn}
            onPress={() => router.replace('/(tabs)/explorar' as any)}
            activeOpacity={0.75}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={[styles.mapHeaderTitle, { fontSize: r.font(16) }]}>Explorar Mapa</Text>
        </View>
        <View style={styles.searchBar}>
          <TextInput
            style={[styles.searchInput, { fontSize: r.font(14) }]}
            placeholder="Buscar cidade ou estado..."
            placeholderTextColor={Colors.textGray}
            value={busca}
            onChangeText={setBusca}
          />
          {busca.length > 0 ? (
            <TouchableOpacity
              style={styles.clearSearchBtn}
              onPress={() => {
                setBusca('');
                Keyboard.dismiss();
              }}
              activeOpacity={0.75}
            >
              <MaterialIcons name="close" size={18} color={Colors.textGray} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[styles.locationBtn, localizando && styles.locationBtnLoading]}
            onPress={handleLocalizarUsuario}
            disabled={localizando}
          >
            <MaterialIcons name="my-location" size={20} color={localizando ? Colors.textGray : Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {FILTROS_RAPIDOS.map(({ id, label, icon }) => {
            const active = filtroRapido === id;
            return (
              <TouchableOpacity
                key={id}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setFiltroRapido(active ? null : id)}
              >
                <MaterialIcons name={icon} size={14} color={active ? Colors.primary : Colors.textGray} />
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.mapActionsRow}>
          <TouchableOpacity style={styles.mapActionBtn} onPress={verTodas} activeOpacity={0.75}>
            <MaterialIcons name="public" size={15} color={Colors.primary} />
            <Text style={styles.mapActionText}>Ver todas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapActionBtn} onPress={limparFiltros} activeOpacity={0.75}>
            <MaterialIcons name="filter-list-off" size={15} color={Colors.primary} />
            <Text style={styles.mapActionText}>Limpar filtros</Text>
          </TouchableOpacity>
        </View>

        {buscaForaDosFiltros ? (
          <Text style={styles.searchHint}>Resultado exibido fora dos filtros atuais.</Text>
        ) : null}

        {mapaLimitado ? (
          <Text style={styles.limitHint}>
            Exibindo {cidadesNoMapa.length} de {totalFiltradas} cidades — refine os filtros
          </Text>
        ) : (
          <Text style={styles.limitHint}>{totalFiltradas} cidades no mapa</Text>
        )}
      </View>

      <View style={styles.mapArea}>
        <CidadesMapView
          ref={mapRef}
          cidades={cidadesRenderizadasNoMapa}
          selectedCityId={selectedCity?.id}
          initialRegion={INITIAL_REGION}
          onSelectCity={focusCity}
        />
        <TouchableOpacity style={styles.filterFab} onPress={limparFiltros}>
          <MaterialIcons name="filter-list-off" size={22} color={Colors.textGray} />
        </TouchableOpacity>
      </View>

      {selectedCity ? (
        <View style={[styles.cityCard, { paddingBottom: insets.bottom + 80 }]}>
          <Image source={{ uri: selectedCity.imagemUrl }} style={styles.cityCardImg} />
          <View style={styles.cityCardBody}>
            <View style={styles.cityCardTop}>
              <MaterialIcons name="place" size={16} color="#FFFFFF" />
              <Text style={[styles.cityCardNome, { fontSize: r.font(20) }]}>{selectedCity.nome}</Text>
              <Text style={[styles.cityCardEstado, { fontSize: r.font(14) }]}>{selectedCity.estado}</Text>
            </View>
            <Text style={[styles.cityCardPop, { fontSize: r.font(13) }]}>
              {formatPopulacao(selectedCity.populacaoEstimada)}
            </Text>
            <View style={styles.cityCardTags}>
              {selectedTags.slice(0, 3).map((tag) => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{tag}</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.playBtn} onPress={handleDetailsPress}>
                <MaterialIcons name="arrow-forward" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.cityCard, styles.cityCardEmpty, { paddingBottom: insets.bottom + 80 }]}>
          <Text style={styles.emptyText}>
            {carregandoCidades
              ? 'Carregando cidades no mapa...'
              : 'Nenhuma cidade encontrada com os filtros atuais.'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F0F0' },
  mapHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  mapBackBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  mapHeaderTitle: { color: Colors.textDark, fontWeight: '700' },
  topBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    zIndex: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 30,
    borderWidth: 1, borderColor: Colors.inputBorder,
    paddingHorizontal: 16, paddingVertical: 10,
    gap: 8, marginBottom: 8,
  },
  searchInput: { flex: 1, color: Colors.textDark },
  clearSearchBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  locationBtnLoading: { opacity: 0.7 },
  filterScroll: { marginBottom: 6, maxHeight: 40 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.inputBorder,
    backgroundColor: '#FFFFFF', marginRight: 8,
  },
  filterChipActive: { borderColor: Colors.primary, backgroundColor: 'rgba(121,116,231,0.08)' },
  filterText: { color: Colors.textGray, fontSize: 13 },
  filterTextActive: { color: Colors.primary, fontWeight: '600' },
  mapActionsRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  mapActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
  },
  mapActionText: { color: Colors.primary, fontWeight: '700', fontSize: 12 },
  searchHint: { color: Colors.primary, fontSize: 11, fontWeight: '700', marginTop: 2 },
  limitHint: { color: Colors.textGray, fontSize: 11, marginTop: 2, marginBottom: 4 },
  mapArea: { flex: 1, backgroundColor: '#DDE5EE', position: 'relative' },
  filterFab: {
    position: 'absolute', right: 16, bottom: 22,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  cityCard: {
    backgroundColor: Colors.primary, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 14,
  },
  cityCardEmpty: { justifyContent: 'center', paddingVertical: 20 },
  emptyText: { color: '#FFFFFF', textAlign: 'center', flex: 1 },
  cityCardImg: { width: 80, height: 80, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)' },
  cityCardBody: { flex: 1 },
  cityCardTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' },
  cityCardNome: { color: '#FFFFFF', fontWeight: '700' },
  cityCardEstado: { color: 'rgba(255,255,255,0.75)' },
  cityCardPop: { color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  cityCardTags: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  tagChip: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagChipText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  playBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
});
