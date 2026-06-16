import type { Guia } from '../types/guia';

export const guiasLocais: Guia[] = [
  {
    id: 'guia-001',
    ownerUid: 'sistema',
    nome: 'Mercado de São José',
    descricao: 'O mercado público mais antigo do Brasil em funcionamento, fundado em 1875, no centro do Recife.',
    tipo: 'Mercado',
    cidadeIds: [],
    cidadeNomes: ['Recife'],
    imagemUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Mercado_de_S%C3%A3o_Jos%C3%A9_-_Recife.jpg/320px-Mercado_de_S%C3%A3o_Jos%C3%A9_-_Recife.jpg',
    endereco: 'Praça Dom Vital, s/n — Boa Vista, Recife - PE',
  },
  {
    id: 'guia-002',
    ownerUid: 'sistema',
    nome: 'Parque da Jaqueira',
    descricao: 'Grande área verde no bairro da Jaqueira, ideal para caminhadas, corridas e lazer ao ar livre.',
    tipo: 'Parque',
    cidadeIds: [],
    cidadeNomes: ['Recife'],
    endereco: 'R. do Futuro, s/n — Jaqueira, Recife - PE',
  },
  {
    id: 'guia-003',
    ownerUid: 'sistema',
    nome: 'Pelourinho',
    descricao: 'Centro histórico de Salvador, patrimônio mundial pela UNESCO. Arquitetura colonial barroca do século XVII.',
    tipo: 'Patrimônio Histórico',
    cidadeIds: [],
    cidadeNomes: ['Salvador'],
    endereco: 'Largo do Pelourinho — Centro Histórico, Salvador - BA',
  },
];
