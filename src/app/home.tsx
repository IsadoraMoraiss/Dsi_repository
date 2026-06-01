import { useMemo, useState } from 'react';
import HomeScreenContent from '../components/home/HomeScreenContent';
import MainTabLayout from '../components/layout/MainTabLayout';
import { Cidade } from '../data/mockCidades';
import { getPoolCidadesRecomendadas } from '../data/cidadesRecomendadas';
import { useAuth } from '../context/AuthContext';
import { useRecentViews } from '../context/RecentViewsContext';
import { rankCitiesByPreferences, sortCitiesByPreferenceRelevance, UserPreferences } from '../utils/preferences';
import { buscarCidadesPorTermo, toCidadeLegacy } from '../utils/cidadeDataset';
import type { CidadeDataset } from '../types/cidadeDataset';

const poolRecomendadas = getPoolCidadesRecomendadas();
const todasCidadesJson = (require('../data/cidades.json') as CidadeDataset[]).map(toCidadeLegacy);

const MAX_RECOMENDADAS = 20;
const MAX_BUSCA = 40;

export default function HomeScreen() {
  const { userData } = useAuth();
  const { recentCidades } = useRecentViews();
  const preferencias = (userData?.preferencias ?? {}) as UserPreferences;

  const recomendadas = useMemo(() => {
    const filtradas = rankCitiesByPreferences(poolRecomendadas, preferencias);
    return filtradas.slice(0, MAX_RECOMENDADAS);
  }, [userData?.preferencias]);

  const [busca, setBusca] = useState('');
  const [resultadoBusca, setResultadoBusca] = useState<Cidade[] | null>(null);

  function handleBusca() {
    const termo = busca.trim();
    if (!termo) {
      setResultadoBusca(null);
      return;
    }

    const matches = buscarCidadesPorTermo(todasCidadesJson, termo, MAX_BUSCA * 2);
    setResultadoBusca(sortCitiesByPreferenceRelevance(matches, preferencias).slice(0, MAX_BUSCA));
  }

  return (
    <MainTabLayout activeTab="explorar">
      <HomeScreenContent
        busca={busca}
        resultadoBusca={resultadoBusca}
        recomendadas={recomendadas}
        ultimas={recentCidades}
        onChangeBusca={(t) => {
          setBusca(t);
          if (!t.trim()) setResultadoBusca(null);
        }}
        onSubmitBusca={handleBusca}
      />
    </MainTabLayout>
  );
}
