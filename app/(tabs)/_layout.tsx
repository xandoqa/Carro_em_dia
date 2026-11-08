/**
 * Barra de navegacao inferior.
 *
 * Tres destinos, como no protótipo. A aba de alertas mostra um contador
 * quando ha pendencia, porque e a informacao que faz o usuario abrir o app.
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { Txt } from '../../src/components/base/Text';
import { useGarage } from '../../src/hooks/useGarage';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function TabsLayout() {
  const theme = useTheme();
  const { contagem } = useGarage();

  const pendentes = contagem.vencido + contagem.atencao;

  /**
   * Retorno tatil ao trocar de aba.
   *
   * Em app de celular o toque na barra inferior quase sempre responde com uma
   * vibracao curta; sem ela a navegacao parece lenta mesmo quando nao e.
   */
  const aoTocarAba = () => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  };

  return (
    <Tabs
      screenListeners={{ tabPress: aoTocarAba }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.brand,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surfaceRaised,
          borderTopColor: theme.colors.line,
          borderTopWidth: StyleSheet.hairlineWidth,
          // No Android a barra encosta na borda; o espaco extra evita que os
          // rotulos fiquem colados na navegacao do sistema.
          height: Platform.OS === 'ios' ? 86 : 64,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
        tabBarLabelStyle: {
          ...theme.typography.label,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Veiculos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-sport-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alertas"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="notifications-outline" size={size} color={color} />
              {pendentes > 0 ? (
                <View
                  style={[
                    styles.selo,
                    {
                      backgroundColor:
                        contagem.vencido > 0
                          ? theme.colors.late
                          : theme.colors.warn,
                      borderColor: theme.colors.surfaceRaised,
                    },
                  ]}
                >
                  <Txt
                    variant="label"
                    color={theme.isDark ? '#0B0F0D' : '#FFFFFF'}
                    style={styles.seloTexto}
                  >
                    {pendentes > 9 ? '9+' : pendentes}
                  </Txt>
                </View>
              ) : null}
            </View>
          ),
          tabBarAccessibilityLabel:
            pendentes > 0
              ? `Alertas, ${pendentes} ${pendentes === 1 ? 'pendencia' : 'pendencias'}`
              : 'Alertas',
        }}
      />
      <Tabs.Screen
        name="gastos"
        options={{
          title: 'Gastos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  selo: {
    position: 'absolute',
    top: -4,
    right: -9,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  seloTexto: {
    fontSize: 10,
    lineHeight: 13,
  },
});
