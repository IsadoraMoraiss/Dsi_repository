import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { roteirosRecomendados, Roteiro } from '../data/mockRoteiros';
import { useAuth } from '../context/AuthContext';
import {
  adicionarRoteiroRecomendadoAoUsuario,
  buscarCopiaSalvaUsuario,
  buscarRoteiroPorId,
  buscarRoteiroUsuario,
  enriquecerRoteiroUsuario,
  isProvavelIdFirestore,
  removerRoteiroSalvoComunidade,
  UserRoteiro,
  deletarRoteiroUsuario,
  removerCidadeDoRoteiro,
} from '../services/roteiros';
import { imagemExibicaoRoteiro } from '../utils/roteiroImagem';
import {
  CITY_COORDS,
  corDoRoteiro,
  distanciaExibidaRoteiro,
  ehRoteiroDaComunidade,
  ehRoteiroCriadoPeloUsuario,
  resolverCidadesDoRoteiro,
  subtituloAutorRoteiro,
} from '../utils/roteiroUtils';
import { sugerirCidades } from '../services/sugestoes';
import { useResponsive } from '../utils/responsive';
import { Cidade } from '../data/mockCidades';

const todasCidadesJson = require('../data/cidades.json') as Cidade[];

type Params = {
  id?: string;
  origem?: 'usuario' | 'recomendado';
};

function CityRow({ cidade, index, onRemove }: { cidade: string; index: number; onRemove?: () => void }) {
  const r = useResponsive();
  return (
    <View style={styles.cityRow}>
      <View style={styles.stepCircle}>
        <Text style={styles.stepText}>{index + 1}</Text>
      </View>
      <View style={styles.cityInfo}>
        <Text style={[styles.cityName, { fontSize: r.font(15) }]}>{cidade}</Text>
        <Text style={[styles.cityMeta, { fontSize: r.font(12) }]}>Parada do roteiro</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <MaterialIcons name="place" size={20} color={Colors.primary} />
        {onRemove && (
          <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
            <MaterialIcons name="close" size={18} color={Colors.textGray} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function SuggestionCard({ cidade, onPress }: { cidade: Cidade; onPress: () => void }) {
  const r = useResponsive();
  return (
    <TouchableOpacity
      style={styles.suggestionCard}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`Abrir perfil de ${cidade.nome}`}
    >
      <View style={styles.suggestionIcon}>
        <MaterialIcons name="near-me" size={16} color={Colors.primary} />
      </View>
      <View style={styles.suggestionInfo}>
        <Text style={[styles.suggestionName, { fontSize: r.font(13) }]}>{cidade.nome}</Text>
        <Text style={[styles.suggestionMeta, { fontSize: r.font(11) }]}>{cidade.categoria}</Text>
      </View>
      <MaterialIcons name="arrow-forward" size={16} color={Colors.textGray} />
    </TouchableOpacity>
  );
}

export default function RoteiroDetalhesScreen() {
  const router = useRouter();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<Params>();
  const roteiroId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  const [roteiroUsuario, setRoteiroUsuario] = useState<UserRoteiro | null>(null);
  const [copiaSalva, setCopiaSalva] = useState<UserRoteiro | null>(null);
  const [loading, setLoading] = useState(Boolean(roteiroId && isProvavelIdFirestore(roteiroId)));
  const [salvando, setSalvando] = useState(false);

  const todasCidades = useMemo(
    () => [...todasCidadesJson].sort((a, b) => a.nome.localeCompare(b.nome)),
    []
  );

  const cidadeMap = useMemo(() => {
    const map = new Map<string, Cidade>();
    todasCidades.forEach((c) => {
      map.set(c.id, c);
    });
    return map;
  }, [todasCidades]);

  useEffect(() => {
    let active = true;

    async function carregar() {
      if (!roteiroId || !isProvavelIdFirestore(roteiroId)) {
        setLoading(false);
        return;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const roteiro = await buscarRoteiroPorId(roteiroId, user.uid);
        if (!active) return;
        if (roteiro) {
          const enriquecido = await enriquecerRoteiroUsuario(roteiro, todasCidades);
          if (active) setRoteiroUsuario(enriquecido);
        } else if (active) {
          setRoteiroUsuario(null);
        }
      } catch (error) {
        console.error('[roteiro-detalhes]', error);
      } finally {
        if (active) setLoading(false);
      }
    }

    carregar();
    return () => {
      active = false;
    };
  }, [roteiroId, user, todasCidades]);

  useEffect(() => {
    let ativo = true;

    async function verificarCopiaSalva() {
      if (!user || !roteiroId) {
        if (ativo) setCopiaSalva(null);
        return;
      }

      const base =
        roteiroUsuario ??
        roteirosRecomendados.find((item) => item.id === roteiroId);
      if (!base) {
        if (ativo) setCopiaSalva(null);
        return;
      }

      try {
        const copia = await buscarCopiaSalvaUsuario(user.uid, base);
        if (ativo) setCopiaSalva(copia);
      } catch {
        if (ativo) setCopiaSalva(null);
      }
    }

    verificarCopiaSalva();
    return () => {
      ativo = false;
    };
  }, [user?.uid, roteiroId, roteiroUsuario?.id, roteiroUsuario?.updatedAt]);

  const roteiro = useMemo<Roteiro | UserRoteiro | undefined>(() => {
    if (roteiroUsuario) return roteiroUsuario;
    if (!roteiroId) return undefined;
    return roteirosRecomendados.find((item) => item.id === roteiroId);
  }, [roteiroId, roteiroUsuario]);

  const isDono = Boolean(user && roteiroUsuario?.uid === user.uid);
  const isCriadoPorMim = Boolean(
    roteiroUsuario && isDono && ehRoteiroCriadoPeloUsuario(roteiroUsuario),
  );
  const ehCatalogo = Boolean(roteiro && ehRoteiroDaComunidade(roteiro));
  const jaSalvoNaConta = Boolean(copiaSalva);
  const mostrarAcaoSalvar = Boolean(user && ehCatalogo && !isCriadoPorMim);

  const cidadesResolvidas = useMemo(() => {
    if (!roteiro) return { ids: [] as string[], detalhadas: [] as Cidade[] };
    return resolverCidadesDoRoteiro(roteiro, todasCidades);
  }, [roteiro, todasCidades]);

  const roteiroDetalhadoCidades = cidadesResolvidas.detalhadas;
  const cidadeIdsResolvidos = cidadesResolvidas.ids;

  const distanciaKm = useMemo(() => {
    if (!roteiro) return 0;
    return distanciaExibidaRoteiro(roteiro, roteiroDetalhadoCidades);
  }, [roteiro, roteiroDetalhadoCidades]);

  const sugestoesDeProximas = useMemo(() => {
    if (!roteiro || roteiroDetalhadoCidades.length === 0) return [];
    const ultimaCidade = roteiroDetalhadoCidades[roteiroDetalhadoCidades.length - 1];
    return sugerirCidades(
      ultimaCidade,
      roteiroDetalhadoCidades,
      todasCidades,
      cidadeIdsResolvidos,
      CITY_COORDS,
      3,
    );
  }, [roteiro, roteiroDetalhadoCidades, todasCidades, cidadeIdsResolvidos]);

  async function handleRemoverCidade(index: number) {
    if (!roteiro || !isCriadoPorMim || !roteiroUsuario) return;

    const cidadeId = roteiroUsuario.cidadeIds?.[index];
    const cidadeLabel = roteiroUsuario.cidades?.[index];

    if (!cidadeId || !cidadeLabel) return;

    Alert.alert(
      'Remover Cidade',
      `Tem certeza que deseja remover ${cidadeLabel}?`,
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Remover',
          onPress: async () => {
            try {
              await removerCidadeDoRoteiro(roteiroUsuario.id, cidadeLabel, cidadeId);
              const atualizado = await buscarRoteiroUsuario(user!.uid, roteiroUsuario.id);
              setRoteiroUsuario(atualizado);
            } catch (error) {
              console.error('[remover-cidade]', error);
              Alert.alert('Erro', 'Não foi possível remover a cidade.');
            }
          },
        },
      ]
    );
  }

  async function handleDeletarRoteiro() {
    if (!roteiroUsuario || !isCriadoPorMim) return;

    Alert.alert(
      'Deletar Roteiro',
      `Tem certeza que deseja deletar "${roteiroUsuario.nome}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Deletar',
          onPress: async () => {
            try {
              await deletarRoteiroUsuario(roteiroUsuario.id);
              router.replace('/(tabs)/roteiros' as any);
            } catch (error) {
              console.error('[deletar-roteiro]', error);
              Alert.alert('Erro', 'Não foi possível deletar o roteiro.');
            }
          },
        },
      ]
    );
  }

  async function handleAcaoSalvar() {
    if (!roteiro || !user || !mostrarAcaoSalvar) return;

    setSalvando(true);
    try {
      if (jaSalvoNaConta) {
        const removido = await removerRoteiroSalvoComunidade(user.uid, roteiro);
        if (!removido) {
          Alert.alert('Atenção', 'Não encontramos este roteiro nos seus salvos.');
          return;
        }
        setCopiaSalva(null);
        if (roteiroUsuario && ehRoteiroDaComunidade(roteiroUsuario)) {
          setRoteiroUsuario(null);
        }
        Alert.alert('Removido', 'Roteiro excluído dos seus salvos.');
        return;
      }

      const { id } = await adicionarRoteiroRecomendadoAoUsuario(user.uid, roteiro as UserRoteiro);
      const copia = await buscarRoteiroUsuario(user.uid, id);
      setCopiaSalva(copia);
      Alert.alert('Salvo', 'Roteiro adicionado em Favoritos.');
    } catch (error) {
      console.error('[salvar-recomendado]', error);
      Alert.alert('Erro', 'Não foi possível atualizar o roteiro salvo.');
    } finally {
      setSalvando(false);
    }
  }

  function handleAbrirCidade(cidade: Cidade) {
    router.push({ pathname: '/detalhes-cidade', params: { id: cidade.id } });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!roteiro) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textWhite} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <MaterialIcons name="event-busy" size={46} color={Colors.textGray} />
          <Text style={[styles.emptyTitle, { fontSize: r.font(18) }]}>Roteiro não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const subtituloAutor = subtituloAutorRoteiro(roteiro, isDono);
  const descricao =
    roteiro.descricao ??
    ('observacoes' in roteiro && roteiro.observacoes
      ? roteiro.observacoes
      : isCriadoPorMim
        ? 'Roteiro salvo na sua conta. As cidades adicionadas aparecem abaixo.'
        : 'Roteiro recomendado pela comunidade.');

  const capaUrl = imagemExibicaoRoteiro(roteiro);
  const corHero = corDoRoteiro(roteiro);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, { paddingTop: r.scaleY(8) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: r.font(18) }]}>Detalhes do Roteiro</Text>
        <View style={{ marginLeft: 'auto', flexDirection: 'row', gap: 8 }}>
          {isCriadoPorMim && (
            <>
              <TouchableOpacity onPress={() => router.push(`/editar-roteiro?id=${roteiroId}`)}>
                <MaterialIcons name="edit" size={24} color={Colors.textWhite} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeletarRoteiro}>
                <MaterialIcons name="delete" size={24} color="#EF4444" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: corHero }]}>
          <Image source={{ uri: capaUrl }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <Text style={[styles.routeName, { fontSize: r.font(24) }]}>{roteiro.nome}</Text>
            <Text style={[styles.routeAuthor, { fontSize: r.font(13) }]}>{subtituloAutor}</Text>
          </View>
        </View>

        <Text style={[styles.description, { fontSize: r.font(14) }]}>{descricao}</Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <MaterialIcons name="schedule" size={20} color={Colors.primary} />
            <Text style={styles.metricLabel}>Duração</Text>
            <Text style={styles.metricValue}>{roteiro.duracao}</Text>
          </View>
          <View style={styles.metricBox}>
            <MaterialIcons name="explore" size={20} color={Colors.primary} />
            <Text style={styles.metricLabel}>Tipo</Text>
            <Text style={styles.metricValue}>{roteiro.tipo}</Text>
          </View>
          <View style={styles.metricBox}>
            <MaterialIcons name="route" size={20} color={Colors.primary} />
            <Text style={styles.metricLabel}>Distância</Text>
            <Text style={styles.metricValue}>{distanciaKm} km</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { fontSize: r.font(18) }]}>Cidades selecionadas</Text>
          <Text style={[styles.cityCount, { fontSize: r.font(13) }]}>{roteiro.cidades.length} parada(s)</Text>
        </View>

        {roteiro.cidades.length > 0 ? (
          roteiro.cidades.map((cidade, index) => (
            <CityRow
              key={`${cidade}-${index}`}
              cidade={cidade}
              index={index}
              onRemove={isCriadoPorMim ? () => handleRemoverCidade(index) : undefined}
            />
          ))
        ) : (
          <Text style={[styles.emptyText, { fontSize: r.font(14) }]}>Nenhuma cidade adicionada ainda.</Text>
        )}

        {/* Sugestões de cidades próximas */}
        {roteiroDetalhadoCidades.length > 0 && sugestoesDeProximas.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Text style={[styles.sectionTitle, { fontSize: r.font(18) }]}>Sugestões Próximas</Text>
            </View>
            <Text style={[styles.sectionSubtitle, { fontSize: r.font(12) }]}>
              Cidades próximas à sua última parada
            </Text>
            {sugestoesDeProximas.map((cidade) => (
              <SuggestionCard key={cidade.id} cidade={cidade} onPress={() => handleAbrirCidade(cidade)} />
            ))}
          </>
        )}
      </ScrollView>

      {/* Footer Button */}
      {mostrarAcaoSalvar && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity
            style={[
              jaSalvoNaConta ? styles.excluirBtn : styles.salvarBtn,
              salvando && { opacity: 0.6 },
            ]}
            onPress={handleAcaoSalvar}
            disabled={salvando}
          >
            <Text
              style={[
                styles.salvarText,
                { fontSize: r.font(15) },
                jaSalvoNaConta && { color: '#EF4444' },
              ]}
            >
              {salvando
                ? 'Aguarde...'
                : jaSalvoNaConta
                  ? 'Excluir dos salvos'
                  : 'Salvar Roteiro'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  backBtn: { marginRight: 12 },
  headerTitle: { color: Colors.textWhite, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingTop: 6 },
  heroCard: {
    minHeight: 180,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginBottom: 18,
  },
  heroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.55 },
  heroOverlay: { padding: 18, backgroundColor: 'rgba(0,0,0,0.25)' },
  routeName: { color: '#FFFFFF', fontWeight: '800', marginBottom: 6 },
  routeAuthor: { color: 'rgba(255,255,255,0.82)', fontWeight: '600' },
  description: { color: 'rgba(255,255,255,0.78)', lineHeight: 21, marginBottom: 18 },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  metricBox: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    borderRadius: 14,
    padding: 12,
    minHeight: 104,
  },
  metricLabel: { color: Colors.textGray, fontSize: 11, marginTop: 8, marginBottom: 3 },
  metricValue: { color: Colors.textDark, fontSize: 13, fontWeight: '800' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { color: Colors.textWhite, fontWeight: '800' },
  sectionSubtitle: { color: Colors.textGray, marginBottom: 12 },
  cityCount: { color: Colors.textGray },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  cityInfo: { flex: 1 },
  cityName: { color: Colors.textDark, fontWeight: '800' },
  cityMeta: { color: Colors.textGray, marginTop: 2 },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { color: Colors.textGray },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { color: Colors.textWhite, fontWeight: '800' },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  suggestionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionInfo: { flex: 1 },
  suggestionName: { color: Colors.textDark, fontWeight: '700' },
  suggestionMeta: { color: Colors.textGray, marginTop: 2 },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  salvarBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  excluirBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  salvarText: { color: Colors.textWhite, fontWeight: '700' },
});
