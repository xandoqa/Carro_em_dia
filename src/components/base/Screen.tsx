/**
 * Moldura das telas: fundo do tema, area segura e cabecalho.
 *
 * Tambem concentra o estado vazio e o indicador de carregamento, para que
 * todas as telas comuniquem "nao ha nada aqui ainda" e "estou carregando" da
 * mesma forma.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeProvider';
import { Button } from './Button';
import { Txt } from './Text';

/* -------------------------------------------------------------------------- */
/* Screen                                                                      */
/* -------------------------------------------------------------------------- */

export interface ScreenProps {
  children: React.ReactNode;
  /** Envolve o conteudo em ScrollView. Desligue em telas com lista propria. */
  scroll?: boolean;
  /** Remove a margem lateral padrao. */
  flush?: boolean;
  /** Espaco extra no fim, para o conteudo nao ficar sob um botao fixo. */
  bottomInset?: number;
  contentStyle?: StyleProp<ViewStyle>;
  /**
   * Liga o puxar-para-atualizar. Sem isso, a unica forma de recarregar seria
   * fechar e abrir o app — e puxar a lista e o gesto que todo mundo tenta
   * primeiro.
   */
  onRefresh?: () => void | Promise<void>;
  /** Avisado a cada rolagem, para telas que encolhem algo conforme desce. */
  onScroll?: (offsetY: number) => void;
  /**
   * Afasta o conteudo do teclado nos formularios. Sem isso, no iOS o campo
   * de baixo fica atras do teclado e o usuario digita as cegas.
   */
  avoidKeyboard?: boolean;
}

export function Screen({
  children,
  scroll = true,
  flush = false,
  bottomInset = 0,
  contentStyle,
  onRefresh,
  onScroll,
  avoidKeyboard = false,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [atualizando, setAtualizando] = React.useState(false);

  const padding: ViewStyle = {
    paddingHorizontal: flush ? 0 : theme.layout.gutter,
    paddingBottom: insets.bottom + theme.spacing.xl + bottomInset,
  };

  const handleRefresh = React.useCallback(async () => {
    if (!onRefresh) return;
    setAtualizando(true);
    try {
      await onRefresh();
    } finally {
      setAtualizando(false);
    }
  }, [onRefresh]);

  if (!scroll) {
    return (
      <View style={[styles.raiz, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.conteudo, padding, contentStyle]}>{children}</View>
      </View>
    );
  }

  const conteudo = (
    <ScrollView
      style={[styles.raiz, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[padding, contentStyle]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={
        onScroll
          ? (e: { nativeEvent: { contentOffset: { y: number } } }) =>
              onScroll(e.nativeEvent.contentOffset.y)
          : undefined
      }
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={atualizando}
            onRefresh={handleRefresh}
            tintColor={theme.colors.brand}
            colors={[theme.colors.brand]}
            progressBackgroundColor={theme.colors.surface}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );

  if (!avoidKeyboard) return conteudo;

  return (
    <KeyboardAvoidingView
      style={styles.raiz}
      // No Android o sistema ja redimensiona a janela; no iOS nao, entao so
      // ali o deslocamento precisa ser feito a mao.
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      {conteudo}
    </KeyboardAvoidingView>
  );
}

/* -------------------------------------------------------------------------- */
/* Cabecalho                                                                   */
/* -------------------------------------------------------------------------- */

export interface HeaderProps {
  title: string;
  subtitle?: string;
  /** Mostra a seta de voltar. */
  back?: boolean;
  /** Conteudo a direita, como um botao de acao. */
  right?: React.ReactNode;
}

export function Header({ title, subtitle, back = false, right }: HeaderProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.header, { paddingVertical: theme.spacing.md }]}>
      {back ? (
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={10}
          style={({ pressed }) => [
            styles.voltar,
            {
              minWidth: theme.layout.touchTarget,
              minHeight: theme.layout.touchTarget,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={26}
            color={theme.colors.text}
          />
        </Pressable>
      ) : null}

      <View style={styles.headerTexto}>
        <Txt variant="titleLG" numberOfLines={1}>
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="bodySM" tone="muted" numberOfLines={1}>
            {subtitle}
          </Txt>
        ) : null}
      </View>

      {right}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Estado vazio                                                                */
/* -------------------------------------------------------------------------- */

export interface EmptyStateProps {
  title: string;
  /** Diz o que fazer, nao so que esta vazio. */
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.vazio, { paddingVertical: theme.spacing.huge }]}>
      {icon ? <View style={{ marginBottom: theme.spacing.lg }}>{icon}</View> : null}
      <Txt variant="titleMD" align="center">
        {title}
      </Txt>
      <Txt
        variant="body"
        tone="muted"
        align="center"
        style={{ marginTop: 6, maxWidth: 320 }}
      >
        {description}
      </Txt>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          block={false}
          style={{ marginTop: theme.spacing.xl }}
        />
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Carregando                                                                  */
/* -------------------------------------------------------------------------- */

export function Loading({ label }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.carregando, { paddingVertical: theme.spacing.huge }]}>
      <ActivityIndicator color={theme.colors.brand} />
      {label ? (
        <Txt variant="bodySM" tone="muted" style={{ marginTop: theme.spacing.md }}>
          {label}
        </Txt>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Aviso de erro                                                               */
/* -------------------------------------------------------------------------- */

export function ErrorNotice({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.erro,
        {
          backgroundColor: theme.colors.lateSoft,
          borderColor: theme.colors.late,
          borderRadius: theme.radius.control,
          padding: theme.spacing.md,
          gap: theme.spacing.sm,
        },
      ]}
      accessibilityRole="alert"
    >
      <Txt variant="bodySM" tone="late" style={{ flex: 1 }}>
        {message}
      </Txt>
      {onRetry ? (
        <Button
          label="Tentar de novo"
          onPress={onRetry}
          variant="ghost"
          block={false}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
  },
  conteudo: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voltar: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
  },
  headerTexto: {
    flex: 1,
  },
  vazio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  carregando: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  erro: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
