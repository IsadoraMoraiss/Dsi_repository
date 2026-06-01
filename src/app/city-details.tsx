import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryChip } from '../components/home/CategoryChip';
import { CityHeader } from '../components/home/CityHeader';
import { HotelCard } from '../components/home/HotelCard';
import { InfoCard } from '../components/home/InfoCard';
import { MapPreview } from '../components/home/MapPreview';
import { PlaceCard } from '../components/home/PlaceCard';
import { RestaurantCard } from '../components/home/RestaurantCard';
import { FloatingButton } from '../components/ui/FloatingButton';
import {
  CITY_DETAILS_BOTTOM_SPACE,
  CITY_DETAILS_HORIZONTAL_PADDING,
} from '../constants/cityDetails';
import { getCityDetailsById } from '../data/cityDetails';
import { cityDetailsTheme as theme } from '../theme/cityDetailsTheme';
import type {
  CityCategory,
  Hotel,
  QuickInfo,
  RecommendedPlace,
  Restaurant,
} from '../types/city';
import { Colors } from '../constants/Colors';

type CityDetailsParams = {
  cityId?: string;
};

const EmptyState = ({ label }: { label: string }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyText}>{label}</Text>
  </View>
);

const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

export default function CityDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cityId } = useLocalSearchParams<CityDetailsParams>();
  const [isFavorite, setIsFavorite] = useState(false);

  const city = useMemo(() => getCityDetailsById(cityId), [cityId]);

  const locationLabel = useMemo(() => {
    if (!city) return 'Brasil';
    return [city.state, city.region].filter(Boolean).join(' • ');
  }, [city]);

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  }, [router]);

  const handleFavoritePress = useCallback(() => {
    setIsFavorite((current) => !current);
  }, []);

  const handleBuildRoutePress = useCallback(() => {
    console.log('Montar roteiro');
  }, []);

  const handleReservePress = useCallback((hotelId: string) => {
    console.log('Reservar hotel:', hotelId);
  }, []);

  const renderInfoCard: ListRenderItem<QuickInfo> = useCallback(
    ({ item }) => <InfoCard icon={item.icon} label={item.label} value={item.value} />,
    [],
  );

  const renderCategory: ListRenderItem<CityCategory> = useCallback(
    ({ item }) => <CategoryChip label={item} />,
    [],
  );

  const renderPlace: ListRenderItem<RecommendedPlace> = useCallback(
    ({ item }) => <PlaceCard place={item} />,
    [],
  );

  const renderRestaurant: ListRenderItem<Restaurant> = useCallback(
    ({ item }) => <RestaurantCard restaurant={item} />,
    [],
  );

  const renderHotel: ListRenderItem<Hotel> = useCallback(
    ({ item }) => <HotelCard hotel={item} onReservePress={handleReservePress} />,
    [handleReservePress],
  );

  if (!city) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>Cidade não encontrada</Text>
          <Text style={styles.notFoundText}>
            Não foi possível carregar os detalhes desta cidade no momento.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: CITY_DETAILS_BOTTOM_SPACE + insets.bottom },
        ]}
      >
        <CityHeader
          imageUrl={city.heroImageUrl}
          cityName={city.name}
          locationLabel={locationLabel}
          rating={city.rating}
          isFavorite={isFavorite}
          onBackPress={handleBackPress}
          onFavoritePress={handleFavoritePress}
        />

        <View style={styles.content}>
          <FlatList
            horizontal
            data={city.quickInfo}
            keyExtractor={(item) => item.id}
            renderItem={renderInfoCard}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.horizontalGap} />}
            contentContainerStyle={styles.horizontalList}
            ListEmptyComponent={<EmptyState label="Informações indisponíveis." />}
          />

          <View style={styles.section}>
            <SectionHeader title="Sobre a cidade" />
            <Text style={styles.description}>{city.description || 'Descrição indisponível.'}</Text>
          </View>

          <View style={styles.section}>
            <SectionHeader title="Categorias" />
            <FlatList
              horizontal
              data={city.categories}
              keyExtractor={(item) => item}
              renderItem={renderCategory}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.chipGap} />}
              contentContainerStyle={styles.horizontalList}
              ListEmptyComponent={<EmptyState label="Nenhuma categoria disponível." />}
            />
          </View>

          <View style={styles.section}>
            <SectionHeader title="Lugares recomendados" />
            <FlatList
              horizontal
              data={city.recommendedPlaces}
              keyExtractor={(item) => item.id}
              renderItem={renderPlace}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.horizontalGap} />}
              contentContainerStyle={styles.horizontalList}
              ListEmptyComponent={<EmptyState label="Nenhum lugar recomendado." />}
            />
          </View>

          <View style={styles.section}>
            <SectionHeader title="Restaurantes populares" />
            <FlatList
              horizontal
              data={city.restaurants}
              keyExtractor={(item) => item.id}
              renderItem={renderRestaurant}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.horizontalGap} />}
              contentContainerStyle={styles.horizontalList}
              ListEmptyComponent={<EmptyState label="Nenhum restaurante disponível." />}
            />
          </View>

          <View style={styles.section}>
            <SectionHeader title="Hotéis recomendados" />
            <FlatList
              horizontal
              data={city.hotels}
              keyExtractor={(item) => item.id}
              renderItem={renderHotel}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.horizontalGap} />}
              contentContainerStyle={styles.horizontalList}
              ListEmptyComponent={<EmptyState label="Nenhum hotel disponível." />}
            />
          </View>

          <View style={styles.section}>
            <SectionHeader title="Mapa e localização" />
            <MapPreview label={city.mapLabel} />
          </View>
        </View>
      </ScrollView>

      <SafeAreaView pointerEvents="box-none" style={styles.floatingArea}>
        <FloatingButton
          label="Montar roteiro"
          onPress={handleBuildRoutePress}
          style={styles.floatingButton}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    backgroundColor: theme.colors.background,
  },
  content: {
    marginTop: -24,
    paddingTop: 26,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    backgroundColor: theme.colors.background,
  },
  horizontalList: {
    paddingHorizontal: CITY_DETAILS_HORIZONTAL_PADDING,
  },
  horizontalGap: {
    width: 14,
  },
  chipGap: {
    width: 10,
  },
  section: {
    marginTop: 28,
    paddingHorizontal: CITY_DETAILS_HORIZONTAL_PADDING,
  },
  sectionTitle: {
    marginBottom: 14,
    color: Colors.textWhite,
    fontSize: theme.typography.section,
    fontWeight: '900',
  },
  description: {
    color: Colors.textWhite,
    fontSize: theme.typography.body,
    lineHeight: 24,
    fontWeight: '500',
  },
  emptyState: {
    minWidth: 240,
    height: 72,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  floatingArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: CITY_DETAILS_HORIZONTAL_PADDING,
    paddingBottom: 14,
  },
  floatingButton: {
    width: '100%',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  notFoundTitle: {
    color: Colors.textWhite,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  notFoundText: {
    marginTop: 10,
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
