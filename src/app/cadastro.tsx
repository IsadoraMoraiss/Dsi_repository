import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import CustomInput from '../components/CustomInput';
import PrimaryButton from '../components/PrimaryButton';
import { Colors } from '../constants/colors';

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

      <View style={styles.formContainer}>
        <CustomInput
        placeholder="Nome completo"
        value={nome}
        onChangeText={setNome}
      />

        <View style={styles.inputSpacing} />

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

        <View style={styles.inputSpacing} />

        <CustomInput
        placeholder="Confirmar senha"
        secureTextEntry
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
      />
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton title="Cadastrar" onPress={handleCadastro} />
      </View>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.link}>Já tenho conta</Text>
      </Pressable>
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
    marginBottom: 32,
  },
  formContainer: {
    marginBottom: 24,
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
});
