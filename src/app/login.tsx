import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import CustomInput from '../components/CustomInput';
import PrimaryButton from '../components/PrimaryButton';
import { Colors } from '../constants/colors';

/**
 * Tela 2 – Login
 */
export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [meLembre, setMeLembre] = useState(false);

  function handleLogin() {
    router.replace('/home');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.titulo}>Login</Text>

        <View style={styles.formContainer}>
          <CustomInput
            placeholder="abc@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <CustomInput
            placeholder="Senha"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        <View style={styles.rowOptions}>
          <View style={styles.switchRow}>
            <Switch
              value={meLembre}
              onValueChange={setMeLembre}
              trackColor={{ false: Colors.inputBorder, true: Colors.primary }}
              thumbColor={Colors.textWhite}
            />
            <Text style={styles.switchLabel}>Me Lembre</Text>
          </View>
          <Pressable onPress={() => router.push('/redefinir')}>
            <Text style={styles.linkInline}>Esqueceu a senha?</Text>
          </Pressable>
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton title="LOGIN" onPress={handleLogin} />
        </View>

        <View style={styles.separadorContainer}>
          <View style={styles.linha} />
          <Text style={styles.separadorTexto}>OU</Text>
          <View style={styles.linha} />
        </View>

        <View style={styles.socialContainer}>
          <Pressable style={styles.socialButton}>
            <Image
              source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }}
              style={styles.socialIcon}
            />
          </Pressable>
          <Pressable style={styles.socialButton}>
            <Image
              source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/mac-os.png' }}
              style={styles.socialIcon}
            />
          </Pressable>
        </View>

        <View style={styles.rodape}>
          <Text style={styles.rodapeTexto}>Não possui conta? </Text>
          <Pressable onPress={() => router.push('/cadastro')}>
            <Text style={styles.linkDestaque}>Cadastre-se!</Text>
          </Pressable>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 32,
    color: Colors.textWhite,
    marginBottom: 24,
  },
  formContainer: {
    gap: 14,
    marginBottom: 16,
  },
  rowOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    color: Colors.textWhite,
    fontSize: 14,
  },
  linkInline: {
    color: Colors.textWhite,
    fontSize: 14,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  separadorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  linha: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.textWhite,
    opacity: 0.3,
  },
  separadorTexto: {
    color: Colors.textWhite,
    fontSize: 13,
    opacity: 0.7,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 28,
    height: 28,
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rodapeTexto: {
    color: Colors.textWhite,
    fontSize: 14,
    opacity: 0.8,
  },
  linkDestaque: {
    color: '#7B9CFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
