import type { CategoriaDestinoId, MacrorregiaoId } from '../constants/preferencias';

/** Cidade enriquecida a partir de BRAZIL_CITIES.csv (src/data/cidades.json). */
export type CidadeDataset = {
  id: string;
  nome: string;
  estado: string;
  regiao: MacrorregiaoId | string;
  latitude: number;
  longitude: number;
  populacaoEstimada: number | null;
  regiaoTur: string | null;
  categoriaTur: string | null;
  ruralUrban: string | null;
  hoteis: number | null;
  leitos: number | null;
  agenciasTurismo: number | null;
  idhm: number | null;
  uber: boolean;
  altitude: number | null;
  capital: boolean;
  pibPerCapita: number | null;
  categorias: CategoriaDestinoId[];
  categoria: string;
  imagemUrl: string;
};

export type FiltroAmbienteMapa = 'Todas' | 'Urbano' | 'Rural' | 'Intermediário';
export type FiltroInfraestruturaMapa = 'Todas' | 'Alta' | 'Média' | 'Básica';

export type FiltrosMapa = {
  ambiente: FiltroAmbienteMapa;
  populoso: boolean;
  infraestrutura: FiltroInfraestruturaMapa;
  comHotel: boolean;
  capitais: boolean;
  comUber: boolean;
};

export const FILTROS_MAPA_PADRAO: FiltrosMapa = {
  ambiente: 'Todas',
  populoso: false,
  infraestrutura: 'Todas',
  comHotel: false,
  capitais: false,
  comUber: false,
};
