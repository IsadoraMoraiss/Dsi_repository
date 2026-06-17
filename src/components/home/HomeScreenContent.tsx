import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Radius, Shadow } from '../../constants/Tokens';
import { categorias, Cidade } from '../../data/mockCidades';
import { useResponsive } from '../../utils/responsive';
import HomeSearchHeader from './HomeSearchHeader';
import HomeSection from './HomeSection';
import { useRouter } from 'expo-router';

type HomeScreenContentProps = {
  busca: string;
  resultadoBusca: Cidade[] | null;
  carregandoBusca?: boolean;
  recomendadas: Cidade[];
  ultimas: Cidade[];
  categoriaSelecionada?: string;
  onSelectCategoria?: (cat: string) => void;
  onChangeBusca: (value: string) => void;
  onSubmitBusca: () => void;
};

export default function HomeScreenContent({
  busca,
  resultadoBusca,
  carregandoBusca = false,
  recomendadas,
  ultimas,
  categoriaSelecionada = 'Todas',
  onSelectCategoria,
  onChangeBusca,
  onSubmitBusca,
}: HomeScreenContentProps) {
  const insets = useSafeAreaInsets();
  const r = useResponsive();
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <HomeSearchHeader busca={busca} onChangeBusca={onChangeBusca} onSubmitBusca={onSubmitBusca} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: r.scaleY(20), paddingBottom: insets.bottom + r.scaleY(96) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {resultadoBusca !== null ? (
          <HomeSection
            title={`Resultados (${resultadoBusca.length})`}
            data={resultadoBusca}
            emptyText="Nenhuma cidade encontrada."
          />
        ) : carregandoBusca ? (
          <HomeSection title="Buscando..." data={[]} emptyText="Filtrando cidades..." />
        ) : null}

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoryScroll}
        >
          {categorias.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                categoriaSelecionada === cat && styles.categoryButtonActive,
                {
                  paddingHorizontal: r.scaleX(16),
                  paddingVertical: r.scaleY(8),
                },
              ]}
              activeOpacity={0.8}
              onPress={() => onSelectCategoria?.(cat)}
            >
              <Text 
                style={[
                  styles.categoryText, 
                  categoriaSelecionada === cat && styles.categoryTextActive,
                  { fontSize: r.font(13) }
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <HomeSection
          title="Cidades recomendadas"
          data={recomendadas}
          emptyText="Nenhuma cidade nesta categoria."
        />

        <HomeSection
          title="Últimas visualizações"
          data={ultimas}
          emptyText="Nenhuma cidade visualizada ainda."
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {},
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.subtle,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    color: Colors.textDark,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
});
