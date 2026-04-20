import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '../constants/colors';

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Brasil em Foco</Text>
      <Text style={styles.subtitle}>Fluxo inicial do app</Text>

      <Link href="/login" style={styles.primaryLink}>
        Entrar
      </Link>

      <Link href="/cadastro" style={styles.secondaryLink}>
        Criar conta
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.background,
  },
  title: {
    color: Colors.textWhite,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    color: Colors.textWhite,
    opacity: 0.85,
    marginBottom: 28,
    fontSize: 14,
  },
  primaryLink: {
    color: Colors.textWhite,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    overflow: 'hidden',
    marginBottom: 12,
    minWidth: 170,
    textAlign: 'center',
    fontWeight: '600',
  },
  secondaryLink: {
    color: Colors.textWhite,
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});
