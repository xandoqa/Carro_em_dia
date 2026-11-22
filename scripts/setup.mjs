#!/usr/bin/env node
/**
 * Instalação do CarroEmDia.
 *
 * Caminho normal: `npm ci`. Ele instala EXATAMENTE as versões gravadas no
 * package-lock.json — o mesmo conjunto que o GitHub Actions instala, verifica
 * e compila para iOS, Android e web a cada push. Não resolve nada, então não
 * existe conflito de versão possível, e o resultado é igual em qualquer
 * máquina. Ele também apaga um node_modules antigo antes de instalar, o que
 * desfaz qualquer instalação pela metade.
 *
 * O que este script NÃO faz mais: pular para o SDK mais recente por conta
 * própria. As versões de hoje (Expo SDK 58) são as que foram testadas; um SDK
 * que saia amanhã não foi. Atualizar o SDK é uma decisão, e tem comando
 * próprio: `npm run sdk:atualizar`.
 *
 * Node puro, sem dependência instalada — precisa rodar quando não há
 * node_modules.
 *
 * Uso:
 *   node scripts/setup.mjs                 instalação padrão (npm ci)
 *   node scripts/setup.mjs --atualizar-sdk sobe o Expo para o SDK mais recente
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARGS = new Set(process.argv.slice(2));
const ATUALIZAR_SDK = ARGS.has('--atualizar-sdk');

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

let etapa = 0;
function titulo(texto) {
  etapa += 1;
  console.log('');
  console.log(`${C.azul}${C.forte}[${etapa}] ${texto}${C.reset}`);
}
const nota = (t) => console.log(`${C.fraco}    ${t}${C.reset}`);
const ok = (t) => console.log(`${C.verde}    ✓ ${t}${C.reset}`);
const aviso = (t) => console.log(`${C.amarelo}    ! ${t}${C.reset}`);

/**
 * Roda um comando com a saída ao vivo. Com `capturar`, também guarda a
 * saída para reconhecer o tipo de erro — e a reimprime se falhar, para nada
 * ficar escondido.
 */
function rodar(cmd, args, { capturar = false } = {}) {
  console.log(`${C.fraco}    $ ${cmd} ${args.join(' ')}${C.reset}`);
  const r = spawnSync(cmd, args, {
    cwd: RAIZ,
    stdio: capturar ? ['inherit', 'pipe', 'pipe'] : 'inherit',
    shell: process.platform === 'win32',
    encoding: 'utf8',
  });
  const saida = capturar ? `${r.stdout ?? ''}${r.stderr ?? ''}` : '';
  if (capturar && r.status !== 0) process.stderr.write(saida);
  return { codigo: r.status ?? 1, saida };
}

const conflito = (s) =>
  /ERESOLVE|could not resolve dependency|conflicting peer dependency/i.test(s);

function parar(oque, fazer) {
  console.log('');
  console.log(`${C.vermelho}${C.forte}A instalação parou.${C.reset}`);
  console.log('');
  console.log(`  ${C.forte}O que aconteceu:${C.reset} ${oque}`);
  if (fazer) {
    console.log('');
    console.log(`  ${C.forte}O que fazer:${C.reset}`);
    for (const linha of fazer.split('\n')) console.log(`  ${linha}`);
  }
  console.log('');
  console.log(`  Se não resolver: ${C.forte}npm run doctor${C.reset} e mande a saída.`);
  console.log('');
  process.exit(1);
}

/* ========================================================================== */

console.log('');
console.log(`${C.forte}Instalação do CarroEmDia${C.reset}`);

if (!fs.existsSync(path.join(RAIZ, 'package.json'))) {
  parar(
    'não há package.json aqui — esta não é a pasta do projeto.',
    'Entre na pasta certa. Se veio do .zip, ela se chama Carro_em_dia-main.',
  );
}

const versaoNode = Number(process.versions.node.split('.')[0]);
if (versaoNode < 20) {
  parar(
    `o Node instalado é o ${process.versions.node}, e o projeto exige 20 ou mais novo.`,
    'Linux e macOS:  nvm install 22 && nvm use 22\n' +
      'Windows:        baixe o instalador LTS em https://nodejs.org',
  );
}

const temLock = fs.existsSync(path.join(RAIZ, 'package-lock.json'));

/* -------------------------------------------------------------------------- */

if (ATUALIZAR_SDK) {
  titulo('Atualizando o Expo para o SDK mais recente');
  aviso('As versões novas NÃO foram testadas no CI. Rode npm run verify depois.');

  let r = rodar('npm', ['install', 'expo@latest', '--save', '--legacy-peer-deps'], {
    capturar: true,
  });
  if (r.codigo !== 0) parar('não foi possível baixar o Expo mais recente.', 'Confira a internet.');

  titulo('Alinhando as bibliotecas ao SDK novo');
  r = rodar('npx', ['expo', 'install', '--fix']);
  if (r.codigo !== 0) {
    aviso('O alinhamento automático tropeçou. Tentando instalar tolerando conflitos.');
    r = rodar('npm', ['install', '--legacy-peer-deps']);
    if (r.codigo === 0) r = rodar('npx', ['expo', 'install', '--fix']);
    if (r.codigo !== 0) parar('não foi possível alinhar as versões ao SDK novo.');
  }
  ok('SDK atualizado');
} else if (temLock) {
  titulo('Instalando as versões testadas (npm ci)');
  nota('Exatamente o conjunto do package-lock.json — o mesmo que passa no CI.');
  nota('Cerca de 700 MB. De 2 a 5 minutos.');

  const r = rodar('npm', ['ci', '--no-audit', '--no-fund'], { capturar: true });

  if (r.codigo === 0) {
    ok('Dependências instaladas');
  } else {
    // npm ci só falha por três motivos práticos: lock fora de sincronia com o
    // package.json (alguém editou um sem o outro), rede, ou disco.
    console.log('');
    aviso('O npm ci falhou. Tentando a instalação comum.');
    let r2 = rodar('npm', ['install', '--no-audit', '--no-fund'], { capturar: true });
    if (r2.codigo !== 0 && conflito(r2.saida)) {
      aviso('Conflito de versões — instalando tolerando o conflito.');
      r2 = rodar('npm', ['install', '--legacy-peer-deps', '--no-audit', '--no-fund']);
    }
    if (r2.codigo !== 0) {
      parar(
        'nenhuma das formas de instalação funcionou.',
        'Apague o que ficou pela metade e tente de novo:\n\n' +
          '  rm -rf node_modules\n' +
          '  npm run setup\n\n' +
          'No Windows (PowerShell):  Remove-Item -Recurse -Force node_modules',
      );
    }
    aviso('Instalado pelo caminho alternativo. Rode npm run verify para conferir.');
  }
} else {
  titulo('Instalando as dependências');
  nota('Sem package-lock.json: o npm vai resolver as versões agora.');
  let r = rodar('npm', ['install', '--no-audit', '--no-fund'], { capturar: true });
  if (r.codigo !== 0 && conflito(r.saida)) {
    aviso('Conflito de versões — instalando tolerando o conflito.');
    r = rodar('npm', ['install', '--legacy-peer-deps', '--no-audit', '--no-fund']);
  }
  if (r.codigo !== 0) parar('o npm install falhou.', 'Veja as últimas linhas acima.');
  ok('Dependências instaladas');
}

/* -------------------------------------------------------------------------- */

console.log('');
console.log(`${C.verde}${C.forte}Instalação concluída. Diagnóstico:${C.reset}`);

const diag = spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'doctor.mjs')], {
  cwd: RAIZ,
  stdio: 'inherit',
});

if (diag.status === 0) {
  console.log('');
  console.log(`${C.forte}Pronto.${C.reset}`);
  console.log(`  Celular (Expo Go):  ${C.forte}npm start${C.reset}`);
  console.log(`  Navegador:          ${C.forte}npm run web${C.reset}`);
  console.log(`  Emulador Android:   ${C.forte}npm run android${C.reset}`);
  console.log('');
}

process.exit(diag.status ?? 0);
