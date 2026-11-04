/**
 * Exporta os tokens do tema para `design/tokens/tokens.json`.
 *
 * A fonte da verdade continua sendo `src/theme`; este arquivo gera a versao
 * legivel por ferramentas de design, para que a paleta documentada nunca
 * divirja da que o app usa de verdade.
 *
 * Uso: npm run tokens
 *
 * O script roda no Node puro, fora do React Native. Como `theme/fonts.ts`
 * precisa de `Platform`, substituimos o modulo por um substituto minimo antes
 * de importar o tema — e o unico ponto em que a plataforma aparece.
 */

import Module from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/* -------------------------------------------------------------------------- */
/* Substituto de react-native                                                  */
/* -------------------------------------------------------------------------- */

interface ModuleComLoad {
  _load(request: string, parent: unknown, isMain: boolean): unknown;
}

const moduleInterno = Module as unknown as ModuleComLoad;
const carregarOriginal = moduleInterno._load.bind(moduleInterno);

moduleInterno._load = function (request, parent, isMain) {
  if (request === 'react-native') {
    return {
      Platform: {
        OS: 'ios',
        select: (opcoes: Record<string, unknown>) =>
          opcoes.ios ?? opcoes.default,
      },
    };
  }
  return carregarOriginal(request, parent, isMain);
};

/* -------------------------------------------------------------------------- */

async function main() {
  // Importados depois do substituto estar no lugar.
  const { themes, themeOrder } = await import('../src/theme/palettes');
  const tokens = await import('../src/theme/tokens');

  const saida = {
    nome: 'CarroEmDia',
    versao: '1.0.0',
    gerado:
      'Arquivo gerado por scripts/export-tokens.ts. Nao edite a mao: ' +
      'a fonte da verdade e src/theme.',
    espacamento: tokens.spacing,
    raio: tokens.radius,
    notaRaio:
      'O raio codifica o papel do elemento: 20 objeto, 10 controle, ' +
      '4 leitura, 999 estado.',
    tipografia: tokens.typography,
    movimento: tokens.motion,
    layout: tokens.layout,
    temas: Object.fromEntries(
      themeOrder.map((id) => [
        id,
        {
          nome: themes[id].name,
          descricao: themes[id].description,
          esquema: themes[id].scheme,
          cores: themes[id].colors,
        },
      ]),
    ),
  };

  const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const destino = resolve(raiz, 'design/tokens/tokens.json');

  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, `${JSON.stringify(saida, null, 2)}\n`, 'utf8');

  console.warn(
    `tokens.json gerado com ${themeOrder.length} temas em design/tokens/`,
  );
}

void main();
