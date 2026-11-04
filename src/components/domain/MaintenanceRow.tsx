/**
 * Linha do historico de manutencoes.
 *
 * Nao e um card: o historico e um livro de registros, e linhas separadas por
 * filete leem melhor em sequencia do que uma pilha de caixas. Os valores ficam
 * em coluna a direita, em fonte monoespacada, para poderem ser comparados de
 * relance.
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  tiposManutencao,
  type Manutencao,
} from '../../domain/models';
import { ServiceIcon } from '../../icons/ServiceIcon';
import { useTheme } from '../../theme/ThemeProvider';
import { formatDateShort } from '../../utils/date';
import { formatAmount, formatKm, formatLiters } from '../../utils/format';
import { Txt } from '../base/Text';

export interface MaintenanceRowProps {
  manutencao: Manutencao;
  onPress?: () => void;
  /** Mostra o nome do veiculo, para listas que juntam varios. */
  veiculoNome?: string;
  /** Oculta o filete inferior no ultimo item da lista. */
  last?: boolean;
}

export function MaintenanceRow({
  manutencao,
  onPress,
  veiculoNome,
  last = false,
}: MaintenanceRowProps) {
  const theme = useTheme();

  const nome =
    manutencao.tipo === 'outro' && manutencao.descricao
      ? manutencao.descricao
      : (tiposManutencao[manutencao.tipo]?.nome ?? 'Servico');

  // A segunda linha reune os dados que mudam de registro para registro.
  const detalhes = [
    formatDateShort(manutencao.data),
    `${formatKm(manutencao.km)} km`,
    manutencao.litros ? formatLiters(manutencao.litros) : null,
    veiculoNome,
  ]
    .filter(Boolean)
    .join('  ·  ');

  const conteudo = (
    <View
      style={[
        styles.linha,
        {
          paddingVertical: theme.spacing.md,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.line,
          minHeight: theme.layout.touchTarget,
        },
      ]}
    >
      <ServiceIcon
        tipo={manutencao.tipo}
        size={22}
        color={theme.colors.brand}
      />

      <View style={styles.meio}>
        <Txt variant="titleSM" numberOfLines={1}>
          {nome}
        </Txt>
        <Txt variant="meterSM" tone="muted" numberOfLines={1} style={{ marginTop: 2 }}>
          {detalhes}
        </Txt>
        {manutencao.oficina ? (
          <Txt variant="bodySM" tone="muted" numberOfLines={1}>
            {manutencao.oficina}
          </Txt>
        ) : null}
      </View>

      <Txt variant="meterMD" style={styles.valor}>
        {formatAmount(manutencao.valor)}
      </Txt>
    </View>
  );

  if (!onPress) return conteudo;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${nome}, ${detalhes}, ${formatAmount(manutencao.valor)} reais`}
      style={({ pressed }) => (pressed ? { opacity: 0.6 } : undefined)}
    >
      {conteudo}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  meio: {
    flex: 1,
    minWidth: 0,
  },
  valor: {
    textAlign: 'right',
  },
});
