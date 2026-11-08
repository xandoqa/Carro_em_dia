/**
 * Esqueleto do cartão de veículo.
 *
 * Tem exatamente a mesma estrutura e as mesmas alturas do cartão real, para
 * a tela não "saltar" quando os dados chegam. É a diferença entre um
 * carregamento que parece rápido e um que parece quebrado.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { Skeleton } from '../base/Feedback';
import { Card } from '../base/Surfaces';

export function VehicleCardSkeleton() {
  const theme = useTheme();

  return (
    <Card>
      <View style={styles.topo}>
        <Skeleton width={54} height={54} radius={theme.radius.control} />
        <View style={styles.identificacao}>
          <Skeleton width="62%" height={19} />
          <Skeleton width="80%" height={13} style={{ marginTop: 6 }} />
          <Skeleton width={74} height={13} style={{ marginTop: 6 }} />
        </View>
        <Skeleton width={78} height={24} radius={theme.radius.pill} />
      </View>

      <View
        style={[
          styles.odometro,
          {
            borderTopColor: theme.colors.line,
            marginTop: theme.spacing.md,
            paddingTop: theme.spacing.md,
          },
        ]}
      >
        <Skeleton width={72} height={12} />
        <Skeleton width={110} height={23} />
      </View>

      <View style={{ marginTop: theme.spacing.md }}>
        <Skeleton width="55%" height={15} />
        <Skeleton
          height={theme.layout.measureStrip}
          style={{ marginTop: theme.spacing.sm }}
        />
        <View style={styles.pontas}>
          <Skeleton width={84} height={13} />
          <Skeleton width={84} height={13} />
        </View>
      </View>
    </Card>
  );
}

/** Quantos esqueletos mostrar enquanto a garagem carrega. */
export function GarageSkeleton({ quantidade = 2 }: { quantidade?: number }) {
  const theme = useTheme();
  return (
    <View
      style={{ gap: theme.spacing.md }}
      accessible
      accessibilityLabel="Carregando sua garagem"
    >
      {Array.from({ length: quantidade }, (_, i) => (
        <VehicleCardSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  topo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  identificacao: {
    flex: 1,
    minWidth: 0,
  },
  odometro: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pontas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
});
