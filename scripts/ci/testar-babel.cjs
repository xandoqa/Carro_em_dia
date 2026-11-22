/**
 * Mede se o plugin de worklets roda uma ou duas vezes.
 *
 * O babel-preset-expo pode adicionar o plugin sozinho; o babel.config.js do
 * projeto também o declara. Rodar duas vezes pode compilar sem erro e mesmo
 * assim quebrar as animações no aparelho. Aqui o mesmo trecho é transformado
 * com a configuração do projeto e com o preset puro, e as saídas comparadas.
 *
 * O plugin de worklets relê o arquivo-fonte do disco, então o trecho é
 * gravado num arquivo de verdade, apagado no fim.
 */
const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');

const codigo = `import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
export function useX() {
  const v = useSharedValue(0);
  return useAnimatedStyle(() => ({ width: v.value }));
}
`;
const arquivo = path.join(process.cwd(), 'src', '__babel_teste__.tsx');
fs.writeFileSync(arquivo, codigo);

function transformar(opcoes) {
  return babel.transformSync(codigo, {
    filename: arquivo,
    caller: { name: 'metro', platform: 'ios', bundler: 'metro' },
    ...opcoes,
  }).code;
}

let codigoSaida = 0;
try {
  const comProjeto = transformar({ configFile: path.join(process.cwd(), 'babel.config.js') });
  const soPreset = transformar({
    configFile: false,
    babelrc: false,
    presets: ['babel-preset-expo'],
  });

  const contar = (s) => (s.match(/__workletHash/g) || []).length;
  const a = contar(comProjeto);
  const b = contar(soPreset);
  console.log('worklets com o babel.config.js do projeto:', a);
  console.log('worklets so com o babel-preset-expo      :', b);
  console.log('saidas identicas?', comProjeto === soPreset);

  if (b === 0) {
    console.log('=> o preset NAO adiciona o plugin: a linha do projeto e necessaria');
  } else if (a > b) {
    console.log('=> DUPLICADO: o plugin roda duas vezes com a config do projeto');
    codigoSaida = 1;
  } else {
    console.log('=> o preset ja adiciona o plugin; a linha do projeto nao duplica');
  }
} finally {
  fs.unlinkSync(arquivo);
}
process.exit(codigoSaida);
