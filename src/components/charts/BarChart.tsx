/**
 * Grafico de barras da evolucao mensal.
 *
 * Desenhado com View em vez de biblioteca de graficos: sao poucas barras, e
 * uma dependencia de grafico custaria centenas de kB no bundle para fazer o
 * que cabe em quarenta linhas.
 *
 * Escolhas que vieram do dado, nao da estetica:
 * - meses sem gasto aparecem como um traco na linha de base, nao somem, para
 *   a distancia entre as barras continuar significando tempo;
 * - o maior valor do periodo fica rotulado, porque e o numero que o usuario
 *   procura;
 * - a altura e proporcional ao maior valor do periodo, nunca a um teto fixo.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useReducedMotion,
  FadeIn,
} from 'react-native-reanimated';

import type { GastoPorMes } from '../../domain/models';
import { useTheme } from '../../theme/ThemeProvider';
import { formatAmount } from '../../utils/format';
import { Txt } from '../base/Text';

export interface BarChartProps {
  data: GastoPorMes[];
  /** Altura da area das barras. */
  height?: number;
}

export function BarChart({ data, height = 120 }: BarChartProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();

  if (data.length === 0) {
    return (
      <Txt variant="bodySM" tone="muted">
        Sem gastos registrados no periodo.
      </Txt>
    );
  }

  const maior = Math.max(...data.map((d) => d.total));
  const indiceMaior = data.findIndex((d) => d.total === maior);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={descrever(data)}
    >
      <View style={[styles.area, { height }]}>
        {data.map((ponto, i) => {
          // Mes sem gasto vira um traco fino na base em vez de nada.
          const fracao = maior > 0 ? ponto.total / maior : 0;
          const alturaBarra = Math.max(fracao * height, ponto.total > 0 ? 4 : 2);
          const destaque = i === indiceMaior && maior > 0;

          return (
            <View key={ponto.mes} style={styles.coluna}>
              {destaque ? (
                <Txt
                  variant="meterSM"
                  tone="muted"
                  style={styles.rotuloTopo}
                  numberOfLines={1}
                >
                  {formatAmount(ponto.total)}
                </Txt>
              ) : null}

              <Animated.View
                entering={reduced ? undefined : FadeIn.delay(i * 40).duration(260)}
                style={[
                  styles.barra,
                  {
                    height: alturaBarra,
                    backgroundColor:
                      ponto.total > 0 ? theme.colors.brand : theme.colors.line,
                    opacity: ponto.total === 0 ? 1 : destaque ? 1 : 0.65,
                    borderTopLeftRadius: theme.radius.readout,
                    borderTopRightRadius: theme.radius.readout,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      <View
        style={[
          styles.eixo,
          { borderTopColor: theme.colors.line, marginTop: 6, paddingTop: 6 },
        ]}
      >
        {data.map((ponto) => (
          <Txt
            key={ponto.mes}
            variant="meterSM"
            tone="muted"
            style={styles.rotuloEixo}
            numberOfLines={1}
          >
            {ponto.rotulo}
          </Txt>
        ))}
      </View>
    </View>
  );
}

function descrever(data: GastoPorMes[]): string {
  const partes = data
    .filter((d) => d.total > 0)
    .map((d) => `${d.rotulo}: ${formatAmount(d.total)} reais`);

  if (partes.length === 0) return 'Grafico sem gastos no periodo.';
  return `Evolucao mensal. ${partes.join('. ')}.`;
}

const styles = StyleSheet.create({
  area: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 7,
  },
  coluna: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  barra: {
    width: '100%',
  },
  rotuloTopo: {
    textAlign: 'center',
    marginBottom: 4,
    fontSize: 11,
  },
  eixo: {
    flexDirection: 'row',
    gap: 7,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rotuloEixo: {
    flex: 1,
    textAlign: 'center',
  },
});
