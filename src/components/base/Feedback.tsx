/**
 * Confirmações rápidas (toast).
 *
 * Existe porque salvar um registro simplesmente voltava para a tela anterior,
 * sem dizer nada. O usuário ficava sem saber se deu certo — e numa tela cheia
 * de campos, "voltou" e "falhou e voltou" são indistinguíveis.
 *
 * Aparece sobre tudo, some sozinho e não bloqueia a interface. Para decisões
 * que exigem resposta (excluir, por exemplo) continua valendo o `Alert`
 * nativo, que prende a atenção de propósito.
 */

import * as Haptics from 'expo-haptics';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeProvider';
import { Txt } from './Text';

export type TomFeedback = 'sucesso' | 'erro' | 'neutro';

interface Mensagem {
  texto: string;
  tom: TomFeedback;
  /** Muda a cada chamada para reiniciar a animação em mensagens repetidas. */
  chave: number;
}

interface FeedbackContextValue {
  mostrar: (texto: string, tom?: TomFeedback) => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

/** Quanto tempo a mensagem fica na tela. */
const DURACAO = 2600;

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrar = useCallback((texto: string, tom: TomFeedback = 'sucesso') => {
    if (timer.current) clearTimeout(timer.current);

    setMensagem({ texto, tom, chave: Date.now() });

    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(
        tom === 'erro'
          ? Haptics.NotificationFeedbackType.Error
          : Haptics.NotificationFeedbackType.Success,
      );
    }

    timer.current = setTimeout(() => setMensagem(null), DURACAO);
  }, []);

  // Um toast agendado não pode disparar depois que a árvore desmontou.
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const value = useMemo(() => ({ mostrar }), [mostrar]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {mensagem ? <Toast key={mensagem.chave} mensagem={mensagem} /> : null}
    </FeedbackContext.Provider>
  );
}

function Toast({ mensagem }: { mensagem: Mensagem }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();

  const progresso = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      progresso.value = 1;
      return;
    }
    progresso.value = withTiming(1, {
      duration: theme.motion.quick,
      easing: Easing.out(Easing.cubic),
    });
  }, [progresso, reduced, theme.motion.quick]);

  const animado = useAnimatedStyle(() => ({
    opacity: progresso.value,
    transform: [{ translateY: (1 - progresso.value) * -14 }],
  }));

  const cores: Record<TomFeedback, { fundo: string; texto: string }> = {
    sucesso: { fundo: theme.colors.ok, texto: '#FFFFFF' },
    erro: { fundo: theme.colors.late, texto: '#FFFFFF' },
    neutro: { fundo: theme.colors.surfaceRaised, texto: theme.colors.text },
  };

  const { fundo, texto } = cores[mensagem.tom];

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        animado,
        {
          top: insets.top + theme.spacing.sm,
          backgroundColor: fundo,
          borderRadius: theme.radius.control,
          borderColor:
            mensagem.tom === 'neutro' ? theme.colors.line : 'transparent',
        },
        theme.elevation.floating,
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Txt variant="titleSM" color={texto} numberOfLines={2}>
        {mensagem.texto}
      </Txt>
    </Animated.View>
  );
}

/** Dispara confirmações. Lança fora do provedor para falhar cedo. */
export function useFeedback(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error('useFeedback precisa estar dentro de <FeedbackProvider>.');
  }
  return ctx;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    zIndex: 999,
  },
});

/** Camada vazia para telas que precisam medir o espaço do toast. */
export const ALTURA_TOAST = 52;

/* -------------------------------------------------------------------------- */
/* Esqueleto de carregamento                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Bloco cinza pulsante no lugar do conteúdo que ainda está vindo.
 *
 * Substitui o indicador girando: o esqueleto mostra a forma do que vai
 * aparecer, então a tela não "salta" quando os dados chegam, e a espera
 * parece menor mesmo durando o mesmo tempo.
 */
export function Skeleton({
  width,
  height = 16,
  radius,
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: object;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const brilho = useSharedValue(0.5);

  useEffect(() => {
    if (reduced) return;
    // Pulso lento e contínuo: rápido demais vira distração.
    // `-1` repete para sempre e `true` faz a volta (ida e volta).
    brilho.value = withRepeat(
      withTiming(1, { duration: 820, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [brilho, reduced]);

  const animado = useAnimatedStyle(() => ({ opacity: brilho.value }));

  return (
    <Animated.View
      style={[
        {
          width: width ?? '100%',
          height,
          backgroundColor: theme.colors.surfaceSunken,
          borderRadius: radius ?? theme.radius.readout,
        },
        reduced ? { opacity: 0.6 } : animado,
        style,
      ]}
    />
  );
}
