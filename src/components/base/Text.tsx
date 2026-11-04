/**
 * Texto tematizado.
 *
 * Centralizar aqui evita que cada tela repita `color` e `fontFamily` e garante
 * que trocar a escala tipografica valha para o app inteiro.
 */

import React from 'react';
import {
  Text as RNText,
  type StyleProp,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { TypographyToken } from '../../theme/tokens';

export interface TxtProps extends RNTextProps {
  /** Papel do texto na escala tipografica. */
  variant?: TypographyToken;
  /** Atalho para as cores do tema. `muted` e o padrao de texto secundario. */
  tone?: 'default' | 'muted' | 'brand' | 'ok' | 'warn' | 'late' | 'onBrand';
  /** Sobrepoe a cor do tom. */
  color?: string;
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
}

export function Txt({
  variant = 'body',
  tone = 'default',
  color,
  align,
  style,
  children,
  ...rest
}: TxtProps) {
  const theme = useTheme();

  const cores: Record<NonNullable<TxtProps['tone']>, string> = {
    default: theme.colors.text,
    muted: theme.colors.textMuted,
    brand: theme.colors.brand,
    ok: theme.colors.ok,
    warn: theme.colors.warn,
    late: theme.colors.late,
    onBrand: theme.colors.textOnBrand,
  };

  return (
    <RNText
      style={[
        theme.typography[variant],
        { color: color ?? cores[tone] },
        align ? { textAlign: align } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
