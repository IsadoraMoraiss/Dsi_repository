import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/home');
        } else {
          router.replace('/login');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <View style={styles.container}>
      <MaterialIcons name="location-pin" size={64} color={Colors.textWhite} style={styles.icon} />
      <Text style={styles.appName}>Brasil em Foco</Text>
      <ActivityIndicator
        size="large"
        color={Colors.primary}
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  appName: {
    fontSize: 32,
    color: Colors.textWhite,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});
