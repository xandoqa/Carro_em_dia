/**
 * Distribuicao de gastos por categoria.
 *
 * O protótipo previa um grafico de pizza. Trocamos por barras horizontais
 * empilhadas numa lista por um motivo pratico: numa tela de celular, uma
 * pizza com cinco fatias exige legenda, e a legenda ocupa o mesmo espaco que
 * a lista — so que sem permitir ler o valor exato de cada categoria. A lista
 * mostra nome, valor e proporcao na mesma linha.
 *
 * As categorias usam intensidades da cor da marca, nao cores arbitrarias: a
 * escala de intensidade ja comunica a ordem de grandeza, e verde, ambar e
 * vermelho continuam reservados para estado de manutencao.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { GastoPorCategoria } from '../../domain/models';
import { ServiceIcon } from '../../icons/ServiceIcon';
import { useTheme } from '../../theme/ThemeProvider';
import { formatAmount, formatPercent } from '../../utils/format';
import { Txt } from '../base/Text';

export interface CategoryBreakdownProps {
  data: GastoPorCategoria[];
}

/** Intensidades aplicadas em ordem, da maior categoria para a menor. */
const INTENSIDADES = [1, 0.8, 0.62, 0.46, 0.34, 0.26, 0.2, 0.16];

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const theme = useTheme();

  if (data.length === 0) {
    return (
      <Txt variant="bodySM" tone="muted">
        Sem gastos para distribuir no periodo.
      </Txt>
    );
  }

  return (
    <View>
      {/* Barra unica empilhada: a proporcao do todo, de relance. */}
      <View
        style={[
          styles.empilhada,
          {
            borderRadius: theme.radius.readout,
            backgroundColor: theme.colors.surfaceSunken,
            borderColor: theme.colors.line,
          },
        ]}
      >
        {data.map((categoria, i) => (
          <View
            key={categoria.tipo}
            style={{
              flex: Math.max(categoria.fracao, 0.001),
              backgroundColor: theme.colors.brand,
              opacity: INTENSIDADES[i] ?? 0.14,
            }}
          />
        ))}
      </View>

      <View style={{ marginTop: theme.spacing.md }}>
        {data.map((categoria, i) => (
          <View
            key={categoria.tipo}
            style={[
              styles.linha,
              {
                paddingVertical: theme.spacing.sm,
                borderBottomWidth:
                  i === data.length - 1 ? 0 : StyleSheet.hairlineWidth,
                borderBottomColor: theme.colors.line,
              },
            ]}
            accessible
            accessibilityLabel={`${categoria.nome}: ${formatAmount(categoria.total)} reais, ${formatPercent(categoria.fracao)} do total, ${categoria.quantidade} ${categoria.quantidade === 1 ? 'registro' : 'registros'}`}
          >
            <View
              style={[
                styles.amostra,
                {
                  backgroundColor: theme.colors.brand,
                  opacity: INTENSIDADES[i] ?? 0.14,
                  borderRadius: 3,
                },
              ]}
            />
            <ServiceIcon
              tipo={categoria.tipo}
              size={18}
              color={theme.colors.textMuted}
            />
            <Txt variant="body" style={styles.nome} numberOfLines={1}>
              {categoria.nome}
            </Txt>
            <Txt variant="meterSM" tone="muted" style={styles.percentual}>
              {formatPercent(categoria.fracao)}
            </Txt>
            <Txt variant="meterMD" style={styles.valor}>
              {formatAmount(categoria.total)}
            </Txt>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empilhada: {
    flexDirection: 'row',
    height: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  amostra: {
    width: 4,
    height: 22,
  },
  nome: {
    flex: 1,
    minWidth: 0,
  },
  percentual: {
    width: 44,
    textAlign: 'right',
  },
  valor: {
    width: 86,
    textAlign: 'right',
  },
});
