/**
 * Paletas do CarroEmDia.
 *
 * Sao quatro temas, cada um com um motivo concreto — nao sao variacoes de cor
 * por variar:
 *
 *   oficina  — claro, verde-petroleo. O esmalte de maquina de oficina sobre
 *              papel cinza-frio. Tema padrao no modo claro.
 *   asfalto  — escuro, verde-petroleo. A mesma marca de noite.
 *   ambar    — escuro, ambar quente. A iluminacao de painel em viagem noturna.
 *   pista    — claro, alto contraste. Tinta quase preta, branco e amarelo de
 *              sinalizacao. Para quem precisa de mais contraste ou usa o app
 *              sob sol forte.
 *
 * Regra de cor do produto: vermelho e ambar pertencem ao estado do veiculo
 * (vencido / atencao). Eles nunca aparecem como decoracao, so como sinal.
 */

export type ThemeId = 'oficina' | 'asfalto' | 'ambar' | 'pista';

export type ColorScheme = 'light' | 'dark';

export interface Palette {
  /** Fundo da tela. */
  background: string;
  /** Superficie de um objeto (card de veiculo, bloco de alerta). */
  surface: string;
  /** Superficie recuada: painel de leitura, campo de formulario. */
  surfaceSunken: string;
  /** Superficie elevada: menu, modal, barra inferior. */
  surfaceRaised: string;

  /** Texto principal. */
  text: string;
  /** Texto secundario e rotulos. */
  textMuted: string;
  /** Texto sobre a cor da marca. */
  textOnBrand: string;

  /** Linha fina: divisor, contorno de painel de leitura. */
  line: string;
  /** Linha mais forte: contorno de campo focado. */
  lineStrong: string;

  /** Cor da marca: acoes primarias, selecao, marcador da faixa de medida. */
  brand: string;
  /** Marca pressionada. */
  brandPressed: string;
  /** Fundo tenue da marca: chip selecionado, aba ativa. */
  brandSoft: string;

  /** Em dia. */
  ok: string;
  okSoft: string;
  /** Atencao: manutencao proxima. */
  warn: string;
  warnSoft: string;
  /** Vencido. */
  late: string;
  lateSoft: string;

  /** Sobreposicao atras de modais. */
  scrim: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  /** Nome mostrado ao usuario. */
  name: string;
  /** Uma linha explicando o tema na tela de aparencia. */
  description: string;
  scheme: ColorScheme;
  colors: Palette;
}

/* -------------------------------------------------------------------------- */

const oficina: ThemeDefinition = {
  id: 'oficina',
  name: 'Oficina',
  description: 'Claro, verde-petroleo sobre papel cinza.',
  scheme: 'light',
  colors: {
    background: '#F2F3F0',
    surface: '#FFFFFF',
    surfaceSunken: '#EDEFEB',
    surfaceRaised: '#FFFFFF',

    text: '#15201C',
    textMuted: '#5E6B66',
    textOnBrand: '#FFFFFF',

    line: '#D8DCD6',
    lineStrong: '#A9B2AC',

    brand: '#0F4D45',
    brandPressed: '#0A3A34',
    brandSoft: '#D7E8E3',

    ok: '#2F7D5B',
    okSoft: '#DCEFE4',
    warn: '#A86D12',
    warnSoft: '#F6E8CF',
    late: '#B23A2E',
    lateSoft: '#F7DFDC',

    scrim: 'rgba(21, 32, 28, 0.44)',
  },
};

const asfalto: ThemeDefinition = {
  id: 'asfalto',
  name: 'Asfalto',
  description: 'Escuro, verde-petroleo. Padrao no modo escuro.',
  scheme: 'dark',
  colors: {
    background: '#101513',
    surface: '#171E1B',
    surfaceSunken: '#0C110F',
    surfaceRaised: '#1F2825',

    text: '#E8EDE9',
    textMuted: '#8D9A94',
    textOnBrand: '#06211D',

    line: '#2A3531',
    lineStrong: '#415049',

    brand: '#3FB89F',
    brandPressed: '#359C87',
    brandSoft: '#15322D',

    ok: '#4FBF8B',
    okSoft: '#13301F',
    warn: '#E0A33A',
    warnSoft: '#33260F',
    late: '#FF6B5B',
    lateSoft: '#3A1A17',

    scrim: 'rgba(0, 0, 0, 0.62)',
  },
};

const ambar: ThemeDefinition = {
  id: 'ambar',
  name: 'Ambar',
  description: 'Escuro e quente, como a luz do painel a noite.',
  scheme: 'dark',
  colors: {
    background: '#140F0A',
    surface: '#1C150E',
    surfaceSunken: '#100C07',
    surfaceRaised: '#251C12',

    text: '#F2E6D4',
    textMuted: '#9C8A72',
    textOnBrand: '#1F1405',

    line: '#33281B',
    lineStrong: '#4C3C28',

    brand: '#E8A33D',
    brandPressed: '#C9892C',
    brandSoft: '#352512',

    ok: '#9BBF6A',
    okSoft: '#232B16',
    warn: '#E8A33D',
    warnSoft: '#352512',
    late: '#E2564A',
    lateSoft: '#361713',

    scrim: 'rgba(0, 0, 0, 0.66)',
  },
};

const pista: ThemeDefinition = {
  id: 'pista',
  name: 'Pista',
  description: 'Claro e de alto contraste, para sol forte.',
  scheme: 'light',
  colors: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSunken: '#F0F0EE',
    surfaceRaised: '#FFFFFF',

    text: '#0B0F0D',
    textMuted: '#454B48',
    // A marca deste tema e quase preta, entao o texto sobre ela precisa ser
    // branco. Repetir a cor de tinta aqui deixaria o botao ilegivel.
    textOnBrand: '#FFFFFF',

    line: '#9BA19E',
    lineStrong: '#0B0F0D',

    brand: '#1C1C1A',
    brandPressed: '#000000',
    brandSoft: '#FFE38A',

    ok: '#19663F',
    okSoft: '#D8EFE2',
    warn: '#8A5A00',
    warnSoft: '#FFE9B8',
    late: '#99241A',
    lateSoft: '#FBD9D5',

    scrim: 'rgba(11, 15, 13, 0.52)',
  },
};

/* -------------------------------------------------------------------------- */

export const themes: Record<ThemeId, ThemeDefinition> = {
  oficina,
  asfalto,
  ambar,
  pista,
};

/** Ordem em que os temas aparecem na tela de aparencia. */
export const themeOrder: ThemeId[] = ['oficina', 'asfalto', 'ambar', 'pista'];

/** Tema usado quando o usuario pede "seguir o sistema". */
export const systemDefaults: Record<ColorScheme, ThemeId> = {
  light: 'oficina',
  dark: 'asfalto',
};

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && value in themes;
}
