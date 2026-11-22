#!/usr/bin/env node
/**
 * Instalação do CarroEmDia.
 *
 * Existe porque a sequência ingênua não funciona:
 *
 *   npm install expo@latest && npm install && npx expo install --fix
 *
 * O `npm install` do meio falha com ERESOLVE sempre que o SDK novo exige uma
 * versão de biblioteca que o `package.json` ainda prende na versão antiga —
 * e o passo que consertaria exatamente isso (`expo install --fix`) só roda
 * depois, ou seja, nunca. Caso real: o SDK 58 traz `react-native@0.88`, que
 * pede `@types/react@^19.1.1`, enquanto o `package.json` prendia `~19.0.10`.
 *
 * A ordem aqui é outra. Primeiro instala tolerando o conflito, só para ter o
 * CLI do Expo em mãos; depois pergunta ao Expo quais versões são as certas
 * para o SDK instalado, o que reescreve o `package.json`; e só então faz a
 * instalação limpa, que agora resolve sem conflito nenhum.
 *
 * Roda em Node puro, sem dependência instalada — ele precisa funcionar
 * justamente quando não há `node_modules`.
 *
 * Uso:
 *   node scripts/setup.mjs           instala no SDK mais recente (padrão)
 *   node scripts/setup.mjs --fixo    mantém as versões do package.json
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARGS = new Set(process.argv.slice(2));
const FIXO = ARGS.has('--fixo');

const cor = process.stdout.isTTY && !process.env.NO_COLOR;
const C = {
  reset: cor ? '\x1b[0m' : '',
  forte: cor ? '\x1b[1m' : '',
  fraco: cor ? '\x1b[2m' : '',
  verde: cor ? '\x1b[32m' : '',
  amarelo: cor ? '\x1b[33m' : '',
  vermelho: cor ? '\x1b[31m' : '',
  azul: cor ? '\x1b[36m' : '',
};

let etapaAtual = 0;
const TOTAL = FIXO ? 3 : 4;

function titulo(texto) {
  etapaAtual += 1;
  console.log('');
  console.log(`${C.azul}${C.forte}[${etapaAtual}/${TOTAL}] ${texto}${C.reset}`);
}

function nota(texto) {
  console.log(`${C.fraco}      ${texto}${C.reset}`);
}

function ok(texto) {
  console.log(`${C.verde}      ✓ ${texto}${C.reset}`);
}

function aviso(texto) {
  console.log(`${C.amarelo}      ! ${texto}${C.reset}`);
}

/**
 * Roda um comando mostrando a saída ao vivo. Devolve o código de saída e,
 * quando falha, também a saída capturada — precisamos dela para reconhecer o
 * ERESOLVE e decidir o que fazer, mas não queremos esconder o progresso de
 * quem está olhando o terminal durante um download de minutos.
 */
function rodar(comando, argumentos, { capturar = false } = {}) {
  console.log(`${C.fraco}      $ ${comando} ${argumentos.join(' ')}${C.reset}`);
  const r = spawnSync(comando, argumentos, {
    cwd: RAIZ,
    stdio: capturar ? ['inherit', 'pipe', 'pipe'] : 'inherit',
    shell: process.platform === 'win32',
    encoding: 'utf8',
  });
  if (capturar) {
    const saida = `${r.stdout ?? ''}${r.stderr ?? ''}`;
    if (r.status !== 0) process.stderr.write(saida);
    return { codigo: r.status ?? 1, saida };
  }
  return { codigo: r.status ?? 1, saida: '' };
}

function ehConflitoDePeer(saida) {
  return /ERESOLVE|could not resolve dependency|conflicting peer dependency/i.test(saida);
}

function encerrar(mensagem, detalhe) {
  console.log('');
  console.log(`${C.vermelho}${C.forte}A instalação parou aqui.${C.reset}`);
  console.log('');
  console.log(`  ${C.forte}O que aconteceu${C.reset}`);
  console.log(`  ${mensagem}`);
  if (detalhe) {
    console.log('');
    console.log(`  ${C.forte}O que fazer${C.reset}`);
    console.log(`  ${detalhe}`);
  }
  console.log('');
  console.log(`  Se não resolver, rode ${C.forte}npm run doctor${C.reset} e me mande a saída.`);
  console.log('');
  process.exit(1);
}

/* ========================================================================== */

console.log('');
console.log(`${C.forte}Instalação do CarroEmDia${C.reset}`);
console.log(
  `${C.fraco}${FIXO ? 'Modo fixo: mantém as versões do package.json.' : 'Instala no SDK mais recente do Expo.'}${C.reset}`,
);

if (!fs.existsSync(path.join(RAIZ, 'package.json'))) {
  encerrar(
    'Não há package.json nesta pasta, então este não é o diretório do projeto.',
    'Entre na pasta do projeto antes de rodar. Se você extraiu o .zip, ela costuma\n  se chamar Carro_em_dia-main, e não Carro_em_dia.',
  );
}

/* -------------------------------------------------------------------------- */

if (!FIXO) {
  titulo('Atualizando o Expo para a versão mais recente');
  nota('A versão presa no package.json envelhece, e o Expo Go das lojas');
  nota('recusa projetos de SDK antigo. Quem sabe qual é a atual é o npm.');

  const r = rodar('npm', ['install', 'expo@latest', '--save', '--legacy-peer-deps'], {
    capturar: true,
  });
  if (r.codigo !== 0) {
    encerrar(
      'Não foi possível baixar a versão mais recente do Expo.',
      'Verifique a conexão. Se estiver sem internet agora, use as versões já\n  fixadas no projeto:  npm run setup:fixo',
    );
  }
  ok('Expo atualizado no package.json');
}

/* -------------------------------------------------------------------------- */

titulo('Instalando as dependências');
nota('Esta é a etapa longa: são cerca de 700 MB. De 2 a 5 minutos.');

let r = rodar('npm', ['install'], { capturar: true });

if (r.codigo !== 0 && ehConflitoDePeer(r.saida)) {
  console.log('');
  aviso('Conflito de versões entre bibliotecas (ERESOLVE).');
  nota('Normal depois de trocar de SDK: alguma versão do package.json ainda');
  nota('é a do SDK anterior. Instalando assim mesmo para ter o CLI do Expo —');
  nota('o próximo passo acerta as versões e a instalação final fica limpa.');
  console.log('');
  r = rodar('npm', ['install', '--legacy-peer-deps'], { capturar: true });

  if (r.codigo !== 0) {
    encerrar(
      'A instalação falhou mesmo ignorando o conflito de versões.',
      'Apague o que ficou pela metade e tente de novo:\n\n' +
        '    rm -rf node_modules package-lock.json\n' +
        '    npm run setup\n\n' +
        '  No Windows (PowerShell):\n\n' +
        '    Remove-Item -Recurse -Force node_modules, package-lock.json\n' +
        '    npm run setup',
    );
  }
  aviso('Instalado com versões ainda desalinhadas — corrigidas no passo seguinte.');
} else if (r.codigo !== 0) {
  encerrar(
    'O npm install falhou por um motivo que não é conflito de versões.',
    'A causa costuma estar nas últimas linhas acima. As mais comuns:\n\n' +
      '  • Sem internet ou proxy bloqueando o registro do npm\n' +
      '  • Permissão negada: não use sudo; veja a seção 10 do README-INSTALACAO.md\n' +
      '  • Disco cheio',
  );
} else {
  ok('Dependências instaladas');
}

/* -------------------------------------------------------------------------- */

titulo('Alinhando as bibliotecas ao SDK instalado');
nota('O Expo sabe qual versão de cada biblioteca combina com o SDK. Este');
nota('passo reescreve o package.json com essas versões — é ele que desfaz');
nota('o conflito, e por isso vem antes da instalação final.');

r = rodar('npx', ['expo', 'install', '--fix']);
if (r.codigo !== 0) {
  encerrar(
    'Não foi possível alinhar as versões das bibliotecas.',
    'Tente rodar sozinho, para ver a mensagem inteira:\n\n' +
      '    npx expo install --fix\n\n' +
      '  Se ele reclamar de rede, é a consulta à API do Expo: tente de novo\n' +
      '  com a internet estável.',
  );
}
ok('Versões alinhadas');

/* -------------------------------------------------------------------------- */

if (!FIXO) {
  titulo('Instalação final, já sem conflito');
  nota('Agora que as versões combinam, uma instalação limpa, sem exceções.');

  r = rodar('npm', ['install'], { capturar: true });
  if (r.codigo !== 0 && ehConflitoDePeer(r.saida)) {
    aviso('Ainda há um conflito que o Expo não resolveu sozinho.');
    nota('O projeto funciona assim, mas vale olhar depois da apresentação.');
    rodar('npm', ['install', '--legacy-peer-deps']);
  } else if (r.codigo !== 0) {
    encerrar(
      'A instalação final falhou.',
      'Apague e recomece:\n\n    rm -rf node_modules package-lock.json\n    npm run setup',
    );
  } else {
    ok('Instalação limpa');
  }
}

/* -------------------------------------------------------------------------- */

console.log('');
console.log(`${C.verde}${C.forte}Instalação concluída. Diagnóstico a seguir.${C.reset}`);

const diag = spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'doctor.mjs')], {
  cwd: RAIZ,
  stdio: 'inherit',
});

if (diag.status === 0) {
  console.log('');
  console.log(`${C.forte}Pronto. Para iniciar:${C.reset}  npm start`);
  console.log('');
}

process.exit(diag.status ?? 0);
