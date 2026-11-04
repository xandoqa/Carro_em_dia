/**
 * Faixa de medida — o elemento assinatura do CarroEmDia.
 *
 * Mostra onde o veiculo esta entre o ultimo servico e o proximo previsto, no
 * formato de uma regua graduada: duas pontas rotuladas, marcas de escala e um
 * cursor na posicao atual.
 *
 * Por que uma regua e nao uma barra de progresso comum: o usuario nao quer
 * saber "72% concluido", ele quer saber "estou em 114.500 e o limite e
 * 115.000". A regua mostra as duas pontas e a posicao, que sao exatamente os
 * tres numeros que respondem a pergunta. As marcas de escala dao a nocao de
 * distancia que uma barra lisa nao da.
 *
 * Quando o limite passa, a faixa continua alem da ponta direita em vez de
 * parar em 100%: ver o cursor fora da escala comunica o atraso melhor do que
 * uma barra cheia.
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '../../theme/ThemeProvider';
import type { StatusLembrete } from '../../domain/models';

export interface MeasureStripProps {
  /** Posicao atual entre as pontas, de 0 a 1 (pode passar de 1). */
  progress: number;
  status: StatusLembrete;
  /** Rotulo da ponta esquerda, ex.: "105.000 km". */
  startLabel?: string;
  /** Rotulo da ponta direita, ex.: "115.000 km". */
  endLabel?: string;
  /** Quantas marcas de escala desenhar entre as pontas. */
  ticks?: number;
  /** Anima do zero ate o valor ao montar. */
  animate?: boolean;
  style?: ViewStyle;
}

const CURSOR_WIDTH = 5;
const CURSOR_BORDER = 1;

export function MeasureStrip({
  progress,
  status,
  startLabel,
  endLabel,
  ticks = 10,
  animate = true,
  style,
}: MeasureStripProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();

  // O trilho mostra de 0 a 1. Alem disso, o cursor encosta na ponta e a cor
  // de vencido assume o trilho inteiro.
  const alvo = Math.min(Math.max(progress, 0), 1);
  const estourou = progress > 1;

  const valor = useSharedValue(animate && !reduced ? 0 : alvo);

  useEffect(() => {
    if (animate && !reduced) {
      valor.value = withTiming(alvo, {
        duration: theme.motion.measure,
        // Desacelera no fim, como um ponteiro assentando.
        easing: Easing.out(Easing.cubic),
      });
    } else {
      valor.value = alvo;
    }
  }, [alvo, animate, reduced, theme.motion.measure, valor]);

  const cor =
    status === 'vencido'
      ? theme.colors.late
      : status === 'atencao'
        ? theme.colors.warn
        : theme.colors.ok;

  const preenchimento = useAnimatedStyle(() => ({
    width: `${valor.value * 100}%`,
  }));

  const cursor = useAnimatedStyle(() => ({
    left: `${valor.value * 100}%`,
  }));

  return (
    <View style={style}>
      <View
        style={[
          styles.trilho,
          {
            backgroundColor: theme.colors.surfaceSunken,
            borderColor: theme.colors.line,
            borderRadius: theme.radius.readout,
            height: theme.layout.measureStrip,
          },
        ]}
        // A faixa e informacao, nao controle: um unico rotulo descreve tudo.
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={descreverParaLeitor(
          progress,
          status,
          startLabel,
          endLabel,
        )}
      >
        {/* Marcas de escala, por tras do preenchimento. */}
        <View style={styles.escala} pointerEvents="none">
          {Array.from({ length: ticks - 1 }, (_, i) => (
            <View
              key={i}
              style={[
                styles.tick,
                {
                  left: `${((i + 1) / ticks) * 100}%`,
                  backgroundColor: theme.colors.lineStrong,
                  // Marca mais alta no meio da escala, para dar referencia.
                  height: (i + 1) === ticks / 2 ? '62%' : '36%',
                },
              ]}
            />
          ))}
        </View>

        <Animated.View
          style={[
            styles.preenchimento,
            preenchimento,
            {
              backgroundColor: cor,
              // Vencido preenche solido: o trilho inteiro vira sinal. Dentro do
              // prazo fica translucido para as marcas de escala continuarem
              // visiveis atraves do preenchimento.
              opacity: estourou ? 1 : 0.4,
              borderTopLeftRadius: theme.radius.readout - 1,
              borderBottomLeftRadius: theme.radius.readout - 1,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.cursor,
            cursor,
            {
              backgroundColor: estourou ? theme.colors.surface : cor,
              // Um contorno garante que o cursor se destaque tanto do trilho
              // vazio quanto do preenchimento, em qualquer tema.
              borderColor: estourou ? cor : theme.colors.surface,
            },
          ]}
        />
      </View>

      {(startLabel || endLabel) && (
        <View style={styles.pontas}>
          <Text
            style={[
              theme.typography.meterSM,
              { color: theme.colors.textMuted },
            ]}
            numberOfLines={1}
          >
            {startLabel ?? ''}
          </Text>
          <Text
            style={[
              theme.typography.meterSM,
              { color: estourou ? cor : theme.colors.textMuted },
            ]}
            numberOfLines={1}
          >
            {endLabel ?? ''}
          </Text>
        </View>
      )}
    </View>
  );
}

function descreverParaLeitor(
  progress: number,
  status: StatusLembrete,
  startLabel?: string,
  endLabel?: string,
): string {
  const estado =
    status === 'vencido'
      ? 'vencido'
      : status === 'atencao'
        ? 'proximo do vencimento'
        : 'em dia';

  const trecho =
    startLabel && endLabel ? ` De ${startLabel} ate ${endLabel}.` : '';

  return `${Math.round(Math.min(progress, 1) * 100)} por cento do intervalo, ${estado}.${trecho}`;
}

const styles = StyleSheet.create({
  trilho: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  escala: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  tick: {
    position: 'absolute',
    width: StyleSheet.hairlineWidth,
    alignSelf: 'center',
  },
  preenchimento: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  cursor: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: CURSOR_WIDTH,
    marginLeft: -CURSOR_WIDTH / 2,
    borderRadius: CURSOR_WIDTH,
    borderWidth: CURSOR_BORDER,
  },
  pontas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 6,
    gap: 8,
  },
});
