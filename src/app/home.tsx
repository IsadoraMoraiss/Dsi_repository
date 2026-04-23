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
            />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBlockWrapper: {
    padding: 16,
  },
  searchBlock: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 10,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    color: Colors.textWhite,
    padding: 10,
  },
});
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '../constants/colors';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Autenticacao concluida com sucesso.</Text>

      <Link href="/login" style={styles.link}>
        Sair
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.background,
  },
  title: {
    color: Colors.textWhite,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    color: Colors.textWhite,
    opacity: 0.85,
    marginBottom: 24,
    fontSize: 14,
  },
  link: {
    color: Colors.textWhite,
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});
