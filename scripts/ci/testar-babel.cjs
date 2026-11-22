/**
 * Mede se o plugin de worklets roda uma ou duas vezes.
 *
 * O babel-preset-expo pode adicionar o plugin sozinho; o babel.config.js do
 * projeto também o declara. Rodar duas vezes compila sem erro, mas pode
 * quebrar as animações no aparelho. Aqui o mesmo trecho é transformado com a
 * configuração do projeto e com o preset puro, e as saídas são comparadas.
 */
const babel = require('@babel/core');
const path = require('path');

const codigo = `
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
export function useX() {
  const v = useSharedValue(0);
  return useAnimatedStyle(() => ({ width: v.value }));
}
`;
const arquivo = path.join(process.cwd(), 'src', '__babel_teste__.tsx');

function transformar(opcoes) {
  return babel.transformSync(codigo, {
    filename: arquivo,
    caller: { name: 'metro', platform: 'ios', bundler: 'metro' },
    ...opcoes,
  }).code;
}

const comProjeto = transformar({ configFile: path.join(process.cwd(), 'babel.config.js') });
const soPreset = transformar({ configFile: false, babelrc: false, presets: ['babel-preset-expo'] });

const contar = (s) => (s.match(/__workletHash/g) || []).length;
console.log('worklets com babel.config.js do projeto:', contar(comProjeto));
console.log('worklets so com babel-preset-expo     :', contar(soPreset));
console.log('saidas identicas?', comProjeto === soPreset);
if (contar(soPreset) === 0) console.log('=> o preset NAO adiciona o plugin sozinho');
else if (contar(comProjeto) > contar(soPreset)) console.log('=> DUPLICADO: o plugin roda duas vezes');
else console.log('=> o preset ja adiciona o plugin; a linha do projeto e redundante');
