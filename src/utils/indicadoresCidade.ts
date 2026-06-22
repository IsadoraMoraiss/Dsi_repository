/**
 * indicadoresCidade.ts
 *
 * Calcula on-device os mesmos indicadores compostos que o dashboard Python
 * (brasil_em_foco_atualizado) calcula sobre o BRAZIL_CITIES.csv.
 *
 * Os campos usados (hoteis, leitos, agenciasTurismo, uber, idhm,
 * populacaoEstimada) já estão presentes em cidades.json e em CidadeDataset.
 *
 * Conexão dados ↔ app:
 *   Python analisa BRAZIL_CITIES.csv  →  cidades.json guarda campos brutos
 *   →  este arquivo recalcula os scores  →  UI exibe "Inteligência Turística"
 */

import { Colors } from '../constants/Colors';
import type { CidadeDataset } from '../types/cidadeDataset';

// ---------------------------------------------------------------------------
// Constantes de normalização
// Baseadas nos máximos aproximados observados no dataset brasileiro.
// ---------------------------------------------------------------------------
const MAX_HOTEIS = 500;
const MAX_LEITOS = 10_000;
const MAX_AGENCIAS = 300;

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(Math.max(value, min), max);
}

function categoriaTuristicaScore(categoriaTur?: string | null): number {
  const categoria = categoriaTur?.trim().toUpperCase();
  if (categoria === 'A') return 100;
  if (categoria === 'B') return 80;
  if (categoria === 'C') return 60;
  if (categoria === 'D') return 40;
  if (categoria === 'E') return 20;
  return 0;
}

// ---------------------------------------------------------------------------
// 1. Infraestrutura Turística  (0-100)
//    Peso: Hotéis 25% | Leitos 25% | Agências 20% | Uber 15% | IDH 15%
// ---------------------------------------------------------------------------
export function calcularInfraestruturaTuristica(cidade: CidadeDataset): number {
  const hoteis   = Math.min(cidade.hoteis ?? 0, MAX_HOTEIS) / MAX_HOTEIS;
  const leitos   = Math.min(cidade.leitos ?? 0, MAX_LEITOS) / MAX_LEITOS;
  const agencias = Math.min(cidade.agenciasTurismo ?? 0, MAX_AGENCIAS) / MAX_AGENCIAS;
  const uber     = cidade.uber ? 1 : 0;
  const idh      = Math.min(Math.max(cidade.idhm ?? 0, 0), 1);

  const score =
    hoteis   * 0.25 +
    leitos   * 0.25 +
    agencias * 0.20 +
    uber     * 0.15 +
    idh      * 0.15;

  return Math.round(score * 100);
}

// ---------------------------------------------------------------------------
// 2. Oferta Hoteleira Observada (0-100)
//    Aproxima o indicador do dashboard: Leitos 65% | Hoteis 35%.
// ---------------------------------------------------------------------------
export function calcularOfertaHoteleiraObservada(cidade: CidadeDataset): number {
  const leitos = Math.min(cidade.leitos ?? 0, MAX_LEITOS) / MAX_LEITOS;
  const hoteis = Math.min(cidade.hoteis ?? 0, MAX_HOTEIS) / MAX_HOTEIS;

  return Math.round((leitos * 0.65 + hoteis * 0.35) * 100);
}

// ---------------------------------------------------------------------------
// 3. Potencial Turistico (0-100)
//    Versao mobile do indicador do dashboard:
//    IDHM 35% | conveniencia urbana 25% | diversidade local 15% | categoria MTur 25%.
//    Como o app nao carrega todas as colunas economicas do dashboard, usamos
//    proxies ja disponiveis no cidades.json sem criar nova fonte de dados.
// ---------------------------------------------------------------------------
export function calcularPotencialTuristico(cidade: CidadeDataset): number {
  const idhm = clamp((cidade.idhm ?? 0) * 100);
  const convenienciaUrbana = clamp(idhm * 0.6 + (cidade.uber ? 40 : 0));
  const diversidadeLocal = clamp((cidade.categorias?.length ?? 0) * 25);
  const categoria = categoriaTuristicaScore(cidade.categoriaTur);

  return Math.round(
    clamp(
      idhm * 0.35 +
        convenienciaUrbana * 0.25 +
        diversidadeLocal * 0.15 +
        categoria * 0.25,
    ),
  );
}

// ---------------------------------------------------------------------------
// 4. Conversao Turistica (0-100)
//    Estrutura observavel ja convertida em oferta turistica:
//    Oferta hoteleira observada 45% | infraestrutura turistica 55%.
// ---------------------------------------------------------------------------
export function calcularConversaoTuristica(cidade: CidadeDataset): number {
  const oferta = calcularOfertaHoteleiraObservada(cidade);
  const infraestrutura = calcularInfraestruturaTuristica(cidade);

  return Math.round(clamp(oferta * 0.45 + infraestrutura * 0.55));
}

// ---------------------------------------------------------------------------
// 2. Pressão Turística  (Baixa / Média / Alta)
//    Ratio: leitos por mil habitantes.
//    > 15 → Alta   |   5-15 → Média   |   < 5 → Baixa
// ---------------------------------------------------------------------------
export type PressaoTuristica = 'Baixa' | 'Média' | 'Alta';

export function classificarPressaoTuristica(cidade: CidadeDataset): PressaoTuristica {
  if (!cidade.leitos || !cidade.populacaoEstimada || cidade.populacaoEstimada === 0) {
    return 'Baixa';
  }
  const ratioPorMil = (cidade.leitos / cidade.populacaoEstimada) * 1_000;
  if (ratioPorMil > 15) return 'Alta';
  if (ratioPorMil > 5)  return 'Média';
  return 'Baixa';
}

// ---------------------------------------------------------------------------
// 5. Potencial Nao Convertido (0-100)
//    Segue a narrativa do dashboard: diferenca positiva entre potencial turistico
//    estimado e conversao turistica observavel.
// ---------------------------------------------------------------------------
export function calcularPotencialNaoConvertido(cidade: CidadeDataset): number {
  const potencial = calcularPotencialTuristico(cidade);
  const conversao = calcularConversaoTuristica(cidade);

  return Math.round(clamp(potencial - conversao));
}

// Alias legado para nao quebrar imports antigos durante a transicao de nome.
export const calcularPotencialJoiaEscondida = calcularPotencialNaoConvertido;

// ---------------------------------------------------------------------------
// Helpers de formatação (para uso direto na UI)
// ---------------------------------------------------------------------------

/** Retorna cor semântica para cada nível de pressão turística */
export function corPressaoTuristica(pressao: PressaoTuristica): string {
  if (pressao === 'Alta')  return Colors.danger;
  if (pressao === 'Média') return Colors.warning;
  return Colors.success;
}

/** Retorna emoji + label para exibição rápida */
export function labelPressaoTuristica(pressao: PressaoTuristica): string {
  if (pressao === 'Alta')  return '🔴 Alta';
  if (pressao === 'Média') return '🟡 Média';
  return '🟢 Baixa';
}
