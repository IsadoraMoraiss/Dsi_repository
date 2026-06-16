/**
 * (tabs)/explorar.tsx
 *
 * Tela principal "Explorar" — aba gerenciada pelo Tab Navigator nativo.
 */

import { useMemo, useState } from 'react';
import HomeScreenContent from '../../components/home/HomeScreenContent';
import { Cidade } from '../../data/mockCidades';
import { getPoolCidadesRecomendadas } from '../../data/cidadesRecomendadas';
import { getAllCidadesDataset } from '../../data/cidadesDataset';
import { useAuth } from '../../context/AuthContext';
import { useRecentViews } from '../../context/RecentViewsContext';
import {
  rankCitiesByPreferences,
  sortCitiesByPreferenceRelevance,
  UserPreferences,
} from '../../utils/preferences';
import { toCidadeLegacy } from '../../utils/cidadeDataset';
import { useBuscaCidades } from '../../hooks/useBuscaCidades';

const poolRecomendadas = getPoolCidadesRecomendadas();
const todasCidadesDataset = getAllCidadesDataset();

const MAX_RECOMENDADAS = 20;
const MAX_BUSCA = 40;

export default function ExplorarScreen() {
  const { userData } = useAuth();
  const { recentCidades } = useRecentViews();
  const preferencias = (userData?.preferencias ?? {}) as UserPreferences;

  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todas');

  const recomendadas = useMemo(() => {
    let filtradas = rankCitiesByPreferences(poolRecomendadas, preferencias);
    
    if (categoriaSelecionada !== 'Todas') {
      filtradas = filtradas.filter(c => c.categoria === categoriaSelecionada);
    }

    return filtradas.slice(0, MAX_RECOMENDADAS);
  }, [userData?.preferencias, categoriaSelecionada]);

  const [busca, setBusca] = useState('');
  const {
    cidadesFiltradas,
    carregando: carregandoBusca,
    buscaAtiva,
  } = useBuscaCidades(todasCidadesDataset, busca);

  const resultadoBusca = useMemo<Cidade[] | null>(() => {
    if (!buscaAtiva) return null;
    const matches = cidadesFiltradas.slice(0, MAX_BUSCA * 2).map(toCidadeLegacy);
    return sortCitiesByPreferenceRelevance(matches, preferencias).slice(0, MAX_BUSCA);
  }, [buscaAtiva, cidadesFiltradas, preferencias]);

  return (
    <HomeScreenContent
      busca={busca}
      resultadoBusca={resultadoBusca}
      carregandoBusca={carregandoBusca}
      recomendadas={recomendadas}
      ultimas={recentCidades}
      categoriaSelecionada={categoriaSelecionada}
      onSelectCategoria={setCategoriaSelecionada}
      onChangeBusca={setBusca}
      onSubmitBusca={() => null}
    />
  );
}
