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
  debounceMs = 180,
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

  const cidadesIndexadas = useMemo(
    () =>
      cidades.map((cidade) => ({
        cidade,
        nomeSearchable: normalizar(cidade.nome),
        secondarySearchable: normalizar(`${cidade.estado} ${cidade.regiao} ${cidade.regiaoTur ?? ''}`),
      })),
    [cidades],
  );

  const cidadesFiltradas = useMemo(() => {
    const termoNormalizado = normalizar(termoDebounced.trim());
    if (!termoNormalizado) return cidades;

    const porNome = cidadesIndexadas
      .filter(({ nomeSearchable }) => nomeSearchable.includes(termoNormalizado))
      .map(({ cidade }) => cidade);

    if (porNome.length > 0) return porNome;

    return cidadesIndexadas
      .filter(({ secondarySearchable }) => secondarySearchable.includes(termoNormalizado))
      .map(({ cidade }) => cidade);
  }, [cidades, cidadesIndexadas, termoDebounced]);

  return {
    cidadesFiltradas,
    carregando,
    buscaAtiva: Boolean(termoDebounced.trim()),
  };
}
