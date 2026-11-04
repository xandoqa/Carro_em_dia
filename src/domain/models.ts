/**
 * Modelo de dados do CarroEmDia.
 *
 * As entidades seguem a documentacao do projeto (Usuario, Veiculo, Tipo de
 * manutencao, Manutencao, Lembrete). Datas trafegam como string ISO
 * `YYYY-MM-DD` porque sao datas de calendario, sem hora nem fuso — a data de um
 * servico e a mesma independente de onde o celular esta.
 */

/** Data de calendario no formato ISO curto, ex.: `2026-05-18`. */
export type IsoDate = string;

/** Instante completo em ISO, usado em campos de auditoria. */
export type IsoDateTime = string;

/* -------------------------------------------------------------------------- */
/* Usuario                                                                     */
/* -------------------------------------------------------------------------- */

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  criadoEm: IsoDateTime;
}

/* -------------------------------------------------------------------------- */
/* Veiculo                                                                     */
/* -------------------------------------------------------------------------- */

export type TipoVeiculo = 'carro' | 'moto';

export type Combustivel =
  | 'flex'
  | 'gasolina'
  | 'etanol'
  | 'diesel'
  | 'gnv'
  | 'eletrico'
  | 'hibrido';

export const combustiveisLabel: Record<Combustivel, string> = {
  flex: 'Flex',
  gasolina: 'Gasolina',
  etanol: 'Etanol',
  diesel: 'Diesel',
  gnv: 'GNV',
  eletrico: 'Eletrico',
  hibrido: 'Hibrido',
};

export interface Veiculo {
  id: string;
  /** Nome que o usuario da ao veiculo, ex.: "Gol do trabalho". */
  apelido: string;
  tipo: TipoVeiculo;
  marca: string;
  modelo: string;
  ano: number;
  /** Placa normalizada em caixa alta, sem hifen. */
  placa: string;
  combustivel: Combustivel;
  /** Quilometragem atual conhecida. */
  kmAtual: number;
  /** URI local da foto, quando o usuario escolheu uma. */
  fotoUri?: string;
  /** Codigo FIPE guardado quando o veiculo veio da consulta a API. */
  fipeCodigo?: string;
  /** Valor FIPE em reais no momento da consulta. */
  fipeValor?: number;
  criadoEm: IsoDateTime;
  atualizadoEm: IsoDateTime;
}

/** Dados que o formulario de cadastro entrega; o resto o repositorio completa. */
export type NovoVeiculo = Omit<Veiculo, 'id' | 'criadoEm' | 'atualizadoEm'>;

/* -------------------------------------------------------------------------- */
/* Tipo de manutencao                                                          */
/* -------------------------------------------------------------------------- */

export type TipoManutencaoId =
  | 'oleo'
  | 'pneus'
  | 'freios'
  | 'bateria'
  | 'revisao'
  | 'filtros'
  | 'abastecimento'
  | 'outro';

export interface TipoManutencao {
  id: TipoManutencaoId;
  nome: string;
  /** Intervalo padrao em quilometros, quando existe. */
  intervaloKm?: number;
  /** Intervalo padrao em meses, quando existe. */
  intervaloMeses?: number;
  /** Se entra no calculo automatico de lembretes. */
  geraLembrete: boolean;
}

/**
 * Intervalos padrao de referencia. O usuario pode sobrescrever a cada registro;
 * estes valores so preenchem o formulario e servem de fallback.
 */
export const tiposManutencao: Record<TipoManutencaoId, TipoManutencao> = {
  oleo: {
    id: 'oleo',
    nome: 'Troca de oleo e filtro',
    intervaloKm: 10000,
    intervaloMeses: 12,
    geraLembrete: true,
  },
  pneus: {
    id: 'pneus',
    nome: 'Pneus',
    intervaloKm: 40000,
    intervaloMeses: 36,
    geraLembrete: true,
  },
  freios: {
    id: 'freios',
    nome: 'Freios',
    intervaloKm: 30000,
    intervaloMeses: 24,
    geraLembrete: true,
  },
  bateria: {
    id: 'bateria',
    nome: 'Bateria',
    intervaloMeses: 36,
    geraLembrete: true,
  },
  revisao: {
    id: 'revisao',
    nome: 'Revisao geral',
    intervaloKm: 10000,
    intervaloMeses: 12,
    geraLembrete: true,
  },
  filtros: {
    id: 'filtros',
    nome: 'Filtros',
    intervaloKm: 15000,
    intervaloMeses: 12,
    geraLembrete: true,
  },
  abastecimento: {
    id: 'abastecimento',
    nome: 'Abastecimento',
    geraLembrete: false,
  },
  outro: {
    id: 'outro',
    nome: 'Outro servico',
    geraLembrete: false,
  },
};

export const tiposManutencaoOrdem: TipoManutencaoId[] = [
  'oleo',
  'pneus',
  'freios',
  'bateria',
  'revisao',
  'filtros',
  'abastecimento',
  'outro',
];

/* -------------------------------------------------------------------------- */
/* Manutencao                                                                  */
/* -------------------------------------------------------------------------- */

export interface Manutencao {
  id: string;
  veiculoId: string;
  tipo: TipoManutencaoId;
  /** Descricao livre quando o tipo e "outro", ou detalhe do servico. */
  descricao?: string;
  data: IsoDate;
  /** Quilometragem no momento do servico. */
  km: number;
  /** Valor pago em reais. */
  valor: number;
  oficina?: string;
  observacoes?: string;
  /** URI local da foto da nota fiscal. */
  notaUri?: string;
  /** Intervalo em km ate a proxima, definido pelo usuario neste registro. */
  proximaEmKm?: number;
  /** Intervalo em meses ate a proxima, definido pelo usuario neste registro. */
  proximaEmMeses?: number;
  /** Litros abastecidos, so para registros de abastecimento. */
  litros?: number;
  criadoEm: IsoDateTime;
}

export type NovaManutencao = Omit<Manutencao, 'id' | 'criadoEm'>;

/* -------------------------------------------------------------------------- */
/* Lembrete                                                                    */
/* -------------------------------------------------------------------------- */

export type StatusLembrete = 'em-dia' | 'atencao' | 'vencido';

/**
 * Lembrete calculado. Nao e persistido: ele e derivado das manutencoes e da
 * quilometragem atual sempre que a tela precisa, para nunca ficar defasado.
 */
export interface Lembrete {
  /** Identificador estavel: `${veiculoId}:${tipo}`. */
  id: string;
  veiculoId: string;
  tipo: TipoManutencaoId;
  nome: string;
  status: StatusLembrete;

  /** Quilometragem prevista para o proximo servico, quando ha base em km. */
  kmPrevisto?: number;
  /** Data prevista, quando ha base em meses. */
  dataPrevista?: IsoDate;

  /** Quanto falta em km. Negativo quando ja passou. */
  kmRestantes?: number;
  /** Quanto falta em dias. Negativo quando ja passou. */
  diasRestantes?: number;

  /** Km do ultimo servico deste tipo, base da faixa de medida. */
  kmUltimoServico?: number;
  /** Data do ultimo servico deste tipo. */
  dataUltimoServico?: IsoDate;

  /**
   * Progresso de 0 a 1 entre o ultimo servico e o proximo previsto.
   * Alimenta a faixa de medida. Passa de 1 quando o prazo venceu.
   */
  progresso: number;
}

/* -------------------------------------------------------------------------- */
/* Agregados de gastos                                                         */
/* -------------------------------------------------------------------------- */

export interface GastoPorCategoria {
  tipo: TipoManutencaoId;
  nome: string;
  total: number;
  /** Fracao do total do periodo, de 0 a 1. */
  fracao: number;
  quantidade: number;
}

export interface GastoPorMes {
  /** Chave `YYYY-MM`. */
  mes: string;
  /** Rotulo curto para o eixo, ex.: "mai". */
  rotulo: string;
  total: number;
}

export interface ResumoGastos {
  total: number;
  /** Media por mes dentro do periodo com registros. */
  mediaMensal: number;
  quantidade: number;
  porCategoria: GastoPorCategoria[];
  porMes: GastoPorMes[];
  maiores: Manutencao[];
}
