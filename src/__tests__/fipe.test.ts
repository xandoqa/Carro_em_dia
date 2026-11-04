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

  it('lida com valores acima de um milhao', () => {
    assert.equal(parseValorFipe('R$ 1.250.000,00'), 1_250_000);
  });

  it('aceita valor sem separador de milhar', () => {
    assert.equal(parseValorFipe('R$ 980,00'), 980);
  });

  it('devolve zero para texto sem numero', () => {
    assert.equal(parseValorFipe('indisponivel'), 0);
    assert.equal(parseValorFipe(''), 0);
  });
});

describe('normalizarCombustivel', () => {
  it('reconhece os rotulos da FIPE', () => {
    assert.equal(normalizarCombustivel('Gasolina'), 'gasolina');
    assert.equal(normalizarCombustivel('Diesel'), 'diesel');
    assert.equal(normalizarCombustivel('Flex'), 'flex');
  });

  it('trata acento e caixa', () => {
    assert.equal(normalizarCombustivel('Álcool'), 'etanol');
    assert.equal(normalizarCombustivel('ALCOOL'), 'etanol');
  });

  it('reconhece eletrico e hibrido', () => {
    assert.equal(normalizarCombustivel('Elétrico'), 'eletrico');
    assert.equal(normalizarCombustivel('Híbrido'), 'hibrido');
  });

  it('cai em gasolina quando nao reconhece', () => {
    assert.equal(normalizarCombustivel('qualquer coisa'), 'gasolina');
  });
});

describe('extrairAnoDoModelo', () => {
  it('encontra o ano no nome do modelo', () => {
    assert.equal(extrairAnoDoModelo('Gol 1.0 Flex 2018'), 2018);
  });

  it('devolve undefined quando nao ha ano', () => {
    assert.equal(extrairAnoDoModelo('Gol 1.0 Flex'), undefined);
  });

  it('ignora numero que nao e ano plausivel', () => {
    assert.equal(extrairAnoDoModelo('Modelo 1200'), undefined);
    assert.equal(extrairAnoDoModelo('Turbo 2099'), undefined);
  });
});
