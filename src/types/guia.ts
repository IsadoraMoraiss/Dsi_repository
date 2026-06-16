export type Guia = {
  id: string;
  ownerUid: string;
  nome: string;
  descricao?: string;
  tipo: string;
  cidadeIds: string[];
  cidadeNomes?: string[];
  imagemUrl?: string;
  endereco?: string;
};
