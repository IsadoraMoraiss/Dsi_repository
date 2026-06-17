import { Redirect } from 'expo-router';

export default function LegacyMapaRedirect() {
  return <Redirect href={'/(tabs)/mapa' as any} />;
}
