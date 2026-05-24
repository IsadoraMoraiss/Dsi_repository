import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import CidadesMapView, { type CidadesMapViewHandle, type MapRegion } from '../components/map/CidadesMapView';
import { Colors } from '../constants/Colors';
import MainTabLayout from '../components/layout/MainTabLayout';
import { getAllCidadesDataset } from '../data/cidadesDataset';
import {
  FILTROS_MAPA_PADRAO,
  type FiltroAmbienteMapa,
  type FiltroInfraestruturaMapa,
  type FiltrosMapa,
} from '../types/cidadeDataset';
import type { CidadeDataset } from '../types/cidadeDataset';
import {
  filtrarCidadesMapa,
  formatPopulacao,
  gerarTagsCidade,
  limitarMarcadoresMapa,
  toCidadeLegacy,
} from '../utils/cidadeDataset';
import { useRecentViews } from '../context/RecentViewsContext';
import { useResponsive } from '../utils/responsive';

const AMBIENTE_FILTROS: FiltroAmbienteMapa[] = ['Todas', 'Urbano', 'Rural', 'Intermediário'];
const INFRA_FILTROS: FiltroInfraestruturaMapa[] = ['Todas', 'Alta', 'Média', 'Básica'];

const TOGGLE_FILTROS: { key: keyof Pick<FiltrosMapa, 'populoso' | 'comHotel' | 'capitais' | 'comUber'>; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { key: 'populoso', label: 'Populoso', icon: 'people' },
  { key: 'comHotel', label: 'Com hotel', icon: 'hotel' },
  { key: 'capitais', label: 'Capitais', icon: 'account-balance' },
  { key: 'comUber', label: 'Com Uber', icon: 'directions-car' },
];

const TODAS_CIDADES = getAllCidadesDataset();

const INITIAL_REGION: MapRegion = {
  latitude: -14.235,
  longitude: -51.9253,
  latitudeDelta: 32,
  longitudeDelta: 32,
};

function regionForCity(city: CidadeDataset): MapRegion {
  return {
    latitude: city.latitude,
    longitude: city.longitude,
    latitudeDelta: 0.18,
    longitudeDelta: 0.18,
  };
}

export default function MapaScreen() {
  const router = useRouter();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<CidadesMapViewHandle | null>(null);
  const { addRecentCidade } = useRecentViews();
  const [filtros, setFiltros] = useState<FiltrosMapa>(FILTROS_MAPA_PADRAO);
  const [busca, setBusca] = useState('');
  const [selectedCity, setSelectedCity] = useState<CidadeDataset | null>(null);

  const { cidadesFiltradas, cidadesNoMapa, mapaLimitado, totalFiltradas } = useMemo(() => {
    const filtradas = filtrarCidadesMapa(TODAS_CIDADES, filtros, busca);
    const { exibidas, totalFiltradas: total, limitado } = limitarMarcadoresMapa(filtradas);
    return {
      cidadesFiltradas: filtradas,
      cidadesNoMapa: exibidas,
      mapaLimitado: limitado,
      totalFiltradas: total,
    };
  }, [filtros, busca]);

  useEffect(() => {
    if (!selectedCity && cidadesFiltradas.length > 0) {
      const recife = cidadesFiltradas.find((c) => c.nome === 'Recife');
      setSelectedCity(recife ?? cidadesFiltradas[0]);
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

  function focusCity(city: CidadeDataset) {
    setSelectedCity(city);
    mapRef.current?.animateToRegion(regionForCity(city), 450);
  }

  function setFiltro<K extends keyof FiltrosMapa>(key: K, value: FiltrosMapa[K]) {
    setFiltros((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'ambiente' && value !== 'Todas' && value !== 'Urbano') {
        next.capitais = false;
      }
      return next;
    });
  }

  function toggleFiltro(key: 'populoso' | 'comHotel' | 'capitais' | 'comUber') {
    setFiltros((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === 'comUber' && next.comUber) {
        next.capitais = false;
      }
      return next;
    });
  }

  function limparFiltros() {
    setFiltros(FILTROS_MAPA_PADRAO);
    setBusca('');
  }

  function handleDetailsPress() {
    if (!selectedCity) return;
    addRecentCidade(toCidadeLegacy(selectedCity));
    router.push({ pathname: '/detalhes-cidade', params: { id: selectedCity.id } });
  }

  return (
    <MainTabLayout activeTab="mapa">
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={[styles.topBar, { paddingTop: r.scaleY(8) }]}>
          <Text style={[styles.mapHeaderTitle, { fontSize: r.font(16) }]}>Explorar Mapa</Text>
          <View style={styles.searchBar}>
            <TextInput
              style={[styles.searchInput, { fontSize: r.font(14) }]}
              placeholder="Buscar cidade ou estado..."
              placeholderTextColor={Colors.textGray}
              value={busca}
              onChangeText={setBusca}
            />
            <TouchableOpacity
              style={styles.locationBtn}
              onPress={() => selectedCity && focusCity(selectedCity)}
              disabled={!selectedCity}
            >
              <MaterialIcons name="my-location" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {AMBIENTE_FILTROS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, filtros.ambiente === f && styles.filterChipActive]}
                onPress={() => setFiltro('ambiente', f)}
              >
                <Text style={[styles.filterText, filtros.ambiente === f && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {INFRA_FILTROS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, filtros.infraestrutura === f && styles.filterChipActive]}
                onPress={() => setFiltro('infraestrutura', f)}
              >
                <MaterialIcons name="star" size={14} color={filtros.infraestrutura === f ? Colors.primary : Colors.textGray} />
                <Text style={[styles.filterText, filtros.infraestrutura === f && styles.filterTextActive]}>
                  {f === 'Todas' ? 'Infra: Todas' : `Infra: ${f}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {TOGGLE_FILTROS.map(({ key, label, icon }) => {
              const active = filtros[key];
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => toggleFiltro(key)}
                >
                  <MaterialIcons name={icon} size={14} color={active ? Colors.primary : Colors.textGray} />
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

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
            cidades={cidadesNoMapa}
            selectedCityId={selectedCity?.id}
            initialRegion={INITIAL_REGION}
            onSelectCity={focusCity}
          />

          <TouchableOpacity style={styles.filterFab} onPress={limparFiltros}>
            <MaterialIcons name="filter-list-off" size={22} color={Colors.textGray} />
          </TouchableOpacity>
        </View>

        {selectedCity ? (
          <View style={[styles.cityCard, { paddingBottom: insets.bottom + 12 }]}>
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
          <View style={[styles.cityCard, styles.cityCardEmpty, { paddingBottom: insets.bottom + 12 }]}>
            <Text style={styles.emptyText}>Nenhuma cidade encontrada com os filtros atuais.</Text>
          </View>
        )}
      </SafeAreaView>
    </MainTabLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F0F0' },
  mapHeaderTitle: { color: Colors.textDark, fontWeight: '700', marginBottom: 10 },
  topBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 8,
  },
  searchInput: { flex: 1, color: Colors.textDark },
  locationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScroll: { marginBottom: 6, maxHeight: 40 },
  filters: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  filterChipActive: { borderColor: Colors.primary, backgroundColor: 'rgba(121,116,231,0.08)' },
  filterText: { color: Colors.textGray, fontSize: 13 },
  filterTextActive: { color: Colors.primary, fontWeight: '600' },
  limitHint: { color: Colors.textGray, fontSize: 11, marginTop: 2, marginBottom: 4 },
  mapArea: { flex: 1, backgroundColor: '#DDE5EE', position: 'relative' },
  filterFab: {
    position: 'absolute',
    right: 16,
    bottom: 22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  cityCard: {
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  cityCardEmpty: { justifyContent: 'center', paddingVertical: 20 },
  emptyText: { color: '#FFFFFF', textAlign: 'center', flex: 1 },
  cityCardImg: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cityCardBody: { flex: 1 },
  cityCardTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' },
  cityCardNome: { color: '#FFFFFF', fontWeight: '700' },
  cityCardEstado: { color: 'rgba(255,255,255,0.75)' },
  cityCardPop: { color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  cityCardTags: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  tagChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagChipText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  playBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
});
