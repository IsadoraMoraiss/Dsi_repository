export type Cidade = {
  id: string;
  nome: string;
  estado: string;
  regiao: string;
  avaliacao: number;
  categoria: string;
  imagemUrl: string;
};

export const categorias = ['Todas', 'Praia', 'Cultura', 'Gastronomia', 'Natureza', 'Histórico'];

export const cidadesRecomendadas: Cidade[] = [
  {
    id: '1',
    nome: 'Florianópolis',
    estado: 'SC',
    regiao: 'Sul',
    avaliacao: 4.8,
    categoria: 'Praia',
    imagemUrl: 'https://picsum.photos/seed/Florianopolis/300/200',
  },
  {
    id: '2',
    nome: 'Salvador',
    estado: 'BA',
    regiao: 'Nordeste',
    avaliacao: 4.7,
    categoria: 'Cultura',
    imagemUrl: 'https://picsum.photos/seed/Salvador/300/200',
  },
  {
    id: '3',
    nome: 'Gramado',
    estado: 'RS',
    regiao: 'Sul',
    avaliacao: 4.9,
    categoria: 'Natureza',
    imagemUrl: 'https://picsum.photos/seed/Gramado/300/200',
  },
  {
    id: '4',
    nome: 'Ouro Preto',
    estado: 'MG',
    regiao: 'Sudeste',
    avaliacao: 4.8,
    categoria: 'Histórico',
    imagemUrl: 'https://picsum.photos/seed/OuroPreto/300/200',
  },
  {
    id: '5',
    nome: 'Fortaleza',
    estado: 'CE',
    regiao: 'Nordeste',
    avaliacao: 4.6,
    categoria: 'Praia',
    imagemUrl: 'https://picsum.photos/seed/Fortaleza/300/200',
  },
  {
    id: '6',
    nome: 'São Paulo',
    estado: 'SP',
    regiao: 'Sudeste',
    avaliacao: 4.5,
    categoria: 'Gastronomia',
    imagemUrl: 'https://picsum.photos/seed/SaoPaulo/300/200',
  },
];

export const ultimasVisualizadas: Cidade[] = [
  {
    id: '7',
    nome: 'Manaus',
    estado: 'AM',
    regiao: 'Norte',
    avaliacao: 4.6,
    categoria: 'Natureza',
    imagemUrl: 'https://picsum.photos/seed/Manaus/300/200',
  },
  {
    id: '8',
    nome: 'Recife',
    estado: 'PE',
    regiao: 'Nordeste',
    avaliacao: 4.7,
    categoria: 'Cultura',
    imagemUrl: 'https://picsum.photos/seed/Recife/300/200',
  },
  {
    id: '9',
    nome: 'Bonito',
    estado: 'MS',
    regiao: 'Centro-Oeste',
    avaliacao: 4.9,
    categoria: 'Natureza',
    imagemUrl: 'https://picsum.photos/seed/Bonito/300/200',
  },
];
