import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AuthLinkAction from '../components/auth/components/AuthLinkAction';
import AuthScreenLayout from '../components/auth/components/AuthScreenLayout';
import FormField from '../components/auth/components/FormField';
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
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  function handleCadastro() {
    let valido = true;

    if (!nome.trim()) {
      setErroNome('O nome e obrigatorio.');
      valido = false;
    } else {
      setErroNome('');
    }

    if (!email.trim()) {
      setErroEmail('O e-mail e obrigatorio.');
      valido = false;
    } else if (!EMAIL_REGEX.test(email.trim())) {
      setErroEmail('Informe um e-mail valido.');
      valido = false;
    } else {
      setErroEmail('');
    }

    if (!senha) {
      setErroSenha('A senha e obrigatoria.');
      valido = false;
    } else if (senha.length < 6) {
      setErroSenha('A senha deve ter no minimo 6 caracteres.');
      valido = false;
    } else {
      setErroSenha('');
    }

    if (!confirmarSenha) {
      setErroConfirmar('Confirme a sua senha.');
      valido = false;
    } else if (confirmarSenha !== senha) {
      setErroConfirmar('As senhas nao coincidem.');
      valido = false;
    } else {
      setErroConfirmar('');
    }

    if (valido) {
      router.replace('/home');
    }
  }

  return (
    <AuthScreenLayout
      title="Cadastro"
      primaryAction={<PrimaryButton title="Cadastrar" onPress={handleCadastro} />}
      footerAction={<AuthLinkAction label="Ja possui conta? Faca o Login" onPress={() => router.push('/login')} />}
    >
      <FormField error={erroNome}>
        <CustomInput
          placeholder="Nome completo"
          value={nome}
          onChangeText={setNome}
        />
      </FormField>

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

      <FormField error={erroConfirmar}>
        <CustomInput
          placeholder="Confirmar senha"
          secureTextEntry={!mostrarConfirmar}
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          right={
            <Pressable onPress={() => setMostrarConfirmar((v) => !v)}>
              <MaterialIcons
                name={mostrarConfirmar ? 'visibility-off' : 'visibility'}
                size={22}
                color={Colors.textGray}
              />
            </Pressable>
          }
        />
      </FormField>
    </AuthScreenLayout>
  );
}
