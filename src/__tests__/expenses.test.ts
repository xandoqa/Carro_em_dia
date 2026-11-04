import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  agruparPorCategoria,
  agruparPorMes,
  consumoMedio,
  custoPorKm,
  dentroDoPeriodo,
  filtrarManutencoes,
  maioresGastos,
  periodoAno,
  periodoDozeMeses,
  periodoMes,
  resumirGastos,
} from '../domain/expenses';
import type { Manutencao } from '../domain/models';

function m(overrides: Partial<Manutencao> = {}): Manutencao {
  return {
    id: Math.random().toString(36).slice(2),
    veiculoId: 'v1',
    tipo: 'oleo',
    data: '2026-03-10',
    km: 100_000,
    valor: 100,
    criadoEm: '2026-03-10T00:00:00.000Z',
    ...overrides,
  };
}

describe('periodos', () => {
  it('ano vai de 1o de janeiro ate hoje', () => {
    assert.deepEqual(periodoAno('2026-05-18'), {
      de: '2026-01-01',
      ate: '2026-05-18',
    });
  });

  it('mes vai do dia 1 ate hoje', () => {
    assert.deepEqual(periodoMes('2026-05-18'), {
      de: '2026-05-01',
      ate: '2026-05-18',
    });
  });

  it('doze meses cobre onze meses cheios mais o atual', () => {
    // jun/2025 ate mai/2026 sao doze meses contando o corrente.
    assert.deepEqual(periodoDozeMeses('2026-05-18'), {
      de: '2025-06-01',
      ate: '2026-05-18',
    });
  });

  it('doze meses atravessa a virada do ano', () => {
    assert.deepEqual(periodoDozeMeses('2026-01-15'), {
      de: '2025-02-01',
      ate: '2026-01-15',
    });
  });

  it('inclui as duas pontas do periodo', () => {
    const periodo = { de: '2026-01-01', ate: '2026-12-31' };
    assert.equal(dentroDoPeriodo('2026-01-01', periodo), true);
    assert.equal(dentroDoPeriodo('2026-12-31', periodo), true);
    assert.equal(dentroDoPeriodo('2025-12-31', periodo), false);
    assert.equal(dentroDoPeriodo('2027-01-01', periodo), false);
  });
});

describe('filtrarManutencoes', () => {
  const dados = [
    m({ id: 'a', veiculoId: 'v1', tipo: 'oleo', data: '2026-01-10' }),
    m({ id: 'b', veiculoId: 'v2', tipo: 'pneus', data: '2026-02-10' }),
    m({ id: 'c', veiculoId: 'v1', tipo: 'freios', data: '2025-11-10' }),
  ];

  it('filtra por veiculo', () => {
    const r = filtrarManutencoes(dados, { veiculoId: 'v1' });
    assert.deepEqual(r.map((x) => x.id).sort(), ['a', 'c']);
  });

  it('filtra por periodo', () => {
    const r = filtrarManutencoes(dados, {
      periodo: { de: '2026-01-01', ate: '2026-12-31' },
    });
    assert.deepEqual(r.map((x) => x.id).sort(), ['a', 'b']);
  });

  it('filtra por tipo', () => {
    const r = filtrarManutencoes(dados, { tipos: ['pneus', 'freios'] });
    assert.deepEqual(r.map((x) => x.id).sort(), ['b', 'c']);
  });

  it('lista de tipos vazia nao filtra nada', () => {
    assert.equal(filtrarManutencoes(dados, { tipos: [] }).length, 3);
  });

  it('combina os filtros', () => {
    const r = filtrarManutencoes(dados, {
      veiculoId: 'v1',
      periodo: { de: '2026-01-01', ate: '2026-12-31' },
    });
    assert.deepEqual(r.map((x) => x.id), ['a']);
  });
});

describe('agruparPorCategoria', () => {
  it('soma por tipo e ordena do maior para o menor', () => {
    const r = agruparPorCategoria([
      m({ tipo: 'oleo', valor: 100 }),
      m({ tipo: 'oleo', valor: 200 }),
      m({ tipo: 'pneus', valor: 640 }),
    ]);

    assert.equal(r.length, 2);
    assert.equal(r[0].tipo, 'pneus');
    assert.equal(r[0].total, 640);
    assert.equal(r[1].tipo, 'oleo');
    assert.equal(r[1].total, 300);
    assert.equal(r[1].quantidade, 2);
  });

  it('as fracoes somam 1', () => {
    const r = agruparPorCategoria([
      m({ tipo: 'oleo', valor: 250 }),
      m({ tipo: 'pneus', valor: 750 }),
    ]);

    assert.equal(r[0].fracao, 0.75);
    assert.equal(r[1].fracao, 0.25);
    assert.equal(
      r.reduce((s, x) => s + x.fracao, 0),
      1,
    );
  });

  it('nao divide por zero quando tudo e gratuito', () => {
    const r = agruparPorCategoria([m({ valor: 0 })]);
    assert.equal(r[0].fracao, 0);
    assert.ok(Number.isFinite(r[0].fracao));
  });

  it('devolve lista vazia sem registros', () => {
    assert.deepEqual(agruparPorCategoria([]), []);
  });
});

describe('agruparPorMes', () => {
  it('inclui meses sem gasto como zero', () => {
    const r = agruparPorMes(
      [m({ data: '2026-01-15', valor: 350 }), m({ data: '2026-03-02', valor: 410 })],
      { de: '2026-01-01', ate: '2026-03-31' },
    );

    assert.deepEqual(
      r.map((x) => [x.mes, x.total]),
      [
        ['2026-01', 350],
        ['2026-02', 0],
        ['2026-03', 410],
      ],
    );
  });

  it('usa rotulo curto em portugues', () => {
    const r = agruparPorMes([], { de: '2026-05-01', ate: '2026-05-31' });
    assert.equal(r[0].rotulo, 'mai');
  });

  it('soma varios registros do mesmo mes', () => {
    const r = agruparPorMes(
      [m({ data: '2026-01-05', valor: 100 }), m({ data: '2026-01-25', valor: 50 })],
      { de: '2026-01-01', ate: '2026-01-31' },
    );
    assert.equal(r[0].total, 150);
  });
});

describe('maioresGastos', () => {
  it('ordena pelo valor e respeita o limite', () => {
    const r = maioresGastos(
      [
        m({ id: 'a', valor: 120 }),
        m({ id: 'b', valor: 980 }),
        m({ id: 'c', valor: 640 }),
      ],
      2,
    );

    assert.deepEqual(r.map((x) => x.id), ['b', 'c']);
  });

  it('nao altera o array original', () => {
    const dados = [m({ id: 'a', valor: 1 }), m({ id: 'b', valor: 2 })];
    maioresGastos(dados);
    assert.deepEqual(dados.map((x) => x.id), ['a', 'b']);
  });
});

describe('resumirGastos', () => {
  it('monta total, media e agregados', () => {
    const r = resumirGastos(
      [
        m({ data: '2026-01-15', valor: 300, tipo: 'oleo' }),
        m({ data: '2026-03-02', valor: 700, tipo: 'pneus' }),
      ],
      { de: '2026-01-01', ate: '2026-03-31' },
    );

    assert.equal(r.total, 1000);
    assert.equal(r.quantidade, 2);
    // Dois meses tiveram gasto; fevereiro foi zero e nao entra na media.
    assert.equal(r.mediaMensal, 500);
    assert.equal(r.porMes.length, 3);
    assert.equal(r.porCategoria.length, 2);
  });

  it('nao quebra sem registros', () => {
    const r = resumirGastos([], { de: '2026-01-01', ate: '2026-01-31' });
    assert.equal(r.total, 0);
    assert.equal(r.mediaMensal, 0);
    assert.deepEqual(r.porCategoria, []);
    assert.equal(r.porMes.length, 1);
  });
});

describe('consumoMedio', () => {
  it('calcula km por litro entre abastecimentos', () => {
    const r = consumoMedio([
      m({ tipo: 'abastecimento', km: 100_000, litros: 40 }),
      m({ tipo: 'abastecimento', km: 100_400, litros: 40 }),
    ]);

    // 400 km rodados com os 40 L do segundo abastecimento.
    assert.equal(r, 10);
  });

  it('ignora o primeiro abastecimento no calculo', () => {
    const r = consumoMedio([
      m({ tipo: 'abastecimento', km: 1_000, litros: 999 }),
      m({ tipo: 'abastecimento', km: 1_500, litros: 50 }),
    ]);

    assert.equal(r, 10);
  });

  it('devolve null com menos de dois abastecimentos', () => {
    assert.equal(consumoMedio([m({ tipo: 'abastecimento', litros: 40 })]), null);
    assert.equal(consumoMedio([]), null);
  });

  it('ignora trechos com km repetido ou fora de ordem', () => {
    const r = consumoMedio([
      m({ tipo: 'abastecimento', km: 1_000, litros: 30 }),
      m({ tipo: 'abastecimento', km: 1_000, litros: 30 }),
      m({ tipo: 'abastecimento', km: 1_300, litros: 30 }),
    ]);

    assert.equal(r, 10);
  });

  it('desconsidera registros que nao sao abastecimento', () => {
    assert.equal(
      consumoMedio([
        m({ tipo: 'oleo', km: 1_000 }),
        m({ tipo: 'oleo', km: 2_000 }),
      ]),
      null,
    );
  });
});

describe('custoPorKm', () => {
  it('divide o total pela distancia percorrida', () => {
    const r = custoPorKm([
      m({ km: 100_000, valor: 200 }),
      m({ km: 101_000, valor: 300 }),
    ]);

    assert.equal(r, 0.5);
  });

  it('devolve null sem distancia', () => {
    assert.equal(custoPorKm([m({ km: 100_000 }), m({ km: 100_000 })]), null);
    assert.equal(custoPorKm([m()]), null);
  });
});
