/**
 * Seed Firestore collection `cidades` a partir de BRAZIL_CITIES.csv.
 *
 * Campos por documento (espelham src/data/cidades.json):
 * - nome, estado, regiao (macrorregião via STATE)
 * - categorias: string[] — inferido de REGIAO_TUR + ALT (ver generate-cidades-json.js)
 * - categoriaTur / turismoMtur: A | B | C quando CATEGORIA_TUR existir
 *
 * Filtro de preferências do usuário (Firestore):
 *   usuarios/{uid}.preferencias = { regioes: string[], categorias: string[] }
 *   query: where('regiao', 'in', regioes) + array-contains-any em categorias
 *
 * Uso local (JSON para o app): node scripts/generate-cidades-json.js
 *
 * Este arquivo é um placeholder para o script Admin SDK da equipe.
 * Copie a lógica de inferCategorias de generate-cidades-json.js ao implementar o seed.
 */
console.log(
  'Use node scripts/generate-cidades-json.js para gerar src/data/cidades.json.\n' +
    'Implemente o upload Firestore Admin SDK aqui quando tiver a chave de serviço.',
);
