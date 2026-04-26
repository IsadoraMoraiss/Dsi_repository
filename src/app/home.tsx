import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import {
  Cidade,
  cidadesRecomendadas,
  ultimasVisualizadas,
} from '../data/mockCidades';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
// Proportional scale helper — maps prototype px to device px
const rs = (n: number) => Math.round((n / BASE_WIDTH) * SCREEN_WIDTH);

const CARD_WIDTH = rs(160);
const CARD_HEIGHT = rs(255);
const CARD_IMAGE_HEIGHT = rs(131);
const SEARCH_BLOCK_HEIGHT = rs(128);
const FOOTER_HEIGHT = rs(72);

const NAV_ITEMS = [
  { key: 'explorar', label: 'Explorar', icon: 'explore' as const },
  { key: 'roteiro', label: 'Roteiro', icon: 'directions' as const },
  { key: 'mapa', label: 'Mapa', icon: 'map' as const },
  { key: 'perfil', label: 'Perfil', icon: 'person' as const },
];

function CidadeCard({ cidade }: { cidade: Cidade }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: cidade.imagemUrl }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.cardNome} numberOfLines={1}>
          {cidade.nome}, {cidade.estado}
        </Text>
        <Text style={styles.cardRegiao} numberOfLines={1}>
          {cidade.regiao}
        </Text>
        <Text style={styles.cardDescricao} numberOfLines={2}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </Text>
        <Text style={styles.cardAvaliacao}>⭐ {cidade.avaliacao.toFixed(1)}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [busca, setBusca] = useState('');
  const [resultadoBusca, setResultadoBusca] = useState<Cidade[] | null>(null);
  const [navAtivo, setNavAtivo] = useState('explorar');

  function handleBusca() {
    const termo = busca.trim().toLowerCase();
    if (!termo) {
      setResultadoBusca(null);
      return;
    }
    const todas = [...cidadesRecomendadas, ...ultimasVisualizadas];
    setResultadoBusca(todas.filter((c) => c.nome.toLowerCase().includes(termo)));
  }

  const recomendadasFiltradas = cidadesRecomendadas;

  return (
    // edges={['top']} — SafeAreaView handles only the top inset; bottom is
    // handled manually in the footer so its white background fills the home
    // indicator area correctly instead of showing the purple background.
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {/* ── Search block ── */}
      <View style={styles.searchBlockWrapper}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.searchBlock}
          onPress={() => {}}
        >
          <View style={styles.searchInputRow}>
            <MaterialIcons name="search" size={rs(20)} color="rgba(255,255,255,0.8)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar cidade..."
              placeholderTextColor="rgba(255,255,255,0.55)"
              value={busca}
              onChangeText={(t) => {
                setBusca(t);
                if (!t.trim()) setResultadoBusca(null);
              }}
              onSubmitEditing={handleBusca}
              returnKeyType="search"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: FOOTER_HEIGHT + insets.bottom + rs(16) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {resultadoBusca !== null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Resultados ({resultadoBusca.length})
            </Text>
            {resultadoBusca.length === 0 ? (
              <Text style={styles.semResultado}>Nenhuma cidade encontrada.</Text>
            ) : (
              <FlatList
                horizontal
                data={resultadoBusca}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <CidadeCard cidade={item} />}
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={{ paddingRight: rs(16) }}
              />
            )}
          </View>
        )}

        {/* Categories button */}
        <View style={styles.categoriasWrapper}>
          <TouchableOpacity style={styles.categoriasButton} activeOpacity={0.8} onPress={() => {}}>
            <Text style={styles.categoriasButtonText}>Categorias</Text>
          </TouchableOpacity>
        </View>

        {/* Recommended cities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cidades recomendadas</Text>
          <FlatList
            horizontal
            data={recomendadasFiltradas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CidadeCard cidade={item} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: rs(16) }}
            ListEmptyComponent={
              <Text style={styles.semResultado}>
                Nenhuma cidade nesta categoria.
              </Text>
            }
          />
        </View>

        {/* Last viewed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimas visualizações</Text>
          <FlatList
            horizontal
            data={ultimasVisualizadas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CidadeCard cidade={item} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: rs(16) }}
          />
        </View>
      </ScrollView>

      {/* ── Footer ── */}
      <View
        style={[
          styles.footer,
          { height: FOOTER_HEIGHT + insets.bottom, paddingBottom: insets.bottom },
        ]}
      >
        {NAV_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.footerItem}
            onPress={() => setNavAtivo(item.key)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={item.icon}
              size={rs(24)}
              color={navAtivo === item.key ? Colors.primary : Colors.textGray}
            />
            <Text
              style={[
                styles.footerLabel,
                navAtivo === item.key && styles.footerLabelAtivo,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // Purple behind the status bar so the search block reads as one unified
    // header band from the top of the screen.
    backgroundColor: Colors.primary,
  },

  /* ── Search block ── */
  searchBlockWrapper: {
    backgroundColor: Colors.background,
  },
  searchBlock: {
    width: '100%',
    height: SEARCH_BLOCK_HEIGHT,
    backgroundColor: Colors.primary,
    paddingHorizontal: rs(20),
    justifyContent: 'flex-end',
    paddingBottom: rs(16),
    borderBottomLeftRadius: rs(24),
    borderBottomRightRadius: rs(24),
    overflow: 'hidden',
  },
  searchLabel: {
    color: Colors.textWhite,
    fontSize: rs(18),
    fontWeight: '700',
    marginBottom: rs(10),
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: rs(10),
    paddingHorizontal: rs(12),
    height: rs(42),
  },
  searchInput: {
    flex: 1,
    marginLeft: rs(8),
    color: Colors.textWhite,
    fontSize: rs(14),
    height: rs(42),
  },

  /* ── Scroll ── */
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingTop: rs(20),
  },

  /* ── Categories ── */
  categoriasWrapper: {
    marginBottom: rs(24),
    paddingHorizontal: rs(16),
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoriasButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(20),
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: rs(16),
    paddingVertical: rs(8),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: rs(80),
    alignSelf: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  categoriasButtonText: {
    color: Colors.textDark,
    fontSize: rs(13),
    fontWeight: '600',
  },

  /* ── Sections ── */
  section: {
    marginBottom: rs(28),
  },
  sectionTitle: {
    color: Colors.textWhite,
    fontSize: rs(18),
    fontWeight: '600',
    marginBottom: rs(12),
    paddingHorizontal: rs(16),
  },
  semResultado: {
    color: Colors.textGray,
    fontSize: rs(14),
    paddingHorizontal: rs(16),
  },

  /* ── Card ── */
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: Colors.inputBackground,
    borderRadius: rs(12),
    overflow: 'hidden',
    padding: rs(8),
    marginLeft: rs(16),
  },
  cardImage: {
    width: '100%',
    height: rs(118),
    borderRadius: rs(8),
  },
  cardBody: {
    flex: 1,
    padding: rs(10),
    justifyContent: 'space-between',
  },
  cardNome: {
    color: Colors.textDark,
    fontSize: rs(13),
    fontWeight: '600',
  },
  cardRegiao: {
    color: Colors.textGray,
    fontSize: rs(12),
  },
  cardDescricao: {
    color: Colors.textGray,
    fontSize: rs(12),
    marginTop: rs(2),
    marginBottom: rs(2),
  },
  cardAvaliacao: {
    color: Colors.textDark,
    fontSize: rs(13),
  },

  /* ── Footer ── */
  footer: {
    width: '100%',
    backgroundColor: Colors.inputBackground,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: rs(10),
    borderTopWidth: 1,
    borderTopColor: Colors.inputBorder,
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLabel: {
    fontSize: rs(11),
    color: Colors.textGray,
    marginTop: rs(3),
  },
  footerLabelAtivo: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
