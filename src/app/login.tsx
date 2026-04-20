import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import CustomInput from '../components/CustomInput';
import PrimaryButton from '../components/PrimaryButton';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';

/**
 * Tela 2 – Login
 */
export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(true);
  const [formError, setFormError] = useState('');

  async function handleLogin() {
    setFormError('');
    if (!email || !senha) {
      setFormError('Preencha todos os campos para continuar.');
      return;
    }
    
    // Realiza o login
    const success = await login(email, senha);
    if (success) {
      router.replace('/home');
    } else {
      setFormError('Erro ao fazer login. Tente novamente.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <MaterialIcons
          name="location-pin"
          size={48}
          color={Colors.textWhite}
          style={styles.icon}
        />
        <View style={styles.appNameBox}>
          <Text style={styles.appNameBrasil}>BRASIL</Text>
          <Text style={styles.appNameFoco}>em foco</Text>
        </View>
      </View>
      <View style={styles.loginRow}>
        <Text style={styles.titulo}>Login</Text>
      </View>

      <View style={styles.formContainer}>
        <CustomInput
          placeholder="E-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.inputSpacing} />

        <CustomInput
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
      </View>

      <View style={styles.toggleRow}>
        <View style={styles.toggleLeft}>
          <Switch
            value={lembrar}
            onValueChange={setLembrar}
            trackColor={{ false: '#E0E0E0', true: Colors.primary }}
            thumbColor={lembrar ? Colors.background : '#fff'}
          />
          <Text style={styles.toggleText}>Me lembre</Text>
        </View>
        <Pressable onPress={() => router.push('/redefinir')} style={styles.forgotRight}>
          <Text style={styles.forgotText}>Esqueceu a senha?</Text>
        </Pressable>
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton title="Login" onPress={handleLogin} />
      </View>
      {formError ? (
        <Text style={styles.formError}>{formError}</Text>
      ) : null}

      <View style={styles.socialDivisor}>
        <Text style={styles.socialText}>Não possui conta?{' '}
          <Text style={styles.cadastroLink} onPress={() => router.push('/cadastro')}>Cadastre-se!</Text>
        </Text>
      </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 32,
  },
  icon: {
    marginBottom: 2,
  },
  appNameBox: {
    alignItems: 'center',
  },
  appNameBrasil: {
    fontSize: 48,
    color: Colors.textWhite,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  appNameFoco: {
    fontSize: 28,
    color: Colors.textWhite,
    fontWeight: '400',
    marginTop: -4,
    letterSpacing: 1,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: 24,
    paddingLeft: 4,
  },
  titulo: {
    fontSize: 22,
    color: Colors.textWhite,
    textAlign: 'left',
    fontWeight: 'bold',
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
    marginVertical: 32,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginTop: 8,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    color: Colors.textWhite,
    fontSize: 15,
    marginLeft: 8,
    fontWeight: '500',
  },
  forgotRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  forgotText: {
    color: Colors.textWhite,
    fontSize: 15,
    fontWeight: '400',
    textDecorationLine: 'none',
  },
  socialDivisor: {
    marginTop: 32,
    alignItems: 'center',
  },
  socialText: {
    color: Colors.textGray,
    fontSize: 15,
  },
  cadastroLink: {
    color: '#4F6BED',
    fontWeight: 'bold',
    textDecorationLine: 'none',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 16,
  },
  formError: {
    color: 'red',
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
