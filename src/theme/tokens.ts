/**
 * Tokens primitivos do design system "Caderneta".
 *
 * Estes valores nao dependem de tema. Eles sao a materia-prima; os temas em
 * `palettes.ts` escolhem quais cores usar e `ThemeProvider` monta o objeto final.
 *
 * Conceito: o app e uma caderneta de manutencao com um painel de instrumentos.
 * Numeros sao o conteudo principal, entao eles recebem fonte monoespacada e
 * tamanhos maiores; texto de interface fica em grotesca de sistema.
 */

import { Platform } from 'react-native';

/* -------------------------------------------------------------------------- */
/* Espacamento                                                                 */
/* -------------------------------------------------------------------------- */

/** Escala de 4pt. Use sempre os tokens, nunca numeros soltos nos estilos. */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 56,
} as const;

export type SpacingToken = keyof typeof spacing;

/* -------------------------------------------------------------------------- */
/* Raio de borda — codifica hierarquia, nao decoracao                          */
/* -------------------------------------------------------------------------- */

/**
 * O raio carrega informacao sobre o que o elemento e:
 *
 *   object  (20) — um objeto do dominio: um veiculo, um alerta, um registro
 *   control (10) — algo em que se toca: botao, campo, aba
 *   readout  (4) — um painel de leitura: odometro, faixa de km, valor
 *   pill    (999) — um estado: em dia / atencao / vencido
 */
export const radius = {
  readout: 4,
  control: 10,
  object: 20,
  pill: 999,
} as const;

/* -------------------------------------------------------------------------- */
/* Tipografia                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Duas familias, com papeis bem separados:
 *
 *   ui    — grotesca do sistema. Invisivel, legivel, sem download.
 *   meter — monoespacada. Toda medida (km, R$, data, placa) usa esta familia,
 *           porque numeros precisam alinhar em coluna como num odometro.
 *
 * Trocar por uma fonte propria significa mexer so neste bloco.
 */
export const fontFamily = {
  ui: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }) as string,
  uiMedium: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'System',
  }) as string,
  meter: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }) as string,
} as const;

/**
 * Escala tipografica. Os nomes dizem o papel, nao o tamanho, para que trocar
 * um valor nao exija renomear nada.
 */
export const typography = {
  /** Numero grande de leitura: odometro, total gasto. */
  meterXL: {
    fontFamily: fontFamily.meter,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.8,
    fontWeight: '700' as const,
  },
  /** Numero de destaque dentro de um bloco. */
  meterLG: {
    fontFamily: fontFamily.meter,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.4,
    fontWeight: '700' as const,
  },
  /** Numero em linha de lista ou coluna de valores. */
  meterMD: {
    fontFamily: fontFamily.meter,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
    fontWeight: '600' as const,
  },
  /** Placa, data curta, unidade. */
  meterSM: {
    fontFamily: fontFamily.meter,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0.4,
    fontWeight: '600' as const,
  },

  /** Titulo de tela. */
  titleLG: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 26,
    lineHeight: 31,
    letterSpacing: -0.5,
    fontWeight: '700' as const,
  },
  /** Titulo de bloco ou nome de veiculo. */
  titleMD: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: -0.2,
    fontWeight: '700' as const,
  },
  /** Titulo de item de lista. */
  titleSM: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.1,
    fontWeight: '600' as const,
  },

  /** Texto corrido. */
  body: {
    fontFamily: fontFamily.ui,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
    fontWeight: '400' as const,
  },
  /** Texto secundario, descricoes. */
  bodySM: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 19,
    letterSpacing: 0,
    fontWeight: '400' as const,
  },
  /** Rotulo de campo e legenda. Sentence case, nunca caixa alta. */
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
    fontWeight: '600' as const,
  },
  /** Texto de botao. */
  action: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '700' as const,
  },
} as const;

export type TypographyToken = keyof typeof typography;

/* -------------------------------------------------------------------------- */
/* Movimento                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Duracoes curtas. Movimento aqui responde a uma acao do usuario ou revela uma
 * medida; nao existe animacao de entrada decorativa.
 */
export const motion = {
  /** Resposta imediata a um toque. */
  instant: 120,
  /** Transicao de estado: aba, chip, expandir. */
  quick: 200,
  /** Revelacao de medida: a faixa de km preenchendo. */
  measure: 620,
} as const;

/* -------------------------------------------------------------------------- */
/* Elevacao                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Sombra e usada com parcimonia e so para separar um objeto do fundo.
 * Paineis de leitura e linhas de lista nao tem sombra: eles usam borda fina.
 */
export const elevation = {
  none: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  object: {
    shadowColor: '#000000',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  floating: {
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Medidas fixas de layout                                                     */
/* -------------------------------------------------------------------------- */

export const layout = {
  /** Margem lateral padrao das telas. */
  gutter: spacing.lg,
  /** Altura minima de alvo de toque (acessibilidade). */
  touchTarget: 44,
  /** Espessura das linhas finas. */
  hairline: 1,
  /** Altura da faixa de medida (o elemento assinatura do app). */
  measureStrip: 34,
} as const;
