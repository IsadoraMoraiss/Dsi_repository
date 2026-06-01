// services/pexels.ts

const API_KEY = 'BZmehzlQXoVRQw3OL8fsNhfQPa8stzTKxh5gMgAoGW20wNon1iHW5Ssg';

export async function buscarImagemCidade(cidade: string) {
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${cidade}+Brasil&per_page=1`,
      {
        headers: {
          Authorization: API_KEY,
        },
      }
    );

    const data = await response.json();

    return data.photos[0]?.src?.large;
  } catch (error) {
    console.log('Erro ao buscar imagem:', error);
    return null;
  }
}