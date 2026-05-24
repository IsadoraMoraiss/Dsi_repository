import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import Logo from '../../assets/icons/logo.png';
import SplashLogoScreen from '../components/ui/SplashLogoScreen';
import { isFirebaseConfigured } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

const SPLASH_MS = 3000;

export default function SplashScreen() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!splashDone) return;

    // DEV_FALLBACK: remove after Firebase integration is complete.
    // Modo desenvolvimento: sem Firebase nao ha sessao para checar.
    if (!isFirebaseConfigured) {
      router.replace('/login');
      return;
    }

    // Com Firebase: espera AuthContext terminar de carregar (userData inclusive).
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (userData?.preferenciasConcluidas === true) {
      router.replace('/home');
    } else {
      router.replace('/perfil/preferencias');
    }
  }, [splashDone, loading, user, userData, router]);

  return <SplashLogoScreen logoSource={Logo} />;
}
