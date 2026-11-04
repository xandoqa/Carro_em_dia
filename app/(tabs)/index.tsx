/**
 * Tela inicial: a garagem.
 *
 * Abre com o resumo do que precisa de atencao e, abaixo, os veiculos. A ordem
 * e deliberada: quem abre o app geralmente quer saber se ha algo pendente,
 * nao navegar pela lista.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../src/components/base/Button';
import {
  EmptyState,
  ErrorNotice,
  Header,
  Loading,
  Screen,
} from '../../src/components/base/Screen';
import { Card } from '../../src/components/base/Surfaces';
import { Txt } from '../../src/components/base/Text';
import { VehicleCard } from '../../src/components/domain/VehicleCard';
import { useGarage } from '../../src/hooks/useGarage';
import { BrandMark } from '../../src/icons/ServiceIcon';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function GaragemScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { veiculos, lembretes, contagem, carregando, erro, recarregar } =
    useGarage();

  /** Lembrete mais urgente de cada veiculo. A lista ja vem ordenada. */
  const prioritarioPorVeiculo = useMemo(() => {
    const mapa = new Map<string, (typeof lembretes)[number]>();
    for (const l of lembretes) {
      if (!mapa.has(l.veiculoId)) mapa.set(l.veiculoId, l);
    }
    return mapa;
  }, [lembretes]);

  const pendentes = contagem.vencido + contagem.atencao;

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Screen bottomInset={72}>
        <Header
          title="Minha garagem"
          subtitle={
            veiculos.length === 0
              ? 'Nenhum veiculo cadastrado'
              : `${veiculos.length} ${veiculos.length === 1 ? 'veiculo' : 'veiculos'}`
          }
          right={
            <Pressable
              onPress={() => router.push('/ajustes')}
              accessibilityRole="button"
              accessibilityLabel="Ajustes"
              hitSlop={10}
              style={({ pressed }) => [
                styles.acaoHeader,
                {
                  minWidth: theme.layout.touchTarget,
                  minHeight: theme.layout.touchTarget,
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={theme.colors.text}
              />
            </Pressable>
          }
        />

        {erro ? (
          <ErrorNotice message={erro} onRetry={() => void recarregar()} />
        ) : null}

        {carregando ? (
          <Loading label="Carregando sua garagem" />
        ) : veiculos.length === 0 ? (
          <EmptyState
            icon={
              <BrandMark size={56} color={theme.colors.line} accent={theme.colors.brand} />
            }
            title="Comece pelo primeiro veiculo"
            description="Cadastre seu carro ou moto para registrar manutencoes, acompanhar gastos e receber avisos antes do prazo vencer."
            actionLabel="Cadastrar veiculo"
            onAction={() => router.push('/veiculo/novo')}
          />
        ) : (
          <>
            {/* Resumo so aparece quando ha algo a dizer. Um painel que
                anuncia "tudo certo" em letras grandes rouba espaco do
                conteudo sem informar nada. */}
            {pendentes > 0 ? (
              <Card
                onPress={() => router.push('/(tabs)/alertas')}
                accentColor={
                  contagem.vencido > 0 ? theme.colors.late : theme.colors.warn
                }
                accessibilityLabel={`${pendentes} ${pendentes === 1 ? 'servico pendente' : 'servicos pendentes'}. Abrir alertas.`}
                style={{ marginBottom: theme.spacing.md }}
              >
                <View style={styles.resumo}>
                  <View style={styles.resumoTexto}>
                    <Txt variant="titleSM">
                      {contagem.vencido > 0
                        ? `${contagem.vencido} ${contagem.vencido === 1 ? 'servico vencido' : 'servicos vencidos'}`
                        : `${contagem.atencao} ${contagem.atencao === 1 ? 'servico chegando' : 'servicos chegando'}`}
                    </Txt>
                    <Txt variant="bodySM" tone="muted" style={{ marginTop: 2 }}>
                      {contagem.vencido > 0 && contagem.atencao > 0
                        ? `E mais ${contagem.atencao} ${contagem.atencao === 1 ? 'proximo' : 'proximos'} do prazo.`
                        : 'Toque para ver os detalhes.'}
                    </Txt>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.textMuted}
                  />
                </View>
              </Card>
            ) : null}

            <View style={{ gap: theme.spacing.md }}>
              {veiculos.map((veiculo) => (
                <VehicleCard
                  key={veiculo.id}
                  veiculo={veiculo}
                  lembrete={prioritarioPorVeiculo.get(veiculo.id)}
                  onPress={() => router.push(`/veiculo/${veiculo.id}`)}
                />
              ))}
            </View>

            <Button
              label="Cadastrar outro veiculo"
              variant="secondary"
              onPress={() => router.push('/veiculo/novo')}
              style={{ marginTop: theme.spacing.lg }}
            />
          </>
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  acaoHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -10,
  },
  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resumoTexto: {
    flex: 1,
  },
});
