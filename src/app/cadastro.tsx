import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { Colors } from '../constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

/**
 * Tela 3 – Cadastro
 */
export default function CadastroScreen() {
  const router = useRouter();
  const { cadastro } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [emailError, setEmailError] = useState('');
  const [senhaError, setSenhaError] = useState('');
  const [formError, setFormError] = useState('');
  const [lembrar, setLembrar] = useState(false);

  function validarSenha(senha: string) {
    const tem8Caracteres = senha.length === 8;
    const temMaiuscula = /[A-Z]/.test(senha);
    const temEspecial = /[^A-Za-z0-9]/.test(senha);
    return tem8Caracteres && temMaiuscula && temEspecial;
  }

  function validarEmail(email: string) {
    return /@gmail\.com$|@hotmail\.com$/i.test(email);
  }

  useEffect(() => {
    if (email.length === 0) {
      setEmailError('');
    } else if (!validarEmail(email)) {
      setEmailError('O e-mail deve ser do domínio @gmail.com ou @hotmail.com.');
    } else {
      setEmailError('');
    }
  }, [email]);

  useEffect(() => {
    if (senha.length === 0) {
      setSenhaError('');
    } else if (!validarSenha(senha)) {
      setSenhaError('A senha deve ter exatamente 8 caracteres, pelo menos uma letra maiúscula e um caractere especial.');
    } else {
      setSenhaError('');
    }
  }, [senha]);

  async function handleCadastro() {
    setFormError('');
    // Verifica se todos os campos estão preenchidos
    if (!nome || !email || !senha || !confirmarSenha) {
      setFormError('Preencha todos os campos para continuar.');
      return;
    }
    // Verifica se há erros de validação
    if (emailError || senhaError) {
      return;
    }
    // Verifica se as senhas coincidem
    if (senha !== confirmarSenha) {
      setSenhaError('As senhas não coincidem.');
      return;
    }
    setSenhaError(''); // limpa erro de senha se tudo ok
    
    // Realiza o cadastro
    const success = await cadastro(nome, email, senha);
    if (success) {
      router.replace('/verificacao');
    } else {
      setFormError('Erro ao realizar cadastro. Tente novamente.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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
          <View style={styles.tituloBox}>
            <Text style={styles.tituloCaps}>BRASIL</Text>
            <Text style={styles.tituloFoco}>em foco</Text>
          </View>
        </View>
        <View style={styles.loginRow}>
          <Text style={styles.titulo}>Criar Conta</Text>
        </View>

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
          {emailError ? (
            <Text style={styles.emailError}>{emailError}</Text>
          ) : null}

          <View style={styles.inputSpacing} />

          <CustomInput
            placeholder="Senha"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
          {senhaError ? (
            <Text style={styles.senhaError}>{senhaError}</Text>
          ) : null}

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
        {formError ? (
          <Text style={styles.formError}>{formError}</Text>
        ) : null}
        <View style={styles.socialDivisor}>
          <Text style={styles.socialText}>Já possui uma conta?{' '}
            <Text style={styles.cadastroLink} onPress={() => router.back()}>Faça o login!</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 32,
  },
  icon: {
    marginBottom: 0,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: 24,
    paddingLeft: 4,
  },
  tituloBox: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 0,
  },
  tituloCaps: {
    fontSize: 48,
    color: Colors.textWhite,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  tituloFoco: {
    fontSize: 28,
    color: Colors.textWhite,
    fontWeight: '400',
    marginTop: -6,
    letterSpacing: 1,
  },
  titulo: {
    fontSize: 22,
    color: Colors.textWhite,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputSpacing: {
    height: 14,
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  cadastroLink: {
    color: '#4F6BED',
    fontWeight: 'bold',
    textDecorationLine: 'none',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 16,
  },
  emailError: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  senhaError: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  formError: {
    color: 'red',
    fontSize: 15,
    marginTop: 4,
    marginLeft: 4,
    textAlign: 'center',
    fontWeight: 'bold',
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
  socialDivisor: {
    marginTop: 32,
    alignItems: 'center',
  },
  socialText: {
    color: Colors.textGray,
    fontSize: 15,
  },
});
