/**
 * Consulta a tabela FIPE pela BrasilAPI.
 *
 * Atende ao requisito de requisicao a Web Service e, ao mesmo tempo, resolve um
 * problema real do cadastro: em vez de digitar marca e modelo na mao e errar a
 * grafia, o usuario escolhe de uma lista oficial e o app ainda guarda o valor
 * de referencia do veiculo.
 *
 * Documentacao: https://brasilapi.com.br/docs#tag/FIPE
 *
 * O cache em disco serve a dois propositos: a lista de marcas quase nao muda,
 * e o cadastro continua utilizavel sem internet depois da primeira consulta.
 */

import type { TipoVeiculo } from '../domain/models';
import { readJson, storageKeys, writeJson } from '../data/storage';
import {
  extrairAnoDoModelo,
  normalizarCombustivel,
  parseValorFipe,
} from '../utils/fipe';
import { getJson, HttpError, type RequestOptions } from './http';

const BASE = 'https://brasilapi.com.br/api/fipe';

/** Validade do cache: uma semana. A FIPE publica tabela nova por mes. */
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

/* -------------------------------------------------------------------------- */
/* Tipos da API                                                                */
/* -------------------------------------------------------------------------- */

export interface FipeMarca {
  nome: string;
  valor: string;
}

export interface FipeModelo {
  modelo: string;
  valor: string;
}

export interface FipePreco {
  valor: string;
  marca: string;
  modelo: string;
  anoModelo: number;
  combustivel: string;
  codigoFipe: string;
  mesReferencia: string;
  /** 1 carro, 2 moto, 3 caminhao. */
  tipoVeiculo: number;
  siglaCombustivel: string;
}

/** Resultado normalizado que as telas consomem. */
export interface ReferenciaFipe {
  codigo: string;
  marca: string;
  modelo: string;
  ano: number;
  /** Valor em reais, ja convertido de "R$ 45.231,00". */
  valor: number;
  combustivel: string;
  mesReferencia: string;
}

/* -------------------------------------------------------------------------- */
/* Cache                                                                       */
/* -------------------------------------------------------------------------- */

interface EntradaCache<T> {
  gravadoEm: number;
  dados: T;
}

type Cache = Record<string, EntradaCache<unknown>>;

async function lerCache<T>(chave: string): Promise<T | undefined> {
  const cache = await readJson<Cache>(storageKeys.fipeCache, {});
  const entrada = cache[chave] as EntradaCache<T> | undefined;
  if (!entrada) return undefined;
  if (Date.now() - entrada.gravadoEm > TTL_MS) return undefined;
  return entrada.dados;
}

async function gravarCache<T>(chave: string, dados: T): Promise<void> {
  const cache = await readJson<Cache>(storageKeys.fipeCache, {});
  cache[chave] = { gravadoEm: Date.now(), dados };
  await writeJson(storageKeys.fipeCache, cache);
}

/**
 * Busca com cache. Em falha de rede, devolve o cache vencido se existir —
 * uma lista de marcas de um mes atras e muito melhor que uma tela de erro.
 */
async function buscarComCache<T>(
  chave: string,
  url: string,
  options?: RequestOptions,
): Promise<T> {
  const emCache = await lerCache<T>(chave);
  if (emCache !== undefined) return emCache;

  try {
    const dados = await getJson<T>(url, options);
    await gravarCache(chave, dados);
    return dados;
  } catch (erro) {
    const cache = await readJson<Cache>(storageKeys.fipeCache, {});
    const vencido = cache[chave] as EntradaCache<T> | undefined;
    if (vencido) return vencido.dados;
    throw erro;
  }
}

/* -------------------------------------------------------------------------- */
/* Conversoes                                                                  */
/* -------------------------------------------------------------------------- */

// As conversoes puras moram em utils/fipe para poderem ser testadas sem
// arrastar rede e disco junto; reexportadas aqui por conveniencia de import.
export { parseValorFipe, normalizarCombustivel, extrairAnoDoModelo };

/** O caminho da API muda conforme o tipo de veiculo. */
function caminhoTipo(tipo: TipoVeiculo): 'carros' | 'motos' {
  return tipo === 'moto' ? 'motos' : 'carros';
}

/* -------------------------------------------------------------------------- */
/* API publica do servico                                                      */
/* -------------------------------------------------------------------------- */

/** Marcas disponiveis para carro ou moto. */
export async function listarMarcas(
  tipo: TipoVeiculo,
  options?: RequestOptions,
): Promise<FipeMarca[]> {
  const caminho = caminhoTipo(tipo);
  return buscarComCache<FipeMarca[]>(
    `marcas:${caminho}`,
    `${BASE}/marcas/v1/${caminho}`,
    options,
  );
}

/**
 * Modelos de uma marca.
 * `codigoMarca` e o campo `valor` devolvido por `listarMarcas`.
 */
export async function listarModelos(
  tipo: TipoVeiculo,
  codigoMarca: string,
  options?: RequestOptions,
): Promise<FipeModelo[]> {
  const caminho = caminhoTipo(tipo);
  return buscarComCache<FipeModelo[]>(
    `modelos:${caminho}:${codigoMarca}`,
    `${BASE}/veiculos/v1/${caminho}/${encodeURIComponent(codigoMarca)}`,
    options,
  );
}

/**
 * Preco e ficha de um modelo pelo codigo FIPE.
 *
 * A API devolve uma entrada por ano/combustivel. Quando `ano` e informado,
 * escolhemos a entrada daquele ano; sem ele, a mais recente.
 */
export async function consultarPreco(
  codigoFipe: string,
  ano?: number,
  options?: RequestOptions,
): Promise<ReferenciaFipe | null> {
  const precos = await buscarComCache<FipePreco[]>(
    `preco:${codigoFipe}`,
    `${BASE}/preco/v1/${encodeURIComponent(codigoFipe)}`,
    options,
  );

  if (!Array.isArray(precos) || precos.length === 0) return null;

  const escolhido =
    (ano !== undefined && precos.find((p) => p.anoModelo === ano)) ||
    [...precos].sort((a, b) => b.anoModelo - a.anoModelo)[0];

  if (!escolhido) return null;

  return {
    codigo: escolhido.codigoFipe,
    marca: escolhido.marca,
    modelo: escolhido.modelo,
    ano: escolhido.anoModelo,
    valor: parseValorFipe(escolhido.valor),
    combustivel: escolhido.combustivel,
    mesReferencia: escolhido.mesReferencia.trim(),
  };
}

/** Anos disponiveis para um codigo FIPE, do mais novo para o mais antigo. */
export async function listarAnos(
  codigoFipe: string,
  options?: RequestOptions,
): Promise<number[]> {
  const precos = await buscarComCache<FipePreco[]>(
    `preco:${codigoFipe}`,
    `${BASE}/preco/v1/${encodeURIComponent(codigoFipe)}`,
    options,
  );

  if (!Array.isArray(precos)) return [];

  return [...new Set(precos.map((p) => p.anoModelo))].sort((a, b) => b - a);
}

/** Traduz qualquer falha em uma frase que cabe na tela. */
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof HttpError) return erro.mensagemUsuario;
  return 'Nao foi possivel consultar a tabela FIPE agora.';
}

export const fipeService = {
  listarMarcas,
  listarModelos,
  listarAnos,
  consultarPreco,
  mensagemDeErro,
};
