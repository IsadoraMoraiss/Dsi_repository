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
 * Tela 5 – Redefinir Senha
 */
export default function RedefinirScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  function handleEnviar() {
    // TODO: enviar link/OTP de redefinição para o e-mail
    router.push('/verificacao');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.titulo}>Redefinir Senha</Text>
      <Text style={styles.descricao}>
        Informe seu e-mail e enviaremos um código para redefinir sua senha.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor={Colors.cinzaMedio}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Pressable style={styles.botao} onPress={handleEnviar}>
        <Text style={styles.botaoTexto}>Enviar código</Text>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.link}>Voltar ao Login</Text>
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
  descricao: {
    fontSize: Typography.fontSizeBase,
    color: Colors.cinzaMedio,
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
