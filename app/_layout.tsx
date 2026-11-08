/**
 * Raiz do app.
 *
 * Monta os provedores na ordem em que dependem um do outro: o tema primeiro,
 * porque tudo abaixo dele le cores, e a garagem depois, porque ela agenda
 * notificacoes e precisa estar viva enquanto qualquer tela existir.
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FeedbackProvider } from '../src/components/base/Feedback';
import { GarageProvider } from '../src/hooks/useGarage';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';

/**
 * A pilha fica num componente separado porque precisa ler o tema, e so quem
 * esta dentro do ThemeProvider pode fazer isso.
 */
function Navegacao() {
  const theme = useTheme();

  return (
    <>
      {/* A barra de status acompanha o tema, inclusive nos temas claros de
          alto contraste, onde icones claros ficariam invisiveis. */}
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="veiculo/novo" options={{ presentation: 'modal' }} />
        <Stack.Screen name="veiculo/[id]" />
        <Stack.Screen name="veiculo/historico" />
        <Stack.Screen
          name="manutencao/nova"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="manutencao/[id]" />
        <Stack.Screen name="aparencia" />
        <Stack.Screen name="ajustes" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          {/* O feedback fica por fora da garagem para que uma falha ao
              carregar os dados ainda possa ser anunciada. */}
          <FeedbackProvider>
            <GarageProvider>
              <Navegacao />
            </GarageProvider>
          </FeedbackProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
