import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '../constants/colors';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home (provisoria)</Text>
      <Text style={styles.subtitle}>Fluxo de autenticacao validado com sucesso.</Text>

      <Link href="/" style={styles.link}>
        Voltar para Splash
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: Colors.textWhite,
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textWhite,
    fontSize: 14,
    marginBottom: 20,
    opacity: 0.9,
    textAlign: 'center',
  },
  link: {
    color: Colors.textWhite,
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});
