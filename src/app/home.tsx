import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '../constants/colors';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Autenticacao concluida com sucesso.</Text>

      <Link href="/login" style={styles.link}>
        Sair
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
    marginBottom: 24,
    fontSize: 14,
  },
  link: {
    color: Colors.textWhite,
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});
