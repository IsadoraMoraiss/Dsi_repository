import type { CidadeDataset } from '../types/cidadeDataset';

const todasCidades = require('./cidades.json') as CidadeDataset[];

const cidadesComCoordenadas = todasCidades.filter(
  (c) => Number.isFinite(c.latitude) && Number.isFinite(c.longitude),
);

export function getAllCidadesDataset(): CidadeDataset[] {
  return cidadesComCoordenadas;
}

export function getCidadeDatasetById(id: string): CidadeDataset | undefined {
  return todasCidades.find((c) => c.id === id);
}
