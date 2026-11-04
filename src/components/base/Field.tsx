/**
 * Campos de formulario: entrada de texto, seletor segmentado e lista de opcoes.
 *
 * Todos seguem a mesma regra de erro: a mensagem aparece abaixo do campo, diz
 * o que fazer e nao se apoia so na cor, porque quem nao distingue vermelho
 * precisa ler o motivo.
 */

import React from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { Txt } from './Text';

/* -------------------------------------------------------------------------- */
/* Entrada de texto                                                            */
/* -------------------------------------------------------------------------- */

export interface FieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  /** Mensagem de erro. Quando presente, o campo fica marcado. */
  error?: string;
  /** Texto de apoio mostrado quando nao ha erro. */
  hint?: string;
  /** Sufixo fixo a direita, ex.: "km". */
  suffix?: string;
  /** Usa fonte monoespacada: para quilometragem, valores e placa. */
  numeric?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Field({
  label,
  error,
  hint,
  suffix,
  numeric = false,
  containerStyle,
  ...rest
}: FieldProps) {
  const theme = useTheme();
  const [focado, setFocado] = React.useState(false);

  const corBorda = error
    ? theme.colors.late
    : focado
      ? theme.colors.brand
      : theme.colors.line;

  return (
    <View style={containerStyle}>
      <Txt variant="label" tone="muted" style={{ marginBottom: 6 }}>
        {label}
      </Txt>

      <View
        style={[
          styles.caixa,
          {
            backgroundColor: theme.colors.surfaceSunken,
            borderColor: corBorda,
            // A borda engrossa no foco para o estado nao depender so da cor.
            borderWidth: focado || error ? 2 : 1,
            borderRadius: theme.radius.control,
            minHeight: theme.layout.touchTarget,
            // Compensa a borda mais grossa para o campo nao "pular".
            paddingHorizontal: focado || error ? theme.spacing.md - 1 : theme.spacing.md,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            numeric ? theme.typography.meterMD : theme.typography.body,
            { color: theme.colors.text },
          ]}
          placeholderTextColor={theme.colors.textMuted}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          accessibilityLabel={label}
          {...rest}
        />
        {suffix ? (
          <Txt variant="meterSM" tone="muted">
            {suffix}
          </Txt>
        ) : null}
      </View>

      {error ? (
        <Txt variant="bodySM" tone="late" style={{ marginTop: 5 }}>
          {error}
        </Txt>
      ) : hint ? (
        <Txt variant="bodySM" tone="muted" style={{ marginTop: 5 }}>
          {hint}
        </Txt>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Seletor segmentado                                                          */
/* -------------------------------------------------------------------------- */

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  style,
}: SegmentedProps<T>) {
  const theme = useTheme();

  return (
    <View style={style}>
      {label ? (
        <Txt variant="label" tone="muted" style={{ marginBottom: 6 }}>
          {label}
        </Txt>
      ) : null}

      <View
        style={[
          styles.segmentado,
          {
            backgroundColor: theme.colors.surfaceSunken,
            borderRadius: theme.radius.control,
            borderColor: theme.colors.line,
          },
        ]}
        accessibilityRole="tablist"
      >
        {options.map((opcao) => {
          const ativo = opcao.value === value;
          return (
            <Pressable
              key={opcao.value}
              onPress={() => onChange(opcao.value)}
              accessibilityRole="tab"
              accessibilityState={{ selected: ativo }}
              accessibilityLabel={opcao.label}
              style={[
                styles.segmento,
                {
                  borderRadius: theme.radius.control - 3,
                  backgroundColor: ativo ? theme.colors.surface : 'transparent',
                  minHeight: theme.layout.touchTarget - 10,
                },
                ativo && theme.elevation.object,
              ]}
            >
              <Txt
                variant="titleSM"
                tone={ativo ? 'default' : 'muted'}
                numberOfLines={1}
              >
                {opcao.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Linha de opcao, usada em listas de escolha                                  */
/* -------------------------------------------------------------------------- */

export interface OptionRowProps {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  /** Desenho a esquerda, como uma amostra de cor do tema. */
  leading?: React.ReactNode;
}

export function OptionRow({
  title,
  description,
  selected,
  onPress,
  leading,
}: OptionRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      accessibilityHint={description}
      style={({ pressed }) => [
        styles.opcao,
        {
          borderRadius: theme.radius.control,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? theme.colors.brand : theme.colors.line,
          backgroundColor: selected
            ? theme.colors.brandSoft
            : theme.colors.surface,
          padding: selected ? theme.spacing.md - 1 : theme.spacing.md,
          minHeight: theme.layout.touchTarget,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {leading}
      <View style={styles.opcaoTexto}>
        <Txt variant="titleSM">{title}</Txt>
        {description ? (
          <Txt variant="bodySM" tone="muted" style={{ marginTop: 1 }}>
            {description}
          </Txt>
        ) : null}
      </View>

      {/* Marca de selecao: o estado nao depende so do fundo colorido. */}
      <View
        style={[
          styles.marca,
          {
            borderColor: selected ? theme.colors.brand : theme.colors.lineStrong,
            backgroundColor: selected ? theme.colors.brand : 'transparent',
          },
        ]}
      >
        {selected ? (
          <View
            style={[styles.marcaInterna, { backgroundColor: theme.colors.surface }]}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 11,
  },
  segmentado: {
    flexDirection: 'row',
    padding: 3,
    gap: 3,
    borderWidth: StyleSheet.hairlineWidth,
  },
  segmento: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  opcaoTexto: {
    flex: 1,
  },
  marca: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcaInterna: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
