#!/usr/bin/env node
/**
 * Diagnóstico do CarroEmDia.
 *
 * Verifica o ambiente antes de rodar o app e, quando acha um problema, diz
 * cinco coisas: o que aconteceu, por que provavelmente aconteceu, qual arquivo
 * ou dependência está envolvida, como resolver, e o comando exato para
 * executar.
 *
 * Roda em Node puro, sem nenhuma dependência instalada — de propósito: ele
 * precisa funcionar justamente quando o `npm install` ainda não rodou ou
 * falhou, que é quando mais se precisa dele.
 *
 * Uso:
 *   node scripts/doctor.mjs              diagnóstico completo
 *   node scripts/doctor.mjs --preflight  versão curta, antes de iniciar o app
 *   node scripts/doctor.mjs --json       saída em JSON, para script
 *
 * Códigos de saída: 0 tudo bem ou só avisos, 1 há algo que impede de rodar.
 */

import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require_ = createRequire(path.join(RAIZ, 'package.json'));

const ARGS = new Set(process.argv.slice(2));
const PREFLIGHT = ARGS.has('--preflight');
const JSON_OUT = ARGS.has('--json');

/* ========================================================================== */
/* Saída                                                                      */
/* ========================================================================== */

// Cores só quando a saída é um terminal de verdade; num arquivo de log elas
// virariam lixo tipo [32m.
const TTY = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (TTY ? `\u001b[${code}m${s}\u001b[0m` : s);
const verde = (s) => c('32', s);
const vermelho = (s) => c('31', s);
const amarelo = (s) => c('33', s);
const azul = (s) => c('36', s);
const forte = (s) => c('1', s);
const fraco = (s) => c('2', s);

const achados = [];

/**
 * Registra um problema.
 *
 * `nivel` e 'erro' (impede rodar) ou 'aviso'. `ordem` diz o que resolver
 * primeiro quando aparece mais de um: listar tres avisos sem dizer por onde
 * comecar deixa a decisao com quem menos sabe do assunto.
 *
 *   1  resolver antes de tentar rodar
 *   2  resolver para rodar no celular
 *   3  so se for usar o recurso
 */
function problema({ nivel, titulo, porque, onde, solucao, comando, ordem = 2 }) {
  achados.push({ nivel, titulo, porque, onde, solucao, comando, ordem });
}

function ok(texto) {
  if (!JSON_OUT && !PREFLIGHT) console.log(`  ${verde('✓')} ${texto}`);
}

function secao(titulo) {
  if (!JSON_OUT && !PREFLIGHT) console.log(`\n${forte(titulo)}`);
}

/* ========================================================================== */
/* Utilidades                                                                 */
/* ========================================================================== */

function existe(rel) {
  return fs.existsSync(path.join(RAIZ, rel));
}

function lerJson(rel) {
  try {
    return JSON.parse(fs.readFileSync(path.join(RAIZ, rel), 'utf8'));
  } catch {
    return null;
  }
}

/** Versão instalada de um pacote, lendo o package.json dele. */
function versaoInstalada(nome) {
  try {
    const p = require_.resolve(`${nome}/package.json`);
    return JSON.parse(fs.readFileSync(p, 'utf8')).version;
  } catch {
    return null;
  }
}

function comandoExiste(cmd) {
  try {
    execSync(process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`, {
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

function portaLivre(porta) {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once('error', () => resolve(false));
    s.once('listening', () => s.close(() => resolve(true)));
    s.listen(porta, '127.0.0.1');
  });
}

/**
 * Como recuperar um arquivo alterado ou ausente.
 *
 * Quem clonou com git restaura em um comando. Quem baixou o .zip nao tem
 * historico nenhum, entao mandar `git checkout` seria dar um comando que
 * falha — a pior coisa que um diagnostico pode fazer.
 */
const USA_GIT = fs.existsSync(path.join(RAIZ, '.git'));

function comoRecuperar(arquivo) {
  if (USA_GIT) return `git checkout ${arquivo}`;
  return (
    `Baixe o projeto de novo e copie ${arquivo} para esta pasta: ` +
    'https://github.com/xandoqa/Carro_em_dia/archive/refs/heads/main.zip'
  );
}

/** 'linux' | 'darwin' | 'win32' em nome legível. */
const SISTEMA = { linux: 'Linux', darwin: 'macOS', win32: 'Windows' }[process.platform]
  ?? process.platform;

/* ========================================================================== */
/* Verificações                                                               */
/* ========================================================================== */

function checarNode() {
  secao('Ambiente');

  const atual = process.versions.node;
  const maior = Number(atual.split('.')[0]);

  if (maior < 20) {
    problema({
      nivel: 'erro',
      titulo: `Node.js ${atual} é antigo demais`,
      porque:
        'O Expo SDK 53 em diante exige Node 20 ou mais novo. Versões antigas ' +
        'falham no meio do bundle com erros que não dizem que a causa é a versão.',
      onde: 'A versão do Node instalada no sistema.',
      solucao:
        SISTEMA === 'Linux'
          ? 'Instale pelo nvm. O Node que vem no apt costuma ser antigo demais.'
          : 'Instale a versão LTS em https://nodejs.org',
      comando:
        SISTEMA === 'Linux'
          ? 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && nvm install --lts'
          : 'Baixe a versão LTS em https://nodejs.org',
    });
    return;
  }

  ok(`Node.js ${atual}`);
  ok(`Sistema: ${SISTEMA} (${os.arch()})`);

  if (!comandoExiste('npm')) {
    problema({
      nivel: 'erro',
      titulo: 'npm não foi encontrado',
      porque: 'O npm vem junto com o Node. Não achar significa instalação incompleta ou PATH errado.',
      onde: 'PATH do sistema.',
      solucao: 'Reinstale o Node.js, que traz o npm junto.',
      comando: 'node --version && npm --version',
    });
  } else {
    ok('npm disponível');
  }
}

function checarDependencias() {
  secao('Dependências');

  if (!existe('node_modules')) {
    problema({
      nivel: 'erro',
      titulo: 'As dependências não foram instaladas',
      porque: 'A pasta node_modules não existe. Nada do projeto roda sem ela.',
      onde: 'node_modules, na raiz do projeto.',
      solucao:
        'Instale as dependências e depois alinhe as versões ao SDK do Expo. ' +
        'Os dois comandos são necessários: o segundo corrige versões incompatíveis.',
      comando: 'npm install && npx expo install --fix',
    });
    return false;
  }
  ok('node_modules existe');

  const pkg = lerJson('package.json');
  if (!pkg) {
    problema({
      nivel: 'erro',
      titulo: 'package.json ilegível',
      porque: 'O arquivo está ausente ou com JSON inválido (vírgula sobrando, chave não fechada).',
      onde: 'package.json',
      solucao: USA_GIT
        ? 'Restaure o arquivo a partir do repositorio.'
        : 'Baixe o projeto de novo e copie o arquivo que falta.',
      comando: comoRecuperar('package.json'),
    });
    return false;
  }

  const faltando = Object.keys(pkg.dependencies ?? {}).filter(
    (d) => versaoInstalada(d) === null,
  );

  if (faltando.length > 0) {
    problema({
      nivel: 'erro',
      titulo: `${faltando.length} dependência(s) declarada(s) mas não instalada(s)`,
      porque:
        'O package.json pede pacotes que não estão em node_modules. Normalmente é ' +
        'um `npm install` interrompido no meio, ou troca de branch sem reinstalar.',
      onde: `Faltando: ${faltando.join(', ')}`,
      solucao: 'Reinstale do zero, apagando o estado parcial.',
      comando: 'rm -rf node_modules package-lock.json && npm install && npx expo install --fix',
    });
    return false;
  }
  ok(`${Object.keys(pkg.dependencies ?? {}).length} dependências instaladas`);

  return true;
}

function checarExpo() {
  secao('Expo');

  const expo = versaoInstalada('expo');
  if (!expo) {
    problema({
      nivel: 'erro',
      titulo: 'O pacote expo não está instalado',
      porque: 'É o núcleo do projeto; sem ele nenhum comando `expo` funciona.',
      onde: 'node_modules/expo',
      solucao: 'Instale as dependências.',
      comando: 'npm install && npx expo install --fix',
    });
    return;
  }

  const sdk = Number(expo.split('.')[0]);
  ok(`Expo SDK ${sdk} (${expo})`);

  // O Expo Go da loja acompanha o SDK mais recente. Um projeto preso num SDK
  // antigo instala e compila, mas o celular recusa abrir — e a mensagem no
  // aparelho não explica o que fazer.
  const ANO_SDK53 = 2025;
  const anosDesde = new Date().getFullYear() - ANO_SDK53;
  if (sdk <= 53 && anosDesde >= 1) {
    problema({
      nivel: 'aviso',
      titulo: `O SDK ${sdk} pode ser antigo demais para o Expo Go atual`,
      porque:
        'O app Expo Go das lojas só abre projetos do SDK mais recente. Com um SDK ' +
        'antigo o celular mostra "Project is incompatible with this version of Expo Go" ' +
        'e não roda, mesmo com tudo instalado corretamente.',
      onde: 'package.json, campo "expo" em dependencies.',
      solucao:
        'Atualize o projeto para o SDK atual. O `--fix` ajusta todas as outras ' +
        'bibliotecas junto, inclusive o Reanimated e o Expo Router.',
      ordem: 2,
      comando: 'npm install expo@latest && npx expo install --fix',
    });
  }

  // O babel.config.js descobre o plugin sozinho, mas se alguém fixar o nome
  // errado o app abre e trava num erro de worklet que não aponta a causa.
  const reanimated = versaoInstalada('react-native-reanimated');
  if (reanimated) {
    const maior = Number(reanimated.split('.')[0]);
    const temWorklets = versaoInstalada('react-native-worklets') !== null;
    let babel = '';
    try {
      babel = fs.readFileSync(path.join(RAIZ, 'babel.config.js'), 'utf8');
    } catch {
      /* tratado abaixo */
    }

    const fixaAntigo =
      babel.includes("'react-native-reanimated/plugin'") && !babel.includes('require.resolve');
    const fixaNovo =
      babel.includes("'react-native-worklets/plugin'") && !babel.includes('require.resolve');

    if (maior >= 4 && fixaAntigo) {
      problema({
        nivel: 'erro',
        titulo: 'babel.config.js aponta para o plugin errado do Reanimated',
        porque:
          `O Reanimated ${maior} usa o plugin do pacote react-native-worklets, mas o ` +
          'babel.config.js está fixado no nome antigo. O app abre e trava com um erro ' +
          'de worklet que não diz qual é a causa.',
        onde: 'babel.config.js',
        solucao:
          "Troque o plugin por 'react-native-worklets/plugin', ou restaure a versão " +
          'do repositório, que detecta o nome certo sozinha.',
        comando: comoRecuperar('babel.config.js'),
      });
    } else if (maior < 4 && fixaNovo && !temWorklets) {
      problema({
        nivel: 'erro',
        titulo: 'babel.config.js aponta para um plugin que não existe nesta versão',
        porque:
          `O Reanimated ${maior} não traz o pacote react-native-worklets, mas o ` +
          'babel.config.js pede o plugin dele. O bundle falha logo no início.',
        onde: 'babel.config.js',
        solucao: 'Restaure a versao original do arquivo, que detecta o nome certo sozinha.',
        comando: comoRecuperar('babel.config.js'),
      });
    } else {
      ok(`Reanimated ${maior} com o plugin de Babel correspondente`);
    }
  }
}

function checarArquivosEssenciais() {
  secao('Arquivos do projeto');

  const essenciais = [
    ['package.json', 'Lista as dependências e os comandos do projeto.'],
    ['app.json', 'Configuração do Expo: nome, ícone, permissões e plugins.'],
    ['babel.config.js', 'Transformações de código, incluindo o plugin de worklets.'],
    ['tsconfig.json', 'Configuração do TypeScript.'],
    ['app/_layout.tsx', 'Rota raiz do app. Sem ela o Expo Router não monta nada.'],
    ['app/(tabs)/_layout.tsx', 'Barra de abas inferior.'],
  ];

  let faltou = false;
  for (const [arquivo, paraQue] of essenciais) {
    if (!existe(arquivo)) {
      faltou = true;
      problema({
        nivel: 'erro',
        titulo: `Arquivo essencial ausente: ${arquivo}`,
        porque: paraQue,
        onde: arquivo,
        solucao: USA_GIT
          ? 'Restaure o arquivo a partir do repositorio.'
          : 'Baixe o projeto de novo e copie o arquivo que falta.',
        comando: comoRecuperar(arquivo),
      });
    }
  }
  if (!faltou) ok(`${essenciais.length} arquivos essenciais presentes`);

  // O Expo falha ao iniciar se o app.json aponta para uma imagem que não existe.
  // Se o arquivo nem existe, o problema ja foi reportado acima: repetir aqui
  // so transformaria uma causa em dois alarmes.
  if (!existe('app.json')) return;

  const app = lerJson('app.json');
  if (!app?.expo) {
    problema({
      nivel: 'erro',
      titulo: 'app.json sem a chave "expo"',
      porque: 'Todo o conteúdo precisa estar dentro de { "expo": { ... } }.',
      onde: 'app.json',
      solucao: USA_GIT
        ? 'Restaure o arquivo a partir do repositorio.'
        : 'Baixe o projeto de novo e copie o arquivo que falta.',
      comando: comoRecuperar('app.json'),
    });
    return;
  }

  const imagens = [
    app.expo.icon,
    app.expo.splash?.image,
    app.expo.android?.adaptiveIcon?.foregroundImage,
    app.expo.web?.favicon,
  ].filter(Boolean);

  const semImagem = imagens.filter((i) => !existe(i.replace(/^\.\//, '')));
  if (semImagem.length > 0) {
    problema({
      nivel: 'erro',
      titulo: 'app.json aponta para imagens que não existem',
      porque: 'O Expo falha ao iniciar quando o ícone ou a splash não são encontrados.',
      onde: semImagem.join(', '),
      solucao: USA_GIT
        ? 'Restaure os arquivos de imagem do repositorio.'
        : 'Baixe o projeto de novo e copie a pasta assets.',
      comando: comoRecuperar('assets/'),
    });
  } else {
    ok('Ícone, splash e favicon no lugar');
  }
}

async function checarPorta() {
  secao('Rede');

  const livre = await portaLivre(8081);
  if (!livre) {
    problema({
      nivel: 'aviso',
      titulo: 'A porta 8081 já está em uso',
      porque:
        'É a porta do Metro, o bundler do React Native. Normalmente é outro ' +
        '`expo start` esquecido aberto em outro terminal.',
      onde: 'Porta 8081 (Metro bundler).',
      solucao:
        'Feche o outro terminal, encerre o processo que está na porta, ou use outra porta.',
      comando:
        SISTEMA === 'Windows'
          ? 'netstat -ano | findstr :8081    (depois: taskkill /PID <pid> /F)'
          : 'lsof -ti:8081 | xargs kill -9    (ou: npx expo start --port 8082)',
    });
  } else {
    ok('Porta 8081 livre');
  }
}

function checarLinux() {
  if (process.platform !== 'linux') return;

  secao('Específico do Linux');

  // Causa clássica de falha do Metro no Linux: o bundler observa milhares de
  // arquivos e o limite padrão do inotify é baixo demais em várias distros.
  try {
    const limite = Number(
      fs.readFileSync('/proc/sys/fs/inotify/max_user_watches', 'utf8').trim(),
    );
    if (limite < 524288) {
      problema({
        nivel: 'aviso',
        titulo: `Limite de observadores de arquivo baixo (${limite.toLocaleString('pt-BR')})`,
        porque:
          'O Metro observa milhares de arquivos. Com o limite padrão de várias ' +
          'distribuições, ele falha com "ENOSPC: System limit for number of file ' +
          'watchers reached" — um erro que parece falta de disco, mas não é.',
        onde: '/proc/sys/fs/inotify/max_user_watches',
        solucao: 'Aumente o limite de forma permanente.',
        ordem: 1,
        comando:
          "echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p",
      });
    } else {
      ok(`Observadores de arquivo: ${limite.toLocaleString('pt-BR')}`);
    }
  } catch {
    // Alguns ambientes (contêiner, WSL) não expõem o arquivo. Não é problema.
  }

  if (comandoExiste('adb')) {
    ok('adb disponível (emulador ou celular por USB)');
  } else {
    problema({
      nivel: 'aviso',
      titulo: 'adb não encontrado',
      porque:
        'Só é necessário para rodar no emulador Android ou em celular por cabo. ' +
        'Para usar o Expo Go por Wi-Fi, não precisa.',
      onde: 'PATH do sistema.',
      solucao: 'Instale as ferramentas de plataforma do Android, se for usar emulador.',
      ordem: 3,
      comando: 'sudo apt install android-tools-adb',
    });
  }
}

/**
 * Procura dependencias que os pacotes instalados precisam mas nao existem.
 *
 * Este caso derrubou o projeto na pratica: expo-font estava declarado, o
 * build web dele importa expo-asset, e expo-asset nao estava instalado. O
 * bundler so reclamava na hora de montar o pacote, com uma mensagem apontando
 * para dentro de node_modules — longe do package.json, que e onde se resolve.
 *
 * A checagem le o package.json de cada dependencia direta e confere se o que
 * ela declara esta resolvivel.
 */
function checarDependenciasDeTerceiros() {
  secao('Dependências dos pacotes');

  const pkg = lerJson('package.json');
  if (!pkg) return;

  const diretas = Object.keys(pkg.dependencies ?? {});
  const faltando = new Map();

  for (const nome of diretas) {
    let meta;
    try {
      meta = JSON.parse(
        fs.readFileSync(require_.resolve(`${nome}/package.json`), 'utf8'),
      );
    } catch {
      continue; // ausencia do pacote em si ja foi reportada antes
    }

    for (const dep of Object.keys(meta.dependencies ?? {})) {
      if (versaoInstalada(dep) === null) {
        if (!faltando.has(dep)) faltando.set(dep, []);
        faltando.get(dep).push(nome);
      }
    }
  }

  if (faltando.size === 0) {
    ok(`${diretas.length} pacotes com as dependencias resolvidas`);
    return;
  }

  const lista = [...faltando.keys()];
  problema({
    nivel: 'erro',
    titulo: `${lista.length} dependência(s) de pacotes não instalada(s)`,
    porque:
      'Pacotes instalados precisam destes, que nao estao presentes. O erro so ' +
      'aparece quando o bundler monta o pacote, apontando para dentro de ' +
      'node_modules — longe do package.json, que e onde se resolve.',
    onde: lista
      .map((d) => `${d} (exigido por ${faltando.get(d).join(', ')})`)
      .join('; '),
    solucao: 'Instale o que falta pelo Expo, para vir na versao certa do SDK.',
    comando: `npx expo install ${lista.join(' ')}`,
  });
}

function checarFerramentasDeTeste() {
  if (PREFLIGHT) return;
  secao('Ferramentas de verificação');

  for (const [pacote, paraQue, comando] of [
    ['typescript', 'npm run typecheck', 'npm install'],
    ['tsx', 'npm test', 'npm install'],
    ['eslint', 'npm run lint', 'npm install'],
  ]) {
    if (versaoInstalada(pacote)) {
      ok(`${pacote} (${paraQue})`);
    } else {
      problema({
        nivel: 'aviso',
        titulo: `${pacote} não instalado`,
        porque: `Sem ele o comando \`${paraQue}\` não roda. O app em si funciona normalmente.`,
        onde: 'devDependencies do package.json.',
        solucao: 'Instale as dependências de desenvolvimento.',
        comando,
        ordem: 3,
      });
    }
  }
}

/* ========================================================================== */
/* Relatório                                                                  */
/* ========================================================================== */

function relatar() {
  const erros = achados.filter((a) => a.nivel === 'erro');
  const avisos = achados.filter((a) => a.nivel === 'aviso');

  if (JSON_OUT) {
    console.log(JSON.stringify({ erros, avisos, ok: erros.length === 0 }, null, 2));
    return erros.length === 0 ? 0 : 1;
  }

  if (achados.length === 0) {
    if (PREFLIGHT) {
      console.log(verde('✓ Ambiente verificado. Iniciando o app...\n'));
    } else {
      console.log(`\n${verde(forte('Tudo certo.'))} O projeto está pronto para rodar.\n`);
      console.log(`  ${azul('npm start')}        inicia o app`);
      console.log(`  ${azul('npm run verify')}   tipos, lint e testes\n`);
    }
    return 0;
  }

  console.log('');
  for (const a of [...erros, ...avisos]) {
    const marca = a.nivel === 'erro' ? vermelho('✖ PROBLEMA') : amarelo('▲ AVISO');
    console.log(`${marca}  ${forte(a.titulo)}`);
    console.log(`\n  ${fraco('Por quê:')}    ${a.porque}`);
    console.log(`  ${fraco('Onde:')}      ${a.onde}`);
    console.log(`  ${fraco('Solução:')}   ${a.solucao}`);
    console.log(`  ${fraco('Comando:')}   ${azul(a.comando)}`);
    console.log('');
  }

  if (erros.length > 0) {
    console.log(
      vermelho(forte(`${erros.length} problema(s) impedem o app de rodar.`)) +
        ' Resolva os comandos acima e rode de novo:',
    );
    console.log(`  ${azul('npm run doctor')}\n`);
    return 1;
  }

  console.log(
    amarelo(`${avisos.length} aviso(s).`) +
      ' Nada impede de rodar, mas vale resolver se algo der errado.',
  );

  if (avisos.length > 1) {
    console.log(`\n${forte('Sugestão de ordem:')}`);
    const rotulos = {
      1: 'antes de tentar rodar',
      2: 'para rodar no celular',
      3: 'só se for usar o recurso',
    };
    [...avisos]
      .sort((a, b) => a.ordem - b.ordem)
      .forEach((a, i) => {
        console.log(`  ${i + 1}. ${a.titulo}  ${fraco(`(${rotulos[a.ordem]})`)}`);
        console.log(`     ${azul(a.comando)}`);
      });
  }
  console.log('');
  return 0;
}

/* ========================================================================== */

async function main() {
  if (!JSON_OUT && !PREFLIGHT) {
    console.log(forte('\nDiagnóstico do CarroEmDia'));
    console.log(fraco(`${RAIZ}`));
  }

  checarNode();
  const temDeps = checarDependencias();
  if (temDeps) checarExpo();
  checarArquivosEssenciais();
  await checarPorta();
  checarLinux();
  if (temDeps) checarDependenciasDeTerceiros();
  if (temDeps) checarFerramentasDeTeste();

  process.exit(relatar());
}

main().catch((erro) => {
  // O diagnóstico nunca deve ser o motivo de o app não iniciar.
  console.error(vermelho('\nO diagnóstico falhou inesperadamente:'), erro.message);
  console.error(fraco('Isso não impede o app de rodar. Tente: npx expo start\n'));
  process.exit(0);
});
