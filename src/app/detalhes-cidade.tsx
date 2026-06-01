import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import StarRating from '../components/ui/StarRating';
import { Colors } from '../constants/Colors';
import { Avaliacao } from '../data/mockAvaliacoes';
import { cidadesRecomendadas, ultimasVisualizadas } from '../data/mockCidades';
import { getCidadeDatasetById } from '../data/cidadesDataset';
import { useAuth } from '../context/AuthContext';
import { auth, db, isFirebaseConfigured } from '../services/firebase';
import { buscarImagemCidade } from '../services/pexels';
import { adicionarCidadeAoRoteiroAutomatico } from '../services/roteiros';
import {
  calcularMediaAvaliacoes,
  listarAvaliacoesPublicasDaCidade,
} from '../services/avaliacoes';
import {
  formatAltitudeLabel,
  formatPibPerCapita,
  formatPopulacao,
  gerarTagsCidade,
  getCategoriaTurBadge,
  getIdhmFaixa,
  getWikipediaUrl,
  toCidadeLegacy,
} from '../utils/cidadeDataset';
import { useResponsive } from '../utils/responsive';

export default function DetalhesCidadeScreen() {
  const router = useRouter();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();

  const cidadeDataset = params.id ? getCidadeDatasetById(params.id) : undefined;
  const cidadeMock =
    cidadesRecomendadas.find((c) => c.id === params.id) ??
    ultimasVisualizadas.find((c) => c.id === params.id);

  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const [showReviews, setShowReviews] = useState(false);
  const [avaliacoesCidade, setAvaliacoesCidade] = useState<Avaliacao[]>([]);
  const [favoritado, setFavoritado] = useState(false);
  const [adicionandoRoteiro, setAdicionandoRoteiro] = useState(false);

  const nomeCidade = cidadeDataset?.nome ?? cidadeMock?.nome;
  const imagemFallback = cidadeDataset?.imagemUrl ?? cidadeMock?.imagemUrl;
  const estadoCidade = cidadeDataset?.estado ?? cidadeMock?.estado ?? '';

  const carregarAvaliacoes = useCallback(async () => {
    if (!nomeCidade || !estadoCidade) {
      setAvaliacoesCidade([]);
      return;
    }
    const lista = await listarAvaliacoesPublicasDaCidade(
      cidadeDataset?.id ?? cidadeMock?.id,
      nomeCidade,
      estadoCidade,
    );
    setAvaliacoesCidade(lista);
  }, [cidadeDataset?.id, cidadeMock?.id, nomeCidade, estadoCidade]);

  useFocusEffect(
    useCallback(() => {
      carregarAvaliacoes();
    }, [carregarAvaliacoes]),
  );

  useEffect(() => {
    if (!nomeCidade) return;
    let ativo = true;
    buscarImagemCidade(nomeCidade).then((url) => {
      if (ativo && url) setHeroUrl(url);
    });
    return () => {
      ativo = false;
    };
  }, [nomeCidade]);

  const tags = useMemo(() => (cidadeDataset ? gerarTagsCidade(cidadeDataset) : []), [cidadeDataset]);
  const badgeTur = useMemo(
    () => (cidadeDataset ? getCategoriaTurBadge(cidadeDataset.categoriaTur) : null),
    [cidadeDataset],
  );
  const faixaIdhm = useMemo(
    () => (cidadeDataset ? getIdhmFaixa(cidadeDataset.idhm) : null),
    [cidadeDataset],
  );
  const pibLabel = useMemo(
    () => (cidadeDataset ? formatPibPerCapita(cidadeDataset.pibPerCapita) : null),
    [cidadeDataset],
  );
  const altitudeLabel = useMemo(
    () => (cidadeDataset ? formatAltitudeLabel(cidadeDataset.altitude) : null),
    [cidadeDataset],
  );

  if (!cidadeDataset && !cidadeMock) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.notFoundHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.notFoundBack}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textWhite} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFoundBody}>
          <MaterialIcons name="location-off" size={48} color={Colors.textGray} />
          <Text style={[styles.notFoundTitle, { fontSize: r.font(18) }]}>Cidade não encontrada</Text>
          <TouchableOpacity style={styles.notFoundBtn} onPress={() => router.back()}>
            <Text style={styles.notFoundBtnText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const mediaAvaliacoes = calcularMediaAvaliacoes(avaliacoesCidade);
  const avaliacao = mediaAvaliacoes ?? cidadeMock?.avaliacao ?? 4.5;
  const regiao = cidadeDataset?.regiao ?? cidadeMock?.regiao ?? '';
  const estado = estadoCidade;

  function handleFavoritar() {
    setFavoritado((v) => !v);
    Alert.alert('Favoritos', 'Cidade favoritada no modo desenvolvimento.');
  }

  function handleAvaliar() {
    Alert.alert('Avaliar', 'Avaliação simulada no modo desenvolvimento.');
  }

  async function handleAdicionarRoteiro() {
    if (!cidadeDataset) {
      Alert.alert('Dados indisponíveis', 'Não foi possível carregar os dados completos desta cidade.');
      return;
    }
    if (!isFirebaseConfigured || !auth || !db || !user) {
      Alert.alert('Firebase necessário', 'Faça login com Firebase configurado para salvar cidades em roteiros.');
      return;
    }

    setAdicionandoRoteiro(true);
    try {
      const nomeRoteiro = await adicionarCidadeAoRoteiroAutomatico(user.uid, toCidadeLegacy(cidadeDataset));
      Alert.alert('Roteiro atualizado', `${cidadeDataset.nome} foi adicionada ao ${nomeRoteiro}.`);
    } catch (error) {
      console.error('[detalhes-cidade:roteiro]', error);
      Alert.alert('Erro', 'Não foi possível adicionar a cidade ao roteiro. Tente novamente.');
    } finally {
      setAdicionandoRoteiro(false);
    }
  }

  function handleWikipedia() {
    if (!nomeCidade || !estado) return;
    const url = getWikipediaUrl(nomeCidade, estado);
    Linking.openURL(url).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o Wikipedia.');
    });
  }

  const hoteisLeitos =
    cidadeDataset?.hoteis != null && cidadeDataset.hoteis > 0
      ? `${cidadeDataset.hoteis} hotéis · ${(cidadeDataset.leitos ?? 0).toLocaleString('pt-BR')} leitos disponíveis`
      : null;

  const agencias =
    cidadeDataset?.agenciasTurismo != null && cidadeDataset.agenciasTurismo > 0
      ? `${cidadeDataset.agenciasTurismo.toLocaleString('pt-BR')} agências de turismo`
      : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrapper}>
          <Image
            source={{ uri: heroUrl ?? imagemFallback ?? undefined }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={[styles.heroTitle, { fontSize: r.font(20) }]}>Detalhes</Text>
          </View>
        </View>

        <View style={styles.likesBar}>
          <View style={styles.avatarGroup}>
            {['rayssa', 'fabio', 'jonas'].map((s) => (
              <Image key={s} source={{ uri: `https://picsum.photos/seed/${s}/40/40` }} style={styles.miniAvatar} />
            ))}
          </View>
          <Text style={[styles.likesText, { fontSize: r.font(15) }]}>+20 Gostaram</Text>
          <TouchableOpacity style={styles.shareBtn}>
            <MaterialIcons name="share" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.body, { paddingHorizontal: 20 }]}>
          <Text style={[styles.cidadeNome, { fontSize: r.font(24) }]}>{nomeCidade}</Text>

          {cidadeDataset?.regiaoTur ? (
            <Text style={[styles.regiaoTur, { fontSize: r.font(14) }]}>
              Região Tur.: {cidadeDataset.regiaoTur}
            </Text>
          ) : null}

          <Text style={[styles.cidadeSub, { fontSize: r.font(13) }]}>
            {estado} • {regiao}
            {cidadeDataset?.categoria ? ` • ${cidadeDataset.categoria}` : cidadeMock?.categoria ? ` • ${cidadeMock.categoria}` : ''}
          </Text>

          <View style={styles.badgesRow}>
            {badgeTur ? (
              <View style={[styles.badgeTur, { backgroundColor: badgeTur.corFundo }]}>
                <Text style={[styles.badgeTurText, { color: badgeTur.corTexto }]}>{badgeTur.label}</Text>
              </View>
            ) : null}
            {tags.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.ratingRow}>
            <Text style={[styles.ratingNum, { fontSize: r.font(16) }]}>{avaliacao.toFixed(1)}</Text>
            <StarRating value={avaliacao} size={18} />
            <TouchableOpacity onPress={() => setShowReviews((v) => !v)}>
              <Text style={[styles.verMaisBtn, { fontSize: r.font(14) }]}>Ver mais</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionsRow}>
            <ActionButton
              icon={favoritado ? 'favorite' : 'favorite-border'}
              label={favoritado ? 'Favoritado' : 'Favoritar'}
              onPress={handleFavoritar}
              r={r}
            />
            <ActionButton icon="star-rate" label="Avaliar" onPress={handleAvaliar} r={r} />
            <ActionButton
              icon="playlist-add"
              label={adicionandoRoteiro ? 'Salvando' : 'Roteiro'}
              onPress={handleAdicionarRoteiro}
              r={r}
              disabled={adicionandoRoteiro || !cidadeDataset}
            />
          </View>

          {!showReviews ? (
            <>
              {cidadeDataset ? (
                <>
                  <InfoCard
                    icon="people"
                    title="População"
                    desc={formatPopulacao(cidadeDataset.populacaoEstimada)}
                    r={r}
                  />

                  {faixaIdhm && cidadeDataset.idhm != null ? (
                    <View style={infoStyles.card}>
                      <View style={infoStyles.iconBox}>
                        <MaterialIcons name="insights" size={24} color={Colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[infoStyles.title, { fontSize: r.font(15) }]}>IDH Municipal</Text>
                        <Text style={[infoStyles.desc, { fontSize: r.font(14) }]}>
                          IDH: {cidadeDataset.idhm.toFixed(3)} — {faixaIdhm.label}
                        </Text>
                        <View style={styles.idhmBarTrack}>
                          <View
                            style={[
                              styles.idhmBarFill,
                              { width: `${Math.min(100, cidadeDataset.idhm * 100)}%`, backgroundColor: faixaIdhm.cor },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  ) : null}

                  {hoteisLeitos ? <InfoCard icon="hotel" title="Hospedagem" desc={hoteisLeitos} r={r} /> : null}
                  {agencias ? <InfoCard icon="store" title="Turismo local" desc={agencias} r={r} /> : null}
                  {pibLabel ? <InfoCard icon="attach-money" title="Economia local" desc={pibLabel} r={r} /> : null}
                  {altitudeLabel ? <InfoCard icon="terrain" title="Relevo" desc={altitudeLabel} r={r} /> : null}
                </>
              ) : (
                <InfoCard icon="info" title="Dados parciais" desc="Esta cidade usa dados resumidos do app." r={r} />
              )}

              <TouchableOpacity style={styles.wikiBtn} onPress={handleWikipedia} activeOpacity={0.85}>
                <MaterialIcons name="menu-book" size={20} color={Colors.primary} />
                <Text style={[styles.wikiBtnText, { fontSize: r.font(15) }]}>Ver no Wikipedia</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {avaliacoesCidade.length > 0 ? (
                avaliacoesCidade.map((av) => (
                  <View key={av.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={[styles.reviewAvatar, styles.reviewAvatarLetter]}>
                        <Text style={styles.reviewAvatarLetterText}>
                          {(av.autorNome ?? 'U').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <View style={styles.reviewMeta}>
                          <Text style={[styles.reviewAutor, { fontSize: r.font(15) }]}>
                            {av.autorNome ?? 'Usuário'}
                          </Text>
                          <Text style={[styles.reviewData, { fontSize: r.font(13) }]}>{av.data}</Text>
                          <Text style={[styles.reviewNota, { fontSize: r.font(15) }]}>
                            {av.nota.toFixed(1)} <MaterialIcons name="star" size={14} color="#F59E0B" />
                          </Text>
                        </View>
                        {av.comentario ? (
                          <Text style={[styles.reviewComentario, { fontSize: r.font(14) }]}>{av.comentario}</Text>
                        ) : null}
                      </View>
                    </View>
                    <View style={styles.reviewDivider} />
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyReviewsText, { fontSize: r.font(14) }]}>
                  Nenhuma avaliação pública para esta cidade ainda.
                </Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  r,
  disabled,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  r: ReturnType<typeof import('../utils/responsive').useResponsive>;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[actionStyles.btn, disabled && { opacity: 0.6 }]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
    >
      <MaterialIcons name={icon} size={20} color="#FFFFFF" />
      <Text style={[actionStyles.label, { fontSize: r.font(13) }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const actionStyles = StyleSheet.create({
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  label: { color: '#FFFFFF', fontWeight: '600' },
});

function InfoCard({
  icon,
  title,
  desc,
  r,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  desc: string;
  r: ReturnType<typeof import('../utils/responsive').useResponsive>;
}) {
  return (
    <View style={infoStyles.card}>
      <View style={infoStyles.iconBox}>
        <MaterialIcons name={icon} size={24} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[infoStyles.title, { fontSize: r.font(15) }]}>{title}</Text>
        <Text style={[infoStyles.desc, { fontSize: r.font(14) }]}>{desc}</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(121,116,231,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: Colors.textWhite, fontWeight: '700', marginBottom: 2 },
  desc: { color: 'rgba(255,255,255,0.75)' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heroWrapper: { position: 'relative', height: 260 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  backBtn: { marginRight: 12 },
  heroTitle: { color: '#FFFFFF', fontWeight: '700' },
  likesBar: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarGroup: { flexDirection: 'row' },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: -6,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  likesText: { color: Colors.primary, fontWeight: '600', flex: 1 },
  shareBtn: {},
  body: { paddingTop: 24 },
  cidadeNome: { color: Colors.textWhite, fontWeight: '700', marginBottom: 4 },
  regiaoTur: { color: Colors.primary, fontWeight: '600', marginBottom: 4 },
  cidadeSub: { color: Colors.textGray, marginBottom: 12 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  badgeTur: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  badgeTurText: { fontSize: 12, fontWeight: '800' },
  tagChip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagChipText: { color: Colors.textWhite, fontSize: 12, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  actionsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  idhmBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 8,
    overflow: 'hidden',
  },
  idhmBarFill: { height: '100%', borderRadius: 3 },
  wikiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
  },
  wikiBtnText: { color: Colors.primary, fontWeight: '700' },
  notFoundHeader: { paddingHorizontal: 16, paddingTop: 8 },
  notFoundBack: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  notFoundBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  notFoundTitle: { color: Colors.textWhite, fontWeight: '700', textAlign: 'center' },
  notFoundBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  notFoundBtnText: { color: '#FFFFFF', fontWeight: '700' },
  ratingNum: { color: Colors.primary, fontWeight: '700' },
  verMaisBtn: { color: Colors.primary, marginLeft: 4 },
  reviewCard: { marginBottom: 4 },
  reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12 },
  reviewAvatar: { width: 44, height: 44, borderRadius: 22 },
  reviewAvatarLetter: {
    backgroundColor: '#4B4B8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarLetterText: { color: '#FFFFFF', fontWeight: '700', fontSize: 18 },
  reviewMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  reviewAutor: { color: Colors.primary, fontWeight: '600' },
  reviewData: { color: Colors.textGray },
  reviewNota: { color: Colors.textWhite, fontWeight: '600', marginLeft: 'auto' },
  reviewComentario: { color: 'rgba(255,255,255,0.8)' },
  reviewDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  emptyReviewsText: { color: Colors.textGray, textAlign: 'center', paddingVertical: 24 },
});
