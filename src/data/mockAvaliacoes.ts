export type Avaliacao = {
  id: string;
  cidadeId?: string;
  cidadeNome: string;
  cidadeEstado: string;
  nota: number;
  data: string;
  comentario: string;
  publica: boolean;
  autorUid?: string;
  autorNome?: string;
};

export const minhasAvaliacoes: Avaliacao[] = [
  {
    id: '1',
    cidadeNome: 'Recife',
    cidadeEstado: 'PE',
    nota: 5,
    data: '12/03/2026',
    comentario: '"Ótimo lugar para conhecer a cultura e gastronomia local!"',
    publica: true,
  },
  {
    id: '2',
    cidadeNome: 'Olinda',
    cidadeEstado: 'PE',
    nota: 4,
    data: '22/03/2026',
    comentario: '"Legal"',
    publica: true,
  },
  {
    id: '3',
    cidadeNome: 'Rio De Janeiro',
    cidadeEstado: 'RJ',
    nota: 3,
    data: '10/02/2026',
    comentario:
      'Beleza incrível, mas transporte e segurança frustram. Vale pela paisagem, mas é perigosa.',
    publica: false,
  },
  {
    id: '4',
    cidadeNome: 'Santo André',
    cidadeEstado: 'SP',
    nota: 4,
    data: '07/03/2026',
    comentario:
      'Cidade organizada, com bons serviços, mas poucas opções de lazer; ideal para quem trabalha na região do ABC.',
    publica: true,
  },
];

export type AvaliacaoComunidade = {
  id: string;
  autorNome: string;
  avatarUrl?: string;
  avatarLetra?: string;
  data: string;
  nota: number;
  comentario: string;
};

export const avaliacoesComunidade: AvaliacaoComunidade[] = [
  {
    id: '1',
    autorNome: 'Rayssa B.',
    avatarUrl: 'https://picsum.photos/seed/rayssa/80/80',
    data: '15/03/2026',
    nota: 5,
    comentario: 'Lugar incrível! Piscinas naturais perfeitas e clima frio. Voltarei com certeza!',
  },
  {
    id: '2',
    autorNome: 'Fábio M.',
    avatarLetra: 'F',
    data: '12/02/2026',
    nota: 4,
    comentario: '',
  },
  {
    id: '3',
    autorNome: 'Jonas S.',
    avatarUrl: 'https://picsum.photos/seed/jonas/80/80',
    data: '08/01/2026',
    nota: 4,
    comentario: 'Gostei. Faltaram mais opções de lazer, mas a natureza compensa',
  },
  {
    id: '4',
    autorNome: 'Gabriel B.',
    avatarLetra: 'G',
    data: '03/01/2026',
    nota: 3,
    comentario: 'Cidade simples, pouco o que fazer. Em um dia já conhece tudo.',
  },
];
