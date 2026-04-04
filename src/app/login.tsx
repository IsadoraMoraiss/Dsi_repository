import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';

/**
 * Tela 2 – Login
 */
export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  function handleLogin() {
    // TODO: implementar autenticação e navegar para a tela principal
    // router.replace('/(home)');
    console.warn('Login ainda não implementado.');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.titulo}>Brasil em Foco</Text>
      <Text style={styles.subtitulo}>Acesse sua conta</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor={Colors.cinzaMedio}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor={Colors.cinzaMedio}
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <Pressable style={styles.botao} onPress={handleLogin}>
        <Text style={styles.botaoTexto}>Entrar</Text>
      </Pressable>

      <Pressable onPress={() => router.push('/redefinir')}>
        <Text style={styles.link}>Esqueceu a senha?</Text>
      </Pressable>

      <Pressable onPress={() => router.push('/cadastro')}>
        <Text style={styles.link}>Criar conta</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.branco,
    padding: 24,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: Typography.fontSizeTitle,
    fontWeight: Typography.fontWeightBold,
    color: Colors.verde,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: Typography.fontSizeMedium,
    color: Colors.texto,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.cinzaMedio,
    borderRadius: 8,
    padding: 12,
    fontSize: Typography.fontSizeBase,
    color: Colors.texto,
    marginBottom: 16,
  },
  botao: {
    backgroundColor: Colors.verde,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  botaoTexto: {
    color: Colors.branco,
    fontSize: Typography.fontSizeMedium,
    fontWeight: Typography.fontWeightBold,
  },
  link: {
    color: Colors.azul,
    fontSize: Typography.fontSizeBase,
    textAlign: 'center',
    marginTop: 8,
  },
});
