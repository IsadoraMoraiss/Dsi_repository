import { Redirect, useLocalSearchParams } from 'expo-router';

export default function LegacyCityDetailsRedirect() {
  const { cityId, id } = useLocalSearchParams<{ cityId?: string; id?: string }>();
  const cidadeId = cityId ?? id;

  return (
    <Redirect
      href={{
        pathname: '/detalhes-cidade',
        params: cidadeId ? { id: cidadeId } : undefined,
      }}
    />
  );
}
