import type { CityDetails } from '../types/city';

const citiesDatabase: Record<string, CityDetails> = {
  '1': {
    id: '1',
    name: 'Florianópolis',
    state: 'Santa Catarina',
    region: 'Sul',
    rating: 4.8,
    heroImageUrl: 'https://picsum.photos/seed/Florianopolis/800/400',
    description:
      'Florianópolis é uma ilha paradisíaca com praias cristalinas, vida noturna vibrante e uma cena gastronômica internacional. Perfeita para quem quer sol, mar e diversão.',
    quickInfo: [
      { id: 'weather', label: 'Clima', value: '22°C', icon: 'partly-sunny' },
      { id: 'season', label: 'Melhor época', value: 'Dez-Fev', icon: 'calendar' },
      { id: 'cost', label: 'Custo médio', value: 'R$ 250/dia', icon: 'wallet' },
      { id: 'duration', label: 'Duração ideal', value: '4 dias', icon: 'time' },
    ],
    categories: ['Praias', 'Gastronomia', 'Vida Noturna', 'Natureza'],
    recommendedPlaces: [
      { id: '1', name: 'Praia Mole', imageUrl: 'https://picsum.photos/seed/PraiaMole/400/300', rating: 4.9, distance: '3.2 km', category: 'Praias' },
      { id: '2', name: 'Lagoa da Conceição', imageUrl: 'https://picsum.photos/seed/LagoonConceicao/400/300', rating: 4.7, distance: '8.5 km', category: 'Natureza' },
    ],
    restaurants: [
      { id: '1', name: 'Ostradamus', imageUrl: 'https://picsum.photos/seed/Ostras/400/300', cuisine: 'Frutos do mar', rating: 4.8 },
      { id: '2', name: 'Sabor Português', imageUrl: 'https://picsum.photos/seed/Portugues/400/300', cuisine: 'Portuguesa', rating: 4.6 },
    ],
    hotels: [
      { id: '1', name: 'Costão do Santinho', imageUrl: 'https://picsum.photos/seed/Costao/400/300', price: 'R$ 650/noite', rating: 4.8 },
      { id: '2', name: 'Lua Hotel', imageUrl: 'https://picsum.photos/seed/Lua/400/300', price: 'R$ 380/noite', rating: 4.6 },
    ],
    mapLabel: 'Lagoa, Florianópolis',
  },
  '2': {
    id: '2',
    name: 'Salvador',
    state: 'Bahia',
    region: 'Nordeste',
    rating: 4.7,
    heroImageUrl: 'https://picsum.photos/seed/Salvador/800/400',
    description:
      'Salvador é a capital da Bahia e um berço da cultura afro-brasileira. Combina história colonial, praias tropicais e uma gastronomia incomparável.',
    quickInfo: [
      { id: 'weather', label: 'Clima', value: '26°C', icon: 'partly-sunny' },
      { id: 'season', label: 'Melhor época', value: 'Out-Mar', icon: 'calendar' },
      { id: 'cost', label: 'Custo médio', value: 'R$ 280/dia', icon: 'wallet' },
      { id: 'duration', label: 'Duração ideal', value: '4 dias', icon: 'time' },
    ],
    categories: ['Cultura', 'Gastronomia', 'Praias', 'Eventos'],
    recommendedPlaces: [
      { id: '1', name: 'Pelourinho', imageUrl: 'https://picsum.photos/seed/Pelourinho/400/300', rating: 4.9, distance: '1.2 km', category: 'Cultura' },
      { id: '2', name: 'Praia de Itapuã', imageUrl: 'https://picsum.photos/seed/Itapua/400/300', rating: 4.8, distance: '12 km', category: 'Praias' },
    ],
    restaurants: [
      { id: '1', name: 'Casa da Gamboa', imageUrl: 'https://picsum.photos/seed/Gamboa/400/300', cuisine: 'Baiana', rating: 4.9 },
      { id: '2', name: 'Barroqueta', imageUrl: 'https://picsum.photos/seed/Barroqueta/400/300', cuisine: 'Contemporânea', rating: 4.7 },
    ],
    hotels: [
      { id: '1', name: 'Hotel Oka', imageUrl: 'https://picsum.photos/seed/OkaHotel/400/300', price: 'R$ 420/noite', rating: 4.7 },
      { id: '2', name: 'Solar do Contra', imageUrl: 'https://picsum.photos/seed/SolarContra/400/300', price: 'R$ 520/noite', rating: 4.8 },
    ],
    mapLabel: 'Centro, Salvador',
  },
  '3': {
    id: '3',
    name: 'Gramado',
    state: 'Rio Grande do Sul',
    region: 'Sul',
    rating: 4.9,
    heroImageUrl: 'https://picsum.photos/seed/Gramado/800/400',
    description:
      'Gramado é um refúgio nas montanhas com clima europeu, arquitetura charmosa e chocolaterias renomadas. Ideal para casais e amantes de natureza.',
    quickInfo: [
      { id: 'weather', label: 'Clima', value: '15°C', icon: 'cloud' },
      { id: 'season', label: 'Melhor época', value: 'Mai-Out', icon: 'calendar' },
      { id: 'cost', label: 'Custo médio', value: 'R$ 320/dia', icon: 'wallet' },
      { id: 'duration', label: 'Duração ideal', value: '3 dias', icon: 'time' },
    ],
    categories: ['Natureza', 'Gastronomia', 'Eventos'],
    recommendedPlaces: [
      { id: '1', name: 'Rua Coberta', imageUrl: 'https://picsum.photos/seed/RuaCoberta/400/300', rating: 4.8, distance: '0.5 km', category: 'Cultura' },
      { id: '2', name: 'Parque Estadual Pousada de Pedra', imageUrl: 'https://picsum.photos/seed/PedraParque/400/300', rating: 4.7, distance: '5 km', category: 'Natureza' },
    ],
    restaurants: [
      { id: '1', name: 'Bella Italia', imageUrl: 'https://picsum.photos/seed/BellaItalia/400/300', cuisine: 'Italiana', rating: 4.8 },
      { id: '2', name: 'Castelões', imageUrl: 'https://picsum.photos/seed/Casteloes/400/300', cuisine: 'Brasileira', rating: 4.7 },
    ],
    hotels: [
      { id: '1', name: 'Hotel Laje de Pedra', imageUrl: 'https://picsum.photos/seed/LajePedra/400/300', price: 'R$ 480/noite', rating: 4.8 },
      { id: '2', name: 'Pousada do Bosque', imageUrl: 'https://picsum.photos/seed/Bosque/400/300', price: 'R$ 350/noite', rating: 4.6 },
    ],
    mapLabel: 'Centro, Gramado',
  },
  '4': {
    id: '4',
    name: 'Ouro Preto',
    state: 'Minas Gerais',
    region: 'Sudeste',
    rating: 4.8,
    heroImageUrl: 'https://picsum.photos/seed/OuroPreto/800/400',
    description:
      'Ouro Preto é um tesouro histórico com igrejas barrocas, ruas de pedra e uma atmosfera colonial única. Um passeio pela história do Brasil.',
    quickInfo: [
      { id: 'weather', label: 'Clima', value: '18°C', icon: 'cloud' },
      { id: 'season', label: 'Melhor época', value: 'Abr-Set', icon: 'calendar' },
      { id: 'cost', label: 'Custo médio', value: 'R$ 260/dia', icon: 'wallet' },
      { id: 'duration', label: 'Duração ideal', value: '2 dias', icon: 'time' },
    ],
    categories: ['Cultura', 'Histórico', 'Natureza'],
    recommendedPlaces: [
      { id: '1', name: 'Igreja de São Francisco', imageUrl: 'https://picsum.photos/seed/SaoFrancisco/400/300', rating: 4.9, distance: '0.3 km', category: 'Cultura' },
      { id: '2', name: 'Museu da Inconfidência', imageUrl: 'https://picsum.photos/seed/Inconfidencia/400/300', rating: 4.8, distance: '0.2 km', category: 'Cultura' },
    ],
    restaurants: [
      { id: '1', name: 'Casa do Ouvidor', imageUrl: 'https://picsum.photos/seed/Ouvidor/400/300', cuisine: 'Mineira', rating: 4.7 },
      { id: '2', name: 'O Canto da Sereia', imageUrl: 'https://picsum.photos/seed/Sereia/400/300', cuisine: 'Frutos do mar', rating: 4.6 },
    ],
    hotels: [
      { id: '1', name: 'Ouro Minas Palace Hotel', imageUrl: 'https://picsum.photos/seed/OuroMinasP/400/300', price: 'R$ 420/noite', rating: 4.7 },
      { id: '2', name: 'Pousada Clássica', imageUrl: 'https://picsum.photos/seed/Classica/400/300', price: 'R$ 280/noite', rating: 4.5 },
    ],
    mapLabel: 'Centro Histórico, Ouro Preto',
  },
  '5': {
    id: '5',
    name: 'Fortaleza',
    state: 'Ceará',
    region: 'Nordeste',
    rating: 4.6,
    heroImageUrl: 'https://picsum.photos/seed/Fortaleza/800/400',
    description:
      'Fortaleza é uma capital do Nordeste com praias selvagens, buggy rides no deserto e uma vida noturna eletrizante. Perfeita para aventura e diversão.',
    quickInfo: [
      { id: 'weather', label: 'Clima', value: '28°C', icon: 'sunny' },
      { id: 'season', label: 'Melhor época', value: 'Jan-Jul', icon: 'calendar' },
      { id: 'cost', label: 'Custo médio', value: 'R$ 240/dia', icon: 'wallet' },
      { id: 'duration', label: 'Duração ideal', value: '3 dias', icon: 'time' },
    ],
    categories: ['Praias', 'Eventos', 'Gastronomia', 'Vida Noturna'],
    recommendedPlaces: [
      { id: '1', name: 'Praia de Iracema', imageUrl: 'https://picsum.photos/seed/Iracema/400/300', rating: 4.7, distance: '1 km', category: 'Praias' },
      { id: '2', name: 'Dunas de Jericoacoara', imageUrl: 'https://picsum.photos/seed/Jeri/400/300', rating: 4.9, distance: '150 km', category: 'Natureza' },
    ],
    restaurants: [
      { id: '1', name: 'Mucuripe Seafood', imageUrl: 'https://picsum.photos/seed/Mucuripe/400/300', cuisine: 'Frutos do mar', rating: 4.8 },
      { id: '2', name: 'Taverna Camaceu', imageUrl: 'https://picsum.photos/seed/Camaceu/400/300', cuisine: 'Cearense', rating: 4.7 },
    ],
    hotels: [
      { id: '1', name: 'Marina Park Hotel', imageUrl: 'https://picsum.photos/seed/Marina/400/300', price: 'R$ 380/noite', rating: 4.6 },
      { id: '2', name: 'Hotel Luzeiros', imageUrl: 'https://picsum.photos/seed/Luzeiros/400/300', price: 'R$ 320/noite', rating: 4.5 },
    ],
    mapLabel: 'Praia de Iracema, Fortaleza',
  },
  '6': {
    id: '6',
    name: 'São Paulo',
    state: 'São Paulo',
    region: 'Sudeste',
    rating: 4.5,
    heroImageUrl: 'https://picsum.photos/seed/SaoPaulo/800/400',
    description:
      'São Paulo é a maior metrópole do Brasil com museus de classe mundial, gastronomia diversa e uma cena cultural vibrante. A cidade que nunca dorme.',
    quickInfo: [
      { id: 'weather', label: 'Clima', value: '22°C', icon: 'cloud' },
      { id: 'season', label: 'Melhor época', value: 'Abr-Set', icon: 'calendar' },
      { id: 'cost', label: 'Custo médio', value: 'R$ 350/dia', icon: 'wallet' },
      { id: 'duration', label: 'Duração ideal', value: '3 dias', icon: 'time' },
    ],
    categories: ['Cultura', 'Gastronomia', 'Vida Noturna', 'Eventos'],
    recommendedPlaces: [
      { id: '1', name: 'MASP', imageUrl: 'https://picsum.photos/seed/MASP/400/300', rating: 4.8, distance: '2 km', category: 'Cultura' },
      { id: '2', name: 'Pinacoteca do Estado', imageUrl: 'https://picsum.photos/seed/Pinacoteca/400/300', rating: 4.7, distance: '1.5 km', category: 'Cultura' },
    ],
    restaurants: [
      { id: '1', name: 'Fasano', imageUrl: 'https://picsum.photos/seed/Fasano/400/300', cuisine: 'Italiana', rating: 4.9 },
      { id: '2', name: 'Sushi Yasuda', imageUrl: 'https://picsum.photos/seed/Yasuda/400/300', cuisine: 'Japonesa', rating: 4.8 },
    ],
    hotels: [
      { id: '1', name: 'Emiliano Hotel', imageUrl: 'https://picsum.photos/seed/Emiliano/400/300', price: 'R$ 550/noite', rating: 4.8 },
      { id: '2', name: 'Hotel Unique', imageUrl: 'https://picsum.photos/seed/Unique/400/300', price: 'R$ 480/noite', rating: 4.7 },
    ],
    mapLabel: 'Avenida Paulista, São Paulo',
  },
  '7': {
    id: '7',
    name: 'Manaus',
    state: 'Amazonas',
    region: 'Norte',
    rating: 4.6,
    heroImageUrl: 'https://picsum.photos/seed/Manaus/800/400',
    description:
      'Manaus é a porta de entrada para a Floresta Amazônica. Uma experiência única na natureza selvagem com encontro das águas e aventura pura.',
    quickInfo: [
      { id: 'weather', label: 'Clima', value: '28°C', icon: 'sunny' },
      { id: 'season', label: 'Melhor época', value: 'Jun-Out', icon: 'calendar' },
      { id: 'cost', label: 'Custo médio', value: 'R$ 300/dia', icon: 'wallet' },
      { id: 'duration', label: 'Duração ideal', value: '3 dias', icon: 'time' },
    ],
    categories: ['Natureza', 'Aventura', 'Cultura'],
    recommendedPlaces: [
      { id: '1', name: 'Encontro das Águas', imageUrl: 'https://picsum.photos/seed/EncontroAguas/400/300', rating: 4.9, distance: '10 km', category: 'Natureza' },
      { id: '2', name: 'Teatro Amazonas', imageUrl: 'https://picsum.photos/seed/TeatroAmazonas/400/300', rating: 4.8, distance: '1 km', category: 'Cultura' },
    ],
    restaurants: [
      { id: '1', name: 'Pirarucu de Aripuanã', imageUrl: 'https://picsum.photos/seed/Pirarucu/400/300', cuisine: 'Amazônica', rating: 4.7 },
      { id: '2', name: 'Churrascaria Garota de Ipanema', imageUrl: 'https://picsum.photos/seed/Churrascaria/400/300', cuisine: 'Brasileira', rating: 4.6 },
    ],
    hotels: [
      { id: '1', name: 'Tropical Hotel', imageUrl: 'https://picsum.photos/seed/Tropical/400/300', price: 'R$ 480/noite', rating: 4.7 },
      { id: '2', name: 'Amazon Park Hotel', imageUrl: 'https://picsum.photos/seed/AmazonPark/400/300', price: 'R$ 340/noite', rating: 4.5 },
    ],
    mapLabel: 'Distrito Industrial, Manaus',
  },
  '8': {
    id: '8',
    name: 'Recife',
    state: 'Pernambuco',
    region: 'Nordeste',
    rating: 4.7,
    heroImageUrl: 'https://picsum.photos/seed/Recife/800/400',
    description:
      'Recife é uma cidade vibrante com praias paradisíacas, ilhas e uma história rica. Perfeita para quem quer sol, mar e muita diversão.',
    quickInfo: [
      { id: 'weather', label: 'Clima', value: '27°C', icon: 'sunny' },
      { id: 'season', label: 'Melhor época', value: 'Nov-Mar', icon: 'calendar' },
      { id: 'cost', label: 'Custo médio', value: 'R$ 270/dia', icon: 'wallet' },
      { id: 'duration', label: 'Duração ideal', value: '3 dias', icon: 'time' },
    ],
    categories: ['Praias', 'Cultura', 'Gastronomia', 'Eventos'],
    recommendedPlaces: [
      { id: '1', name: 'Praia de Boa Viagem', imageUrl: 'https://picsum.photos/seed/BoaViagem/400/300', rating: 4.8, distance: '5 km', category: 'Praias' },
      { id: '2', name: 'Antigo Recife', imageUrl: 'https://picsum.photos/seed/AntigoRecife/400/300', rating: 4.7, distance: '1 km', category: 'Cultura' },
    ],
    restaurants: [
      { id: '1', name: 'Carne Asada', imageUrl: 'https://picsum.photos/seed/CarneAsada/400/300', cuisine: 'Carnes', rating: 4.8 },
      { id: '2', name: 'Recife Velho', imageUrl: 'https://picsum.photos/seed/RecifeVelho/400/300', cuisine: 'Pernambucana', rating: 4.6 },
    ],
    hotels: [
      { id: '1', name: 'Recife Palace Hotel', imageUrl: 'https://picsum.photos/seed/RecifePalace/400/300', price: 'R$ 420/noite', rating: 4.6 },
      { id: '2', name: 'Guararapes Hotel', imageUrl: 'https://picsum.photos/seed/Guararapes/400/300', price: 'R$ 360/noite', rating: 4.5 },
    ],
    mapLabel: 'Boa Viagem, Recife',
  },
  '9': {
    id: '9',
    name: 'Bonito',
    state: 'Mato Grosso do Sul',
    region: 'Centro-Oeste',
    rating: 4.9,
    heroImageUrl: 'https://picsum.photos/seed/Bonito/800/400',
    description:
      'Bonito é um paraíso para ecoturismo e aventura. Grutas, mergulho em água doce cristalina e experiências inesquecíveis na natureza.',
    quickInfo: [
      { id: 'weather', label: 'Clima', value: '24°C', icon: 'cloud' },
      { id: 'season', label: 'Melhor época', value: 'Abr-Set', icon: 'calendar' },
      { id: 'cost', label: 'Custo médio', value: 'R$ 300/dia', icon: 'wallet' },
      { id: 'duration', label: 'Duração ideal', value: '3 dias', icon: 'time' },
    ],
    categories: ['Natureza', 'Aventura', 'Ecoturismo'],
    recommendedPlaces: [
      { id: '1', name: 'Gruta do Lago Azul', imageUrl: 'https://picsum.photos/seed/LagoAzul/400/300', rating: 4.9, distance: '20 km', category: 'Natureza' },
      { id: '2', name: 'Rio da Prata', imageUrl: 'https://picsum.photos/seed/RioPrata/400/300', rating: 4.8, distance: '25 km', category: 'Natureza' },
    ],
    restaurants: [
      { id: '1', name: 'Casa do Turista', imageUrl: 'https://picsum.photos/seed/CasaTurista/400/300', cuisine: 'Brasileira', rating: 4.7 },
      { id: '2', name: 'Tapera Açu', imageUrl: 'https://picsum.photos/seed/TaperaAcu/400/300', cuisine: 'Regional', rating: 4.6 },
    ],
    hotels: [
      { id: '1', name: 'Pousada da Boca da Onça', imageUrl: 'https://picsum.photos/seed/BocaOnca/400/300', price: 'R$ 450/noite', rating: 4.8 },
      { id: '2', name: 'Jaguar Hotel', imageUrl: 'https://picsum.photos/seed/Jaguar/400/300', price: 'R$ 320/noite', rating: 4.6 },
    ],
    mapLabel: 'Centro, Bonito',
  },
};

export const getCityDetailsById = (cityId?: string): CityDetails | null => {
  if (!cityId) return null;
  return citiesDatabase[cityId] || null;
};
    
