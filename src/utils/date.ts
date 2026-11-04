/**
 * Funcoes de data que operam em `YYYY-MM-DD`.
 *
 * Tudo aqui trata a data como data de calendario, nao como instante. Usar
 * `new Date('2026-05-18')` cria um instante em UTC e, no fuso do Brasil, pode
 * voltar um dia; por isso as datas sao montadas campo a campo com o construtor
 * local.
 */

import type { IsoDate } from '../domain/models';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Converte `YYYY-MM-DD` em Date local a meia-noite. Lanca se o formato for invalido. */
export function parseIsoDate(value: IsoDate): Date {
  const match = ISO_DATE.exec(value);
  if (!match) {
    throw new Error(`Data fora do formato YYYY-MM-DD: ${value}`);
  }
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/** Converte um Date para `YYYY-MM-DD` usando os campos locais. */
export function toIsoDate(date: Date): IsoDate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Data de hoje em `YYYY-MM-DD`. */
export function today(now: Date = new Date()): IsoDate {
  return toIsoDate(now);
}

/**
 * Soma meses preservando o fim de mes.
 * 31/01 + 1 mes vira 28/02 (ou 29/02), nao 03/03.
 */
export function addMonths(value: IsoDate, months: number): IsoDate {
  const date = parseIsoDate(value);
  const day = date.getDate();
  const result = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();
  result.setDate(Math.min(day, lastDay));
  return toIsoDate(result);
}

/** Dias inteiros de `from` ate `to`. Negativo quando `to` ja passou. */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  const a = parseIsoDate(from).getTime();
  const b = parseIsoDate(to).getTime();
  // Divisao por dia inteiro: ambas as pontas sao meia-noite local, entao o
  // horario de verao nao introduz fracoes relevantes.
  return Math.round((b - a) / 86_400_000);
}

/** Chave de agrupamento mensal `YYYY-MM`. */
export function monthKey(value: IsoDate): string {
  return value.slice(0, 7);
}

const MESES_CURTOS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

/** Rotulo curto do mes a partir de `YYYY-MM`, ex.: "mai". */
export function monthLabel(key: string): string {
  const index = Number(key.slice(5, 7)) - 1;
  return MESES_CURTOS[index] ?? key;
}

/** Formata `YYYY-MM-DD` como `18/05/2026`. */
export function formatDate(value: IsoDate): string {
  const match = ISO_DATE.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/** Formata `YYYY-MM-DD` como `18 mai 2026`. */
export function formatDateShort(value: IsoDate): string {
  const match = ISO_DATE.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  const mes = MESES_CURTOS[Number(month) - 1] ?? month;
  return `${day} ${mes} ${year}`;
}

/**
 * Lista as chaves `YYYY-MM` de `from` ate `to`, inclusive.
 * Usada para que o grafico mostre meses sem gasto como zero em vez de pular.
 */
export function monthRange(from: IsoDate, to: IsoDate): string[] {
  const start = parseIsoDate(from);
  const end = parseIsoDate(to);
  const keys: string[] = [];

  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);

  // Limite de seguranca: 10 anos de meses evita laco infinito se vier data ruim.
  let guard = 0;
  while (cursor <= last && guard < 120) {
    keys.push(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`,
    );
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    guard += 1;
  }

  return keys;
}
