export type CityCategory =
  | 'Praias'
  | 'Gastronomia'
  | 'Cultura'
  | 'Natureza'
  | 'Vida Noturna'
  | 'Eventos'
  | 'Histórico'
  | 'Aventura'
  | 'Ecoturismo';

export type QuickInfo = {
  id: string;
  label: string;
  value: string;
  icon: string;
};

export type RecommendedPlace = {
  id: string;
  name: string;
  imageUrl?: string | null;
  rating: number;
  distance: string;
  category: CityCategory;
};

export type Restaurant = {
  id: string;
  name: string;
  imageUrl?: string | null;
  cuisine: string;
  rating: number;
};

export type Hotel = {
  id: string;
  name: string;
  imageUrl?: string | null;
  price: string;
  rating: number;
};

export type CityDetails = {
  id: string;
  name: string;
  state: string;
  region: string;
  rating: number;
  heroImageUrl?: string | null;
  description: string;
  quickInfo: QuickInfo[];
  categories: CityCategory[];
  recommendedPlaces: RecommendedPlace[];
  restaurants: Restaurant[];
  hotels: Hotel[];
  mapLabel: string;
};
