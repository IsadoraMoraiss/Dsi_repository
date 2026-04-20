import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="location-pin" size={48} color={Colors.textWhite} style={styles.icon} />
        <View style={styles.appNameBox}>
          <Text style={styles.appNameBrasil}>BRASIL</Text>
          <Text style={styles.appNameFoco}>em foco</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 32,
  },
  icon: {
    marginBottom: 2,
  },
  appNameBox: {
    alignItems: 'center',
  },
  appNameBrasil: {
    fontSize: 48,
    color: Colors.textWhite,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  appNameFoco: {
    fontSize: 28,
    color: Colors.textWhite,
    fontWeight: '400',
    marginTop: -4,
    letterSpacing: 1,
  },
});
