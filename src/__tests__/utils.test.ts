import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  addMonths,
  daysBetween,
  formatDate,
  formatDateShort,
  monthKey,
  monthLabel,
  monthRange,
  parseIsoDate,
  toIsoDate,
} from '../utils/date';
import {
  formatAmount,
  formatCurrency,
  formatKm,
  formatKmUnit,
  formatLiters,
  formatPercent,
  formatPlaca,
  formatRestante,
  isPlacaValida,
  normalizePlaca,
  parseNumberInput,
} from '../utils/format';

describe('datas', () => {
  it('interpreta a data no fuso local, sem voltar um dia', () => {
    const d = parseIsoDate('2026-05-18');
    assert.equal(d.getFullYear(), 2026);
    assert.equal(d.getMonth(), 4);
    assert.equal(d.getDate(), 18);
  });

  it('faz o caminho de volta sem perder o dia', () => {
    assert.equal(toIsoDate(parseIsoDate('2026-01-01')), '2026-01-01');
    assert.equal(toIsoDate(parseIsoDate('2026-12-31')), '2026-12-31');
  });

  it('recusa formato invalido', () => {
    assert.throws(() => parseIsoDate('18/05/2026'));
  });

  it('soma meses preservando o fim do mes', () => {
    // 31 de janeiro mais um mes e o fim de fevereiro, nao 3 de marco.
    assert.equal(addMonths('2026-01-31', 1), '2026-02-28');
    assert.equal(addMonths('2024-01-31', 1), '2024-02-29');
    assert.equal(addMonths('2026-05-18', 12), '2027-05-18');
  });

  it('soma meses atravessando o ano', () => {
    assert.equal(addMonths('2026-11-10', 3), '2027-02-10');
  });

  it('conta dias entre duas datas', () => {
    assert.equal(daysBetween('2026-05-18', '2026-05-20'), 2);
    assert.equal(daysBetween('2026-05-20', '2026-05-18'), -2);
    assert.equal(daysBetween('2026-05-18', '2026-05-18'), 0);
  });

  it('conta dias atravessando o horario de verao', () => {
    assert.equal(daysBetween('2026-01-01', '2026-12-31'), 364);
  });

  it('monta a chave e o rotulo do mes', () => {
    assert.equal(monthKey('2026-05-18'), '2026-05');
    assert.equal(monthLabel('2026-05'), 'mai');
    assert.equal(monthLabel('2026-01'), 'jan');
  });

  it('lista os meses do intervalo inclusive', () => {
    assert.deepEqual(monthRange('2026-01-15', '2026-04-02'), [
      '2026-01',
      '2026-02',
      '2026-03',
      '2026-04',
    ]);
  });

  it('lista um unico mes quando as pontas coincidem', () => {
    assert.deepEqual(monthRange('2026-05-01', '2026-05-31'), ['2026-05']);
  });

  it('formata data para leitura', () => {
    assert.equal(formatDate('2026-05-18'), '18/05/2026');
    assert.equal(formatDateShort('2026-05-18'), '18 mai 2026');
  });
});

describe('numeros', () => {
  it('formata quilometragem com separador de milhar', () => {
    assert.equal(formatKm(114_500), '114.500');
    assert.equal(formatKmUnit(114_500), '114.500 km');
    assert.equal(formatKm(0), '0');
  });

  it('nao quebra com valor invalido', () => {
    assert.equal(formatKm(Number.NaN), '0');
    assert.equal(formatAmount(Number.NaN), '0,00');
  });

  it('formata moeda em reais', () => {
    // O separador usado pelo Intl e um espaco nao separavel.
    assert.match(formatCurrency(280.5), /^R\$\s280,50$/);
    assert.equal(formatAmount(280.5), '280,50');
    assert.equal(formatAmount(1234.5), '1.234,50');
  });

  it('formata porcentagem e litros', () => {
    assert.equal(formatPercent(0.4512), '45%');
    assert.equal(formatPercent(0), '0%');
    assert.equal(formatLiters(32.14), '32,1 L');
  });
});

describe('placa', () => {
  it('normaliza para caixa alta sem separadores', () => {
    assert.equal(normalizePlaca('bra-2e19'), 'BRA2E19');
    assert.equal(normalizePlaca('abc 1234'), 'ABC1234');
  });

  it('aceita o padrao antigo e o Mercosul', () => {
    assert.equal(isPlacaValida('ABC1234'), true);
    assert.equal(isPlacaValida('BRA2E19'), true);
    assert.equal(isPlacaValida('bra2e19'), true);
  });

  it('recusa placa malformada', () => {
    assert.equal(isPlacaValida('AB1234'), false);
    assert.equal(isPlacaValida('ABCD123'), false);
    assert.equal(isPlacaValida(''), false);
  });

  it('exibe com separacao visual', () => {
    assert.equal(formatPlaca('BRA2E19'), 'BRA 2E19');
  });
});

describe('parseNumberInput', () => {
  it('le o formato brasileiro', () => {
    assert.equal(parseNumberInput('1.234,56'), 1234.56);
    assert.equal(parseNumberInput('280,50'), 280.5);
  });

  it('le o formato com ponto decimal', () => {
    assert.equal(parseNumberInput('1234.56'), 1234.56);
    assert.equal(parseNumberInput('1,234.56'), 1234.56);
  });

  it('le inteiro simples', () => {
    assert.equal(parseNumberInput('114500'), 114500);
  });

  it('ignora simbolos de moeda e espacos', () => {
    assert.equal(parseNumberInput('R$ 280,50'), 280.5);
    assert.equal(parseNumberInput(' 85000 km '), 85000);
  });

  it('devolve null para entrada vazia ou sem numero', () => {
    assert.equal(parseNumberInput(''), null);
    assert.equal(parseNumberInput('   '), null);
    assert.equal(parseNumberInput('abc'), null);
  });
});

describe('formatRestante', () => {
  it('descreve atraso em km', () => {
    assert.equal(formatRestante(-300, undefined), 'Venceu ha 300 km');
  });

  it('descreve atraso em dias', () => {
    assert.equal(formatRestante(undefined, -1), 'Venceu ha 1 dia');
    assert.equal(formatRestante(undefined, -5), 'Venceu ha 5 dias');
  });

  it('prioriza o km quando as duas dimensoes existem', () => {
    assert.equal(formatRestante(1500, 20), 'Faltam 1.500 km ou 20 dias');
  });

  it('informa quando nao ha previsao', () => {
    assert.equal(formatRestante(undefined, undefined), 'Sem previsao');
  });
});
