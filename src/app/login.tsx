import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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

  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast() {
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

  function handleLogin() {
    let valido = true;
    const emailValido = EMAIL_REGEX.test(email.trim());

    if (!email.trim()) {
      setErroEmail('O e-mail é obrigatório.');
      valido = false;
    } else if (!emailValido) {
      setErroEmail('Informe um e-mail válido.');
      valido = false;
    } else {
      setErroEmail('');
    }

    if (!senha) {
      setErroSenha('A senha é obrigatória.');
      valido = false;
    } else if (emailValido && senha.length < 6) {
      setErroSenha('');
      showToast();
      return;
    } else {
      setErroSenha('');
    }

    if (valido) {
      router.replace('/home');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.titulo}>Login</Text>
      <Text style={styles.subtitulo}>Acesse sua conta</Text>

      <View style={styles.formContainer}>
        <CustomInput
          placeholder="E-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        {!!erroEmail && <Text style={styles.erro}>{erroEmail}</Text>}

        <View style={styles.inputSpacing} />

        <CustomInput
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
        {!!erroSenha && <Text style={styles.erro}>{erroSenha}</Text>}
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton title="Login" onPress={handleLogin} />
      </View>

      <Pressable onPress={() => router.push('/cadastro')}>
        <Text style={styles.link}>Criar conta</Text>
      </Pressable>

      <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
        <Text style={styles.toastTexto}>Usuário ou senha inválidos</Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingTop: 96,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 32,
    color: Colors.textWhite,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: Colors.textWhite,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
  },
  formContainer: {
    marginBottom: 22,
  },
  inputSpacing: {
    height: 14,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  link: {
    color: Colors.textWhite,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  erro: {
    color: '#FF4D4D',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  toast: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    backgroundColor: '#1a1a4e',
    borderWidth: 1,
    borderColor: '#FF4D4D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  toastTexto: {
    color: '#FF4D4D',
    fontSize: 14,
    fontWeight: '600',
  },
});
