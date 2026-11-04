/**
 * Testes do calculo de disparo das notificacoes.
 *
 * A regra e pura e mora em `domain/notificationSchedule`, separada do servico
 * justamente para poder ser testada sem carregar o `expo-notifications`.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calcularDisparo, montarTexto } from '../domain/notificationSchedule';
import type { Lembrete, Veiculo } from '../domain/models';

function lembrete(overrides: Partial<Lembrete> = {}): Lembrete {
  return {
    id: 'v1:oleo',
    veiculoId: 'v1',
    tipo: 'oleo',
    nome: 'Troca de oleo e filtro',
    status: 'atencao',
    progresso: 0.9,
    ...overrides,
  };
}

/** 18/05/2026 as 14h, horario local. */
const AGORA = new Date(2026, 4, 18, 14, 0, 0, 0);

describe('calcularDisparo', () => {
  it('agenda a antecedencia antes da data prevista', () => {
    const disparo = calcularDisparo(
      lembrete({ dataPrevista: '2026-06-10' }),
      7,
      9,
      AGORA,
    );

    assert.ok(disparo);
    assert.equal(disparo.getFullYear(), 2026);
    assert.equal(disparo.getMonth(), 5);
    assert.equal(disparo.getDate(), 3);
    assert.equal(disparo.getHours(), 9);
    assert.equal(disparo.getMinutes(), 0);
  });

  it('avisa um vencido na proxima hora cheia, nao no passado', () => {
    const disparo = calcularDisparo(
      lembrete({ status: 'vencido', dataPrevista: '2026-01-10' }),
      7,
      9,
      AGORA,
    );

    assert.ok(disparo);
    assert.ok(
      disparo.getTime() > AGORA.getTime(),
      'o disparo tem que estar no futuro',
    );
    // As 14h de hoje, as 9h ja passaram: cai para amanha.
    assert.equal(disparo.getDate(), 19);
    assert.equal(disparo.getHours(), 9);
  });

  it('avisa um vencido hoje mesmo se a hora ainda nao passou', () => {
    const cedo = new Date(2026, 4, 18, 7, 0, 0, 0);
    const disparo = calcularDisparo(
      lembrete({ status: 'vencido' }),
      7,
      9,
      cedo,
    );

    assert.ok(disparo);
    assert.equal(disparo.getDate(), 18);
    assert.equal(disparo.getHours(), 9);
  });

  it('avisa um vencido que nem tem data prevista', () => {
    // Lembrete que vence so por quilometragem e ja passou do limite.
    const disparo = calcularDisparo(
      lembrete({ status: 'vencido', kmRestantes: -300 }),
      7,
      9,
      AGORA,
    );

    assert.ok(disparo, 'vencido por km tambem precisa gerar aviso');
  });

  it('nao agenda lembrete sem data que ainda esta no prazo', () => {
    const disparo = calcularDisparo(
      lembrete({ status: 'atencao', kmRestantes: 500 }),
      7,
      9,
      AGORA,
    );

    assert.equal(disparo, null);
  });

  it('cai para a proxima hora quando a janela de antecedencia ja passou', () => {
    // Vence em 3 dias, mas a antecedencia e de 7: o momento ideal ficou atras.
    const disparo = calcularDisparo(
      lembrete({ dataPrevista: '2026-05-21' }),
      7,
      9,
      AGORA,
    );

    assert.ok(disparo);
    assert.ok(disparo.getTime() > AGORA.getTime());
    assert.equal(disparo.getDate(), 19);
  });

  it('respeita a hora escolhida pelo usuario', () => {
    const disparo = calcularDisparo(
      lembrete({ dataPrevista: '2026-06-10' }),
      7,
      20,
      AGORA,
    );

    assert.ok(disparo);
    assert.equal(disparo.getHours(), 20);
  });

  it('antecedencia zero agenda no proprio dia do vencimento', () => {
    const disparo = calcularDisparo(
      lembrete({ dataPrevista: '2026-06-10' }),
      0,
      9,
      AGORA,
    );

    assert.ok(disparo);
    assert.equal(disparo.getDate(), 10);
    assert.equal(disparo.getMonth(), 5);
  });
});

describe('montarTexto', () => {
  const veiculo: Veiculo = {
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
  };

  it('diz que venceu quando o lembrete esta vencido', () => {
    const { titulo } = montarTexto(lembrete({ status: 'vencido' }), veiculo);
    assert.match(titulo, /venceu$/);
  });

  it('diz que esta chegando quando ainda ha prazo', () => {
    const { titulo } = montarTexto(lembrete({ status: 'atencao' }), veiculo);
    assert.match(titulo, /esta chegando$/);
  });

  it('cita o veiculo e a quilometragem prevista', () => {
    const { corpo } = montarTexto(
      lembrete({ kmPrevisto: 115_000 }),
      veiculo,
    );
    assert.match(corpo, /Gol do trabalho/);
    assert.match(corpo, /115\.000 km/);
  });

  it('usa singular para um dia restante', () => {
    const { corpo } = montarTexto(lembrete({ diasRestantes: 1 }), veiculo);
    assert.match(corpo, /faltam 1 dia(?!s)/);
  });

  it('diz "vence hoje" quando faltam zero dias', () => {
    const { corpo } = montarTexto(lembrete({ diasRestantes: 0 }), veiculo);
    assert.match(corpo, /vence hoje/);
  });

  it('nao cita dias negativos no corpo', () => {
    const { corpo } = montarTexto(
      lembrete({ status: 'vencido', diasRestantes: -5 }),
      veiculo,
    );
    assert.equal(corpo.includes('-5'), false);
  });
});
