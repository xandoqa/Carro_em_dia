import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { kmMinimoPermitido, validarNovoKm } from '../domain/odometer';
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

describe('kmMinimoPermitido', () => {
  it('e o maior km do historico do veiculo', () => {
    const minimo = kmMinimoPermitido(
      [m({ km: 98_000 }), m({ km: 114_000 }), m({ km: 105_000 })],
      'v1',
    );
    assert.equal(minimo, 114_000);
  });

  it('ignora manutencoes de outro veiculo', () => {
    const minimo = kmMinimoPermitido(
      [m({ veiculoId: 'v1', km: 50_000 }), m({ veiculoId: 'v2', km: 900_000 })],
      'v1',
    );
    assert.equal(minimo, 50_000);
  });

  it('e zero sem historico', () => {
    assert.equal(kmMinimoPermitido([], 'v1'), 0);
    assert.equal(kmMinimoPermitido([m({ veiculoId: 'v2' })], 'v1'), 0);
  });
});

describe('validarNovoKm', () => {
  it('aceita avanco normal do odometro', () => {
    const r = validarNovoKm({ novo: 115_000, atual: 114_500, minimo: 114_000 });
    assert.equal(r.tipo, 'avanco');
  });

  it('aceita valor igual sem exigir nada', () => {
    const r = validarNovoKm({ novo: 114_500, atual: 114_500, minimo: 114_000 });
    assert.equal(r.tipo, 'ok');
  });

  it('trata valor menor como correcao quando o historico permite', () => {
    // O usuario digitou 1.145.000 por engano e quer voltar para 114.500.
    const r = validarNovoKm({
      novo: 114_500,
      atual: 1_145_000,
      minimo: 114_000,
    });
    assert.equal(r.tipo, 'correcao');
  });

  it('recusa correcao abaixo do maior km registrado', () => {
    const r = validarNovoKm({ novo: 100_000, atual: 114_500, minimo: 114_000 });
    assert.equal(r.tipo, 'invalido');
    if (r.tipo === 'invalido') {
      assert.match(r.motivo, /114\.000 km/);
    }
  });

  it('recusa valor negativo', () => {
    const r = validarNovoKm({ novo: -5, atual: 100, minimo: 0 });
    assert.equal(r.tipo, 'invalido');
  });

  it('recusa valor que nao e numero', () => {
    const r = validarNovoKm({ novo: Number.NaN, atual: 100, minimo: 0 });
    assert.equal(r.tipo, 'invalido');
  });

  it('permite zerar o odometro de veiculo sem historico', () => {
    const r = validarNovoKm({ novo: 0, atual: 999_999, minimo: 0 });
    assert.equal(r.tipo, 'correcao');
  });

  it('distingue correcao de invalido, que e o que da saida ao usuario', () => {
    // Sem essa distincao, um erro de digitacao ficaria preso para sempre:
    // o valor inflado nao poderia ser desfeito por nenhum caminho do app.
    const correcao = validarNovoKm({
      novo: 114_500,
      atual: 1_145_000,
      minimo: 114_000,
    });
    const invalido = validarNovoKm({
      novo: 50_000,
      atual: 1_145_000,
      minimo: 114_000,
    });

    assert.notEqual(correcao.tipo, invalido.tipo);
    assert.equal(correcao.tipo, 'correcao');
    assert.equal(invalido.tipo, 'invalido');
  });
});
