/**
 * Conjunto de icones proprio para os tipos de servico.
 *
 * Por que desenhar em vez de usar um pacote: as bibliotecas genericas nao tem
 * marcas para "troca de oleo" ou "pastilha de freio", e o que elas oferecem no
 * lugar (uma chave inglesa para tudo) nao distingue um servico do outro. Como
 * o tipo de servico e a informacao que o usuario procura primeiro em cada
 * linha da lista, vale ter uma marca reconhecivel para cada um.
 *
 * Todos seguem a mesma grade de 24, traco de 1.8 e pontas arredondadas, para
 * que pareçam do mesmo conjunto.
 */

import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import type { TipoManutencaoId } from '../domain/models';

export interface ServiceIconProps {
  tipo: TipoManutencaoId;
  size?: number;
  color: string;
  /** Espessura do traco. O padrao acompanha o tamanho. */
  strokeWidth?: number;
}

export function ServiceIcon({
  tipo,
  size = 24,
  color,
  strokeWidth,
}: ServiceIconProps) {
  // Mantem o traco visualmente constante quando o icone muda de tamanho.
  const sw = strokeWidth ?? (size <= 20 ? 1.6 : 1.8);

  const comum = {
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {renderPaths(tipo, comum)}
    </Svg>
  );
}

type Comum = {
  stroke: string;
  strokeWidth: number;
  strokeLinecap: 'round';
  strokeLinejoin: 'round';
  fill: 'none';
};

function renderPaths(tipo: TipoManutencaoId, c: Comum) {
  switch (tipo) {
    // Gota caindo de um bico: oleo.
    case 'oleo':
      return (
        <>
          <Path d="M12 9.5c2 2.2 3 3.8 3 5.2a3 3 0 0 1-6 0c0-1.4 1-3 3-5.2Z" {...c} />
          <Path d="M5 5h7l2 2.5" {...c} />
          <Line x1="5" y1="5" x2="5" y2="8" {...c} />
        </>
      );

    // Pneu: aro, banda e sulcos.
    case 'pneus':
      return (
        <>
          <Circle cx="12" cy="12" r="8.2" {...c} />
          <Circle cx="12" cy="12" r="3.4" {...c} />
          <Line x1="12" y1="3.8" x2="12" y2="8.6" {...c} />
          <Line x1="12" y1="15.4" x2="12" y2="20.2" {...c} />
          <Line x1="3.8" y1="12" x2="8.6" y2="12" {...c} />
          <Line x1="15.4" y1="12" x2="20.2" y2="12" {...c} />
        </>
      );

    // Disco de freio com a pinca encaixada.
    case 'freios':
      return (
        <>
          <Circle cx="11" cy="12" r="7.6" {...c} />
          <Circle cx="11" cy="12" r="2.6" {...c} />
          <Path d="M17.4 8.2h2.2a1.4 1.4 0 0 1 1.4 1.4v4.8a1.4 1.4 0 0 1-1.4 1.4h-2.2" {...c} />
        </>
      );

    // Bateria: caixa, polos e indicacao de carga.
    case 'bateria':
      return (
        <>
          <Rect x="3" y="8" width="18" height="11" rx="1.6" {...c} />
          <Line x1="7.5" y1="8" x2="7.5" y2="5.5" {...c} />
          <Line x1="16.5" y1="8" x2="16.5" y2="5.5" {...c} />
          <Line x1="7.8" y1="13.5" x2="11" y2="13.5" {...c} />
          <Line x1="14.8" y1="13.5" x2="18" y2="13.5" {...c} />
          <Line x1="16.4" y1="11.9" x2="16.4" y2="15.1" {...c} />
        </>
      );

    // Chave de boca sobre engrenagem parcial: revisao geral.
    case 'revisao':
      return (
        <>
          <Path d="M15.6 4.4a4.2 4.2 0 0 0-5.3 5.3L4.6 15.4a1.9 1.9 0 0 0 2.7 2.7l5.7-5.7a4.2 4.2 0 0 0 5.3-5.3l-2.4 2.4-2.3-.6-.6-2.3 2.6-2.2Z" {...c} />
          <Circle cx="6.2" cy="16.8" r="0.9" fill={c.stroke} stroke="none" />
        </>
      );

    // Filtro: elemento plissado dentro da carcaça.
    case 'filtros':
      return (
        <>
          <Rect x="4" y="5" width="16" height="14" rx="2" {...c} />
          <Line x1="8" y1="8" x2="8" y2="16" {...c} />
          <Line x1="12" y1="8" x2="12" y2="16" {...c} />
          <Line x1="16" y1="8" x2="16" y2="16" {...c} />
        </>
      );

    // Bomba de combustivel.
    case 'abastecimento':
      return (
        <>
          <Path d="M5 20V6a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v14" {...c} />
          <Line x1="3.6" y1="20" x2="15.4" y2="20" {...c} />
          <Line x1="7" y1="8.4" x2="12" y2="8.4" {...c} />
          <Path d="M14 9h3a2 2 0 0 1 2 2v4.4a1.6 1.6 0 0 1-3.2 0V13" {...c} />
        </>
      );

    // Prancheta: registro avulso.
    case 'outro':
    default:
      return (
        <>
          <Rect x="5" y="4.5" width="14" height="16" rx="2" {...c} />
          <Path d="M9.2 4.5V3.4a1 1 0 0 1 1-1h3.6a1 1 0 0 1 1 1v1.1" {...c} />
          <Line x1="8.8" y1="10.5" x2="15.2" y2="10.5" {...c} />
          <Line x1="8.8" y1="14.5" x2="13" y2="14.5" {...c} />
        </>
      );
  }
}

/* -------------------------------------------------------------------------- */
/* Marca do app                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Simbolo do CarroEmDia: um ponteiro de instrumento dentro de um arco
 * graduado. E a mesma ideia que organiza o app — uma medida entre dois
 * limites — reduzida ao menor desenho possivel.
 */
export function BrandMark({
  size = 28,
  color,
  accent,
}: {
  size?: number;
  color: string;
  accent?: string;
}) {
  const sw = size <= 24 ? 1.8 : 2;
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {/* Arco graduado, aberto embaixo como num mostrador. */}
      <Path
        d="M5 23a13 13 0 1 1 22 0"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      {/* Marcas de escala. */}
      <Line x1="6.6" y1="15.4" x2="9.2" y2="16.2" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="16" y1="5.4" x2="16" y2="8.1" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="25.4" y1="15.4" x2="22.8" y2="16.2" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      {/* Ponteiro apontando para a faixa segura. */}
      <Line
        x1="16"
        y1="23"
        x2="21.4"
        y2="13.6"
        stroke={accent ?? color}
        strokeWidth={sw + 0.4}
        strokeLinecap="round"
      />
      <Circle cx="16" cy="23" r="2.2" fill={accent ?? color} />
    </Svg>
  );
}
