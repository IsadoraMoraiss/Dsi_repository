import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { excluirDadosBasicosUsuario } from '../../services/usuarios';
import { useResponsive } from '../../utils/responsive';

type InfoRowProps = { label: string; value: string };

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

function montarPreferenciasPerfil(
  preferencias?: Record<string, unknown>,
  requisitosAntigos?: string[],
): string[] {
  const clima = toStringArray(preferencias?.clima).map((item) => `Clima: ${item}`);
  const duracao = toStringArray(preferencias?.duracao).map((item) => `Duração: ${item}`);
  const estilo = toStringArray(preferencias?.estilo);
  const atuais = [...clima, ...duracao, ...estilo];

  if (atuais.length > 0) return atuais;
  if (requisitosAntigos?.length) return requisitosAntigos;
  return ['Nenhuma preferência definida'];
}

function InfoRow({ label, value }: InfoRowProps) {
  const r = useResponsive();
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { fontSize: r.font(16) }]}>{label}</Text>
      <Text style={[styles.infoValue, { fontSize: r.font(15) }]}>{value}</Text>
    </View>
  );
}

export default function MeuPerfilScreen() {
  const router = useRouter();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const { user, userData, loading } = useAuth();
  const [modalExclusaoVisivel, setModalExclusaoVisivel] = useState(false);
  const [senhaExclusao, setSenhaExclusao] = useState('');
  const [excluindo, setExcluindo] = useState(false);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const requisitos = montarPreferenciasPerfil(userData?.preferencias, userData?.requisitos);

  function handleExcluirConta() {
    if (!user?.email) {
      Alert.alert('Login necessário', 'Entre na sua conta para excluí-la.');
      return;
    }

    setSenhaExclusao('');
    setModalExclusaoVisivel(true);
  }

  async function confirmarExclusaoConta() {
    if (!user?.email || !senhaExclusao) {
      Alert.alert('Senha necessária', 'Digite sua senha para confirmar a exclusão.');
      return;
    }

    setExcluindo(true);
    try {
      const credencial = EmailAuthProvider.credential(user.email, senhaExclusao);
      await reauthenticateWithCredential(user, credencial);
      await excluirDadosBasicosUsuario(user.uid);
      await deleteUser(user);
      setModalExclusaoVisivel(false);
      router.replace('/login');
    } catch (error: any) {
      if (['auth/invalid-credential', 'auth/wrong-password'].includes(error?.code)) {
        Alert.alert('Senha incorreta', 'Confira a senha e tente novamente.');
      } else if (error?.code === 'auth/too-many-requests') {
        Alert.alert('Muitas tentativas', 'Aguarde alguns minutos antes de tentar novamente.');
      } else if (error?.code === 'permission-denied') {
        Alert.alert('Erro de permissão', 'Não foi possível remover os dados da conta. Tente novamente.');
      } else {
        Alert.alert('Erro', 'Não foi possível excluir sua conta agora.');
      }
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, { paddingTop: r.scaleY(8) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: r.font(20) }]}>Meu Perfil</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            {userData?.avatarUrl ? (
              <Image source={{ uri: userData.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <MaterialIcons name="person" size={r.scaleX(56)} color={Colors.textWhite} />
            )}
          </View>
        </View>

        <Text style={[styles.name, { fontSize: r.font(24) }]}>{userData?.nome || 'Usuário'}</Text>

        <TouchableOpacity style={styles.editBtn} activeOpacity={0.8} onPress={() => router.push('/perfil/editar-perfil')}>
          <MaterialIcons name="edit" size={18} color={Colors.primary} />
          <Text style={[styles.editBtnText, { fontSize: r.font(14) }]}>Editar Perfil</Text>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <InfoRow label="Email" value={userData?.email || 'N/A'} />
          <InfoRow label="Nome de Usuário" value={userData?.nome || 'N/A'} />
          <InfoRow label="Telefone" value={userData?.telefone || 'Não informado'} />
          <InfoRow label="Data de Nascimento" value={userData?.dataNascimento || 'Não informado'} />
          <InfoRow label="Senha" value="*********" />
        </View>

        <View style={styles.requisitosHeader}>
          <Text style={[styles.requisitosTitle, { fontSize: r.font(18) }]}>Minhas Preferências</Text>
          <TouchableOpacity style={styles.editSmallBtn} activeOpacity={0.8} onPress={() => router.push('/perfil/preferencias')}>
            <MaterialIcons name="edit" size={15} color={Colors.textGray} />
            <Text style={[styles.editSmallText, { fontSize: r.font(12) }]}>EDITAR</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tagsRow}>
          {requisitos.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={[styles.tagText, { fontSize: r.font(14) }]}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.dangerZone}>
          <Text style={[styles.dangerTitle, { fontSize: r.font(16) }]}>Conta</Text>
          <Text style={[styles.dangerText, { fontSize: r.font(13) }]}>
            Exclua sua conta apenas se tiver certeza. Esta ação não pode ser desfeita.
          </Text>
          <TouchableOpacity style={styles.deleteAccountBtn} activeOpacity={0.85} onPress={handleExcluirConta}>
            <MaterialIcons name="delete-outline" size={18} color="#FCA5A5" />
            <Text style={[styles.deleteAccountText, { fontSize: r.font(14) }]}>Excluir conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={modalExclusaoVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => !excluindo && setModalExclusaoVisivel(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { fontSize: r.font(19) }]}>Confirmar exclusão</Text>
            <Text style={[styles.modalText, { fontSize: r.font(14) }]}>
              Digite sua senha. Sua conta e seus dados serão excluídos permanentemente.
            </Text>
            <TextInput
              style={[styles.passwordInput, { fontSize: r.font(15) }]}
              placeholder="Senha"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={senhaExclusao}
              onChangeText={setSenhaExclusao}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!excluindo}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalExclusaoVisivel(false)}
                disabled={excluindo}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalDeleteBtn, excluindo && styles.disabledBtn]}
                onPress={confirmarExclusaoConta}
                disabled={excluindo}
              >
                {excluindo ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalDeleteText}>Excluir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  content: { paddingHorizontal: 24, paddingTop: 8, alignItems: 'center' },
  avatarWrapper: { marginBottom: 16, alignItems: 'center' },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(121,116,231,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 55 },
  name: { color: Colors.textWhite, fontWeight: '700', marginBottom: 12 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginBottom: 28,
  },
  editBtnText: { color: Colors.primary },
  infoContainer: { alignSelf: 'stretch' },
  infoRow: { marginBottom: 16 },
  infoLabel: { color: Colors.textWhite, fontWeight: '700' },
  infoValue: { color: Colors.textWhite, opacity: 0.75, marginTop: 2 },
  requisitosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 8,
    marginBottom: 12,
  },
  requisitosTitle: { color: Colors.textWhite, fontWeight: '700' },
  editSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editSmallText: { color: Colors.textGray },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignSelf: 'stretch' },
  tag: {
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
  },
  tagText: { color: Colors.textDark, fontWeight: '600' },
  dangerZone: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.32)',
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: 14,
    padding: 16,
    marginTop: 28,
  },
  dangerTitle: { color: '#FCA5A5', fontWeight: '800', marginBottom: 6 },
  dangerText: { color: Colors.textGray, lineHeight: 18, marginBottom: 12 },
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.45)',
    borderRadius: 24,
    paddingVertical: 12,
  },
  deleteAccountText: { color: '#FCA5A5', fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  modalContent: { backgroundColor: '#292750', borderRadius: 8, padding: 20 },
  modalTitle: { color: Colors.textWhite, fontWeight: '800', marginBottom: 8 },
  modalText: { color: Colors.textGray, lineHeight: 20, marginBottom: 16 },
  passwordInput: {
    color: Colors.textWhite,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 18 },
  modalCancelBtn: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  modalCancelText: { color: Colors.textWhite, fontWeight: '700' },
  modalDeleteBtn: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#DC2626',
  },
  modalDeleteText: { color: '#FFFFFF', fontWeight: '800' },
  disabledBtn: { opacity: 0.6 },
});
