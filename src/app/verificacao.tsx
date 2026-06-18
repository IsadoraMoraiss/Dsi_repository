import { useLocalSearchParams, useRouter } from 'expo-router';
import { Linking } from 'react-native';
import AuthLinkAction from '../components/auth/components/AuthLinkAction';
import AuthScreenLayout from '../components/auth/components/AuthScreenLayout';
import PrimaryButton from '../components/ui/PrimaryButton';

export default function VerificacaoScreen() {
  const router = useRouter();
  const { email = '' } = useLocalSearchParams<{ email?: string }>();

  return (
    <AuthScreenLayout
      title="Verifique seu e-mail"
      titleAlign="center"
      description={
        email
          ? `Enviamos um link de confirmação para ${email}. Abra o link e depois volte para fazer login.`
          : 'Abra o link de confirmação enviado pelo Firebase e depois volte para fazer login.'
      }
      primaryAction={<PrimaryButton title="Abrir aplicativo de e-mail" onPress={() => Linking.openURL('mailto:')} />}
      footerAction={<AuthLinkAction label="Voltar ao Login" onPress={() => router.replace('/login')} />}
    />
  );
}
