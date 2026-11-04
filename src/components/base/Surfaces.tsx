/**
 * Superficies: Card, Readout e Divider.
 *
 * O raio de cada uma vem do token correspondente ao seu papel, o que mantem a
 * regra do design system visivel no codigo: objeto, controle, leitura.
 */

import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { Txt } from './Text';

/* -------------------------------------------------------------------------- */
/* Card — um objeto do dominio                                                 */
/* -------------------------------------------------------------------------- */

export interface CardProps {
  children: React.ReactNode;
  /** Torna o card tocavel e adiciona o papel de botao. */
  onPress?: () => void;
  /** Contorno colorido, usado para destacar um alerta vencido. */
  accentColor?: string;
  /** Remove o espacamento interno, para listas que controlam o proprio padding. */
  flush?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Card({
  children,
  onPress,
  accentColor,
  flush = false,
  style,
  accessibilityLabel,
}: CardProps) {
  const theme = useTheme();

  const base: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.object,
    borderWidth: 1,
    borderColor: accentColor ?? theme.colors.line,
    padding: flush ? 0 : theme.spacing.lg,
    ...theme.elevation.object,
    shadowColor: theme.isDark ? '#000000' : '#15201C',
  };

  if (!onPress) {
    return <View style={[base, style]}>{children}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [base, pressed && { opacity: 0.85 }, style]}
    >
      {children}
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* Readout — um painel de leitura                                              */
/* -------------------------------------------------------------------------- */

export interface ReadoutProps {
  /** Rotulo em sentence case, nunca caixa alta. */
  label: string;
  /** Valor principal, em fonte monoespacada. */
  value: string;
  /** Linha de apoio abaixo do valor. */
  hint?: string;
  /** Tamanho do valor. */
  size?: 'lg' | 'xl';
  /** Cor do valor, para quando ele carrega estado. */
  valueColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function Readout({
  label,
  value,
  hint,
  size = 'lg',
  valueColor,
  style,
}: ReadoutProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surfaceSunken,
          borderColor: theme.colors.line,
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: theme.radius.readout,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.md,
        },
        style,
      ]}
      accessible
      accessibilityLabel={`${label}: ${value}${hint ? `. ${hint}` : ''}`}
    >
      <Txt variant="label" tone="muted">
        {label}
      </Txt>
      <Txt
        variant={size === 'xl' ? 'meterXL' : 'meterLG'}
        color={valueColor}
        style={{ marginTop: 2 }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Txt>
      {hint ? (
        <Txt variant="bodySM" tone="muted" style={{ marginTop: 2 }}>
          {hint}
        </Txt>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Divider                                                                     */
/* -------------------------------------------------------------------------- */

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          height: StyleSheet.hairlineWidth,
          backgroundColor: theme.colors.line,
        },
        style,
      ]}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* SectionHeader                                                               */
/* -------------------------------------------------------------------------- */

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.sectionHeader,
        { marginBottom: theme.spacing.sm, minHeight: 24 },
      ]}
    >
      <Txt variant="label" tone="muted">
        {title}
      </Txt>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
