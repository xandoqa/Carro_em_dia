/**
 * Regras do odometro.
 *
 * Pequeno, mas vale estar no dominio e com teste proprio: foi aqui que
 * apareceu um problema real. Como `atualizarKm` so aceita valores maiores e
 * registrar manutencao com km maior sobe o odometro sozinho, quem digitasse
 * 1.145.000 em vez de 114.500 ficava preso — o valor inflado nao podia ser
 * desfeito por nenhum caminho do app.
 */

import type { Manutencao } from './models';

/**
 * Menor odometro coerente com o historico: o maior km ja registrado.
 * Nao da para ter rodado menos que o ultimo servico feito.
 */
export function kmMinimoPermitido(
  manutencoes: Manutencao[],
  veiculoId: string,
): number {
  const doVeiculo = manutencoes.filter((m) => m.veiculoId === veiculoId);
  if (doVeiculo.length === 0) return 0;
  return Math.max(...doVeiculo.map((m) => m.km));
}

export type ResultadoValidacao =
  | { tipo: 'ok' }
  /** Valor maior que o atual: avanco normal do odometro. */
  | { tipo: 'avanco' }
  /** Valor menor, mas coerente com o historico: exige confirmacao. */
  | { tipo: 'correcao' }
  | { tipo: 'invalido'; motivo: string };

/**
 * Classifica uma nova leitura de odometro.
 *
 * Separar "correcao" de "invalido" e o que permite a interface oferecer uma
 * saida em vez de um erro sem caminho.
 */
export function validarNovoKm(params: {
  novo: number;
  atual: number;
  minimo: number;
}): ResultadoValidacao {
  const { novo, atual, minimo } = params;

  if (!Number.isFinite(novo)) {
    return { tipo: 'invalido', motivo: 'Informe a quilometragem em numeros.' };
  }
  if (novo < 0) {
    return { tipo: 'invalido', motivo: 'A quilometragem nao pode ser negativa.' };
  }
  if (novo === atual) {
    return { tipo: 'ok' };
  }
  if (novo > atual) {
    return { tipo: 'avanco' };
  }
  if (novo < minimo) {
    return {
      tipo: 'invalido',
      motivo: `Ha uma manutencao registrada em ${minimo.toLocaleString('pt-BR')} km. Corrija ou exclua esse registro antes de baixar o odometro.`,
    };
  }
  return { tipo: 'correcao' };
}
