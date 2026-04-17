import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import CustomInput from '../components/CustomInput';
import PrimaryButton from '../components/PrimaryButton';
import { Colors } from '../constants/Colors';

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

      <CustomInput
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.buttonContainer}>
        <PrimaryButton title="Enviar codigo" onPress={handleEnviar} />
      </View>

      <Link href="/login" style={styles.link}>
        Voltar ao Login
      </Link>
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
  descricao: {
    fontSize: 14,
    color: Colors.textWhite,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
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
