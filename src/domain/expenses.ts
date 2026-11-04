/**
 * Agregacao de gastos.
 *
 * Alimenta a tela de relatorio: total do periodo, evolucao mes a mes,
 * distribuicao por categoria e os maiores gastos.
 */

import {
  tiposManutencao,
  type GastoPorCategoria,
  type GastoPorMes,
  type IsoDate,
  type Manutencao,
  type ResumoGastos,
  type TipoManutencaoId,
} from './models';
import { monthKey, monthLabel, monthRange, today } from '../utils/date';

export interface PeriodoFiltro {
  /** Inclusive. */
  de: IsoDate;
  /** Inclusive. */
  ate: IsoDate;
}

/** Periodo do ano corrente, de 1o de janeiro ate hoje. */
export function periodoAno(hoje: IsoDate = today()): PeriodoFiltro {
  return { de: `${hoje.slice(0, 4)}-01-01`, ate: hoje };
}

/** Periodo do mes corrente. */
export function periodoMes(hoje: IsoDate = today()): PeriodoFiltro {
  return { de: `${hoje.slice(0, 7)}-01`, ate: hoje };
}

/** Periodo dos ultimos doze meses, contando o mes atual. */
export function periodoDozeMeses(hoje: IsoDate = today()): PeriodoFiltro {
  const ano = Number(hoje.slice(0, 4));
  const mes = Number(hoje.slice(5, 7));
  const inicio = new Date(ano, mes - 12, 1);
  const de = `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, '0')}-01`;
  return { de, ate: hoje };
}

export function dentroDoPeriodo(data: IsoDate, periodo: PeriodoFiltro): boolean {
  // Comparacao lexicografica funciona porque o formato e YYYY-MM-DD.
  return data >= periodo.de && data <= periodo.ate;
}

/** Filtra por veiculo e periodo. `veiculoId` indefinido significa todos. */
export function filtrarManutencoes(
  manutencoes: Manutencao[],
  options: { veiculoId?: string; periodo?: PeriodoFiltro; tipos?: TipoManutencaoId[] } = {},
): Manutencao[] {
  const { veiculoId, periodo, tipos } = options;

  return manutencoes.filter((m) => {
    if (veiculoId && m.veiculoId !== veiculoId) return false;
    if (periodo && !dentroDoPeriodo(m.data, periodo)) return false;
    if (tipos && tipos.length > 0 && !tipos.includes(m.tipo)) return false;
    return true;
  });
}

function somar(manutencoes: Manutencao[]): number {
  return manutencoes.reduce((total, m) => total + (m.valor || 0), 0);
}

/** Total por categoria, da maior para a menor. */
export function agruparPorCategoria(
  manutencoes: Manutencao[],
): GastoPorCategoria[] {
  const total = somar(manutencoes);
  const mapa = new Map<TipoManutencaoId, { total: number; quantidade: number }>();

  for (const m of manutencoes) {
    const atual = mapa.get(m.tipo) ?? { total: 0, quantidade: 0 };
    atual.total += m.valor || 0;
    atual.quantidade += 1;
    mapa.set(m.tipo, atual);
  }

  return [...mapa.entries()]
    .map(([tipo, dados]) => ({
      tipo,
      nome: tiposManutencao[tipo]?.nome ?? 'Outro servico',
      total: dados.total,
      quantidade: dados.quantidade,
      // Sem gasto no periodo, a fracao e zero em vez de NaN.
      fracao: total > 0 ? dados.total / total : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Total por mes dentro do periodo.
 *
 * Inclui meses sem gasto com total zero, para o grafico de barras manter o
 * ritmo do eixo em vez de encostar barras de meses distantes.
 */
export function agruparPorMes(
  manutencoes: Manutencao[],
  periodo: PeriodoFiltro,
): GastoPorMes[] {
  const totais = new Map<string, number>();

  for (const m of manutencoes) {
    const chave = monthKey(m.data);
    totais.set(chave, (totais.get(chave) ?? 0) + (m.valor || 0));
  }

  return monthRange(periodo.de, periodo.ate).map((mes) => ({
    mes,
    rotulo: monthLabel(mes),
    total: totais.get(mes) ?? 0,
  }));
}

/** Os `limite` maiores gastos do conjunto. */
export function maioresGastos(
  manutencoes: Manutencao[],
  limite = 5,
): Manutencao[] {
  return [...manutencoes]
    .sort((a, b) => (b.valor || 0) - (a.valor || 0))
    .slice(0, limite);
}

/**
 * Resumo completo do periodo.
 *
 * A media mensal divide pelo numero de meses que realmente tiveram gasto, nao
 * pelo tamanho do periodo: dividir um unico gasto de janeiro por doze meses
 * daria um numero que nao ajuda ninguem.
 */
export function resumirGastos(
  manutencoes: Manutencao[],
  periodo: PeriodoFiltro,
): ResumoGastos {
  const total = somar(manutencoes);
  const porMes = agruparPorMes(manutencoes, periodo);
  const mesesComGasto = porMes.filter((m) => m.total > 0).length;

  return {
    total,
    mediaMensal: mesesComGasto > 0 ? total / mesesComGasto : 0,
    quantidade: manutencoes.length,
    porCategoria: agruparPorCategoria(manutencoes),
    porMes,
    maiores: maioresGastos(manutencoes),
  };
}

/**
 * Consumo medio em km/L a partir dos abastecimentos.
 *
 * Metodo "tanque a tanque": a distancia entre dois abastecimentos consecutivos
 * dividida pelos litros do segundo. O primeiro abastecimento nao entra, porque
 * nao se sabe quanto foi rodado antes dele.
 *
 * Devolve `null` quando nao ha dados suficientes.
 */
export function consumoMedio(manutencoes: Manutencao[]): number | null {
  const abastecimentos = manutencoes
    .filter((m) => m.tipo === 'abastecimento' && m.litros && m.litros > 0)
    .sort((a, b) => a.km - b.km);

  if (abastecimentos.length < 2) return null;

  let distancia = 0;
  let litros = 0;

  for (let i = 1; i < abastecimentos.length; i += 1) {
    const trecho = abastecimentos[i].km - abastecimentos[i - 1].km;
    // Km repetido ou fora de ordem indica erro de digitacao: ignora o trecho.
    if (trecho <= 0) continue;
    distancia += trecho;
    litros += abastecimentos[i].litros ?? 0;
  }

  if (litros <= 0 || distancia <= 0) return null;
  return distancia / litros;
}

/** Custo por quilometro no periodo, considerando a distancia percorrida. */
export function custoPorKm(manutencoes: Manutencao[]): number | null {
  if (manutencoes.length < 2) return null;

  const kms = manutencoes.map((m) => m.km).filter((km) => km > 0);
  if (kms.length < 2) return null;

  const distancia = Math.max(...kms) - Math.min(...kms);
  if (distancia <= 0) return null;

  return somar(manutencoes) / distancia;
}
