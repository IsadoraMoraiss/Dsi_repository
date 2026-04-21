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
import CustomInput from '../components/ui/CustomInput';
import PrimaryButton from '../components/ui/PrimaryButton';
import { Colors } from '../constants/Colors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CadastroScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erroNome, setErroNome] = useState('');
  const [erroEmail, setErroEmail] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [erroConfirmar, setErroConfirmar] = useState('');

  function handleCadastro() {
    let valido = true;

    if (!nome.trim()) {
      setErroNome('O nome é obrigatório.');
      valido = false;
    } else {
      setErroNome('');
    }

    if (!email.trim()) {
      setErroEmail('O e-mail é obrigatório.');
      valido = false;
    } else if (!EMAIL_REGEX.test(email.trim())) {
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

    if (!confirmarSenha) {
      setErroConfirmar('Confirme a sua senha.');
      valido = false;
    } else if (confirmarSenha !== senha) {
      setErroConfirmar('As senhas não coincidem.');
      valido = false;
    } else {
      setErroConfirmar('');
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
      <Text style={styles.titulo}>Criar Conta</Text>

      <View style={styles.formContainer}>
        <CustomInput
          placeholder="Nome completo"
          value={nome}
          onChangeText={setNome}
        />
        {!!erroNome && <Text style={styles.erro}>{erroNome}</Text>}

        <View style={styles.inputSpacing} />

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

        <View style={styles.inputSpacing} />

        <CustomInput
          placeholder="Confirmar senha"
          secureTextEntry
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />
        {!!erroConfirmar && <Text style={styles.erro}>{erroConfirmar}</Text>}
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton title="Cadastrar" onPress={handleCadastro} />
      </View>

      <Pressable onPress={() => router.push('/login')}>
        <Text style={styles.link}>Já possui conta? Faça o Login</Text>
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
  erro: {
    color: '#FF4D4D',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
});
