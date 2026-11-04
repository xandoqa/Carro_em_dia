/**
 * Calculo de lembretes de manutencao.
 *
 * Esta e a regra central do app: dado o historico de um veiculo e a sua
 * quilometragem atual, dizer o que esta em dia, o que esta chegando e o que ja
 * venceu.
 *
 * Decisoes que valem registrar:
 *
 * - Lembretes nao sao persistidos. Eles sao derivados a cada leitura, porque o
 *   odometro muda e um lembrete salvo ficaria desatualizado em silencio.
 * - Um servico pode ter previsao por km, por data, ou pelas duas. Quando tem as
 *   duas, vale a que chegar primeiro — e o criterio que a oficina usa.
 * - O limiar de "atencao" e proporcional ao intervalo (15%), com um piso e um
 *   teto. Assim, uma troca de oleo de 10.000 km avisa com 1.500 km de folga, e
 *   um item de 40.000 km nao avisa com 6.000 km de antecedencia.
 */

import {
  tiposManutencao,
  type IsoDate,
  type Lembrete,
  type Manutencao,
  type StatusLembrete,
  type TipoManutencaoId,
  type Veiculo,
} from './models';
import { addMonths, daysBetween, today } from '../utils/date';

/** Fracao do intervalo em que o lembrete passa a "atencao". */
const FRACAO_ATENCAO = 0.15;

/** Piso e teto da janela de atencao em km. */
const ATENCAO_KM_MIN = 300;
const ATENCAO_KM_MAX = 2000;

/** Piso e teto da janela de atencao em dias. */
const ATENCAO_DIAS_MIN = 7;
const ATENCAO_DIAS_MAX = 45;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Janela de atencao em km para um intervalo. */
export function janelaAtencaoKm(intervaloKm: number): number {
  return clamp(
    Math.round(intervaloKm * FRACAO_ATENCAO),
    ATENCAO_KM_MIN,
    ATENCAO_KM_MAX,
  );
}

/** Janela de atencao em dias para um intervalo em meses. */
export function janelaAtencaoDias(intervaloMeses: number): number {
  const dias = intervaloMeses * 30;
  return clamp(
    Math.round(dias * FRACAO_ATENCAO),
    ATENCAO_DIAS_MIN,
    ATENCAO_DIAS_MAX,
  );
}

/**
 * Status a partir do que falta.
 * `undefined` em uma das dimensoes significa que ela nao se aplica.
 */
export function definirStatus(params: {
  kmRestantes?: number;
  diasRestantes?: number;
  janelaKm?: number;
  janelaDias?: number;
}): StatusLembrete {
  const { kmRestantes, diasRestantes, janelaKm, janelaDias } = params;

  // Vencido ganha de tudo: basta uma das dimensoes ter passado.
  if (kmRestantes !== undefined && kmRestantes < 0) return 'vencido';
  if (diasRestantes !== undefined && diasRestantes < 0) return 'vencido';

  if (
    kmRestantes !== undefined &&
    janelaKm !== undefined &&
    kmRestantes <= janelaKm
  ) {
    return 'atencao';
  }
  if (
    diasRestantes !== undefined &&
    janelaDias !== undefined &&
    diasRestantes <= janelaDias
  ) {
    return 'atencao';
  }

  return 'em-dia';
}

/**
 * Progresso entre o ultimo servico e o proximo previsto, de 0 a 1 (podendo
 * passar de 1 quando venceu). Alimenta a faixa de medida.
 *
 * Quando ha previsao por km e por data, usa a dimensao mais adiantada, que e a
 * mesma que determina o status.
 */
function calcularProgresso(params: {
  kmUltimo?: number;
  kmPrevisto?: number;
  kmAtual: number;
  dataUltimo?: IsoDate;
  dataPrevista?: IsoDate;
  hoje: IsoDate;
}): number {
  const { kmUltimo, kmPrevisto, kmAtual, dataUltimo, dataPrevista, hoje } =
    params;

  const candidatos: number[] = [];

  if (kmPrevisto !== undefined && kmUltimo !== undefined) {
    const intervalo = kmPrevisto - kmUltimo;
    if (intervalo > 0) {
      candidatos.push((kmAtual - kmUltimo) / intervalo);
    }
  }

  if (dataPrevista !== undefined && dataUltimo !== undefined) {
    const intervalo = daysBetween(dataUltimo, dataPrevista);
    if (intervalo > 0) {
      candidatos.push(daysBetween(dataUltimo, hoje) / intervalo);
    }
  }

  if (candidatos.length === 0) return 0;

  // A dimensao mais adiantada e a que manda.
  return Math.max(0, Math.max(...candidatos));
}

/** Ultimo servico de cada tipo, por data e, em empate, por km. */
export function ultimoServicoPorTipo(
  manutencoes: Manutencao[],
): Map<TipoManutencaoId, Manutencao> {
  const mapa = new Map<TipoManutencaoId, Manutencao>();

  for (const m of manutencoes) {
    const atual = mapa.get(m.tipo);
    if (!atual) {
      mapa.set(m.tipo, m);
      continue;
    }
    const maisRecente =
      m.data > atual.data || (m.data === atual.data && m.km > atual.km);
    if (maisRecente) {
      mapa.set(m.tipo, m);
    }
  }

  return mapa;
}

/**
 * Monta os lembretes de um veiculo.
 *
 * So gera lembrete para tipos que ja tem pelo menos um registro: sem historico
 * nao da para saber quando foi a ultima vez, e inventar um vencimento assustaria
 * o usuario sem motivo.
 */
export function calcularLembretes(
  veiculo: Veiculo,
  manutencoes: Manutencao[],
  hoje: IsoDate = today(),
): Lembrete[] {
  const doVeiculo = manutencoes.filter((m) => m.veiculoId === veiculo.id);
  const ultimos = ultimoServicoPorTipo(doVeiculo);
  const lembretes: Lembrete[] = [];

  for (const [tipo, servico] of ultimos) {
    const definicao = tiposManutencao[tipo];
    if (!definicao?.geraLembrete) continue;

    // Se o usuario definiu alguma previsao neste registro, ela vale sozinha.
    // Preencher a outra dimensao com o padrao do tipo criaria um prazo que o
    // usuario nao pediu: quem escolheu "avisar em 10.000 km" e deixou os meses
    // em branco nao quer um vencimento por data.
    const definiuAlgo =
      servico.proximaEmKm !== undefined || servico.proximaEmMeses !== undefined;

    const intervaloKm = definiuAlgo ? servico.proximaEmKm : definicao.intervaloKm;
    const intervaloMeses = definiuAlgo
      ? servico.proximaEmMeses
      : definicao.intervaloMeses;

    if (!intervaloKm && !intervaloMeses) continue;

    const kmPrevisto =
      intervaloKm !== undefined ? servico.km + intervaloKm : undefined;
    const dataPrevista =
      intervaloMeses !== undefined
        ? addMonths(servico.data, intervaloMeses)
        : undefined;

    const kmRestantes =
      kmPrevisto !== undefined ? kmPrevisto - veiculo.kmAtual : undefined;
    const diasRestantes =
      dataPrevista !== undefined ? daysBetween(hoje, dataPrevista) : undefined;

    const status = definirStatus({
      kmRestantes,
      diasRestantes,
      janelaKm: intervaloKm !== undefined ? janelaAtencaoKm(intervaloKm) : undefined,
      janelaDias:
        intervaloMeses !== undefined
          ? janelaAtencaoDias(intervaloMeses)
          : undefined,
    });

    lembretes.push({
      id: `${veiculo.id}:${tipo}`,
      veiculoId: veiculo.id,
      tipo,
      nome: definicao.nome,
      status,
      kmPrevisto,
      dataPrevista,
      kmRestantes,
      diasRestantes,
      kmUltimoServico: servico.km,
      dataUltimoServico: servico.data,
      progresso: calcularProgresso({
        kmUltimo: servico.km,
        kmPrevisto,
        kmAtual: veiculo.kmAtual,
        dataUltimo: servico.data,
        dataPrevista,
        hoje,
      }),
    });
  }

  return ordenarLembretes(lembretes);
}

const PESO_STATUS: Record<StatusLembrete, number> = {
  vencido: 0,
  atencao: 1,
  'em-dia': 2,
};

/**
 * Ordena por urgencia: vencido, depois atencao, depois em dia. Dentro do mesmo
 * status, o mais proximo de vencer vem primeiro.
 */
export function ordenarLembretes(lembretes: Lembrete[]): Lembrete[] {
  return [...lembretes].sort((a, b) => {
    const porStatus = PESO_STATUS[a.status] - PESO_STATUS[b.status];
    if (porStatus !== 0) return porStatus;
    // Progresso maior significa mais perto do vencimento (ou mais vencido).
    return b.progresso - a.progresso;
  });
}

/** Lembretes de todos os veiculos, ja ordenados por urgencia. */
export function calcularTodosLembretes(
  veiculos: Veiculo[],
  manutencoes: Manutencao[],
  hoje: IsoDate = today(),
): Lembrete[] {
  const todos = veiculos.flatMap((v) =>
    calcularLembretes(v, manutencoes, hoje),
  );
  return ordenarLembretes(todos);
}

/** O lembrete mais urgente de um veiculo, para o resumo do card. */
export function lembretePrioritario(lembretes: Lembrete[]): Lembrete | undefined {
  return lembretes[0];
}

/** Quantos lembretes em cada estado, para os contadores da barra de abas. */
export function contarPorStatus(
  lembretes: Lembrete[],
): Record<StatusLembrete, number> {
  const contagem: Record<StatusLembrete, number> = {
    'em-dia': 0,
    atencao: 0,
    vencido: 0,
  };
  for (const l of lembretes) {
    contagem[l.status] += 1;
  }
  return contagem;
}

/** Lembretes que merecem notificacao: vencidos e em atencao. */
export function lembretesPendentes(lembretes: Lembrete[]): Lembrete[] {
  return lembretes.filter((l) => l.status !== 'em-dia');
}
