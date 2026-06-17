/**
 * Roteiros.tsx
 *
 * Tela principal de roteiros utilizada pela navegação de tabs web/native.
 */

import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import SearchBar from '../components/ui/SearchBar';
import MainTabLayout from '../components/layout/MainTabLayout';
import { roteirosRecomendados, Roteiro } from '../data/mockRoteiros';
import { useAuth } from '../context/AuthContext';
import { rankRoteirosByPreferences, UserPreferences } from '../utils/preferences';
import { useResponsive } from '../utils/responsive';
import {
  buscarCopiaSalvaUsuario,
  buscarUltimosRoteiroVistos,
  isProvavelIdFirestore,
  listarRoteirosEmAlta,
  registrarVisualizacaoRoteiro,
  toggleFavoritarRoteiro,
  UserRoteiro,
} from '../services/roteiros';
import { imagemExibicaoRoteiro } from '../utils/roteiroImagem';
import {
  corDoRoteiro,
  distanciaExibidaRoteiro,
  ehRoteiroDaComunidade,
  resolverCidadesDoRoteiro,
} from '../utils/roteiroUtils';
import { Cidade } from '../data/mockCidades';

const todasCidadesJson = require('../data/cidades.json') as Cidade[];

function RoteiroCard({
  roteiro,
  onNavigate,
  onFavoritoChange,
}: {
  roteiro: Roteiro;
  origem: 'usuario' | 'recomendado';
  onNavigate: (roteiro: Roteiro) => void;
  onFavoritoChange?: (roteiroId: string, favoritado: boolean) => void;
}) {
  const r = useResponsive();
  const { user } = useAuth();
  const [favoritado, setFavoritado] = useState(false);
  const [salvandoFavorito, setSalvandoFavorito] = useState(false);
  const ehCatalogo = ehRoteiroDaComunidade(roteiro);
  const isOwn = 'uid' in roteiro && (roteiro as any).uid === user?.uid;
  const corCard = ehCatalogo ? Colors.inputBackground : corDoRoteiro(roteiro);
  const { detalhadas } = resolverCidadesDoRoteiro(roteiro, todasCidadesJson);
  const km = distanciaExibidaRoteiro(roteiro, detalhadas);

  useEffect(() => {
    let ativo = true;
    async function sincronizarFavorito() {
      if (!user) { if (ativo) setFavoritado(false); return; }
      try {
        const copia = await buscarCopiaSalvaUsuario(user.uid, roteiro);
        if (ativo) setFavoritado(Boolean(copia?.favoritado));
      } catch { if (ativo) setFavoritado(false); }
    }
    sincronizarFavorito();
    return () => { ativo = false; };
  }, [user?.uid, roteiro.nome, roteiro.cidades]);

  async function handleToggleFavorito() {
    if (salvandoFavorito) return;
    if (!user) {
      Alert.alert('Login necessário', 'Entre na sua conta para salvar roteiros.');
      return;
    }
    setSalvandoFavorito(true);
    try {
      const novo = await toggleFavoritarRoteiro(user.uid, roteiro);
      setFavoritado(novo);
      onFavoritoChange?.(roteiro.id, novo);
      Alert.alert(
        novo ? 'Salvo' : 'Removido',
        novo ? 'Roteiro adicionado aos seus favoritos.' : 'Roteiro removido dos seus favoritos.',
      );
    } catch (error) {
      console.error('[roteiros:favoritar]', error);
      Alert.alert('Erro', 'Não foi possível atualizar o roteiro.');
    } finally {
      setSalvandoFavorito(false);
    }
  }

  return (
    <TouchableOpacity
      style={[styles.roteiroCard, { backgroundColor: corCard }]}
      activeOpacity={0.86}
      onPress={() => onNavigate(roteiro)}
    >
      <Image source={{ uri: imagemExibicaoRoteiro(roteiro) }} style={styles.roteiroImg} />
      <View style={styles.roteiroBody}>
        <Text
          style={[
            styles.roteiroNome,
            { fontSize: r.font(16), color: ehCatalogo ? Colors.textDark : '#FFFFFF', marginBottom: 2 },
          ]}
          numberOfLines={2}
        >
          {roteiro.nome}
        </Text>
        <Text
          style={{
            fontSize: r.font(12),
            color: ehCatalogo ? Colors.textGray : 'rgba(255,255,255,0.8)',
            marginBottom: 6,
          }}
        >
          {ehCatalogo ? 'Equipe do Brasil em Foco' : `Criado por ${('autorNome' in roteiro && (roteiro as any).autorNome) || 'Membro da Comunidade'}`}
        </Text>
        <View style={styles.roteiroBadges}>
          <View style={[styles.badge, ehCatalogo && styles.badgeCatalogo]}>
            <Text style={[styles.badgeText, { fontSize: r.font(11), color: ehCatalogo ? Colors.textDark : '#FFFFFF' }]}> 
              {roteiro.duracao.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.badge, ehCatalogo && styles.badgeCatalogo]}>
            <Text style={[styles.badgeText, { fontSize: r.font(11), color: ehCatalogo ? Colors.textDark : '#FFFFFF' }]}> 
              {roteiro.tipo.toUpperCase()}
            </Text>
          </View>
          {km > 0 && (
            <View style={[styles.badge, ehCatalogo && styles.badgeCatalogo]}>
              <Text style={[styles.badgeText, { fontSize: r.font(11), color: ehCatalogo ? Colors.textDark : '#FFFFFF' }]}> 
                {km} KM
              </Text>
            </View>
          )}
        </View>
      </View>
      {!isOwn && (
        <TouchableOpacity
          onPress={(e) => { e.stopPropagation(); handleToggleFavorito(); }}
          style={styles.bookmarkBtn}
          disabled={salvandoFavorito}
        >
          <MaterialIcons
            name={favoritado ? 'bookmark' : 'bookmark-border'}
            size={24}
            color={ehCatalogo ? (favoritado ? Colors.primary : Colors.textGray) : (favoritado ? '#FFFFFF' : 'rgba(255,255,255,0.75)')}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

export default function RoteirosScreen() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const preferencias = (userData?.preferencias ?? {}) as UserPreferences;
  const r = useResponsive();
  const insets = useSafeAreaInsets();

  const [busca, setBusca] = useState('');
  const [emAlta, setEmAlta] = useState<UserRoteiro[]>([]);
  const [ultimosVistos, setUltimosVistos] = useState<UserRoteiro[]>([]);
  const [carregandoEmAlta, setCarregandoEmAlta] = useState(false);
  const [carregandoUltimos, setCarregandoUltimos] = useState(false);

  useEffect(() => {
    let ativo = true;
    async function carregarEmAlta() {
      setCarregandoEmAlta(true);
      try {
        const roteiros = await listarRoteirosEmAlta(5);
        if (ativo) setEmAlta(roteiros.map((rt) => ({ ...rt, cor: corDoRoteiro(rt) })));
      } catch { if (ativo) setEmAlta([]); }
      finally { if (ativo) setCarregandoEmAlta(false); }
    }
    carregarEmAlta();
    return () => { ativo = false; };
  }, [user?.uid]);

  useEffect(() => {
    let ativo = true;
    async function carregarUltimos() {
      setCarregandoUltimos(true);
      try {
        const roteiros = await buscarUltimosRoteiroVistos(user?.uid);
        if (ativo) setUltimosVistos(roteiros.map((rt) => ({ ...rt, cor: corDoRoteiro(rt) })));
      } catch { if (ativo) setUltimosVistos([]); }
      finally { if (ativo) setCarregandoUltimos(false); }
    }
    carregarUltimos();
    return () => { ativo = false; };
  }, [user?.uid]);

  const recomendados = useMemo(
    () => rankRoteirosByPreferences(roteirosRecomendados, preferencias),
    [userData?.preferencias],
  );

  function normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  function filtrarPorBusca<T extends Roteiro>(lista: T[]): T[] {
    if (!busca.trim()) return lista;
    const termo = normalizar(busca.trim());
    return lista.filter((rt) => normalizar(rt.nome).includes(termo));
  }

  async function handleNavigateRoteiro(roteiro: Roteiro) {
    await registrarVisualizacaoRoteiro(roteiro.id, user?.uid);
    if (user) {
      const atualizados = await buscarUltimosRoteiroVistos(user.uid);
      setUltimosVistos(atualizados);
    }
    const origem =
      isProvavelIdFirestore(roteiro.id) || ('uid' in roteiro && Boolean((roteiro as UserRoteiro).uid))
        ? 'usuario'
        : 'recomendado';
    router.push({ pathname: '/roteiro-detalhes', params: { id: roteiro.id, origem } });
  }

  const filtradosEmAlta = filtrarPorBusca(emAlta);
  const filtradosRecomendados = filtrarPorBusca(recomendados);
  const filtradosUltimos = filtrarPorBusca(ultimosVistos);

  return (
    <MainTabLayout activeTab="roteiro">
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ paddingHorizontal: 20, paddingTop: r.scaleY(12), paddingBottom: 8 }}>
          <Text style={{ color: Colors.textWhite, fontSize: r.font(20), fontWeight: '700' }}>Roteiros</Text>
        </View>

        <View style={[styles.searchWrapper, { paddingTop: r.scaleY(8) }]}> 
          <SearchBar
            value={busca}
            onChangeText={setBusca}
            placeholder="Pesquisar roteiro..."
          />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { fontSize: r.font(18) }]}>Roteiros em Alta</Text>
          {carregandoEmAlta ? (
            <Text style={[styles.emptyText, { fontSize: r.font(14) }]}>Carregando...</Text>
          ) : filtradosEmAlta.length > 0 ? (
            filtradosEmAlta.map((rt) => (
              <RoteiroCard key={rt.id} roteiro={rt} origem="recomendado" onNavigate={handleNavigateRoteiro} onFavoritoChange={() => {}} />
            ))
          ) : (
            <Text style={[styles.emptyText, { fontSize: r.font(14) }]}>Nenhum roteiro em destaque ainda.</Text>
          )}

          <Text style={[styles.sectionTitle, { fontSize: r.font(18), marginTop: 20 }]}>Roteiros Recomendados</Text>
          {filtradosRecomendados.length > 0 ? (
            filtradosRecomendados.map((rt) => (
              <RoteiroCard key={rt.id} roteiro={rt} origem="recomendado" onNavigate={handleNavigateRoteiro} />
            ))
          ) : (
            <Text style={[styles.emptyText, { fontSize: r.font(14) }]}>Nenhum roteiro recomendado alinhado com suas preferências.</Text>
          )}

          <Text style={[styles.sectionTitle, { fontSize: r.font(18), marginTop: 20 }]}>Últimos Visualizados</Text>
          {carregandoUltimos ? (
            <Text style={[styles.emptyText, { fontSize: r.font(14) }]}>Carregando...</Text>
          ) : filtradosUltimos.length > 0 ? (
            filtradosUltimos.map((rt) => (
              <RoteiroCard key={`${rt.id}-ultimo`} roteiro={rt} origem={rt.uid ? 'usuario' : 'recomendado'} onNavigate={handleNavigateRoteiro} />
            ))
          ) : (
            <Text style={[styles.emptyText, { fontSize: r.font(14) }]}>Nenhum roteiro visualizado ainda.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </MainTabLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchWrapper: { paddingHorizontal: 20, paddingBottom: 12 },
  content: { paddingHorizontal: 20, paddingTop: 4 },
  sectionTitle: { color: Colors.textWhite, fontWeight: '700', marginBottom: 16 },
  emptyText: { color: Colors.textGray, marginBottom: 8 },
  roteiroCard: {
    borderRadius: 16, flexDirection: 'row', alignItems: 'center',
    padding: 12, marginBottom: 12,
    ...require('react-native').Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
      android: { elevation: 3 },
      web: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
    }),
  },
  roteiroImg: { width: 72, height: 72, borderRadius: 12, marginRight: 12 },
  roteiroBody: { flex: 1 },
  roteiroNome: { color: '#FFFFFF', fontWeight: '700', marginBottom: 8 },
  roteiroBadges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#FFFFFF' },
  badgeCatalogo: { borderColor: Colors.inputBorder },
  bookmarkBtn: { padding: 4 },
});
