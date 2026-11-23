/**
 * Abre a versão web do app num navegador de verdade e percorre as telas.
 *
 * Existe porque compilar não é rodar. O CI já compilava o app para web, e
 * mesmo assim ele quebrava na abertura: um efeito chamava uma função do
 * expo-notifications que só existe no celular. Esse tipo de erro só aparece
 * com o JavaScript executando num navegador.
 *
 * O que faz:
 *   1. Serve a compilação web (dist-web) com as rotas do expo-router.
 *   2. Abre cada tela num Chromium com tamanho de celular.
 *   3. Carrega os dados de exemplo pelo botão dos Ajustes, como um usuário.
 *   4. Percorre as telas com dados, e a tela inicial em cada um dos 4 temas.
 *   5. Fotografa cada tela em telas/.
 *   6. FALHA se qualquer tela lançar erro de JavaScript.
 *
 * Uso: node scripts/ci/testar-web.mjs [pasta-da-compilacao]   (padrão: dist-web)
 */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const RAIZ = path.resolve(process.argv[2] ?? 'dist-web');
const SAIDA = path.resolve('telas');
const PORTA = 4321;
const BASE = `http://localhost:${PORTA}`;
const TEMAS = ['oficina', 'asfalto', 'ambar', 'pista'];
const CHAVE_PREFS = '@carroemdia/preferencias';
const CHAVE_VEICULOS = '@carroemdia/veiculos';

/* ------------------------------------------------------------------------ */
/* Servidor: resolve rotas do expo-router para os .html da compilação        */
/* ------------------------------------------------------------------------ */

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
};

const ehArquivo = (p) => fs.existsSync(p) && fs.statSync(p).isFile();

/** /veiculo/abc/editar -> dist-web/veiculo/[id]/editar.html */
function resolver(urlPath) {
  const limpo = decodeURIComponent(urlPath.split('?')[0]).replace(/\/+$/, '') || '/';
  const direto = path.join(RAIZ, limpo);
  for (const c of [direto, `${direto}.html`, path.join(direto, 'index.html')]) {
    if (ehArquivo(c)) return c;
  }

  // Rota dinâmica: desce segmento a segmento, usando [param] quando o nome
  // literal não existir.
  const segmentos = limpo.split('/').filter(Boolean);
  let dir = RAIZ;
  for (let i = 0; i < segmentos.length; i += 1) {
    const ultimo = i === segmentos.length - 1;
    const seg = segmentos[i];
    const entradas = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    if (ultimo) {
      if (entradas.includes(`${seg}.html`)) return path.join(dir, `${seg}.html`);
      const dinamico = entradas.find((e) => /^\[[^\]]+\]\.html$/.test(e));
      if (dinamico) return path.join(dir, dinamico);
      const pasta = entradas.find((e) => e === seg || /^\[[^\]]+\]$/.test(e));
      if (pasta && ehArquivo(path.join(dir, pasta, 'index.html'))) {
        return path.join(dir, pasta, 'index.html');
      }
      return null;
    }
    const proximo = entradas.includes(seg) ? seg : entradas.find((e) => /^\[[^\]]+\]$/.test(e));
    if (!proximo) return null;
    dir = path.join(dir, proximo);
  }
  return null;
}

function iniciarServidor() {
  const servidor = http.createServer((req, res) => {
    const url = req.url ?? '/';
    // Aplicação de página única (web.output = "single"): toda rota sem
    // extensão recebe o index.html, e o roteador do app resolve no navegador.
    // Com saída estática, o resolver acha o .html da rota antes disso.
    const semExtensao = !path.extname(url.split('?')[0]);
    const arquivo = resolver(url) ?? (semExtensao ? path.join(RAIZ, 'index.html') : null);
    if (!arquivo) {
      res.writeHead(404).end('nao encontrado');
      return;
    }
    res.writeHead(200, {
      'Content-Type': TIPOS[path.extname(arquivo)] ?? 'application/octet-stream',
    });
    fs.createReadStream(arquivo).pipe(res);
  });
  return new Promise((ok) => servidor.listen(PORTA, () => ok(servidor)));
}

/* ------------------------------------------------------------------------ */
/* Navegador                                                                 */
/* ------------------------------------------------------------------------ */

const erros = [];
let telaAtual = '(inicio)';

async function abrir(page, rota, nome) {
  telaAtual = nome;
  await page.goto(`${BASE}${rota}`, { waitUntil: 'networkidle' });
  // Dá tempo para efeitos e animações de entrada assentarem.
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(SAIDA, `${nome}.png`) });
  console.log(`  ok  ${nome.padEnd(30)} ${rota}`);
}

async function definirTema(page, tema) {
  await page.evaluate(
    ([chave, valor]) => {
      const atual = JSON.parse(localStorage.getItem(chave) ?? '{}');
      localStorage.setItem(chave, JSON.stringify({ ...atual, tema: valor }));
    },
    [CHAVE_PREFS, tema],
  );
}

async function main() {
  if (!fs.existsSync(RAIZ)) {
    console.error(`Compilação web não encontrada em ${RAIZ}. Rode antes: npx expo export --platform web --output-dir dist-web`);
    process.exit(1);
  }
  fs.mkdirSync(SAIDA, { recursive: true });

  const servidor = await iniciarServidor();
  const navegador = await chromium.launch();
  const contexto = await navegador.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  });
  const page = await contexto.newPage();

  page.on('pageerror', (e) => erros.push(`[${telaAtual}] ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') erros.push(`[${telaAtual}] console: ${m.text()}`);
  });
  // Avisos e confirmações do app viram caixas do navegador: aceita todas.
  page.on('dialog', (d) => void d.accept());

  try {
    console.log('\nSem dados:');
    await abrir(page, '/', '01-garagem-vazia');
    await abrir(page, '/alertas', '02-alertas-vazio');
    await abrir(page, '/gastos', '03-gastos-vazio');
    await abrir(page, '/ajustes', '04-ajustes');

    console.log('\nCarregando os dados de exemplo pelo botão dos Ajustes:');
    telaAtual = 'carregar-exemplo';
    await page.getByText('Carregar dados de exemplo', { exact: false }).first().click();
    await page.waitForFunction(
      (chave) => (JSON.parse(localStorage.getItem(chave) ?? '[]') ?? []).length > 0,
      CHAVE_VEICULOS,
      { timeout: 15000 },
    );
    const veiculos = await page.evaluate(
      (chave) => JSON.parse(localStorage.getItem(chave) ?? '[]'),
      CHAVE_VEICULOS,
    );
    console.log(`  ok  ${veiculos.length} veículos gravados`);
    const id = veiculos[0].id;

    console.log('\nCom dados:');
    await abrir(page, '/', '05-garagem');
    await abrir(page, '/alertas', '06-alertas');
    await abrir(page, '/gastos', '07-gastos');
    await abrir(page, `/veiculo/${id}`, '08-veiculo');
    await abrir(page, `/veiculo/historico?veiculoId=${id}`, '09-historico');
    await abrir(page, `/manutencao/nova?veiculoId=${id}`, '10-nova-manutencao');
    await abrir(page, '/veiculo/novo', '11-novo-veiculo');
    await abrir(page, `/veiculo/${id}/editar`, '12-editar-veiculo');
    await abrir(page, '/aparencia', '13-aparencia');

    console.log('\nTemas:');
    for (const tema of TEMAS) {
      await definirTema(page, tema);
      await abrir(page, '/', `tema-${tema}-garagem`);
      await abrir(page, `/veiculo/${id}`, `tema-${tema}-veiculo`);
    }
  } catch (e) {
    erros.push(`[${telaAtual}] o teste não conseguiu prosseguir: ${e.message}`);
  } finally {
    await navegador.close();
    servidor.close();
  }

  console.log('');
  if (erros.length > 0) {
    console.log(`FALHOU: ${erros.length} erro(s) no navegador`);
    for (const e of erros) console.log(`  ✖ ${e}`);
    process.exit(1);
  }
  console.log(`Nenhum erro. ${fs.readdirSync(SAIDA).length} telas fotografadas em telas/.`);
}

await main();
