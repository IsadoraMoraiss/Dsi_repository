import { useRouter } from 'expo-router';
import { useState } from 'react';
import AuthLinkAction from '../components/auth/components/AuthLinkAction';
import AuthScreenLayout from '../components/auth/components/AuthScreenLayout';
import FormField from '../components/auth/components/FormField';
import CustomInput from '../components/ui/CustomInput';
import PrimaryButton from '../components/ui/PrimaryButton';

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
    <AuthScreenLayout
      title="Redefinir Senha"
      titleAlign="center"
      description="Informe seu e-mail e enviaremos um código para redefinir sua senha."
      primaryAction={<PrimaryButton title="Enviar codigo" onPress={handleEnviar} />}
      footerAction={<AuthLinkAction label="Voltar ao Login" onPress={() => router.push('/login')} />}
    >
      <FormField>
        <CustomInput
          placeholder="E-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </FormField>
    </AuthScreenLayout>
  );
}
