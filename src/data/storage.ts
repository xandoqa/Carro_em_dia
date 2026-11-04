/**
 * Camada fina sobre o AsyncStorage.
 *
 * Centraliza serializacao, chaves e tratamento de erro para que os
 * repositorios nao repitam `JSON.parse` dentro de try/catch em todo lugar.
 *
 * Decisao: leitura nunca lanca. Se o disco devolver algo corrompido, o app
 * trata como "nao existe" e segue funcionando, em vez de travar na abertura.
 * Escrita, essa sim, propaga o erro — o usuario precisa saber que o registro
 * nao foi salvo.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/** Prefixo em todas as chaves, para nao colidir com outras bibliotecas. */
const PREFIX = '@carroemdia';

export const storageKeys = {
  veiculos: `${PREFIX}/veiculos`,
  manutencoes: `${PREFIX}/manutencoes`,
  preferencias: `${PREFIX}/preferencias`,
  sessao: `${PREFIX}/sessao`,
  usuarios: `${PREFIX}/usuarios`,
  fipeCache: `${PREFIX}/cache/fipe`,
  notificacoes: `${PREFIX}/notificacoes`,
  /** Versao do formato gravado, para futuras migracoes. */
  schemaVersion: `${PREFIX}/schema`,
} as const;

/** Versao atual do formato em disco. */
export const SCHEMA_VERSION = 1;

/**
 * Le e desserializa. Devolve `fallback` quando a chave nao existe ou o
 * conteudo esta ilegivel.
 */
export async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // Conteudo corrompido ou disco indisponivel: segue com o padrao.
    return fallback;
  }
}

/** Serializa e grava. Propaga o erro para quem chamou. */
export async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function remove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Remover algo que ja nao existe nao e um problema.
  }
}

/** Apaga todos os dados do app, preservando chaves de outras bibliotecas. */
export async function clearAll(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const nossas = keys.filter((k) => k.startsWith(PREFIX));
  if (nossas.length > 0) {
    await AsyncStorage.multiRemove(nossas);
  }
}

/**
 * Garante que o formato em disco e o esperado.
 *
 * Hoje so grava a versao; quando houver mudanca de formato, as migracoes
 * entram aqui, uma funcao por salto de versao.
 */
export async function ensureSchema(): Promise<void> {
  const atual = await readJson<number>(storageKeys.schemaVersion, 0);
  if (atual === SCHEMA_VERSION) return;

  // Espaco reservado para migracoes futuras:
  // if (atual < 2) await migrarPara2();

  await writeJson(storageKeys.schemaVersion, SCHEMA_VERSION);
}

/**
 * Gera um id unico sem depender de `crypto.randomUUID`, que nao esta
 * disponivel em todas as versoes do runtime do React Native.
 */
export function generateId(prefix = 'id'): string {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${time}${random}`;
}
