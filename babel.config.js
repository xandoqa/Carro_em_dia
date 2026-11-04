/**
 * Babel do Expo.
 *
 * O plugin do Reanimated precisa ser o ultimo da lista: ele reescreve as
 * funcoes marcadas como worklet e, se outro plugin rodar depois, a
 * transformacao se perde.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'react' }]],
    plugins: ['react-native-reanimated/plugin'],
  };
};
