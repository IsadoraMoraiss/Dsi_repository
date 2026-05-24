import { MaterialIcons } from '@expo/vector-icons';
import React, { forwardRef, useImperativeHandle } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import type { CidadeDataset } from '../../types/cidadeDataset';
import { gerarTagsCidade } from '../../utils/cidadeDataset';

export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type CidadesMapViewHandle = {
  animateToRegion: (region: MapRegion, duration?: number) => void;
};

type CidadesMapViewProps = {
  cidades: CidadeDataset[];
  selectedCityId?: string;
  initialRegion: MapRegion;
  onSelectCity: (city: CidadeDataset) => void;
};

const CidadesMapView = forwardRef<CidadesMapViewHandle, CidadesMapViewProps>(function CidadesMapViewWeb(
  { cidades, selectedCityId, onSelectCity },
  ref,
) {
  useImperativeHandle(ref, () => ({
    animateToRegion: () => {},
  }));

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <MaterialIcons name="map" size={28} color={Colors.primary} />
        <Text style={styles.bannerTitle}>Mapa interativo no celular</Text>
        <Text style={styles.bannerText}>
          No navegador, selecione uma cidade na lista abaixo. Use o Expo Go no celular para ver o mapa completo.
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {cidades.map((cidade) => {
          const active = selectedCityId === cidade.id;
          return (
            <TouchableOpacity
              key={cidade.id}
              style={[styles.cityRow, active && styles.cityRowActive]}
              onPress={() => onSelectCity(cidade)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="place" size={20} color={active ? Colors.primary : Colors.textGray} />
              <View style={styles.cityInfo}>
                <Text style={[styles.cityName, active && styles.cityNameActive]}>
                  {cidade.nome}, {cidade.estado}
                </Text>
                <Text style={styles.cityTags}>{gerarTagsCidade(cidade).slice(0, 3).join(' · ')}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

export default CidadesMapView;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF2F7' },
  banner: {
    backgroundColor: '#FFFFFF',
    margin: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  bannerTitle: { color: Colors.textDark, fontWeight: '700', fontSize: 15 },
  bannerText: { color: Colors.textGray, fontSize: 13, lineHeight: 18 },
  list: { paddingHorizontal: 12, paddingBottom: 16, gap: 8 },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cityRowActive: { borderColor: Colors.primary, backgroundColor: 'rgba(121,116,231,0.06)' },
  cityInfo: { flex: 1 },
  cityName: { color: Colors.textDark, fontWeight: '600', fontSize: 14 },
  cityNameActive: { color: Colors.primary },
  cityTags: { color: Colors.textGray, fontSize: 12, marginTop: 2 },
});
