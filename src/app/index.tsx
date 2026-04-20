import { Link, Stack } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Colors } from '../constants/colors';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Image
        source={{
          uri: 'https://img.icons8.com/fluency/256/airplane-take-off.png',
        }}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.linksContainer}>
        <Text style={styles.linksTitle}>Atalhos de teste</Text>
        <Link href="/login" style={styles.link}>Login</Link>
        <Link href="/cadastro" style={styles.link}>Cadastro</Link>
        <Link href="/verificacao" style={styles.link}>Verificacao</Link>
        <Link href="/redefinir" style={styles.link}>Redefinir senha</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 180,
  },
  linksContainer: {
    marginTop: 36,
    alignItems: 'center',
    gap: 10,
  },
  linksTitle: {
    color: Colors.textWhite,
    fontSize: 14,
    opacity: 0.8,
  },
  link: {
    color: Colors.textWhite,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
