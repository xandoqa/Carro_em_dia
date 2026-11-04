/**
 * Pilula de estado.
 *
 * O unico lugar do app em que verde, ambar e vermelho aparecem como cor de
 * fundo. Manter isso concentrado aqui e o que faz a cor significar estado em
 * vez de enfeite.
 */

import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { StatusLembrete } from '../../domain/models';
import { useTheme } from '../../theme/ThemeProvider';
import { Txt } from './Text';

export interface StatusChipProps {
  status: StatusLembrete;
  /** Sobrepoe o texto padrao do estado, ex.: "Venceu ha 300 km". */
  label?: string;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

const PADRAO: Record<StatusLembrete, string> = {
  'em-dia': 'Em dia',
  atencao: 'Chegando',
  vencido: 'Vencido',
};

export function StatusChip({
  status,
  label,
  size = 'md',
  style,
}: StatusChipProps) {
  const theme = useTheme();

  const cores: Record<StatusLembrete, { fg: string; bg: string }> = {
    'em-dia': { fg: theme.colors.ok, bg: theme.colors.okSoft },
    atencao: { fg: theme.colors.warn, bg: theme.colors.warnSoft },
    vencido: { fg: theme.colors.late, bg: theme.colors.lateSoft },
  };

  const { fg, bg } = cores[status];
  const texto = label ?? PADRAO[status];

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: bg,
          borderRadius: theme.radius.pill,
          paddingVertical: size === 'sm' ? 3 : 5,
          paddingHorizontal: size === 'sm' ? 8 : 10,
        },
        style,
      ]}
      accessible
      accessibilityLabel={texto}
    >
      {/* O ponto garante que o estado nao dependa so da cor para ser lido. */}
      <View style={[styles.ponto, { backgroundColor: fg }]} />
      <Txt variant="label" color={fg} numberOfLines={1}>
        {texto}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  ponto: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
