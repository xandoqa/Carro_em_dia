/**
 * Provedor de tema do CarroEmDia.
 *
 * Guarda a preferencia do usuario (um tema fixo ou "seguir o sistema") e a
 * persiste, de modo que a escolha sobrevive a fechar e reabrir o app.
 *
 * O objeto exposto por `useTheme()` ja vem com cores, tokens e helpers, entao
 * nenhum componente precisa importar paletas diretamente.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import { preferencesRepository } from '../data/preferencesRepository';
import {
  isThemeId,
  systemDefaults,
  themeOrder,
  themes,
  type ColorScheme,
  type Palette,
  type ThemeDefinition,
  type ThemeId,
} from './palettes';
import {
  elevation,
  layout,
  motion,
  radius,
  spacing,
  typography,
} from './tokens';

/** O que o usuario escolheu: um tema especifico ou acompanhar o sistema. */
export type ThemePreference = ThemeId | 'system';

export interface Theme {
  /** Tema efetivamente aplicado. */
  id: ThemeId;
  name: string;
  scheme: ColorScheme;
  colors: Palette;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  motion: typeof motion;
  elevation: typeof elevation;
  layout: typeof layout;
  /** `true` quando o esquema aplicado e escuro. Util para StatusBar e graficos. */
  isDark: boolean;
}

interface ThemeContextValue {
  theme: Theme;
  /** Preferencia bruta, incluindo 'system'. */
  preference: ThemePreference;
  /** Lista ordenada para a tela de aparencia. */
  available: ThemeDefinition[];
  setPreference: (next: ThemePreference) => void;
  /** `false` enquanto a preferencia salva ainda esta sendo lida do disco. */
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function buildTheme(definition: ThemeDefinition): Theme {
  return {
    id: definition.id,
    name: definition.name,
    scheme: definition.scheme,
    colors: definition.colors,
    spacing,
    radius,
    typography,
    motion,
    elevation,
    layout,
    isDark: definition.scheme === 'dark',
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);

  // Le a preferencia salva uma unica vez, na montagem.
  useEffect(() => {
    let active = true;

    preferencesRepository
      .getThemePreference()
      .then((saved) => {
        if (!active) return;
        if (saved === 'system' || isThemeId(saved)) {
          setPreferenceState(saved);
        }
      })
      .catch(() => {
        // Preferencia ilegivel nao deve impedir o app de abrir: segue no padrao.
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    // Atualiza a interface na hora e grava em seguida; a escrita nao bloqueia.
    setPreferenceState(next);
    void preferencesRepository.setThemePreference(next);
  }, []);

  const theme = useMemo(() => {
    if (preference === 'system') {
      const scheme: ColorScheme = systemScheme === 'dark' ? 'dark' : 'light';
      return buildTheme(themes[systemDefaults[scheme]]);
    }
    return buildTheme(themes[preference]);
  }, [preference, systemScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      preference,
      available: themeOrder.map((id) => themes[id]),
      setPreference,
      ready,
    }),
    [theme, preference, setPreference, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Acesso ao tema aplicado. Lanca fora do provedor para falhar cedo. */
export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme precisa estar dentro de <ThemeProvider>.');
  }
  return ctx.theme;
}

/** Acesso a preferencia e ao seletor, usado pela tela de aparencia. */
export function useThemePreference() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemePreference precisa estar dentro de <ThemeProvider>.');
  }
  const { preference, available, setPreference, ready } = ctx;
  return { preference, available, setPreference, ready };
}
