/**
 * Aparencia: escolha do tema.
 *
 * Cada opcao mostra uma amostra real das cores daquele tema, nao um nome
 * solto. A troca e imediata e a escolha fica salva, entao o app reabre no
 * tema escolhido.
 */

import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OptionRow } from '../src/components/base/Field';
import { Header, Screen } from '../src/components/base/Screen';
import { Card, SectionHeader } from '../src/components/base/Surfaces';
import { StatusChip } from '../src/components/base/StatusChip';
import { Txt } from '../src/components/base/Text';
import { MeasureStrip } from '../src/components/domain/MeasureStrip';
import {
  useTheme,
  useThemePreference,
  type ThemePreference,
} from '../src/theme/ThemeProvider';
import type { ThemeDefinition } from '../src/theme/palettes';

export default function AparenciaScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { preference, available, setPreference } = useThemePreference();

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Screen>
        <Header title="Aparencia" subtitle={`Usando ${theme.name}`} back />

        {/* Previa viva: o cartao abaixo usa o tema aplicado, entao o efeito
            da escolha aparece sem precisar sair da tela. */}
        <Card>
          <SectionHeader title="Previa" />
          <View style={styles.previaTopo}>
            <View style={{ flex: 1 }}>
              <Txt variant="titleSM">Troca de oleo e filtro</Txt>
              <Txt variant="bodySM" tone="muted">
                Gol do trabalho
              </Txt>
            </View>
            <StatusChip status="atencao" label="Faltam 900 km" size="sm" />
          </View>
          <MeasureStrip
            progress={0.91}
            status="atencao"
            startLabel="105.000 km"
            endLabel="115.000 km"
            animate={false}
            style={{ marginTop: theme.spacing.md }}
          />
        </Card>

        <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.sm }}>
          <SectionHeader title="Tema" />

          <OptionRow
            title="Seguir o sistema"
            description="Claro de dia, escuro a noite, conforme o ajuste do celular."
            selected={preference === 'system'}
            onPress={() => setPreference('system')}
            leading={<AmostraSistema />}
          />

          {available.map((definicao) => (
            <OptionRow
              key={definicao.id}
              title={definicao.name}
              description={definicao.description}
              selected={preference === definicao.id}
              onPress={() => setPreference(definicao.id as ThemePreference)}
              leading={<Amostra definicao={definicao} />}
            />
          ))}
        </View>

        <Txt
          variant="bodySM"
          tone="muted"
          style={{ marginTop: theme.spacing.lg }}
        >
          A escolha fica salva no aparelho e vale na proxima vez que voce abrir
          o app.
        </Txt>
      </Screen>
    </View>
  );
}

/* -------------------------------------------------------------------------- */

/** Amostra com as tres cores que mais definem o tema. */
function Amostra({ definicao }: { definicao: ThemeDefinition }) {
  const theme = useTheme();
  const { background, surface, brand } = definicao.colors;

  return (
    <View
      style={[
        styles.amostra,
        {
          backgroundColor: background,
          borderColor: theme.colors.lineStrong,
          borderRadius: theme.radius.readout,
        },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[styles.faixa, { backgroundColor: surface }]} />
      <View style={[styles.ponto, { backgroundColor: brand }]} />
    </View>
  );
}

/** Amostra partida ao meio, representando claro e escuro. */
function AmostraSistema() {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.amostra,
        {
          borderColor: theme.colors.lineStrong,
          borderRadius: theme.radius.readout,
          overflow: 'hidden',
          flexDirection: 'row',
        },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={{ flex: 1, backgroundColor: '#F2F3F0' }} />
      <View style={{ flex: 1, backgroundColor: '#101513' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  previaTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  amostra: {
    width: 38,
    height: 38,
    borderWidth: 1,
    padding: 5,
    justifyContent: 'space-between',
  },
  faixa: {
    height: 8,
    borderRadius: 2,
  },
  ponto: {
    width: 12,
    height: 8,
    borderRadius: 2,
  },
});
