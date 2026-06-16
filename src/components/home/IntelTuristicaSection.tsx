import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import type { CidadeDataset } from '../../types/cidadeDataset';
import { useResponsive } from '../../utils/responsive';
import {
  calcularInfraestruturaTuristica,
  calcularPotencialJoiaEscondida,
  classificarPressaoTuristica,
  corPressaoTuristica,
  type PressaoTuristica,
} from '../../utils/indicadoresCidade';

type IntelTuristicaSectionProps = {
  cidade: CidadeDataset;
};

type IndicadorCardProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  value: string;
  suffix?: string;
  color: string;
};

function corScore(score: number): string {
  if (score >= 70) return Colors.success;
  if (score >= 40) return Colors.warning;
  return Colors.danger;
}

function corPressao(pressao: PressaoTuristica): string {
  return corPressaoTuristica(pressao);
}

function IndicadorCard({ icon, title, value, suffix, color }: IndicadorCardProps) {
  const r = useResponsive();

  return (
    <View style={[styles.indicadorCard, { borderColor: color }]}>
      <MaterialIcons name={icon} size={22} color={color} />
      <View style={styles.valorRow}>
        <Text style={[styles.indicadorValor, { fontSize: r.font(22), color }]}>{value}</Text>
        {suffix ? <Text style={[styles.indicadorMax, { fontSize: r.font(11) }]}>{suffix}</Text> : null}
      </View>
      <Text style={[styles.indicadorLabel, { fontSize: r.font(11) }]}>{title}</Text>
    </View>
  );
}

export default function IntelTuristicaSection({ cidade }: IntelTuristicaSectionProps) {
  const r = useResponsive();
  const indicadores = useMemo(() => {
    const infraestrutura = calcularInfraestruturaTuristica(cidade);
    const pressao = classificarPressaoTuristica(cidade);
    const joiaEscondida = calcularPotencialJoiaEscondida(cidade);
    return { infraestrutura, pressao, joiaEscondida };
  }, [cidade]);

  return (
    <View style={styles.section}>
      <Text style={[styles.titulo, { fontSize: r.font(16) }]}>Inteligencia Turistica</Text>
      <Text style={[styles.subtitulo, { fontSize: r.font(12) }]}>
        Indicadores calculados a partir do dataset de cidades brasileiras.
      </Text>

      <View style={styles.row}>
        <IndicadorCard
          icon="hotel"
          title={'Infraestrutura\nTuristica'}
          value={String(indicadores.infraestrutura)}
          suffix="/100"
          color={corScore(indicadores.infraestrutura)}
        />
        <IndicadorCard
          icon="people"
          title={'Pressao\nTuristica'}
          value={indicadores.pressao}
          color={corPressao(indicadores.pressao)}
        />
        <IndicadorCard
          icon="auto-awesome"
          title={'Joia\nEscondida'}
          value={String(indicadores.joiaEscondida)}
          suffix="/100"
          color={corScore(indicadores.joiaEscondida)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
    marginBottom: 20,
    backgroundColor: 'rgba(121,116,231,0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(121,116,231,0.25)',
  },
  titulo: { color: Colors.textWhite, fontWeight: '700', marginBottom: 4 },
  subtitulo: { color: Colors.textGray, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 8 },
  indicadorCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  valorRow: { flexDirection: 'row', alignItems: 'flex-end', minHeight: 30 },
  indicadorValor: { fontWeight: '800', lineHeight: 28 },
  indicadorMax: { color: Colors.textGray, marginBottom: 3, marginLeft: 2 },
  indicadorLabel: { color: Colors.textGray, textAlign: 'center', lineHeight: 16 },
});
