import { Redirect } from 'expo-router';

export default function LegacyRoteirosRedirect() {
  return <Redirect href={'/(tabs)/roteiros' as any} />;
}
