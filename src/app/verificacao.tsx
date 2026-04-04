import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';

const OTP_LENGTH = 6;

/**
 * Tela 4 – Verificação (OTP)
 */
export default function VerificacaoScreen() {
  const router = useRouter();
  const [codigo, setCodigo] = useState(Array(OTP_LENGTH).fill(''));
  const inputs = useRef<Array<TextInput | null>>([]);

  function handleChange(text: string, index: number) {
    const novosCodigos = [...codigo];
    novosCodigos[index] = text.slice(-1);
    setCodigo(novosCodigos);

    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !codigo[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handleVerificar() {
    // TODO: validar OTP com o backend e navegar para a tela principal
    router.replace('/login');
  }

  function handleReenviar() {
    // TODO: chamar API para reenviar o código OTP
    console.warn('Reenvio de código ainda não implementado.');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.titulo}>Verificação</Text>
      <Text style={styles.descricao}>
        Digite o código de 6 dígitos enviado para o seu e-mail.
      </Text>

      <View style={styles.otpContainer}>
        {codigo.map((digito, i) => (
          <TextInput
            key={i}
            ref={(ref) => {
              inputs.current[i] = ref;
            }}
            style={styles.otpInput}
            value={digito}
            onChangeText={(text) => handleChange(text, i)}
            onKeyPress={({ nativeEvent }) =>
              handleKeyPress(nativeEvent.key, i)
            }
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
          />
        ))}
      </View>

      <Pressable style={styles.botao} onPress={handleVerificar}>
        <Text style={styles.botaoTexto}>Verificar</Text>
      </Pressable>

      <Pressable onPress={handleReenviar}>
        <Text style={styles.link}>Reenviar código</Text>
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 44,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.cinzaMedio,
    borderRadius: 8,
    fontSize: Typography.fontSizeLarge,
    color: Colors.texto,
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
