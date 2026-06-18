import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRef, useState } from 'react';
import { ActivityIndicator, Animated } from 'react-native';
import AuthLinkAction from '../components/auth/components/AuthLinkAction';
import AuthScreenLayout from '../components/auth/components/AuthScreenLayout';
import FormField from '../components/auth/components/FormField';
import CustomInput from '../components/ui/CustomInput';
import FloatingToast from '../components/ui/FloatingToast';
import PrimaryButton from '../components/ui/PrimaryButton';
import { Colors } from '../constants/Colors';
import { auth, isFirebaseConfigured } from '../services/firebase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RedefinirScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [erroEmail, setErroEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'success'>('error');
  const toastOpacity = useRef(new Animated.Value(0)).current;

  function showToast(message: string, type: 'error' | 'success' = 'error') {
    setToastType(type);
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(3500),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  function concluirEnvio() {
    showToast('E-mail enviado. Verifique também a pasta de spam.');
    setTimeout(() => router.replace('/login'), 1500);
  }

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

    if (!isFirebaseConfigured || !auth) {
      showToast('Firebase não configurado.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, emailTrim);
      concluirEnvio();
    } catch (error: any) {
      const codigo = String(error?.code ?? '');
      const mensagem = String(error?.message ?? '');

      // Em alguns dispositivos o Firebase conclui o envio, mas devolve este código nativo.
      if (codigo.includes('error-code:-26') || mensagem.includes('error-code:-26')) {
        concluirEnvio();
      } else if (codigo === 'auth/too-many-requests') {
        showToast('Muitas solicitações. Aguarde alguns minutos e tente novamente.');
      } else if (codigo === 'auth/network-request-failed') {
        showToast('Verifique sua conexão com a internet.');
      } else {
        showToast('Não foi possível enviar o e-mail agora.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenLayout
      title="Recuperar senha"
      description="Informe seu e-mail para receber o link seguro de redefinição."
      primaryAction={
        loading
          ? <ActivityIndicator color={Colors.primary} />
          : <PrimaryButton title="Enviar e-mail" onPress={handleEnviarEmail} />
      }
      footerAction={<AuthLinkAction label="Voltar ao Login" onPress={() => router.replace('/login')} />}
      overlay={<FloatingToast message={toastMessage} opacity={toastOpacity} type={toastType} />}
    >
      <FormField error={erroEmail}>
        <CustomInput
          placeholder="E-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </FormField>
    </AuthScreenLayout>
  );
}
    </AuthScreenLayout>
  );
}
