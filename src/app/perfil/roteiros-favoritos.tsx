import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Roteiro } from '../../data/mockRoteiros';
import { useAuth } from '../../context/AuthContext';
import { listarRoteirosUsuario, UserRoteiro } from '../../services/roteiros';
import { useResponsive } from '../../utils/responsive';

function FavoritoCard({
  roteiro,
  onVerDetalhes,
}: {
  roteiro: UserRoteiro | Roteiro;
  onVerDetalhes: (roteiro: UserRoteiro | Roteiro) => void;
}) {
  const r = useResponsive();
  const cidadesStr = (roteiro.cidades ?? []).join(' → ');
  return (
    <View style={[styles.favCard, { backgroundColor: (roteiro as any).cor ?? '#444' }]}>
      <View style={styles.favHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.favNome, { fontSize: r.font(20) }]}>{roteiro.nome}</Text>
          <View style={styles.favCidadesRow}>
            <MaterialIcons name="place" size={13} color="rgba(255,255,255,0.8)" />
            <Text style={[styles.favCidades, { fontSize: r.font(13) }]}>{cidadesStr}</Text>
          </View>
        </View>
        <MaterialIcons name={(roteiro as any).favoritado ? 'bookmark' : 'bookmark-border'} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.favFooter}>
        <Text style={[styles.favKm, { fontSize: r.font(18) }]}>{(roteiro as any).distanciaKm ?? 0} Km</Text>
        <TouchableOpacity
          style={styles.verDetalhesBtn}
          onPress={() => onVerDetalhes(roteiro)}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel={`Ver detalhes de ${roteiro.nome}`}
        >
          <Text style={[styles.verDetalhesText, { fontSize: r.font(12) }]}>Ver detalhes ▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RoteirosFavoritosScreen() {
  const router = useRouter();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const [busca, setBusca] = useState('');
  const { user } = useAuth();
  const [roteiros, setRoteiros] = useState<UserRoteiro[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [filtro, setFiltro] = useState<'publicos' | 'privados' | 'salvos'>('publicos');

  function handleVerDetalhes(roteiro: UserRoteiro | Roteiro) {
    router.push({ pathname: '/roteiro-detalhes', params: { id: roteiro.id, origem: 'usuario' } });
  }

  React.useEffect(() => {
    let ativo = true;
    async function carregar() {
      if (!user) { if (ativo) setRoteiros([]); return; }
      setCarregando(true);
      try {
        const lista = await listarRoteirosUsuario(user.uid, require('../../data/cidades.json'));
        if (ativo) setRoteiros(lista);
      } catch (error) {
        console.error('[meus-roteiros] erro ao carregar:', error);
        if (ativo) setRoteiros([]);
      } finally { if (ativo) setCarregando(false); }
    }
    carregar();
    return () => { ativo = false; };
  }, [user?.uid]);

  const filtrados = (busca.trim()
    ? roteiros.filter((rt) => rt.nome.toLowerCase().includes(busca.toLowerCase()))
    : roteiros
  ).filter((rt) => {
    const ehSalvo = Boolean(rt.sourceRoteiroId || rt.origemComunidade);
    if (filtro === 'publicos') return rt.privado === false && !ehSalvo;
    if (filtro === 'privados') return rt.privado === true && !ehSalvo;
    // salvos: roteiros criados pelo sistema/externos salvos como cópia na conta do usuário
    return ehSalvo;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: r.scaleY(8) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: r.font(20) }]}>Roteiros Favoritos</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <TextInput
          style={[styles.searchInput, { fontSize: r.font(14) }]}
          placeholder="Nome do Roteiro"
          placeholderTextColor={Colors.textGray}
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.meusRoteirosBanner}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { fontSize: r.font(20) }]}>Meus Roteiros</Text>
            <Text style={[styles.bannerSub, { fontSize: r.font(14) }]}>Seus roteiros públicos e privados</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <TouchableOpacity onPress={() => setFiltro('publicos')} style={[styles.filterBtn, filtro === 'publicos' && styles.filterBtnActive]}>
            <Text style={styles.filterText}>Públicos</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFiltro('privados')} style={[styles.filterBtn, filtro === 'privados' && styles.filterBtnActive]}>
            <Text style={styles.filterText}>Privados</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFiltro('salvos')} style={[styles.filterBtn, filtro === 'salvos' && styles.filterBtnActive]}>
            <Text style={styles.filterText}>Salvos</Text>
          </TouchableOpacity>
        </View>

        {carregando ? (
          <Text style={[styles.emptyText, { fontSize: r.font(14) }]}>Carregando...</Text>
        ) : filtrados.length > 0 ? (
          filtrados.map((rt) => (
            <FavoritoCard key={rt.id} roteiro={rt} onVerDetalhes={handleVerDetalhes} />
          ))
        ) : (
          <Text style={[styles.emptyText, { fontSize: r.font(14) }]}>Nenhum roteiro encontrado.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: { marginRight: 12 },
  headerTitle: { color: Colors.textWhite, fontWeight: '700' },
  searchWrapper: { paddingHorizontal: 20, marginBottom: 16 },
  searchInput: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.textDark,
  },
  content: { paddingHorizontal: 20 },
  meusRoteirosBanner: {
    backgroundColor: '#2D2B6B',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  bannerTitle: { color: Colors.textWhite, fontWeight: '700', marginBottom: 6 },
  bannerSub: { color: Colors.textWhite, opacity: 0.7 },
  bannerLink: { color: 'rgba(255,255,255,0.6)' },
  favCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  favHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  favNome: { color: '#FFFFFF', fontWeight: '700', marginBottom: 4 },
  favCidadesRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  favCidades: { color: 'rgba(255,255,255,0.85)', flexShrink: 1 },
  favFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  favKm: { color: '#FFFFFF', fontWeight: '700' },
  verDetalhesBtn: {},
  verDetalhesText: { color: 'rgba(255,255,255,0.8)' },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  filterBtnActive: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  filterText: { color: Colors.textWhite, fontWeight: '700' },
  emptyText: { color: Colors.textGray, marginBottom: 8 },
});
