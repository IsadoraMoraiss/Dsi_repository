import { useEffect, useMemo, useState } from 'react';
import { InteractionManager } from 'react-native';
import { Cidade } from '../../data/mockCidades';
import { roteirosRecomendados, Roteiro } from '../../data/mockRoteiros';
import type { CidadeDataset } from '../../types/cidadeDataset';
import { useAuth } from '../../context/AuthContext';
import { useRecentViews } from '../../context/RecentViewsContext';
import { useBuscaCidades } from '../../hooks/useBuscaCidades';
import { toCidadeLegacy } from '../../utils/cidadeDataset';
import {
  buscarRoteirosPorTermo,
  rankCitiesByPreferences,
  UserPreferences,
  sortCitiesByPreferenceRelevance,
} from '../../utils/preferences';
import { listarRoteirosPublicos } from '../../services/roteiros';
import HomeScreenContent from './HomeScreenContent';

const MAX_RECOMENDADAS = 20;
const MAX_BUSCA_CIDADES = 40;
const MAX_BUSCA_ROTEIROS = 8;

export default function ExplorarContent() {
  const { userData } = useAuth();
  const { recentCidades } = useRecentViews();
  const preferencias = (userData?.preferencias ?? {}) as UserPreferences;

  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todas');
  const [busca, setBusca] = useState('');
  const [poolRecomendadas, setPoolRecomendadas] = useState<Cidade[]>([]);
  const [todasCidadesDataset, setTodasCidadesDataset] = useState<CidadeDataset[]>([]);
  const [carregandoCidades, setCarregandoCidades] = useState(true);
  const [roteirosPublicos, setRoteirosPublicos] = useState<Roteiro[]>([]);
  const [roteirosPublicosCarregados, setRoteirosPublicosCarregados] = useState(false);

  useEffect(() => {
    let ativo = true;
    const task = InteractionManager.runAfterInteractions(() => {
      Promise.all([
        import('../../data/cidadesRecomendadas'),
        import('../../data/cidadesDataset'),
      ])
        .then(([recomendadasModule, datasetModule]) => {
          if (!ativo) return;
          setPoolRecomendadas(recomendadasModule.getPoolCidadesRecomendadas());
          setTodasCidadesDataset(datasetModule.getAllCidadesDataset());
        })
        .catch((error) => {
          console.warn('[ExplorarContent] Nao foi possivel carregar cidades:', error);
        })
        .finally(() => {
          if (ativo) setCarregandoCidades(false);
        });
    });

    return () => {
      ativo = false;
      task.cancel();
    };
  }, []);

  const recomendadasRankeadas = useMemo(
    () => rankCitiesByPreferences(poolRecomendadas, preferencias),
    [poolRecomendadas, userData?.preferencias],
  );

  const recomendadas = useMemo(() => {
    const base =
      categoriaSelecionada === 'Todas'
        ? recomendadasRankeadas
        : recomendadasRankeadas.filter((cidade) => cidade.categoria === categoriaSelecionada);

    return base.slice(0, MAX_RECOMENDADAS);
  }, [categoriaSelecionada, recomendadasRankeadas]);

  const {
    cidadesFiltradas,
    carregando: carregandoBusca,
    buscaAtiva,
  } = useBuscaCidades(todasCidadesDataset, busca);

  useEffect(() => {
    if (!buscaAtiva || roteirosPublicosCarregados) return;

    let ativo = true;

    listarRoteirosPublicos(80)
      .then((roteiros) => {
        if (ativo) setRoteirosPublicos(roteiros);
      })
      .catch((error) => {
        console.warn('[ExplorarContent] Nao foi possivel carregar roteiros publicos:', error);
      })
      .finally(() => {
        if (ativo) setRoteirosPublicosCarregados(true);
      });

    return () => {
      ativo = false;
    };
  }, [buscaAtiva, roteirosPublicosCarregados]);

  const resultadoBusca = useMemo<Cidade[] | null>(() => {
    if (!buscaAtiva) return null;

    const matches = cidadesFiltradas.slice(0, MAX_BUSCA_CIDADES * 2).map(toCidadeLegacy);
    return sortCitiesByPreferenceRelevance(matches, preferencias).slice(0, MAX_BUSCA_CIDADES);
  }, [buscaAtiva, cidadesFiltradas, preferencias]);

  const roteirosBuscaveis = useMemo(() => {
    const byId = new Map<string, Roteiro>();

    [...roteirosRecomendados, ...roteirosPublicos]
      .filter((roteiro) => roteiro.privado !== true)
      .forEach((roteiro) => {
        byId.set(roteiro.id, roteiro);
      });

    return Array.from(byId.values());
  }, [roteirosPublicos]);

  const resultadoRoteiros = useMemo<Roteiro[] | null>(() => {
    if (!buscaAtiva) return null;

    return buscarRoteirosPorTermo(roteirosBuscaveis, busca, preferencias).slice(0, MAX_BUSCA_ROTEIROS);
  }, [buscaAtiva, busca, preferencias, roteirosBuscaveis]);

  return (
    <HomeScreenContent
      busca={busca}
      resultadoBusca={resultadoBusca}
      resultadoRoteiros={resultadoRoteiros}
      carregandoBusca={carregandoBusca || (buscaAtiva && carregandoCidades)}
      recomendadas={recomendadas}
      ultimas={recentCidades}
      categoriaSelecionada={categoriaSelecionada}
      onSelectCategoria={setCategoriaSelecionada}
      onChangeBusca={setBusca}
      onSubmitBusca={() => null}
    />
  );
}
