import { useEffect, useMemo, useState } from 'react';
import type { CidadeDataset } from '../types/cidadeDataset';

type UseBuscaCidadesResult = {
  cidadesFiltradas: CidadeDataset[];
  carregando: boolean;
  buscaAtiva: boolean;
};

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function useBuscaCidades(
  cidades: CidadeDataset[],
  termo: string,
  debounceMs = 300,
): UseBuscaCidadesResult {
  const [termoDebounced, setTermoDebounced] = useState(termo);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const termoLimpo = termo.trim();
    setCarregando(Boolean(termoLimpo));

    const timer = setTimeout(() => {
      setTermoDebounced(termo);
      setCarregando(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [termo, debounceMs]);

  const cidadesFiltradas = useMemo(() => {
    const termoNormalizado = normalizar(termoDebounced.trim());
    if (!termoNormalizado) return cidades;

    return cidades.filter((cidade) =>
      normalizar(cidade.nome).includes(termoNormalizado),
    );
  }, [cidades, termoDebounced]);

  return {
    cidadesFiltradas,
    carregando,
    buscaAtiva: Boolean(termoDebounced.trim()),
  };
}
