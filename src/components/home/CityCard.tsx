import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Radius } from '../../constants/Tokens';
import { Cidade } from '../../data/mockCidades';
import {
  calcularMediaAvaliacoes,
  listarAvaliacoesPublicasDaCidade,
} from '../../services/avaliacoes';
import { buscarImagemCidade } from '../../services/pexels';
import { clamp, useResponsive } from '../../utils/responsive';

type CityCardProps = {
  cidade: Cidade;
};

export default function CityCard({ cidade }: CityCardProps) {
  const r = useResponsive();
  const router = useRouter();
  const [imagem, setImagem] = useState('');
  const [mediaAvaliacoes, setMediaAvaliacoes] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    async function carregarImagem() {
      const url = await buscarImagemCidade(cidade.nome);

      if (url) {
        setImagem(url);
      }
    }

    carregarImagem();
  }, [cidade.nome]);

  useEffect(() => {
    let ativo = true;

    async function carregarMediaAvaliacoes() {
      setMediaAvaliacoes(undefined);
      try {
        const avaliacoes = await listarAvaliacoesPublicasDaCidade(
          cidade.id,
          cidade.nome,
          cidade.estado,
        );
        if (!ativo) return;
        setMediaAvaliacoes(calcularMediaAvaliacoes(avaliacoes));
      } catch (error) {
        console.warn('[city-card:avaliacoes]', error);
        if (ativo) setMediaAvaliacoes(null);
      }
    }

    carregarMediaAvaliacoes();
    return () => {
      ativo = false;
    };
  }, [cidade.id, cidade.nome, cidade.estado]);

  const cardWidth = clamp(Math.round(r.width * 0.43), r.scaleX(142), r.scaleX(188));
  const cardHeight = clamp(Math.round(cardWidth * 1.58), r.scaleY(220), r.scaleY(286));
  const imageHeight = Math.round(cardHeight * 0.46);
  const cardPadding = r.scaleX(8);
  const bodyPadding = r.scaleX(8);
  const notaExibida = mediaAvaliacoes ?? cidade.avaliacao;
  const ratingLabel = mediaAvaliacoes === undefined ? '--' : notaExibida.toFixed(1);
  const descricaoCard =
    (cidade.descricao ?? '').trim() ||
    'Descubra pontos turísticos, cultura local e experiências únicas.';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/detalhes-cidade', params: { id: cidade.id } })}
      style={[styles.card, { width: cardWidth, height: cardHeight, padding: cardPadding, marginLeft: r.scaleX(16) }]}
    >
      <Image
        source={{
          uri:
            imagem ||
            'https://picsum.photos/300/200',
        }}
        style={[styles.image, { height: imageHeight }]}
      />
      <View style={[styles.body, { padding: bodyPadding }]}>
        <Text style={[styles.name, { fontSize: r.font(12) }]} numberOfLines={1}>
          {cidade.nome}, {cidade.estado}
        </Text>
        <Text style={[styles.region, { fontSize: r.font(12) }]} numberOfLines={1}>
          {cidade.regiao}
        </Text>
        <Text style={[styles.description, { fontSize: r.font(12) }]} numberOfLines={2}>
          {descricaoCard}
        </Text>
        <Text style={[styles.rating, { fontSize: r.font(12) }]}>⭐ {ratingLabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.inputBackground,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    borderRadius: Radius.sm,
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    color: Colors.textDark,
    fontWeight: '600',
  },
  region: {
    color: Colors.textGray,
  },
  description: {
    color: Colors.textGray,
    marginTop: 2,
    marginBottom: 2,
  },
  rating: {
    color: Colors.textDark,
  },
});
