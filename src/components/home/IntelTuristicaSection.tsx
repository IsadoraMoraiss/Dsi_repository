import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import type { CidadeDataset } from '../../types/cidadeDataset';
import { useResponsive } from '../../utils/responsive';
import {
  calcularConversaoTuristica,
  calcularPotencialNaoConvertido,
  calcularPotencialTuristico,
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
  explanation: string;
};

function corScore(score: number): string {
  if (score >= 70) return Colors.success;
  if (score >= 40) return Colors.warning;
  return Colors.danger;
}

function explicarPotencial(score: number, cidadeNome: string): string {
  if (score >= 70) {
    return `${cidadeNome} aparece com alta capacidade de atrair visitantes.`;
  }
  if (score >= 40) {
    return `${cidadeNome} tem bom potencial turístico, mas ainda pode ganhar mais destaque para visitantes.`;
  }
  return `${cidadeNome} aparece com potencial turístico mais baixo nos dados atuais.`;
}

function explicarConversao(score: number, cidadeNome: string): string {
  if (score >= 70) {
    return `${cidadeNome} já transforma bem seu potencial em estrutura para receber visitantes.`;
  }
  if (score >= 40) {
    return `${cidadeNome} tem uma base turística relevante, mas ainda pode ampliar serviços e capacidade de atendimento.`;
  }
  return `${cidadeNome} tem pouca estrutura turística registrada em relação ao que poderia oferecer.`;
}

function explicarPotencialNaoConvertido(score: number, cidadeNome: string): string {
  if (score >= 70) {
    return `${cidadeNome} tem grande oportunidade de crescer no turismo, porque o potencial aparece maior que a estrutura registrada.`;
  }
  if (score >= 40) {
    return `${cidadeNome} já é turística, mas ainda pode ampliar hospedagem, serviços e experiências para acompanhar seu potencial.`;
  }
  if (score > 0) {
    return `${cidadeNome} parece ter uma estrutura próxima do potencial indicado pelos dados.`;
  }
  return `${cidadeNome} não mostra diferença relevante entre potencial e estrutura registrada nos dados atuais.`;
}

function IndicadorCard({ icon, title, value, suffix, color, explanation }: IndicadorCardProps) {
  const r = useResponsive();
  const alertTitle = title.replace(/\n/g, ' ');

  return (
    <Pressable
      style={({ pressed }) => [
        styles.indicadorCard,
        { borderColor: color },
        pressed && styles.indicadorCardPressed,
      ]}
      onPress={() => Alert.alert(alertTitle, explanation)}
      accessibilityRole="button"
      accessibilityLabel={`Entender ${alertTitle}`}
    >
      <MaterialIcons name={icon} size={22} color={color} />
      <View style={styles.valorRow}>
        <Text style={[styles.indicadorValor, { fontSize: r.font(22), color }]}>{value}</Text>
        {suffix ? <Text style={[styles.indicadorMax, { fontSize: r.font(11) }]}>{suffix}</Text> : null}
      </View>
      <Text style={[styles.indicadorLabel, { fontSize: r.font(11) }]}>{title}</Text>
    </Pressable>
  );
}

export default function IntelTuristicaSection({ cidade }: IntelTuristicaSectionProps) {
  const r = useResponsive();
  const indicadores = useMemo(() => {
    const potencial = calcularPotencialTuristico(cidade);
    const conversao = calcularConversaoTuristica(cidade);
    const potencialNaoConvertido = calcularPotencialNaoConvertido(cidade);
    return { potencial, conversao, potencialNaoConvertido };
  }, [cidade]);

  return (
    <View style={styles.section}>
      <Text style={[styles.titulo, { fontSize: r.font(16) }]}>Inteligência Turística</Text>
      <Text style={[styles.subtitulo, { fontSize: r.font(12) }]}>
        Toque em um indicador para entender o que ele representa.
      </Text>

      <View style={styles.row}>
        <IndicadorCard
          icon="auto-graph"
          title={'Potencial\nTurístico'}
          value={String(indicadores.potencial)}
          suffix="/100"
          color={corScore(indicadores.potencial)}
          explanation={explicarPotencial(indicadores.potencial, cidade.nome)}
        />
        <IndicadorCard
          icon="hotel"
          title={'Conversão\nTurística'}
          value={String(indicadores.conversao)}
          suffix="/100"
          color={corScore(indicadores.conversao)}
          explanation={explicarConversao(indicadores.conversao, cidade.nome)}
        />
        <IndicadorCard
          icon="travel-explore"
          title={'Potencial\nNão Convertido'}
          value={String(indicadores.potencialNaoConvertido)}
          suffix="/100"
          color={corScore(indicadores.potencialNaoConvertido)}
          explanation={explicarPotencialNaoConvertido(indicadores.potencialNaoConvertido, cidade.nome)}
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
  indicadorCardPressed: { opacity: 0.82 },
  valorRow: { flexDirection: 'row', alignItems: 'flex-end', minHeight: 30 },
  indicadorValor: { fontWeight: '800', lineHeight: 28 },
  indicadorMax: { color: Colors.textGray, marginBottom: 3, marginLeft: 2 },
  indicadorLabel: { color: Colors.textGray, textAlign: 'center', lineHeight: 16 },
});
