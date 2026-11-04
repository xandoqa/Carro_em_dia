/**
 * Silhueta de carro e moto, usada quando o veiculo nao tem foto.
 *
 * Desenhada no mesmo traco dos icones de servico para o conjunto parecer um
 * so, em vez de misturar com um pacote de icones generico.
 */

import React from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { TipoVeiculo } from '../../domain/models';

export function VehicleGlyph({
  tipo,
  size = 28,
  color,
}: {
  tipo: TipoVeiculo;
  size?: number;
  color: string;
}) {
  const comum = {
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  if (tipo === 'moto') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx="5.2" cy="16.4" r="3.4" {...comum} />
        <Circle cx="18.8" cy="16.4" r="3.4" {...comum} />
        <Path d="M5.2 16.4 9 10.6h4.6l2.2 2.9" {...comum} />
        <Path d="M18.8 16.4 16 10.6" {...comum} />
        <Path d="M9.4 8.2h2.4" {...comum} />
        <Path d="M13.6 10.6 15.4 7.4h2.2" {...comum} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 16.2v-3.4L5.8 8A2 2 0 0 1 7.7 6.7h8.6A2 2 0 0 1 18.2 8L20 12.8v3.4"
        {...comum}
      />
      <Line x1="3.4" y1="12.9" x2="20.6" y2="12.9" {...comum} />
      <Circle cx="7.4" cy="16.4" r="1.5" {...comum} />
      <Circle cx="16.6" cy="16.4" r="1.5" {...comum} />
    </Svg>
  );
}
