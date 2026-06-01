import { MaterialIcons } from '@expo/vector-icons';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
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

const CidadesMapView = forwardRef<CidadesMapViewHandle, CidadesMapViewProps>(function CidadesMapView(
  { cidades, selectedCityId, initialRegion, onSelectCity },
  ref,
) {
  const mapRef = useRef<MapView | null>(null);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region, duration = 450) => {
      mapRef.current?.animateToRegion(region, duration);
    },
  }));

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialRegion={initialRegion}
      showsCompass
      showsScale
      toolbarEnabled={false}
    >
      {cidades.map((cidade) => {
        const active = selectedCityId === cidade.id;
        return (
          <Marker
            key={cidade.id}
            coordinate={{ latitude: cidade.latitude, longitude: cidade.longitude }}
            title={`${cidade.nome}, ${cidade.estado}`}
            description={gerarTagsCidade(cidade).join(' · ')}
            onPress={() => onSelectCity(cidade)}
          >
            <View style={[styles.marker, active && styles.markerActive]}>
              <MaterialIcons name="place" size={active ? 30 : 24} color="#FFFFFF" />
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
});

export default CidadesMapView;

const styles = StyleSheet.create({
  marker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  markerActive: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
  },
});
