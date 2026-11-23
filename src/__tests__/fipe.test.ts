import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  extrairAnoDoModelo,
  normalizarCombustivel,
  parseValorFipe,
} from '../utils/fipe';

describe('parseValorFipe', () => {
  it('converte o formato devolvido pela API', () => {
    assert.equal(parseValorFipe('R$ 45.231,00'), 45231);
    assert.equal(parseValorFipe('R$ 9.876,50'), 9876.5);
  });

  it('lida com valores acima de um milhão', () => {
    assert.equal(parseValorFipe('R$ 1.250.000,00'), 1_250_000);
  });

  it('aceita valor sem separador de milhar', () => {
    assert.equal(parseValorFipe('R$ 980,00'), 980);
  });

  it('devolve zero para texto sem número', () => {
    assert.equal(parseValorFipe('indisponivel'), 0);
    assert.equal(parseValorFipe(''), 0);
  });
});

describe('normalizarCombustivel', () => {
  it('reconhece os rótulos da FIPE', () => {
    assert.equal(normalizarCombustivel('Gasolina'), 'gasolina');
    assert.equal(normalizarCombustivel('Diesel'), 'diesel');
    assert.equal(normalizarCombustivel('Flex'), 'flex');
  });

  it('trata acento e caixa', () => {
    assert.equal(normalizarCombustivel('Álcool'), 'etanol');
    assert.equal(normalizarCombustivel('ÁLCOOL'), 'etanol');
  });

  it('reconhece elétrico e híbrido', () => {
    assert.equal(normalizarCombustivel('Elétrico'), 'eletrico');
    assert.equal(normalizarCombustivel('Híbrido'), 'hibrido');
  });

  it('cai em gasolina quando não reconhece', () => {
    assert.equal(normalizarCombustivel('qualquer coisa'), 'gasolina');
  });
});

describe('extrairAnoDoModelo', () => {
  it('encontra o ano no nome do modelo', () => {
    assert.equal(extrairAnoDoModelo('Gol 1.0 Flex 2018'), 2018);
  });

  it('devolve undefined quando não há ano', () => {
    assert.equal(extrairAnoDoModelo('Gol 1.0 Flex'), undefined);
  });

  it('ignora número que não e ano plausível', () => {
    assert.equal(extrairAnoDoModelo('Modelo 1200'), undefined);
    assert.equal(extrairAnoDoModelo('Turbo 2099'), undefined);
  });
});
