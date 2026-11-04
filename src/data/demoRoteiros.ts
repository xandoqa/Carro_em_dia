/**
 * Roteiro dos dados de demonstracao.
 *
 * Fica separado de `demoData` porque nao toca em disco: assim o cenario pode
 * ser testado sozinho, verificando que ele realmente produz um servico
 * vencido, um chegando e um em dia.
 *
 * Existe por um motivo pratico: numa apresentacao, um app vazio nao mostra
 * historico, nem grafico, nem alerta vencido. Carregar um conjunto de exemplo
 * em um toque evita ter que digitar dez registros ao vivo.
 *
 * As datas e quilometragens sao calculadas a partir de hoje, nao fixas, para
 * que a demonstracao continue coerente em qualquer data: sempre haverá um
 * servico vencido, um chegando e um em dia.
 */

import type { NovaManutencao, NovoVeiculo } from '../domain/models';
import { addMonths, today } from '../utils/date';

/** Subtrai meses de hoje, para datar os registros de exemplo. */
function mesesAtras(meses: number): string {
  return addMonths(today(), -meses);
}

export interface Roteiro {
  veiculo: NovoVeiculo;
  /** Manutencoes sem o veiculoId, que so existe depois de criar o veiculo. */
  manutencoes: Omit<NovaManutencao, 'veiculoId'>[];
}

/**
 * Dois veiculos com historicos diferentes, escolhidos para cobrir os tres
 * estados de lembrete de uma vez.
 */
export function montarRoteiros(): Roteiro[] {
  const carroKm = 114_500;
  const motoKm = 28_200;

  return [
    {
      veiculo: {
        apelido: 'Gol do trabalho',
        tipo: 'carro',
        marca: 'Volkswagen',
        modelo: 'Gol 1.0 Flex',
        ano: 2018,
        placa: 'BRA2E19',
        combustivel: 'flex',
        kmAtual: carroKm,
      },
      manutencoes: [
        // Vencido: o filtro passou do km previsto.
        {
          tipo: 'filtros',
          descricao: 'Filtro de cabine',
          data: mesesAtras(14),
          km: carroKm - 15_300,
          valor: 120,
          oficina: 'AutoCar Express',
          proximaEmKm: 15_000,
        },
        // Chegando: faltam 500 km para a troca de oleo.
        {
          tipo: 'oleo',
          data: mesesAtras(7),
          km: carroKm - 9_500,
          valor: 280,
          oficina: 'AutoCar Express',
          observacoes: 'Oleo sintetico 5W40 e filtro original.',
          proximaEmKm: 10_000,
        },
        // Em dia: os freios tem folga larga.
        {
          tipo: 'freios',
          descricao: 'Pastilhas dianteiras',
          data: mesesAtras(9),
          km: carroKm - 6_300,
          valor: 340,
          oficina: 'Freio Rapido',
          proximaEmKm: 30_000,
        },
        {
          tipo: 'pneus',
          descricao: 'Alinhamento e balanceamento',
          data: mesesAtras(16),
          km: carroKm - 12_000,
          valor: 120,
          oficina: 'Pneus & Cia',
        },
        {
          tipo: 'abastecimento',
          data: mesesAtras(2),
          km: carroKm - 780,
          valor: 180,
          litros: 32.1,
          oficina: 'Posto Central',
        },
        {
          tipo: 'abastecimento',
          data: mesesAtras(1),
          km: carroKm - 390,
          valor: 172,
          litros: 30.4,
          oficina: 'Posto Central',
        },
        {
          tipo: 'abastecimento',
          data: mesesAtras(0),
          km: carroKm - 20,
          valor: 165,
          litros: 29.2,
          oficina: 'Posto da Rodovia',
        },
      ],
    },
    {
      veiculo: {
        apelido: 'Fan do dia a dia',
        tipo: 'moto',
        marca: 'Honda',
        modelo: 'CG 160 Fan',
        ano: 2021,
        placa: 'XYZ9A88',
        combustivel: 'flex',
        kmAtual: motoKm,
      },
      manutencoes: [
        {
          tipo: 'oleo',
          data: mesesAtras(5),
          km: motoKm - 2_700,
          valor: 95,
          oficina: 'Moto Peças do Joao',
          proximaEmKm: 3_000,
        },
        {
          tipo: 'freios',
          descricao: 'Pastilhas dianteiras',
          data: mesesAtras(11),
          km: motoKm - 4_400,
          valor: 140,
          oficina: 'Moto Peças do Joao',
          proximaEmKm: 5_000,
        },
        {
          tipo: 'revisao',
          data: mesesAtras(13),
          km: motoKm - 8_000,
          valor: 260,
          oficina: 'Concessionaria Honda',
          proximaEmMeses: 12,
        },
      ],
    },
  ];
}

