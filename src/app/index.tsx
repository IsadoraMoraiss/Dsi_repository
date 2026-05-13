import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import Logo from '../../assets/icons/logo.png';
import SplashLogoScreen from '../components/ui/SplashLogoScreen';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  const logoSource = Logo;

  return <SplashLogoScreen logoSource={logoSource} />;
}
