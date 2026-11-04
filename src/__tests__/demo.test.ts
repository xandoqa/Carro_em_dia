/**
 * Verifica que o cenario de demonstracao realmente produz os tres estados de
 * lembrete.
 *
 * Isso nao testa so os dados de exemplo: e um teste de ponta a ponta das
 * regras de lembrete sobre um historico realista, com varios tipos de servico
 * e dois veiculos. Se a janela de atencao ou a projecao do proximo servico
 * mudarem sem querer, este teste quebra antes da apresentacao.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { montarRoteiros } from '../data/demoRoteiros';
import { calcularTodosLembretes, contarPorStatus } from '../domain/reminders';
import type { Manutencao, Veiculo } from '../domain/models';

/** Monta veiculos e manutencoes como o repositorio faria, mas em memoria. */
function materializar() {
  const veiculos: Veiculo[] = [];
  const manutencoes: Manutencao[] = [];

  montarRoteiros().forEach((roteiro, vi) => {
    const id = `v${vi}`;
    veiculos.push({
      ...roteiro.veiculo,
      id,
      criadoEm: '2026-01-01T00:00:00.000Z',
      atualizadoEm: '2026-01-01T00:00:00.000Z',
    });

    roteiro.manutencoes.forEach((m, mi) => {
      manutencoes.push({
        ...m,
        id: `v${vi}m${mi}`,
        veiculoId: id,
        criadoEm: '2026-01-01T00:00:00.000Z',
      });
    });
  });

  return { veiculos, manutencoes };
}

describe('cenario de demonstracao', () => {
  it('cria dois veiculos com historico', () => {
    const { veiculos, manutencoes } = materializar();
    assert.equal(veiculos.length, 2);
    assert.ok(manutencoes.length >= 8);
  });

  it('produz pelo menos um lembrete de cada estado', () => {
    const { veiculos, manutencoes } = materializar();
    const contagem = contarPorStatus(
      calcularTodosLembretes(veiculos, manutencoes),
    );

    assert.ok(contagem.vencido >= 1, 'esperava ao menos um vencido');
    assert.ok(contagem.atencao >= 1, 'esperava ao menos um em atencao');
    assert.ok(contagem['em-dia'] >= 1, 'esperava ao menos um em dia');
  });

  it('coloca um vencido no topo da lista', () => {
    const { veiculos, manutencoes } = materializar();
    const lembretes = calcularTodosLembretes(veiculos, manutencoes);
    assert.equal(lembretes[0].status, 'vencido');
  });

  it('nao gera lembrete para abastecimento', () => {
    const { veiculos, manutencoes } = materializar();
    const lembretes = calcularTodosLembretes(veiculos, manutencoes);
    assert.equal(
      lembretes.some((l) => l.tipo === 'abastecimento'),
      false,
    );
  });

  it('permite calcular consumo medio com os abastecimentos do carro', () => {
    const { manutencoes } = materializar();
    const abastecimentos = manutencoes.filter(
      (m) => m.tipo === 'abastecimento',
    );
    assert.ok(
      abastecimentos.length >= 2,
      'o cenario precisa de ao menos dois abastecimentos para o consumo medio aparecer',
    );
  });

  it('nenhum registro tem data no futuro', () => {
    const { manutencoes } = materializar();
    const hoje = new Date().toISOString().slice(0, 10);
    for (const m of manutencoes) {
      assert.ok(m.data <= hoje, `registro com data futura: ${m.data}`);
    }
  });

  it('nenhum registro passa da quilometragem atual do veiculo', () => {
    const { veiculos, manutencoes } = materializar();
    for (const m of manutencoes) {
      const veiculo = veiculos.find((v) => v.id === m.veiculoId);
      assert.ok(veiculo);
      assert.ok(
        m.km <= veiculo.kmAtual,
        `registro de ${m.km} km acima do odometro de ${veiculo.kmAtual} km`,
      );
    }
  });
});
