/**
 * Famílias tipográficas.
 *
 * Único arquivo do tema que depende da plataforma, e por isso fica separado:
 * `tokens.ts` continua puro e pode ser importado por scripts e testes que
 * rodam fora do React Native.
 *
 * Dois papéis bem separados:
 *
 *   ui    — grotesca do sistema. Invisível, legível, sem download.
 *   meter — monoespaçada. Toda medida (km, R$, data, placa) usa esta família,
 *           porque números precisam alinhar em coluna como num odômetro.
 *
 * Trocar por uma fonte própria significa mexer só neste arquivo: carregue-a
 * com `expo-font` no layout raiz e troque os nomes abaixo.
 */

import { Platform } from 'react-native';

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
