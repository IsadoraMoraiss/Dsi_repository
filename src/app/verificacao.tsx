import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated } from 'react-native';
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../services/firebase';
import { createAndSendCode, validateCode } from '../services/authCodes';
import AuthLinkAction from '../components/auth/components/AuthLinkAction';
import AuthScreenLayout from '../components/auth/components/AuthScreenLayout';
import FloatingToast from '../components/ui/FloatingToast';
import PrimaryButton from '../components/ui/PrimaryButton';
import OtpInputRow from '../components/auth/components/OtpInputRow';
import { Colors } from '../constants/Colors';

const COOLDOWN_SECONDS = 60;

/**
 * Tela — Verificação de E-mail via OTP Numérico
 */
export default function VerificacaoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email || '';

  const [codigo, setCodigo] = useState('');
  const [loadingVerificar, setLoadingVerificar] = useState(false);
  const [loadingReenviar, setLoadingReenviar] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!email) {
      showToast('E-mail não fornecido. Faça login novamente.');
      setTimeout(() => router.replace('/login'), 2000);
    }
  }, [email]);

  function showToast(message: string) {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  function startCooldown() {
    setCooldown(COOLDOWN_SECONDS);
    cooldownTimer.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownTimer.current) clearInterval(cooldownTimer.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, []);

  async function handleVerificar() {
    if (codigo.length < 6) {
      showToast('Digite o código de 6 dígitos.');
      return;
    }

    if (!isFirebaseConfigured || !db) {
      showToast('Modo desenvolvimento: Firebase não configurado.');
      return;
    }

    setLoadingVerificar(true);
    try {
      const isValid = await validateCode(email, codigo, 'verification');
      
      if (isValid) {
        // Encontrar usuário pelo e-mail e atualizar campo emailVerificado para true
        const q = query(collection(db, 'usuarios'), where('email', '==', email));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          await updateDoc(userDoc.ref, { emailVerificado: true });
        }
        
        showToast('E-mail verificado com sucesso!');
        setTimeout(() => router.replace('/login'), 1500);
      } else {
        showToast('Código inválido ou expirado. Verifique novamente.');
      }
    } catch (error: any) {
      console.error('[verificacao] handleVerificar', error);
      if (error?.code === 'auth/network-request-failed' || error?.message?.includes('network')) {
        showToast('Verifique sua conexão com a internet.');
      } else {
        showToast('Erro ao verificar. Tente novamente.');
      }
    } finally {
      setLoadingVerificar(false);
    }
  }

  async function handleReenviar() {
    if (cooldown > 0) return;

    if (!isFirebaseConfigured || !db) {
      showToast('Modo desenvolvimento: Firebase não configurado.');
      return;
    }

    setLoadingReenviar(true);
    try {
      await createAndSendCode(email, 'verification');
      startCooldown();
      showToast('Novo código enviado para o seu e-mail!');
    } catch (error: any) {
      console.error('[verificacao] handleReenviar', error);
      if (error?.code === 'auth/network-request-failed' || error?.message?.includes('network')) {
        showToast('Verifique sua conexão com a internet.');
      } else {
        showToast('Erro ao reenviar e-mail. Tente novamente.');
      }
    } finally {
      setLoadingReenviar(false);
    }
  }

  const reenviarLabel = cooldown > 0 ? `Reenviar código (${cooldown}s)` : 'Reenviar código';

  return (
    <AuthScreenLayout
      title="Verificação de E-mail"
      titleAlign="center"
      description={`Digite o código de 6 dígitos que enviamos para ${email}.`}
      primaryAction={
        loadingVerificar ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <PrimaryButton title="Verificar Código" onPress={handleVerificar} />
        )
      }
      footerAction={
        loadingReenviar ? (
          <ActivityIndicator color={Colors.primary} size="small" />
        ) : (
          <AuthLinkAction label={reenviarLabel} onPress={handleReenviar} />
        )
      }
      overlay={<FloatingToast message={toastMessage} opacity={toastOpacity} />}
    >
      <OtpInputRow length={6} value={codigo} onChange={setCodigo} />
    </AuthScreenLayout>
  );
}
