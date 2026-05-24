import type { Cidade } from './mockCidades';
import { getAllCidadesDataset } from './cidadesDataset';
import { toCidadeLegacy } from '../utils/cidadeDataset';

const CATEGORIAS_TUR_RECOMENDADAS = new Set(['A', 'B', 'C']);

/** Pool de cidades para a home: capitais + destinos com infraestrutura turística A/B/C. */
export function getPoolCidadesRecomendadas(): Cidade[] {
  return getAllCidadesDataset()
    .filter(
      (c) =>
        c.capital || (c.categoriaTur != null && CATEGORIAS_TUR_RECOMENDADAS.has(c.categoriaTur)),
    )
    .map(toCidadeLegacy);
}
