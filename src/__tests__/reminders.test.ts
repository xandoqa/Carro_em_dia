/**
 * Testes das regras de lembrete.
 *
 * Rodam no Node puro (`node --test`), sem React Native, porque a camada de
 * dominio nao importa nada da plataforma de proposito.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  calcularLembretes,
  calcularTodosLembretes,
  contarPorStatus,
  definirStatus,
  janelaAtencaoDias,
  janelaAtencaoKm,
  lembretesPendentes,
  ordenarLembretes,
  ultimoServicoPorTipo,
} from '../domain/reminders';
import type { Lembrete, Manutencao, Veiculo } from '../domain/models';

const HOJE = '2026-05-18';

function veiculo(overrides: Partial<Veiculo> = {}): Veiculo {
  return {
    id: 'v1',
    apelido: 'Gol do trabalho',
    tipo: 'carro',
    marca: 'Volkswagen',
    modelo: 'Gol 1.0',
    ano: 2018,
    placa: 'BRA2E19',
    combustivel: 'flex',
    kmAtual: 114_500,
    criadoEm: '2026-01-01T00:00:00.000Z',
    atualizadoEm: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function manutencao(overrides: Partial<Manutencao> = {}): Manutencao {
  return {
    id: 'm1',
    veiculoId: 'v1',
    tipo: 'oleo',
    data: '2026-01-10',
    km: 105_000,
    valor: 280,
    criadoEm: '2026-01-10T12:00:00.000Z',
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */

describe('janelas de atencao', () => {
  it('usa 15% do intervalo dentro dos limites', () => {
    // 15% de 10.000 = 1.500, dentro do piso e do teto.
    assert.equal(janelaAtencaoKm(10_000), 1_500);
  });

  it('respeita o piso para intervalos curtos', () => {
    // 15% de 1.000 = 150, abaixo do piso de 300.
    assert.equal(janelaAtencaoKm(1_000), 300);
  });

  it('respeita o teto para intervalos longos', () => {
    // 15% de 40.000 = 6.000, acima do teto de 2.000.
    assert.equal(janelaAtencaoKm(40_000), 2_000);
  });

  it('converte meses em dias com os mesmos limites', () => {
    // 12 meses -> 360 dias -> 15% = 54 -> teto de 45.
    assert.equal(janelaAtencaoDias(12), 45);
    // 1 mes -> 30 dias -> 15% = 4,5 -> piso de 7.
    assert.equal(janelaAtencaoDias(1), 7);
  });
});

describe('definirStatus', () => {
  it('marca vencido quando o km passou', () => {
    assert.equal(
      definirStatus({ kmRestantes: -300, janelaKm: 1_500 }),
      'vencido',
    );
  });

  it('marca vencido quando a data passou, mesmo com km sobrando', () => {
    assert.equal(
      definirStatus({
        kmRestantes: 5_000,
        janelaKm: 1_500,
        diasRestantes: -2,
        janelaDias: 45,
      }),
      'vencido',
    );
  });

  it('marca atencao dentro da janela', () => {
    assert.equal(
      definirStatus({ kmRestantes: 1_000, janelaKm: 1_500 }),
      'atencao',
    );
  });

  it('marca atencao exatamente no limite da janela', () => {
    assert.equal(
      definirStatus({ kmRestantes: 1_500, janelaKm: 1_500 }),
      'atencao',
    );
  });

  it('marca em dia fora da janela', () => {
    assert.equal(
      definirStatus({ kmRestantes: 5_000, janelaKm: 1_500 }),
      'em-dia',
    );
  });

  it('considera so a dimensao que existe', () => {
    assert.equal(
      definirStatus({ diasRestantes: 3, janelaDias: 7 }),
      'atencao',
    );
  });
});

describe('ultimoServicoPorTipo', () => {
  it('mantem o registro mais recente de cada tipo', () => {
    const mapa = ultimoServicoPorTipo([
      manutencao({ id: 'a', tipo: 'oleo', data: '2025-06-01', km: 95_000 }),
      manutencao({ id: 'b', tipo: 'oleo', data: '2026-01-10', km: 105_000 }),
      manutencao({ id: 'c', tipo: 'freios', data: '2025-09-01', km: 99_000 }),
    ]);

    assert.equal(mapa.get('oleo')?.id, 'b');
    assert.equal(mapa.get('freios')?.id, 'c');
    assert.equal(mapa.size, 2);
  });

  it('desempata pela maior quilometragem na mesma data', () => {
    const mapa = ultimoServicoPorTipo([
      manutencao({ id: 'a', data: '2026-01-10', km: 105_000 }),
      manutencao({ id: 'b', data: '2026-01-10', km: 105_400 }),
    ]);

    assert.equal(mapa.get('oleo')?.id, 'b');
  });
});

describe('calcularLembretes', () => {
  it('nao gera lembrete sem historico', () => {
    assert.deepEqual(calcularLembretes(veiculo(), [], HOJE), []);
  });

  it('projeta o proximo servico a partir do ultimo registro', () => {
    const lembretes = calcularLembretes(
      veiculo({ kmAtual: 108_000 }),
      [manutencao({ km: 105_000, data: '2026-01-10', proximaEmKm: 10_000 })],
      HOJE,
    );

    assert.equal(lembretes.length, 1);
    const [l] = lembretes;
    assert.equal(l.kmPrevisto, 115_000);
    assert.equal(l.kmRestantes, 7_000);
    assert.equal(l.status, 'em-dia');
  });

  it('usa o intervalo padrao do tipo quando o registro nao define um', () => {
    const lembretes = calcularLembretes(
      veiculo({ kmAtual: 106_000 }),
      // Sem previsao no registro: cai nos padroes do tipo "oleo",
      // que sao 10.000 km e 12 meses.
      [manutencao({ km: 105_000, data: '2026-01-10' })],
      HOJE,
    );

    assert.equal(lembretes[0].kmPrevisto, 115_000);
    assert.equal(lembretes[0].dataPrevista, '2027-01-10');
  });

  it('previsao so em km nao cria vencimento por data', () => {
    // O usuario pediu aviso em 10.000 km e deixou os meses em branco.
    // O padrao de 12 meses do tipo nao deve entrar no lugar dele.
    const lembretes = calcularLembretes(
      veiculo({ kmAtual: 106_000 }),
      [manutencao({ km: 105_000, data: '2026-01-10', proximaEmKm: 10_000 })],
      HOJE,
    );

    assert.equal(lembretes[0].kmPrevisto, 115_000);
    assert.equal(lembretes[0].dataPrevista, undefined);
    assert.equal(lembretes[0].diasRestantes, undefined);
  });

  it('previsao so em meses nao cria vencimento por km', () => {
    const lembretes = calcularLembretes(
      veiculo({ kmAtual: 200_000 }),
      [manutencao({ km: 105_000, data: '2026-01-10', proximaEmMeses: 12 })],
      HOJE,
    );

    assert.equal(lembretes[0].kmPrevisto, undefined);
    assert.equal(lembretes[0].dataPrevista, '2027-01-10');
    assert.equal(lembretes[0].status, 'em-dia');
  });

  it('marca vencido quando o odometro passou do previsto', () => {
    const lembretes = calcularLembretes(
      veiculo({ kmAtual: 114_500 }),
      [manutencao({ km: 104_000, data: '2026-01-10', proximaEmKm: 10_000 })],
      HOJE,
    );

    assert.equal(lembretes[0].status, 'vencido');
    assert.equal(lembretes[0].kmRestantes, -500);
    assert.ok(lembretes[0].progresso > 1);
  });

  it('vence pela data mesmo com quilometragem sobrando', () => {
    const lembretes = calcularLembretes(
      veiculo({ kmAtual: 105_100 }),
      [
        manutencao({
          km: 105_000,
          data: '2025-01-10',
          proximaEmKm: 10_000,
          proximaEmMeses: 12,
        }),
      ],
      HOJE,
    );

    // Restam 9.900 km, mas a data prevista (10/01/2026) ja passou.
    assert.equal(lembretes[0].kmRestantes, 9_900);
    assert.equal(lembretes[0].status, 'vencido');
  });

  it('ignora tipos que nao geram lembrete', () => {
    const lembretes = calcularLembretes(
      veiculo(),
      [manutencao({ tipo: 'abastecimento', litros: 32 })],
      HOJE,
    );

    assert.deepEqual(lembretes, []);
  });

  it('nao mistura manutencoes de outro veiculo', () => {
    const lembretes = calcularLembretes(
      veiculo({ id: 'v1' }),
      [manutencao({ veiculoId: 'v2', km: 10_000 })],
      HOJE,
    );

    assert.deepEqual(lembretes, []);
  });

  it('calcula progresso entre o ultimo servico e o previsto', () => {
    const lembretes = calcularLembretes(
      veiculo({ kmAtual: 110_000 }),
      [manutencao({ km: 105_000, data: '2026-01-10', proximaEmKm: 10_000 })],
      HOJE,
    );

    // Metade do caminho entre 105.000 e 115.000.
    assert.equal(lembretes[0].progresso, 0.5);
  });

  it('nao devolve progresso negativo se o odometro estiver atras', () => {
    const lembretes = calcularLembretes(
      veiculo({ kmAtual: 100_000 }),
      [manutencao({ km: 105_000, data: '2026-01-10', proximaEmKm: 10_000 })],
      HOJE,
    );

    assert.equal(lembretes[0].progresso, 0);
  });
});

describe('ordenacao e contagem', () => {
  function lembrete(
    status: Lembrete['status'],
    progresso: number,
    id: string,
  ): Lembrete {
    return {
      id,
      veiculoId: 'v1',
      tipo: 'oleo',
      nome: 'Troca de oleo e filtro',
      status,
      progresso,
    };
  }

  it('coloca vencidos antes de atencao e em dia', () => {
    const ordenados = ordenarLembretes([
      lembrete('em-dia', 0.2, 'c'),
      lembrete('vencido', 1.2, 'a'),
      lembrete('atencao', 0.9, 'b'),
    ]);

    assert.deepEqual(
      ordenados.map((l) => l.id),
      ['a', 'b', 'c'],
    );
  });

  it('dentro do mesmo status, o mais adiantado vem primeiro', () => {
    const ordenados = ordenarLembretes([
      lembrete('atencao', 0.88, 'menos'),
      lembrete('atencao', 0.97, 'mais'),
    ]);

    assert.deepEqual(
      ordenados.map((l) => l.id),
      ['mais', 'menos'],
    );
  });

  it('conta por status', () => {
    const contagem = contarPorStatus([
      lembrete('vencido', 1.1, 'a'),
      lembrete('atencao', 0.9, 'b'),
      lembrete('atencao', 0.88, 'c'),
      lembrete('em-dia', 0.1, 'd'),
    ]);

    assert.deepEqual(contagem, { vencido: 1, atencao: 2, 'em-dia': 1 });
  });

  it('pendentes exclui os em dia', () => {
    const pendentes = lembretesPendentes([
      lembrete('vencido', 1.1, 'a'),
      lembrete('em-dia', 0.1, 'b'),
    ]);

    assert.deepEqual(
      pendentes.map((l) => l.id),
      ['a'],
    );
  });
});

describe('calcularTodosLembretes', () => {
  it('junta varios veiculos ordenados por urgencia', () => {
    const carro = veiculo({ id: 'v1', kmAtual: 114_500 });
    const moto = veiculo({
      id: 'v2',
      tipo: 'moto',
      apelido: 'Fan do dia a dia',
      kmAtual: 28_200,
    });

    const lembretes = calcularTodosLembretes(
      [carro, moto],
      [
        // Carro: vencido em 500 km.
        manutencao({
          id: 'a',
          veiculoId: 'v1',
          km: 104_000,
          data: '2026-01-10',
          proximaEmKm: 10_000,
        }),
        // Moto: faltam 600 km, dentro da janela de 750 km (15% de 5.000).
        manutencao({
          id: 'b',
          veiculoId: 'v2',
          tipo: 'freios',
          km: 23_800,
          data: '2026-03-01',
          proximaEmKm: 5_000,
        }),
      ],
      HOJE,
    );

    assert.equal(lembretes.length, 2);
    assert.equal(lembretes[0].veiculoId, 'v1');
    assert.equal(lembretes[0].status, 'vencido');
    assert.equal(lembretes[1].veiculoId, 'v2');
    assert.equal(lembretes[1].status, 'atencao');
  });
});
