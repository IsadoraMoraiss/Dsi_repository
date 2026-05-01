import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Radius, Shadow } from '../../constants/Tokens';
import { Cidade } from '../../data/mockCidades';
import { useResponsive } from '../../utils/responsive';
import BottomNav from './BottomNav';
import HomeSearchHeader from './HomeSearchHeader';
import HomeSection from './HomeSection';

type HomeScreenContentProps = {
  busca: string;
  resultadoBusca: Cidade[] | null;
  recomendadas: Cidade[];
  ultimas: Cidade[];
  navAtivo: 'explorar' | 'roteiro' | 'mapa' | 'perfil';
  onChangeBusca: (value: string) => void;
  onSubmitBusca: () => void;
  onChangeNav: (key: 'explorar' | 'roteiro' | 'mapa' | 'perfil') => void;
};

export default function HomeScreenContent({
  busca,
  resultadoBusca,
  recomendadas,
  ultimas,
  navAtivo,
  onChangeBusca,
  onSubmitBusca,
  onChangeNav,
}: HomeScreenContentProps) {
  const insets = useSafeAreaInsets();
  const r = useResponsive();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <HomeSearchHeader busca={busca} onChangeBusca={onChangeBusca} onSubmitBusca={onSubmitBusca} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: r.scaleY(20), paddingBottom: insets.bottom + r.scaleY(72) + r.scaleY(20) },
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
        ) : null}

        <View style={styles.categoryWrapper}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              {
                minWidth: r.scaleX(80),
                paddingHorizontal: r.scaleX(16),
                paddingVertical: r.scaleY(8),
              },
            ]}
            activeOpacity={0.8}
            onPress={() => null}
          >
            <Text style={[styles.categoryText, { fontSize: r.font(13) }]}>Categorias</Text>
          </TouchableOpacity>
        </View>

        <HomeSection
          title="Cidades recomendadas"
          data={recomendadas}
          emptyText="Nenhuma cidade nesta categoria."
        />

        <HomeSection title="Últimas visualizações" data={ultimas} />
      </ScrollView>

      <BottomNav activeKey={navAtivo} onChange={onChangeNav} bottomInset={insets.bottom} />
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
  content: {
  },
  categoryWrapper: {
    marginBottom: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    ...Shadow.subtle,
  },
  categoryText: {
    color: Colors.textDark,
    fontWeight: '600',
  },
});
