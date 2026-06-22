import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../services/firebase';
import AuthLinkAction from '../components/auth/components/AuthLinkAction';
import AuthScreenLayout from '../components/auth/components/AuthScreenLayout';
import FormField from '../components/auth/components/FormField';
import RememberOptionsRow from '../components/auth/components/RememberOptionsRow';
import FloatingToast from '../components/ui/FloatingToast';
import CustomInput from '../components/ui/CustomInput';
import PrimaryButton from '../components/ui/PrimaryButton';
import { Colors } from '../constants/Colors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroEmail, setErroEmail] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [loading, setLoading] = useState(false);

  const [toastMessage, setToastMessage] = useState('Usuário ou senha inválidos.');
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(message?: string) {
    if (message) setToastMessage(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  async function handleLogin() {
    // 1. Validacao local — nao chama Firebase se algo falhar aqui
    let valido = true;
    const emailTrim = email.trim();

    if (!emailTrim) {
      setErroEmail('O e-mail é obrigatório.');
      valido = false;
    } else if (!EMAIL_REGEX.test(emailTrim)) {
      setErroEmail('Informe um e-mail válido.');
      valido = false;
    } else {
      setErroEmail('');
    }

    if (!senha) {
      setErroSenha('A senha é obrigatória.');
      valido = false;
    } else if (senha.length < 6) {
      setErroSenha('A senha deve ter no mínimo 6 caracteres.');
      valido = false;
    } else {
      setErroSenha('');
    }

    if (!valido) return;

    // DEV_FALLBACK: remove after Firebase integration is complete.
    // Modo desenvolvimento: Firebase ausente -> nao chama Auth, segue para /home
    // para permitir testar navegacao do app sem credenciais reais.
    if (!isFirebaseConfigured || !auth || !db) {
      showToast('Modo desenvolvimento: Firebase não configurado.');
      setTimeout(() => router.replace('/home'), 600);
      return;
    }

    // 3. Fluxo real do Firebase
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, emailTrim, senha);
      const user = credential.user;

      await user.reload();
      if (!user.emailVerified) {
        try {
          await sendEmailVerification(user);
        } catch (verificationError: any) {
          if (verificationError?.code !== 'auth/too-many-requests') {
            console.warn('[login] falha ao reenviar verificacao:', verificationError);
          }
        }
        await signOut(auth);
        showToast('Verifique seu e-mail. Um novo link foi enviado.');
        setTimeout(() => router.replace({ pathname: '/verificacao', params: { email: emailTrim } }), 1500);
        return;
      }

      const userRef = doc(db, 'usuarios', user.uid);
      const snap = await getDoc(userRef);

      let docData: any = {};
      if (snap.exists()) {
        docData = snap.data();
      } else {
        docData = {
          nome: user.displayName || '',
          email: user.email || emailTrim,
          createdAt: new Date().toISOString(),
          preferenciasConcluidas: false,
          preferencias: {},
          emailVerificado: false,
        };
        await setDoc(userRef, docData);
      }

      if (docData.emailVerificado !== true) {
        await setDoc(userRef, { emailVerificado: true }, { merge: true });
      }

      if (docData.preferenciasConcluidas) {
        router.replace('/home');
      } else {
        router.replace('/perfil/preferencias');
      }
    } catch (error: any) {
      let mensagem = 'Erro ao fazer login. Tente novamente.';

      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          mensagem = 'Usuário ou senha inválidos.';
          break;
        case 'auth/invalid-email':
          mensagem = 'Informe um e-mail válido.';
          break;
        case 'auth/network-request-failed':
          mensagem = 'Verifique sua conexão com a internet.';
          break;
        case 'auth/too-many-requests':
          mensagem = 'Muitas tentativas. Tente novamente mais tarde.';
          break;
      }

      showToast(mensagem);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenLayout
      title="Login"
      primaryAction={
        loading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <PrimaryButton title="Login" onPress={handleLogin} />
        )
      }
      footerAction={<AuthLinkAction label="Criar conta" onPress={() => router.push('/cadastro')} />}
      overlay={<FloatingToast message={toastMessage} opacity={toastOpacity} />}
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

      <FormField error={erroSenha}>
        <CustomInput
          placeholder="Senha"
          secureTextEntry={!mostrarSenha}
          value={senha}
          onChangeText={setSenha}
          right={
            <Pressable onPress={() => setMostrarSenha((v) => !v)}>
              <MaterialIcons
                name={mostrarSenha ? 'visibility-off' : 'visibility'}
                size={22}
                color={Colors.textGray}
              />
            </Pressable>
          }
        />
      </FormField>

      <RememberOptionsRow
        rememberValue={lembrar}
        onChangeRemember={setLembrar}
        onPressForgot={() => router.push('/redefinir')}
      />
    </AuthScreenLayout>
  );
}
