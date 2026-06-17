import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Cidade, cidadesRecomendadas, ultimasVisualizadas } from '../data/mockCidades';
import { getCidadeDatasetById } from '../data/cidadesDataset';
import { toCidadeLegacy } from '../utils/cidadeDataset';

type RecentViewsContextData = {
  recentCidades: Cidade[];
  addRecentCidade: (cidade: Cidade) => void;
};

const STORAGE_KEY_BASE = 'ultimosCidadesVistos';
const MAX_RECENT_VIEWS = 10;

const RecentViewsContext = createContext<RecentViewsContextData>({} as RecentViewsContextData);

function storageKeyForUid(uid?: string | null) {
  return uid ? `${STORAGE_KEY_BASE}:${uid}` : STORAGE_KEY_BASE;
}

function hydrateCidades(ids: string[]): Cidade[] {
  const cidades: Cidade[] = [];
  for (const id of ids) {
    const dataset = getCidadeDatasetById(id);
    if (dataset) {
      cidades.push(toCidadeLegacy(dataset));
    } else {
      const mock =
        cidadesRecomendadas.find((c) => c.id === id) ??
        ultimasVisualizadas.find((c) => c.id === id);
      if (mock) {
        cidades.push(mock);
      }
    }
  }
  return cidades;
}

export const RecentViewsProvider: React.FC<{ children: React.ReactNode; uid?: string | null }> = ({ children, uid }) => {
  const [recentCidades, setRecentCidades] = useState<Cidade[]>([]);

  const storageKey = storageKeyForUid(uid);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        const ids: string[] = raw ? JSON.parse(raw) : [];
        if (ativo) setRecentCidades(hydrateCidades(ids));
      } catch (error) {
        console.warn('[RecentViews] Erro ao carregar cidades vistas:', error);
      }
    }

    setRecentCidades([]); // limpa imediatamente ao trocar de conta
    carregar();
    return () => {
      ativo = false;
    };
  }, [storageKey]);

  const addRecentCidade = useCallback((cidade: Cidade) => {
    setRecentCidades((current) => {
      const filtered = current.filter((item) => item.id !== cidade.id);
      const next = [cidade, ...filtered].slice(0, MAX_RECENT_VIEWS);

      AsyncStorage.getItem(storageKey)
        .then((raw) => {
          const ids: string[] = raw ? JSON.parse(raw) : [];
          const nextIds = [cidade.id, ...ids.filter((id) => id !== cidade.id)].slice(0, MAX_RECENT_VIEWS);
          return AsyncStorage.setItem(storageKey, JSON.stringify(nextIds));
        })
        .catch((error) => console.warn('[RecentViews] Erro ao salvar:', error));

      return next;
    });
  }, [storageKey]);

  const value = useMemo(
    () => ({ recentCidades, addRecentCidade }),
    [recentCidades, addRecentCidade],
  );

  return <RecentViewsContext.Provider value={value}>{children}</RecentViewsContext.Provider>;
};

export const useRecentViews = () => useContext(RecentViewsContext);
