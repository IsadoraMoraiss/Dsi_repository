import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Radius } from '../../constants/Tokens';
import { Cidade } from '../../data/mockCidades';
import { clamp, useResponsive } from '../../utils/responsive';
import { buscarImagemCidade } from '../../services/pexels';
type CityCardProps = {
  cidade: Cidade;
};

export default function CityCard({ cidade }: CityCardProps) {
  const r = useResponsive();
  const router = useRouter();
  const [imagem, setImagem] = useState('');
  useEffect(() => {
    async function carregarImagem() {
      const url = await buscarImagemCidade(cidade.nome);

      if (url) {
        setImagem(url);
      }
    }

    carregarImagem();
  }, [cidade.nome]);
  const cardWidth = clamp(Math.round(r.width * 0.43), r.scaleX(142), r.scaleX(188));
  const cardHeight = clamp(Math.round(cardWidth * 1.58), r.scaleY(220), r.scaleY(286));
  const imageHeight = Math.round(cardHeight * 0.46);
  const cardPadding = r.scaleX(8);
  const bodyPadding = r.scaleX(8);

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
          Descubra pontos turísticos, cultura local e experiências únicas.
        </Text>
        <Text style={[styles.rating, { fontSize: r.font(12) }]}>⭐ {cidade.avaliacao.toFixed(1)}</Text>
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
