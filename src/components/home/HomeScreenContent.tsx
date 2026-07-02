import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Radius, Shadow } from '../../constants/Tokens';
import { categorias, Cidade } from '../../data/mockCidades';
import { Roteiro } from '../../data/mockRoteiros';
import { useResponsive } from '../../utils/responsive';
import HomeSearchHeader from './HomeSearchHeader';
import HomeSection from './HomeSection';

type HomeScreenContentProps = {
  busca: string;
  resultadoBusca: Cidade[] | null;
  resultadoRoteiros?: Roteiro[] | null;
  carregandoBusca?: boolean;
  recomendadas: Cidade[];
  ultimas: Cidade[];
  categoriaSelecionada?: string;
  onSelectCategoria?: (cat: string) => void;
  onChangeBusca: (value: string) => void;
  onSubmitBusca: () => void;
};

function RoteiroSearchSection({ roteiros }: { roteiros: Roteiro[] }) {
  const r = useResponsive();
  const router = useRouter();

  if (roteiros.length === 0) {
    return (
      <View style={[styles.section, { marginBottom: r.scaleY(24) }]}>
        <Text
          style={[
            styles.title,
            { fontSize: r.font(18), marginBottom: r.scaleY(12), paddingHorizontal: r.scaleX(16) },
          ]}
        >
          Roteiros relacionados
        </Text>
        <Text style={[styles.empty, { fontSize: r.font(14), paddingHorizontal: r.scaleX(16) }]}>
          Nenhum roteiro relacionado a esta busca.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.section, { marginBottom: r.scaleY(24) }]}>
      <Text
        style={[
          styles.title,
          { fontSize: r.font(18), marginBottom: r.scaleY(12), paddingHorizontal: r.scaleX(16) },
        ]}
      >
        Roteiros relacionados ({roteiros.length})
      </Text>
      <View style={styles.roteirosList}>
        {roteiros.map((roteiro) => (
          <TouchableOpacity
            key={roteiro.id}
            style={styles.roteiroRow}
            activeOpacity={0.86}
            onPress={() =>
              router.push({
                pathname: '/roteiro-detalhes',
                params: { id: roteiro.id, origem: 'recomendado' },
              })
            }
          >
            <View style={styles.roteiroRowBody}>
              <Text style={[styles.roteiroNome, { fontSize: r.font(15) }]} numberOfLines={1}>
                {roteiro.nome}
              </Text>
              <Text style={[styles.roteiroMeta, { fontSize: r.font(12) }]} numberOfLines={1}>
                {roteiro.cidades.join(' • ')}
              </Text>
            </View>
            <View style={styles.roteiroBadges}>
              <Text style={[styles.roteiroBadge, { fontSize: r.font(11) }]}>{roteiro.duracao}</Text>
              <Text style={[styles.roteiroBadge, { fontSize: r.font(11) }]}>{roteiro.tipo}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function HomeScreenContent({
  busca,
  resultadoBusca,
  resultadoRoteiros = null,
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
  const buscaAtiva = resultadoBusca !== null || resultadoRoteiros !== null || carregandoBusca;
  const totalResultadosBusca = (resultadoBusca?.length ?? 0) + (resultadoRoteiros?.length ?? 0);

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
        {carregandoBusca ? (
          <HomeSection title="Buscando..." data={[]} emptyText="Refinando cidades e roteiros..." />
        ) : buscaAtiva ? (
          <>
            {totalResultadosBusca === 0 ? (
              <Text
                style={[
                  styles.empty,
                  { fontSize: r.font(14), paddingHorizontal: r.scaleX(16), marginBottom: r.scaleY(24) },
                ]}
              >
                Nenhum resultado encontrado para a busca informada.
              </Text>
            ) : (
              <>
                <HomeSection
                  title={`Cidades encontradas (${resultadoBusca?.length ?? 0})`}
                  data={resultadoBusca ?? []}
                  emptyText="Nenhuma cidade encontrada."
                />
                <RoteiroSearchSection roteiros={resultadoRoteiros ?? []} />
              </>
            )}
          </>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categorias.map((cat) => (
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
                  { fontSize: r.font(13) },
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
          actionLabel="Ver todas"
          onPressAction={() =>
            router.push({
              pathname: '/cidades-recomendadas' as never,
              params: { categoria: categoriaSelecionada },
            })
          }

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
  section: {},
  title: {
    color: Colors.textWhite,
    fontWeight: '600',
  },
  empty: {
    color: Colors.textGray,
  },
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
  roteirosList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  roteiroRow: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadow.subtle,
  },
  roteiroRowBody: {
    flex: 1,
  },
  roteiroNome: {
    color: Colors.textDark,
    fontWeight: '700',
    marginBottom: 4,
  },
  roteiroMeta: {
    color: Colors.textGray,
  },
  roteiroBadges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  roteiroBadge: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
