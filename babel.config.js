/**
 * Babel do Expo.
 *
 * O plugin de worklets precisa ser o ULTIMO da lista: ele reescreve as funcoes
 * marcadas como worklet e, se outro plugin rodar depois, a transformacao se
 * perde — o app abre e trava com um erro de worklet difícil de entender.
 *
 * Qual plugin usar mudou de nome entre as versoes do Reanimated:
 *
 *   Reanimated 3 (Expo SDK 53)  -> 'react-native-reanimated/plugin'
 *   Reanimated 4 (Expo SDK 54+) -> 'react-native-worklets/plugin'
 *
 * Em vez de fixar um nome e quebrar quando o SDK for atualizado, o arquivo
 * descobre qual existe. Isso faz o projeto funcionar tanto no SDK fixado no
 * package.json quanto depois de um `npx expo install --fix`, que e o caminho
 * recomendado para rodar no Expo Go mais recente.
 */

function pluginDeWorklets() {
  // O pacote react-native-worklets so existe a partir do Reanimated 4.
  try {
    require.resolve('react-native-worklets/plugin');
    return 'react-native-worklets/plugin';
  } catch {
    return 'react-native-reanimated/plugin';
  }
}

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'react' }]],
    plugins: [pluginDeWorklets()],
  };
};
