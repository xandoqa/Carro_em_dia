/**
 * Configuração do Expo. Lê o app.json e só acrescenta o caminho-base da web
 * quando ele é pedido por variável de ambiente.
 *
 * Existe para a publicação no GitHub Pages, onde o app fica em
 * https://xandoqa.github.io/Carro_em_dia/ — num subcaminho, e não na raiz.
 * O workflow de publicação define EXPO_BASE_URL=/Carro_em_dia; em qualquer
 * outro uso (npm start, npm run web, Expo Go) a variável não existe e nada
 * muda.
 */
module.exports = ({ config }) => {
  const baseUrl = process.env.EXPO_BASE_URL;
  if (!baseUrl) return config;
  return {
    ...config,
    experiments: { ...config.experiments, baseUrl },
  };
};
