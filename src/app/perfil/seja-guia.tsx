import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import {
  buscarMeuCadastroGuia,
  excluirCadastroGuia,
  GuiaCadastro,
  salvarCadastroGuia,
} from '../../services/guias';
import { buscarCidadesPorTermo } from '../../utils/cidadeDataset';
import { useResponsive } from '../../utils/responsive';

const todasCidadesJson = require('../../data/cidades.json') as Cidade[];

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'numeric';
};

function Field({ label, value, onChangeText, placeholder, multiline, keyboardType }: FieldProps) {
  const r = useResponsive();
  return (
    <View style={styles.fieldWrapper}>
      <Text style={[styles.label, { fontSize: r.font(14) }]}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea, { fontSize: r.font(15) }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textGray}
        multiline={multiline}
        keyboardType={keyboardType ?? 'default'}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

export default function SejaGuiaScreen() {
  const router = useRouter();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const { user, userData } = useAuth();

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [cadastroGuia, setCadastroGuia] = useState<GuiaCadastro | null>(null);
  const [editando, setEditando] = useState(false);
  const [status, setStatus] = useState<'pendente' | 'aprovado' | 'rejeitado' | null>(null);
  const [nome, setNome] = useState(userData?.nome ?? '');
  const [telefone, setTelefone] = useState(userData?.telefone ?? '');
  const [buscaCidade, setBuscaCidade] = useState('');
  const [cidadeSelecionada, setCidadeSelecionada] = useState<Cidade | null>(null);
  const [codigo, setCodigo] = useState('');
  const [especializacao, setEspecializacao] = useState('');
  const [idiomas, setIdiomas] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [valor, setValor] = useState('');
  const [tipoCobranca, setTipoCobranca] = useState<'pessoa' | 'grupo'>('pessoa');
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (!user) {
        setCarregando(false);
        return;
      }

      try {
        const cadastro = await buscarMeuCadastroGuia(user.uid);
        if (!ativo || !cadastro) return;

        setCadastroGuia(cadastro);
        setStatus(cadastro.status);
        setNome(cadastro.nome ?? userData?.nome ?? '');
        setTelefone(cadastro.telefone ?? userData?.telefone ?? '');
        setCidadeSelecionada({
          id: cadastro.cidadeId,
          nome: cadastro.cidade,
          estado: '',
        } as Cidade);
        setCodigo(cadastro.codigoIdentificacao ?? '');
        setEspecializacao(cadastro.especializacao ?? '');
        setIdiomas((cadastro.idiomas ?? []).join(', '));
        setExperiencia(cadastro.experiencia ?? '');
        setValor(cadastro.valor ?? '');
        setTipoCobranca(cadastro.tipoCobranca ?? 'pessoa');
        setDescricao(cadastro.descricao ?? '');
      } catch (error) {
        console.warn('[seja-guia:carregar]', error);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [user?.uid]);

  const cidadesSugeridas = useMemo(() => {
    if (cidadeSelecionada || buscaCidade.trim().length === 0) return [];
    return buscarCidadesPorTermo(todasCidadesJson, buscaCidade, 8);
  }, [buscaCidade, cidadeSelecionada]);

  function selecionarCidade(cidade: Cidade) {
    setCidadeSelecionada(cidade);
    setBuscaCidade('');
  }

  function limparCidade() {
    setCidadeSelecionada(null);
    setBuscaCidade('');
  }

  async function handleSalvar() {
    if (!user) {
      Alert.alert('Login necessário', 'Entre na sua conta para se cadastrar como guia.');
      return;
    }

    if (!nome.trim() || !telefone.trim() || !cidadeSelecionada || !codigo.trim()) {
      Alert.alert('Campos obrigatórios', 'Informe nome, telefone, cidade e código de identificação.');
      return;
    }

    const idiomasLista = idiomas
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    setSalvando(true);
    try {
      await salvarCadastroGuia(user.uid, {
        nome: nome.trim(),
        telefone: telefone.trim(),
        cidade: cidadeSelecionada.nome,
        cidadeId: cidadeSelecionada.id,
        codigoIdentificacao: codigo.trim(),
        especializacao: especializacao.trim(),
        idiomas: idiomasLista,
        experiencia: experiencia.trim(),
        valor: valor.trim(),
        tipoCobranca,
        descricao: descricao.trim(),
        foto_perfil: userData?.avatarUrl ?? '',
      });
      const cadastroAtualizado = await buscarMeuCadastroGuia(user.uid);
      setCadastroGuia(cadastroAtualizado);
      setStatus(cadastroAtualizado?.status ?? 'pendente');
      setEditando(false);
      Alert.alert('Cadastro enviado', 'Seu cadastro de guia foi salvo e ficará pendente para validação.');
    } catch (error) {
      console.error('[seja-guia:salvar]', error);
      Alert.alert('Erro', 'Não foi possível salvar seu cadastro de guia.');
    } finally {
      setSalvando(false);
    }
  }

  function handleExcluirCadastro() {
    if (!user || !cadastroGuia) return;

    Alert.alert(
      'Excluir cadastro',
      'Deseja excluir seu cadastro como guia? Essa ação remove seu perfil da área de guias.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirCadastroGuia(user.uid);
              setCadastroGuia(null);
              setStatus(null);
              setEditando(false);
              setCidadeSelecionada(null);
              setBuscaCidade('');
              setCodigo('');
              setEspecializacao('');
              setIdiomas('');
              setExperiencia('');
              setValor('');
              setTipoCobranca('pessoa');
              setDescricao('');
              Alert.alert('Cadastro excluído', 'Seu cadastro de guia foi removido.');
            } catch (error) {
              console.error('[seja-guia:excluir]', error);
              Alert.alert('Erro', 'Não foi possível excluir seu cadastro de guia.');
            }
          },
        },
      ],
    );
  }

  if (carregando) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, { paddingTop: r.scaleY(8) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: r.font(20) }]}>Seja um guia</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.intro, { fontSize: r.font(14) }]}>
            Cadastre seus dados se você já possui registro oficial como guia turístico.
          </Text>

          {cadastroGuia && !editando ? (
            <>
              <TouchableOpacity style={styles.guideCard} activeOpacity={0.85} onPress={() => setEditando(true)}>
                <View style={styles.guideCardHeader}>
                  <View style={styles.guideIcon}>
                    <MaterialIcons name="badge" size={24} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.guideName, { fontSize: r.font(18) }]}>{cadastroGuia.nome}</Text>
                    <Text style={[styles.guideCity, { fontSize: r.font(13) }]}>{cadastroGuia.cidade}</Text>
                  </View>
                  <MaterialIcons name="edit" size={20} color={Colors.textGray} />
                </View>

                <View style={styles.statusBox}>
                  <MaterialIcons name="verified-user" size={18} color={Colors.primary} />
                  <Text style={[styles.statusText, { fontSize: r.font(13) }]}>Status: {cadastroGuia.status}</Text>
                </View>

                <View style={styles.guideInfoRow}>
                  <Text style={styles.guideInfoLabel}>Código</Text>
                  <Text style={styles.guideInfoValue}>{cadastroGuia.codigoIdentificacao}</Text>
                </View>
                <View style={styles.guideInfoRow}>
                  <Text style={styles.guideInfoLabel}>Especialização</Text>
                  <Text style={styles.guideInfoValue}>{cadastroGuia.especializacao || 'Não informada'}</Text>
                </View>
                <View style={styles.guideInfoRow}>
                  <Text style={styles.guideInfoLabel}>Valor</Text>
                  <Text style={styles.guideInfoValue}>
                    R$ {cadastroGuia.valor || '0'}/{cadastroGuia.tipoCobranca === 'grupo' ? 'grupo' : 'pessoa'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.85} onPress={handleExcluirCadastro}>
                <MaterialIcons name="delete-outline" size={18} color="#FCA5A5" />
                <Text style={[styles.deleteText, { fontSize: r.font(14) }]}>Excluir cadastro de guia</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {status ? (
                <View style={styles.statusBox}>
                  <MaterialIcons name="verified-user" size={18} color={Colors.primary} />
                  <Text style={[styles.statusText, { fontSize: r.font(13) }]}>Status: {status}</Text>
                </View>
              ) : null}

              <Field label="Nome público" value={nome} onChangeText={setNome} placeholder="Seu nome como guia" />
              <Field label="Telefone de contato" value={telefone} onChangeText={setTelefone} placeholder="(xx) xxxxx-xxxx" keyboardType="phone-pad" />

              <View style={styles.fieldWrapper}>
            <Text style={[styles.label, { fontSize: r.font(14) }]}>Cidade onde atua</Text>
            {cidadeSelecionada ? (
              <View style={styles.citySelected}>
                <Text style={[styles.citySelectedText, { fontSize: r.font(14) }]}>
                  {cidadeSelecionada.nome}
                  {cidadeSelecionada.estado ? `, ${cidadeSelecionada.estado}` : ''}
                </Text>
                <Pressable onPress={limparCidade} style={styles.clearCityBtn}>
                  <MaterialIcons name="close" size={18} color={Colors.textGray} />
                </Pressable>
              </View>
            ) : (
              <>
                <TextInput
                  style={[styles.input, { fontSize: r.font(15) }]}
                  value={buscaCidade}
                  onChangeText={setBuscaCidade}
                  placeholder="Buscar cidade..."
                  placeholderTextColor={Colors.textGray}
                />
                {cidadesSugeridas.length > 0 ? (
                  <View style={styles.suggestions}>
                    {cidadesSugeridas.map((cidade) => (
                      <Pressable key={cidade.id} style={styles.suggestionItem} onPress={() => selecionarCidade(cidade)}>
                        <Text style={styles.suggestionText}>{cidade.nome}, {cidade.estado}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </>
            )}
              </View>

              <Field label="Código de identificação oficial" value={codigo} onChangeText={setCodigo} placeholder="Ex: CAD-PE-48291" />
              <Field label="Especialização" value={especializacao} onChangeText={setEspecializacao} placeholder="História, gastronomia, natureza..." />
              <Field label="Idiomas" value={idiomas} onChangeText={setIdiomas} placeholder="Português, Inglês, Espanhol" />
              <Field label="Tempo de experiência" value={experiencia} onChangeText={setExperiencia} placeholder="Ex: 5 anos" />

              <View style={styles.priceRow}>
            <View style={{ flex: 1 }}>
              <Field label="Valor cobrado" value={valor} onChangeText={setValor} placeholder="Ex: 120" keyboardType="numeric" />
            </View>
            <View style={styles.chargeType}>
              <Text style={[styles.label, { fontSize: r.font(14) }]}>Tipo</Text>
              <View style={styles.segmented}>
                {(['pessoa', 'grupo'] as const).map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.segment, tipoCobranca === item && styles.segmentActive]}
                    onPress={() => setTipoCobranca(item)}
                  >
                    <Text style={[styles.segmentText, tipoCobranca === item && styles.segmentTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
              </View>

              <Field
                label="Descrição do atendimento"
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Conte de forma breve como são seus passeios."
                multiline
              />

              <TouchableOpacity style={[styles.saveBtn, salvando && { opacity: 0.65 }]} onPress={handleSalvar} disabled={salvando}>
                {salvando ? <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} /> : null}
                <Text style={[styles.saveBtnText, { fontSize: r.font(16) }]}>
                  {salvando ? 'Salvando...' : 'Salvar cadastro'}
                </Text>
              </TouchableOpacity>

              {cadastroGuia ? (
                <TouchableOpacity style={styles.cancelEditBtn} onPress={() => setEditando(false)}>
                  <Text style={[styles.cancelEditText, { fontSize: r.font(14) }]}>Cancelar edição</Text>
                </TouchableOpacity>
              ) : null}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { marginRight: 12 },
  headerTitle: { color: Colors.textWhite, fontWeight: '700' },
  content: { paddingHorizontal: 24, paddingTop: 8 },
  intro: { color: Colors.textGray, lineHeight: 20, marginBottom: 14 },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(121,116,231,0.35)',
    backgroundColor: 'rgba(121,116,231,0.12)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  statusText: { color: Colors.textWhite, fontWeight: '700' },
  guideCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  guideCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  guideIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(121,116,231,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideName: { color: Colors.textWhite, fontWeight: '800' },
  guideCity: { color: Colors.textGray, marginTop: 2 },
  guideInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 10,
    marginTop: 10,
  },
  guideInfoLabel: { color: Colors.textGray, fontSize: 12, fontWeight: '700' },
  guideInfoValue: { flex: 1, color: Colors.textWhite, fontSize: 13, fontWeight: '700', textAlign: 'right' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.45)',
    borderRadius: 24,
    paddingVertical: 12,
    marginBottom: 8,
  },
  deleteText: { color: '#FCA5A5', fontWeight: '800' },
  fieldWrapper: { marginBottom: 16 },
  label: { color: Colors.textWhite, fontWeight: '700', marginBottom: 8 },
  input: {
    color: Colors.textDark,
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  textArea: { minHeight: 96 },
  citySelected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  citySelectedText: { flex: 1, color: Colors.textDark, fontWeight: '700' },
  clearCityBtn: { padding: 4 },
  suggestions: {
    marginTop: 8,
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    overflow: 'hidden',
  },
  suggestionItem: { paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  suggestionText: { color: Colors.textDark },
  priceRow: { flexDirection: 'row', gap: 12 },
  chargeType: { width: 142 },
  segmented: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 3 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 9 },
  segmentActive: { backgroundColor: Colors.primary },
  segmentText: { color: Colors.textGray, fontWeight: '700', fontSize: 12 },
  segmentTextActive: { color: '#FFFFFF' },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700' },
  cancelEditBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  cancelEditText: { color: Colors.textGray, fontWeight: '700' },
});
