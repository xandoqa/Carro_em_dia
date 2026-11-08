/**
 * Botão flutuante de ação.
 *
 * O protótipo previa um botão redondo com "+" no canto inferior da garagem;
 * a primeira versão trocou isso por um botão comum no fim da lista, que some
 * de vista assim que há três ou quatro veículos. O flutuante fica sempre
 * alcançável com o polegar, que é o ponto de um app de celular.
 *
 * Encolhe para só o ícone quando a lista rola, para não cobrir conteúdo —
 * um rótulo permanente num canto é peso visual constante por uma ação que o
 * usuário faz poucas vezes.
 */

import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeProvider';
import { Txt } from './Text';

export interface FabProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  /** `true` encolhe para só o ícone. Normalmente ligado ao scroll. */
  compact?: boolean;
  /** Distância extra do fundo, para subir acima de uma barra de abas. */
  bottomOffset?: number;
}

export function Fab({
  label,
  icon,
  onPress,
  compact = false,
  bottomOffset = 0,
}: FabProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();

  const animado = useAnimatedStyle(() => ({
    maxWidth: withTiming(compact ? 56 : 260, {
      duration: reduced ? 0 : theme.motion.quick,
    }),
  }));

  function handlePress() {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  }

  return (
    <Animated.View
      style={[
        styles.area,
        animado,
        {
          bottom: insets.bottom + theme.spacing.lg + bottomOffset,
          right: theme.layout.gutter,
          borderRadius: theme.radius.pill,
        },
        theme.elevation.floating,
      ]}
    >
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [
          styles.botao,
          {
            backgroundColor: pressed
              ? theme.colors.brandPressed
              : theme.colors.brand,
            borderRadius: theme.radius.pill,
            paddingRight: compact ? 16 : theme.spacing.xl,
          },
        ]}
      >
        {icon}
        {!compact ? (
          <Txt
            variant="action"
            color={theme.colors.textOnBrand}
            numberOfLines={1}
          >
            {label}
          </Txt>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  area: {
    position: 'absolute',
    overflow: 'hidden',
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 56,
    paddingLeft: 16,
  },
});
