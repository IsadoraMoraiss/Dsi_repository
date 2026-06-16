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
// 3. Potencial Joia Escondida  (0-100)
//    Cidades com boa infraestrutura mas baixa pressão turística.
//    Base: IDH 35% + Infraestrutura 45% + constante 20%
//    Fator de ajuste: Alta pressão penaliza (×0.70), Média (×0.85), Baixa (×1.0)
// ---------------------------------------------------------------------------
export function calcularPotencialJoiaEscondida(cidade: CidadeDataset): number {
  const infra   = calcularInfraestruturaTuristica(cidade);          // 0-100
  const pressao = classificarPressaoTuristica(cidade);
  const idh     = (Math.min(Math.max(cidade.idhm ?? 0.5, 0), 1)) * 100; // 0-100

  const fator =
    pressao === 'Baixa'  ? 1.0 :
    pressao === 'Média'  ? 0.85 :
    /* Alta */             0.70;

  const raw = idh * 0.35 + infra * 0.45 + 20;
  return Math.min(Math.round(raw * fator), 100);
}

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
