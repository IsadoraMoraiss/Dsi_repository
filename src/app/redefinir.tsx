import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { isFirebaseConfigured } from '../services/firebase';
import { createAndSendCode, validateCode } from '../services/authCodes';
import AuthLinkAction from '../components/auth/components/AuthLinkAction';
import AuthScreenLayout from '../components/auth/components/AuthScreenLayout';
import FormField from '../components/auth/components/FormField';
import CustomInput from '../components/ui/CustomInput';
import FloatingToast from '../components/ui/FloatingToast';
import PrimaryButton from '../components/ui/PrimaryButton';
import OtpInputRow from '../components/auth/components/OtpInputRow';
import { Colors } from '../constants/Colors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Etapa = 'email' | 'codigo' | 'novaSenha';

/**
 * Tela — Recuperação de Senha (3 etapas com OTP numérico)
 */
export default function RedefinirScreen() {
  const router = useRouter();

  const [etapa, setEtapa] = useState<Etapa>('email');
  const [loading, setLoading] = useState(false);

  // Etapa 1
  const [email, setEmail] = useState('');
  const [erroEmail, setErroEmail] = useState('');

  // Etapa 2
  const [codigo, setCodigo] = useState('');

  // Etapa 3
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erroNovaSenha, setErroNovaSenha] = useState('');
  const [erroConfirmar, setErroConfirmar] = useState('');
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;

  function showToast(message: string) {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  // ─── Etapa 1: Enviar e-mail ────────────────────────────────────────────────

  async function handleEnviarEmail() {
    const emailTrim = email.trim();

    if (!emailTrim) {
      setErroEmail('O e-mail é obrigatório.');
      return;
    }
    if (!EMAIL_REGEX.test(emailTrim)) {
      setErroEmail('Informe um e-mail válido.');
      return;
    }
    setErroEmail('');

    if (!isFirebaseConfigured) {
      showToast('Modo desenvolvimento: Firebase não configurado.');
      return;
    }

    setLoading(true);
    try {
      await createAndSendCode(emailTrim, 'resetPassword');
      setEtapa('codigo');
    } catch (error: any) {
      console.error('[redefinir] handleEnviarEmail', error);
      if (error?.code === 'auth/network-request-failed' || error?.message?.includes('network')) {
        showToast('Verifique sua conexão com a internet.');
      } else {
        showToast('Erro ao enviar e-mail. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  // ─── Etapa 2: Validar código ───────────────────────────────────────────────

  async function handleValidarCodigo() {
    if (codigo.length < 6) {
      showToast('Digite o código de 6 dígitos.');
      return;
    }

    if (!isFirebaseConfigured) {
      showToast('Modo desenvolvimento: Firebase não configurado.');
      return;
    }

    setLoading(true);
    try {
      const isValid = await validateCode(email, codigo, 'resetPassword');
      if (isValid) {
        setEtapa('novaSenha');
      } else {
        showToast('Código inválido ou expirado. Tente novamente.');
      }
    } catch (error: any) {
      console.error('[redefinir] handleValidarCodigo', error);
      if (error?.code === 'auth/network-request-failed' || error?.message?.includes('network')) {
        showToast('Verifique sua conexão com a internet.');
      } else {
        showToast('Erro ao validar código. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  // ─── Etapa 3: Confirmar nova senha ─────────────────────────────────────────

  async function handleConfirmarSenha() {
    let valido = true;

    if (!novaSenha) {
      setErroNovaSenha('A nova senha é obrigatória.');
      valido = false;
    } else if (novaSenha.length < 6) {
      setErroNovaSenha('A senha deve ter no mínimo 6 caracteres.');
      valido = false;
    } else {
      setErroNovaSenha('');
    }

    if (!confirmarSenha) {
      setErroConfirmar('Confirme a nova senha.');
      valido = false;
    } else if (confirmarSenha !== novaSenha) {
      setErroConfirmar('As senhas não coincidem.');
      valido = false;
    } else {
      setErroConfirmar('');
    }

    if (!valido) return;

    setLoading(true);
    try {
      // NOTA CRÍTICA: Sem usar a action URL do Firebase, precisamos de um backend
      // (Admin SDK) para atualizar a senha do usuário, já que ele não está logado.
      // Aqui simularemos o sucesso por se tratar apenas do frontend.
      console.log(`[SIMULAÇÃO DE BACKEND] Atualizando senha do usuário ${email} para ${novaSenha}`);
      
      showToast('Senha redefinida com sucesso! Faça o login.');
      setTimeout(() => router.replace('/login'), 2000);
    } catch (error: any) {
      console.error('[redefinir] handleConfirmarSenha', error);
      if (error?.code === 'auth/network-request-failed' || error?.message?.includes('network')) {
        showToast('Verifique sua conexão com a internet.');
      } else {
        showToast('Erro ao redefinir a senha. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  // ─── Config por etapa ──────────────────────────────────────────────────────

  const configEtapa = {
    email: {
      title: 'Recuperar Senha',
      description: 'Informe seu e-mail e enviaremos um código numérico para redefinir a sua senha.',
      onPrimary: handleEnviarEmail,
      primaryLabel: 'Enviar Código',
    },
    codigo: {
      title: 'Verificar Código',
      description: `Digite o código de 6 dígitos que enviamos para ${email}.`,
      onPrimary: handleValidarCodigo,
      primaryLabel: 'Verificar Código',
    },
    novaSenha: {
      title: 'Nova Senha',
      description: 'Escolha uma senha forte para proteger sua conta.',
      onPrimary: handleConfirmarSenha,
      primaryLabel: 'Confirmar Senha',
    },
  } as const;

  const { title, description, onPrimary, primaryLabel } = configEtapa[etapa];

  return (
    <AuthScreenLayout
      title={title}
      titleAlign="center"
      description={description}
      primaryAction={
        loading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <PrimaryButton title={primaryLabel} onPress={onPrimary} />
        )
      }
      footerAction={
        <AuthLinkAction label="Voltar ao Login" onPress={() => router.replace('/login')} />
      }
      overlay={<FloatingToast message={toastMessage} opacity={toastOpacity} />}
    >
      {etapa === 'email' && (
        <FormField error={erroEmail}>
          <CustomInput
            placeholder="E-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </FormField>
      )}

      {etapa === 'codigo' && (
        <OtpInputRow length={6} value={codigo} onChange={setCodigo} />
      )}

      {etapa === 'novaSenha' && (
        <>
          <FormField error={erroNovaSenha}>
            <CustomInput
              placeholder="Nova senha"
              secureTextEntry={!mostrarNovaSenha}
              value={novaSenha}
              onChangeText={setNovaSenha}
              right={
                <Pressable onPress={() => setMostrarNovaSenha((v) => !v)}>
                  <MaterialIcons
                    name={mostrarNovaSenha ? 'visibility-off' : 'visibility'}
                    size={22}
                    color={Colors.textGray}
                  />
                </Pressable>
              }
            />
          </FormField>

          <FormField error={erroConfirmar}>
            <CustomInput
              placeholder="Confirmar nova senha"
              secureTextEntry={!mostrarConfirmar}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              right={
                <Pressable onPress={() => setMostrarConfirmar((v) => !v)}>
                  <MaterialIcons
                    name={mostrarConfirmar ? 'visibility-off' : 'visibility'}
                    size={22}
                    color={Colors.textGray}
                  />
                </Pressable>
              }
            />
          </FormField>
        </>
      )}
    </AuthScreenLayout>
  );
}
