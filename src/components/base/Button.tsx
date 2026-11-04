/**
 * Botao do app.
 *
 * Tres variantes, cada uma com um papel claro:
 *
 *   primary   — a acao principal da tela. No maximo uma por tela.
 *   secondary — acao de apoio, contornada.
 *   ghost     — acao terciaria ou destrutiva, sem peso visual.
 *
 * O retorno tatil acontece no toque, nao na soltura, porque e assim que o
 * sistema operacional responde e e o que o usuario espera.
 */

import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { Txt } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** Mostra indicador e bloqueia novos toques. */
  loading?: boolean;
  disabled?: boolean;
  /** Pinta como acao destrutiva. So faz sentido em secondary e ghost. */
  destructive?: boolean;
  /** Desenho a esquerda do texto. */
  icon?: React.ReactNode;
  /** Ocupa toda a largura disponivel. */
  block?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  destructive = false,
  icon,
  block = true,
  style,
  accessibilityHint,
}: ButtonProps) {
  const theme = useTheme();
  const inativo = disabled || loading;

  const handlePress = useCallback(() => {
    if (inativo) return;
    // O retorno tatil so existe nos dispositivos; na web a chamada e ignorada.
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [inativo, onPress]);

  const corDestaque = destructive ? theme.colors.late : theme.colors.brand;

  const fundo: Record<ButtonVariant, string> = {
    primary: corDestaque,
    secondary: 'transparent',
    ghost: 'transparent',
  };

  const corTexto: Record<ButtonVariant, string> = {
    primary: theme.colors.textOnBrand,
    secondary: corDestaque,
    ghost: destructive ? theme.colors.late : theme.colors.textMuted,
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inativo, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor:
            pressed && variant === 'primary'
              ? destructive
                ? theme.colors.late
                : theme.colors.brandPressed
              : fundo[variant],
          borderRadius: theme.radius.control,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: corDestaque,
          minHeight: theme.layout.touchTarget,
          paddingHorizontal: theme.spacing.xl,
          // Opacidade comunica o estado inativo sem mudar a cor de cada variante.
          opacity: inativo ? 0.45 : pressed && variant !== 'primary' ? 0.6 : 1,
          alignSelf: block ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={corTexto[variant]} size="small" />
      ) : (
        <View style={styles.conteudo}>
          {icon ? <View style={styles.icone}>{icon}</View> : null}
          <Txt variant="action" color={corTexto[variant]} numberOfLines={1}>
            {label}
          </Txt>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
  },
  conteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icone: {
    marginRight: 2,
  },
});
