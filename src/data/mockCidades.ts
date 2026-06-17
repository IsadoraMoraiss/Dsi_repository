import type { CategoriaDestinoId, MacrorregiaoId } from '../constants/preferencias';

export type Cidade = {
  id: string;
  nome: string;
  estado: string;
  regiao: MacrorregiaoId | string;
  avaliacao: number;
  /** Categoria legada para exibição em cards */
  categoria: string;
  /** Tags inferidas do dataset (REGIAO_TUR / ALT) — usadas no filtro de preferências */
  categorias?: CategoriaDestinoId[];
  imagemUrl: string;
  clima: 'Quente' | 'Temperado' | 'Frio';
  energia: 'Calmo' | 'Moderado' | 'Intenso';
  estilos: string[];
  descricao: string;
};

export const categorias = ['Todas', 'Praia', 'Cultura', 'Gastronomia', 'Natureza', 'Histórico'];

export const cidadesRecomendadas: Cidade[] = [
  {
    id: '1813',
    nome: 'Florianópolis',
    estado: 'SC',
    regiao: 'Sul',
    avaliacao: 4.8,
    categoria: 'Praia',
    categorias: ['praia-litoral'],
    imagemUrl: 'https://picsum.photos/seed/Florianopolis/300/200',
    clima: 'Quente',
    energia: 'Moderado',
    estilos: ['Relaxamento', 'Aventura'],
    descricao: 'A Ilha da Magia combina praias paradisíacas com natureza preservada e vida noturna agitada.',
  },
  {
    id: '4334',
    nome: 'Salvador',
    estado: 'BA',
    regiao: 'Nordeste',
    avaliacao: 4.7,
    categoria: 'Cultura',
    categorias: ['cultura-historico', 'praia-litoral'],
    imagemUrl: 'https://picsum.photos/seed/Salvador/300/200',
    clima: 'Quente',
    energia: 'Moderado',
    estilos: ['Cultural', 'Gastronomia'],
    descricao: 'Berço da cultura afro-brasileira, com arquitetura colonial, gastronomia rica e festas populares.',
  },
  {
    id: '1959',
    nome: 'Gramado',
    estado: 'RS',
    regiao: 'Sul',
    avaliacao: 4.9,
    categoria: 'Natureza',
    categorias: ['serras-montanha', 'gastronomia-vinhos'],
    imagemUrl: 'https://picsum.photos/seed/Gramado/300/200',
    clima: 'Frio',
    energia: 'Calmo',
    estilos: ['Relaxamento', 'Cultural'],
    descricao: 'Charmosa cidade serrana com arquitetura europeia, chocolates artesanais e invernos rigorosos.',
  },
  {
    id: '3486',
    nome: 'Ouro Preto',
    estado: 'MG',
    regiao: 'Sudeste',
    avaliacao: 4.8,
    categoria: 'Histórico',
    categorias: ['cultura-historico'],
    imagemUrl: 'https://picsum.photos/seed/OuroPreto/300/200',
    clima: 'Temperado',
    energia: 'Calmo',
    estilos: ['Cultural'],
    descricao: 'Patrimônio histórico da humanidade com igrejas barrocas, museus e riqueza colonial.',
  },
  {
    id: '1832',
    nome: 'Fortaleza',
    estado: 'CE',
    regiao: 'Nordeste',
    avaliacao: 4.6,
    categoria: 'Praia',
    categorias: ['praia-litoral'],
    imagemUrl: 'https://picsum.photos/seed/Fortaleza/300/200',
    clima: 'Quente',
    energia: 'Moderado',
    estilos: ['Relaxamento', 'Gastronomia'],
    descricao: 'Praias urbanas e selvagens, frutos do mar frescos e sol o ano todo no litoral cearense.',
  },
  {
    id: '4857',
    nome: 'São Paulo',
    estado: 'SP',
    regiao: 'Sudeste',
    avaliacao: 4.5,
    categoria: 'Gastronomia',
    categorias: ['gastronomia-vinhos', 'cultura-historico'],
    imagemUrl: 'https://picsum.photos/seed/SaoPaulo/300/200',
    clima: 'Temperado',
    energia: 'Intenso',
    estilos: ['Gastronomia', 'Cultural'],
    descricao: 'A maior metrópole do Brasil concentra culinária mundial, museus, shows e negócios.',
  },
];

export const ultimasVisualizadas: Cidade[] = [
  {
    id: '2887',
    nome: 'Manaus',
    estado: 'AM',
    regiao: 'Norte',
    avaliacao: 4.6,
    categoria: 'Natureza',
    imagemUrl: 'https://picsum.photos/seed/Manaus/300/200',
    clima: 'Quente',
    energia: 'Intenso',
    estilos: ['Ecoturismo', 'Aventura'],
    descricao: 'Portal da Amazônia com encontro das águas, floresta tropical e biodiversidade única.',
  },
  {
    id: '4112',
    nome: 'Recife',
    estado: 'PE',
    regiao: 'Nordeste',
    avaliacao: 4.7,
    categoria: 'Cultura',
    imagemUrl: 'https://picsum.photos/seed/Recife/300/200',
    clima: 'Quente',
    energia: 'Moderado',
    estilos: ['Cultural', 'Gastronomia'],
    descricao: 'Veneza brasileira com canais históricos, frevo, gastronomia pernambucana e praias urbanas.',
  },
  {
    id: '714',
    nome: 'Bonito',
    estado: 'MS',
    regiao: 'Centro-Oeste',
    avaliacao: 4.9,
    categoria: 'Natureza',
    imagemUrl: 'https://picsum.photos/seed/Bonito/300/200',
    clima: 'Quente',
    energia: 'Intenso',
    estilos: ['Ecoturismo', 'Aventura'],
    descricao: 'Ecoturismo de excelência com rios de águas cristalinas, snorkeling e cavernas.',
  },
];
