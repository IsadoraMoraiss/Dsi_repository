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
 * Tela 3 – Cadastro
 */
export default function CadastroScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  function handleCadastro() {
    // TODO: implementar criação de conta e enviar OTP
    router.push('/verificacao');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.titulo}>Criar Conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        placeholderTextColor={Colors.cinzaMedio}
        value={nome}
        onChangeText={setNome}
      />

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

      <TextInput
        style={styles.input}
        placeholder="Confirmar senha"
        placeholderTextColor={Colors.cinzaMedio}
        secureTextEntry
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
      />

      <Pressable style={styles.botao} onPress={handleCadastro}>
        <Text style={styles.botaoTexto}>Cadastrar</Text>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.link}>Já tenho conta</Text>
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
