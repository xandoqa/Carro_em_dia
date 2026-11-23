/**
 * Texto tematizado.
 *
 * Centralizar aqui evita que cada tela repita `color` e `fontFamily` e garante
 * que trocar a escala tipografica valha para o app inteiro.
 */

import { Children, useState } from 'react';
import {
  Platform,
  Text as RNText,
  type LayoutChangeEvent,
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

/**
 * Largura de um caractere da fonte monoespaçada, em frações do tamanho.
 * Menlo (iOS) mede 0,602 em; a monoespaçada do Android e a do navegador
 * ficam em 0,6. Um pouco de folga evita cortar o último dígito.
 */
const LARGURA_MONO = 0.62;

/** Variantes que usam a fonte de medida, monoespaçada. */
const ehMedida = (v: TypographyToken) => v.startsWith('meter');

/**
 * Texto de uma linha só, que pode encolher para caber.
 *
 * No iPhone e no Android, `adjustsFontSizeToFit` reduz a fonte sozinho. No
 * navegador essa propriedade não existe: o valor era cortado com reticências
 * ("114.500 …", "R$ 1.377,…"). Como os números usam fonte monoespaçada, a
 * largura que o texto precisa é calculável — caracteres vezes largura de um
 * caractere — e a fonte é reduzida na proporção que falta. Só no navegador,
 * e só nas variantes de medida; no resto, nada muda.
 */
function textoPlano(children: TxtProps['children']): string | null {
  const partes = Children.toArray(children);
  if (!partes.every((p) => typeof p === 'string' || typeof p === 'number')) {
    return null;
  }
  return partes.join('');
}

export function Txt({
  variant = 'body',
  tone = 'default',
  color,
  align,
  style,
  children,
  onLayout,
  ...rest
}: TxtProps) {
  const theme = useTheme();
  const [largura, setLargura] = useState(0);

  const base = theme.typography[variant];
  const texto = textoPlano(children);
  const encolherNaWeb =
    Platform.OS === 'web' &&
    rest.adjustsFontSizeToFit === true &&
    rest.numberOfLines === 1 &&
    ehMedida(variant) &&
    texto !== null;

  let encolhido: TextStyle | null = null;
  if (encolherNaWeb && largura > 0) {
    const espacamento = base.letterSpacing ?? 0;
    const necessario =
      texto.length * (base.fontSize * LARGURA_MONO + espacamento);
    if (necessario > largura) {
      const escala = Math.max(0.5, largura / necessario);
      encolhido = {
        fontSize: base.fontSize * escala,
        letterSpacing: espacamento * escala,
      };
    }
  }

  const aoMedir = encolherNaWeb
    ? (e: LayoutChangeEvent) => {
        setLargura(e.nativeEvent.layout.width);
        onLayout?.(e);
      }
    : onLayout;

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
        encolhido,
      ]}
      onLayout={aoMedir}
      {...rest}
    >
      {children}
    </RNText>
  );
}
