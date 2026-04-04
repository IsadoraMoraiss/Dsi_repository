import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';

/**
 * Tela 1 – Splash Screen
 * Exibe a logo do aplicativo e redireciona para o Login.
 */
export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      {/* Substitua pelo componente <Image> com a logo real em assets/ */}
      <Text style={styles.titulo}>Brasil em Foco</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.verde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: Typography.fontSizeTitle,
    fontWeight: Typography.fontWeightBold,
    color: Colors.branco,
  },
});
