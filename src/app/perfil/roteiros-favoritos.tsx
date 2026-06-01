import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { Cidade } from '../../data/mockCidades';
import { listarRoteirosUsuario, UserRoteiro } from '../../services/roteiros';
import {
  corDoRoteiro,
  distanciaExibidaRoteiro,
  ehRoteiroCriadoPeloUsuario,
  resolverCidadesDoRoteiro,
} from '../../utils/roteiroUtils';
import { useResponsive } from '../../utils/responsive';

const todasCidadesJson = require('../../data/cidades.json') as Cidade[];

type AbaMeusRoteiros = 'favoritos' | 'publicos' | 'privados';

function FavoritoCard({ roteiro, onPress }: { roteiro: UserRoteiro; onPress: () => void }) {
  const r = useResponsive();
  const cidadesStr = roteiro.cidades.join(' → ');
  const cor = corDoRoteiro(roteiro);
  const { detalhadas } = resolverCidadesDoRoteiro(roteiro, todasCidadesJson);
  const km = distanciaExibidaRoteiro(roteiro, detalhadas);

  return (
    <TouchableOpacity style={[styles.favCard, { backgroundColor: cor }]} activeOpacity={0.86} onPress={onPress}>
      <View style={styles.favHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.favNome, { fontSize: r.font(20) }]}>{roteiro.nome}</Text>
          <View style={styles.favCidadesRow}>
            <MaterialIcons name="place" size={13} color="rgba(255,255,255,0.8)" />
            <Text style={[styles.favCidades, { fontSize: r.font(13) }]} numberOfLines={2}>
              {cidadesStr}
            </Text>
          </View>
        </View>
        <MaterialIcons
          name={roteiro.favoritado ? 'bookmark' : 'bookmark-border'}
          size={24}
          color="#FFFFFF"
        />
      </View>
      <View style={styles.favFooter}>
        <Text style={[styles.favKm, { fontSize: r.font(18) }]}>{km} Km</Text>
        <Text style={[styles.verDetalhesText, { fontSize: r.font(12) }]}>Ver detalhes ▶</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function RoteirosFavoritosScreen() {
  const router = useRouter();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<AbaMeusRoteiros>('favoritos');
  const [meusRoteiros, setMeusRoteiros] = useState<UserRoteiro[]>([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (!user) {
        setMeusRoteiros([]);
        return;
      }

      setCarregando(true);
      try {
        const roteiros = await listarRoteirosUsuario(user.uid, todasCidadesJson);
        if (ativo) setMeusRoteiros(roteiros);
      } catch (error) {
        console.error('[meus-roteiros]', error);
        if (ativo) setMeusRoteiros([]);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [user]);

  const favoritos = useMemo(
    () => meusRoteiros.filter((r) => r.favoritado === true),
    [meusRoteiros],
  );
  const publicos = useMemo(
    () => meusRoteiros.filter((r) => r.privado === false),
    [meusRoteiros],
  );
  const privados = useMemo(
    () => meusRoteiros.filter((r) => r.privado === true && ehRoteiroCriadoPeloUsuario(r)),
    [meusRoteiros],
  );

  const listaAba =
    abaAtiva === 'favoritos' ? favoritos : abaAtiva === 'publicos' ? publicos : privados;

  const filtrados = busca.trim()
    ? listaAba.filter((rt) => rt.nome.toLowerCase().includes(busca.toLowerCase()))
    : listaAba;

  const emptyMessages: Record<AbaMeusRoteiros, string> = {
    favoritos: 'Você ainda não favoritou nenhum roteiro.',
    publicos: 'Você não tem roteiros públicos.',
    privados: 'Você não tem roteiros privados.',
  };

  const abas: { id: AbaMeusRoteiros; label: string }[] = [
    { id: 'favoritos', label: 'Favoritos' },
    { id: 'publicos', label: 'Roteiros Públicos' },
    { id: 'privados', label: 'Roteiros Privados' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, { paddingTop: r.scaleY(8) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: r.font(20) }]}>Meus Roteiros</Text>
      </View>

      <View style={styles.tabsRow}>
        {abas.map((aba) => {
          const active = abaAtiva === aba.id;
          return (
            <TouchableOpacity
              key={aba.id}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
              onPress={() => setAbaAtiva(aba.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{aba.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

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
        {carregando ? (
          <Text style={[styles.emptyText, { fontSize: r.font(14) }]}>Carregando roteiros...</Text>
        ) : filtrados.length > 0 ? (
          filtrados.map((rt) => (
            <FavoritoCard
              key={rt.id}
              roteiro={rt}
              onPress={() =>
                router.push({ pathname: '/roteiro-detalhes', params: { id: rt.id, origem: 'usuario' } })
              }
            />
          ))
        ) : (
          <Text style={[styles.emptyText, { fontSize: r.font(14) }]}>{emptyMessages[abaAtiva]}</Text>
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
    paddingBottom: 12,
  },
  backBtn: { marginRight: 12 },
  headerTitle: { color: Colors.textWhite, fontWeight: '700' },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    color: Colors.textGray,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  searchWrapper: { paddingHorizontal: 20, marginBottom: 16 },
  searchInput: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.textDark,
  },
  content: { paddingHorizontal: 20 },
  emptyText: { color: Colors.textGray, textAlign: 'center', marginTop: 8 },
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
  verDetalhesText: { color: 'rgba(255,255,255,0.8)' },
});
