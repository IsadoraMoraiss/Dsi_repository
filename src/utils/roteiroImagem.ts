import { Cidade } from '../data/mockCidades';

/** Escolhe uma imagem de capa coerente com tipo, clima ou primeira cidade do roteiro. */
export function escolherImagemRoteiro(input: {
  tipo: string;
  clima?: string;
  nome?: string;
  cidadesDetalhadas?: Cidade[];
}): string {
  const primeira = input.cidadesDetalhadas?.[0];
  if (primeira?.imagemUrl) {
    return primeira.imagemUrl;
  }

  const tipo = input.tipo.toLowerCase();
  const clima = (input.clima ?? '').toLowerCase();
  const nomeSeed = encodeURIComponent((input.nome ?? 'roteiro').replace(/\s+/g, '').slice(0, 24));

  if (tipo.includes('inverno') || clima.includes('frio')) {
    return 'https://picsum.photos/seed/frio/400/300';
  }
  if (tipo.includes('aventura') || tipo.includes('trilha')) {
    return 'https://picsum.photos/seed/trilhas/400/300';
  }
  if (
    tipo.includes('verão') ||
    tipo.includes('verao') ||
    tipo.includes('praia') ||
    clima.includes('ensolarado')
  ) {
    return 'https://picsum.photos/seed/praiaNordeste/400/300';
  }
  if (tipo.includes('natureza')) {
    return 'https://picsum.photos/seed/cidadesNorte/400/300';
  }
  if (tipo.includes('cultura') || tipo.includes('conforto') || tipo.includes('histórico')) {
    return 'https://picsum.photos/seed/sul/400/300';
  }
  if (tipo.includes('passeio')) {
    return 'https://picsum.photos/seed/rioPontos/400/300';
  }
  if (tipo.includes('econômico') || tipo.includes('economico')) {
    return 'https://picsum.photos/seed/litoral/400/300';
  }

  return `https://picsum.photos/seed/${nomeSeed}/400/300`;
}

export function imagemExibicaoRoteiro(roteiro: {
  imagemUrl?: string;
  tipo: string;
  nome: string;
  clima?: string;
}): string {
  return (
    roteiro.imagemUrl ??
    escolherImagemRoteiro({ tipo: roteiro.tipo, clima: roteiro.clima, nome: roteiro.nome })
  );
}
