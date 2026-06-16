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
import { updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { db, isFirebaseConfigured, storage } from '../../services/firebase';
import {
  deleteSupabaseStorageFile,
  uploadImageToSupabaseBucket,
  isSupabaseConfigured as isSupabaseStorageConfigured,
} from '../../services/supabase';
import { salvarPerfilUsuario } from '../../services/usuarios';
import { useResponsive } from '../../utils/responsive';

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatBirthDate(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function Field({ label, value, onChangeText, placeholder, keyboardType }: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  const r = useResponsive();
  return (
    <View style={styles.fieldWrapper}>
      <Text style={[styles.fieldLabel, { fontSize: r.font(14) }]}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, { fontSize: r.font(15) }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textGray}
        keyboardType={keyboardType ?? 'default'}
      />
    </View>
  );
}

export default function EditarPerfilScreen() {
  const router = useRouter();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const { user, userData, refreshUserData } = useAuth();

  const [nome, setNome] = useState(userData?.nome ?? '');
  const [telefone, setTelefone] = useState(formatPhone(userData?.telefone ?? ''));
  const [dataNascimento, setDataNascimento] = useState(formatBirthDate(userData?.dataNascimento ?? ''));
  const [avatarUrl, setAvatarUrl] = useState(userData?.avatarUrl ?? '');
  const [avatarLocalUri, setAvatarLocalUri] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [avatarPreviewVisible, setAvatarPreviewVisible] = useState(false);
  const [avatarDeleted, setAvatarDeleted] = useState(false);
  const [avatarInitialUrl] = useState(userData?.avatarUrl ?? '');
  const [salvando, setSalvando] = useState(false);
  const [enviandoAvatar, setEnviandoAvatar] = useState(false);

  async function handleSelecionarFoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita acesso às fotos para escolher uma imagem de perfil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });

    if (result.canceled) return;
    const uri = result.assets[0]?.uri;
    const base64 = result.assets[0]?.base64 ?? null;
    if (!uri || !base64) {
      Alert.alert('Erro', 'Não foi possível carregar a imagem selecionada.');
      return;
    }

    setAvatarLocalUri(uri);
    setAvatarBase64(base64);
    setAvatarUrl(uri);
  }

  async function fazerUploadAvatar(uri: string | null, base64: string | null, uid: string): Promise<string> {
    if (isSupabaseStorageConfigured) {
      if (!base64) throw new Error('Dados da imagem não disponíveis para upload.');
      const filename = `${Date.now()}-avatar.jpg`;
      return uploadImageToSupabaseBucket('foto-perfil', `usuarios/${uid}/${filename}`, base64);
    }

    if (!uri) throw new Error('URI da imagem não disponível para upload.');
    if (!storage) throw new Error('Firebase Storage não configurado.');
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `${Date.now()}-avatar.jpg`;
    const storageRef = ref(storage, `avatares/${uid}/${filename}`);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  }

  async function handleExcluirAvatar() {
    setAvatarLocalUri(null);
    setAvatarBase64(null);
    setAvatarDeleted(true);
    setAvatarUrl('');
  }

  async function handleSalvar() {
    const nomeTrim = nome.trim();
    if (!nomeTrim) {
      Alert.alert('Atenção', 'O nome não pode estar vazio.');
      return;
    }

    // DEV_FALLBACK: remove after Firebase integration is complete.
    if (!isFirebaseConfigured || !db || !user) {
      Alert.alert('Modo desenvolvimento', 'Perfil simulado. Nada foi salvo no Firebase.');
      router.back();
      return;
    }

    setSalvando(true);
    try {
      let urlFinal = avatarUrl;

      if (avatarDeleted && avatarInitialUrl) {
        try {
          await deleteSupabaseStorageFile(avatarInitialUrl);
        } catch (error) {
          console.warn('[editar-perfil] falha ao excluir avatar antigo:', error);
        }
      }

      if (avatarLocalUri) {
        setEnviandoAvatar(true);
        urlFinal = await fazerUploadAvatar(avatarLocalUri, avatarBase64, user.uid);
        setEnviandoAvatar(false);
        setAvatarUrl(urlFinal);
      } else if (avatarDeleted) {
        urlFinal = '';
      }

      await salvarPerfilUsuario(user.uid, {
        nome: nomeTrim,
        telefone: telefone.trim(),
        dataNascimento: dataNascimento.trim(),
        avatarUrl: urlFinal,
      });
      await updateProfile(user, { displayName: nomeTrim });
      await refreshUserData();
      router.back();
    } catch (error: any) {
      console.error('[editar-perfil]', error);
      setEnviandoAvatar(false);
      Alert.alert('Erro', 'Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, { paddingTop: r.scaleY(8) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: r.font(20) }]}>Editar Perfil</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarWrapper}>
        <TouchableOpacity
          style={styles.avatar}
          activeOpacity={avatarUrl ? 0.8 : 1}
          onPress={() => avatarUrl && setAvatarPreviewVisible(true)}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <MaterialIcons name="person" size={r.scaleX(56)} color={Colors.textWhite} />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarEditBtn} activeOpacity={0.8} onPress={handleSelecionarFoto}>
          <MaterialIcons name="camera-alt" size={16} color={Colors.textWhite} />
        </TouchableOpacity>
      </View>
      <View style={styles.avatarActionsRow}>
        {avatarUrl ? (
          <TouchableOpacity style={styles.avatarActionBtn} onPress={() => setAvatarPreviewVisible(true)}>
            <Text style={styles.avatarActionText}>Visualizar</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={styles.avatarActionBtn} onPress={handleSelecionarFoto}>
          <Text style={styles.avatarActionText}>{avatarUrl || avatarLocalUri ? 'Editar' : 'Adicionar'} foto</Text>
        </TouchableOpacity>
        {(avatarUrl || avatarLocalUri) ? (
          <TouchableOpacity style={styles.avatarActionDeleteBtn} onPress={handleExcluirAvatar}>
            <Text style={styles.avatarActionDeleteText}>Excluir</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <Modal visible={avatarPreviewVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image source={{ uri: avatarUrl }} style={styles.modalImage} />
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setAvatarPreviewVisible(false)}>
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
          <Field label="Nome" value={nome} onChangeText={setNome} placeholder="Seu nome completo" />
          <Field
            label="Email"
            value={userData?.email ?? ''}
            onChangeText={() => {}}
            keyboardType="email-address"
          />
          <Field
            label="Telefone"
            value={telefone}
            onChangeText={(value) => setTelefone(formatPhone(value))}
            placeholder="(xx) xxxxx-xxxx"
            keyboardType="phone-pad"
          />
          <Field
            label="Data de Nascimento"
            value={dataNascimento}
            onChangeText={(value) => setDataNascimento(formatBirthDate(value))}
            placeholder="DD/MM/AAAA"
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={[styles.saveBtn, { marginTop: r.scaleY(12) }, salvando && { opacity: 0.6 }]}
            activeOpacity={0.85}
            onPress={handleSalvar}
            disabled={salvando}
          >
            {salvando ? (
              <>
                <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={[styles.saveBtnText, { fontSize: r.font(16) }]}>
                  {enviandoAvatar ? 'Enviando foto...' : 'Salvando...'}
                </Text>
              </>
            ) : (
              <Text style={[styles.saveBtnText, { fontSize: r.font(16) }]}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  content: { paddingHorizontal: 24, paddingTop: 8, alignItems: 'center' },
  avatarWrapper: { marginBottom: 32, position: 'relative' },
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
  avatarImage: { width: '100%', height: '100%' },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldWrapper: { alignSelf: 'stretch', marginBottom: 20 },
  fieldLabel: { color: Colors.textWhite, fontWeight: '700', marginBottom: 8 },
  fieldInput: {
    color: Colors.textDark,
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  avatarActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
    marginBottom: 24,
  },
  avatarActionBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  avatarActionDeleteBtn: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  avatarActionText: { color: Colors.textWhite, fontWeight: '700' },
  avatarActionDeleteText: { color: '#F87171', fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#111116',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 360,
    resizeMode: 'cover',
  },
  modalCloseBtn: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalCloseText: {
    color: Colors.textWhite,
    fontWeight: '700',
  },
  saveBtn: {
    alignSelf: 'stretch',
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700' },
});
