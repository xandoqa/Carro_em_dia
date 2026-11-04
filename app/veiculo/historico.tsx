/**
 * Historico completo de um veiculo.
 *
 * Linha do tempo com filtro por tipo e por periodo, como no protótipo. O
 * total do que esta filtrado fica no topo: filtrar por "freios" e ver quanto
 * ja foi gasto so com freio e uma das perguntas que levam o usuario aqui.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../src/components/base/Button';
import { Segmented } from '../../src/components/base/Field';
import { EmptyState, Header, Screen } from '../../src/components/base/Screen';
import { Card, SectionHeader } from '../../src/components/base/Surfaces';
import { Txt } from '../../src/components/base/Text';
import { MaintenanceRow } from '../../src/components/domain/MaintenanceRow';
import { MaintenanceDetailSheet } from '../../src/components/domain/MaintenanceDetailSheet';
import {
  filtrarManutencoes,
  periodoAno,
  periodoDozeMeses,
} from '../../src/domain/expenses';
import {
  tiposManutencao,
  type Manutencao,
  type TipoManutencaoId,
} from '../../src/domain/models';
import { useGarage } from '../../src/hooks/useGarage';
import { useTheme } from '../../src/theme/ThemeProvider';
import { formatCurrency } from '../../src/utils/format';

type PeriodoId = 'tudo' | 'ano' | 'doze';

export default function HistoricoScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { veiculoId } = useLocalSearchParams<{ veiculoId: string }>();

  const { veiculoPorId, manutencoesDoVeiculo, removerManutencao } = useGarage();

  const [periodoId, setPeriodoId] = useState<PeriodoId>('tudo');
  const [tiposAtivos, setTiposAtivos] = useState<TipoManutencaoId[]>([]);
  const [detalhe, setDetalhe] = useState<Manutencao | null>(null);

  const veiculo = veiculoPorId(veiculoId);
  const todas = useMemo(
    () => (veiculo ? manutencoesDoVeiculo(veiculo.id) : []),
    [veiculo, manutencoesDoVeiculo],
  );

  /** So oferece filtro dos tipos que esse veiculo realmente tem. */
  const tiposPresentes = useMemo(() => {
    const vistos = new Set(todas.map((m) => m.tipo));
    return [...vistos];
  }, [todas]);

  const periodo = useMemo(() => {
    if (periodoId === 'ano') return periodoAno();
    if (periodoId === 'doze') return periodoDozeMeses();
    return undefined;
  }, [periodoId]);

  const filtradas = useMemo(
    () => filtrarManutencoes(todas, { periodo, tipos: tiposAtivos }),
    [todas, periodo, tiposAtivos],
  );

  const total = useMemo(
    () => filtradas.reduce((soma, m) => soma + m.valor, 0),
    [filtradas],
  );

  function alternarTipo(tipo: TipoManutencaoId) {
    setTiposAtivos((atuais) =>
      atuais.includes(tipo)
        ? atuais.filter((t) => t !== tipo)
        : [...atuais, tipo],
    );
  }

  function confirmarExclusao(manutencao: Manutencao) {
    Alert.alert(
      'Excluir registro?',
      'Este servico sai do historico e dos gastos, e os lembretes sao recalculados. Nao da para desfazer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await removerManutencao(manutencao.id);
            setDetalhe(null);
          },
        },
      ],
    );
  }

  if (!veiculo) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <Screen>
          <Header title="Historico" back />
          <EmptyState
            title="Veiculo nao encontrado"
            description="Ele pode ter sido removido. Volte para a garagem para ver a lista atual."
            actionLabel="Voltar para a garagem"
            onAction={() => router.replace('/(tabs)')}
          />
        </Screen>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Screen>
        <Header
          title="Historico"
          subtitle={`${veiculo.apelido} · ${todas.length} ${todas.length === 1 ? 'registro' : 'registros'}`}
          back
        />

        {todas.length === 0 ? (
          <EmptyState
            title="Nenhum servico registrado"
            description="Registre a primeira manutencao para montar a linha do tempo deste veiculo."
            actionLabel="Registrar manutencao"
            onAction={() =>
              router.push({
                pathname: '/manutencao/nova',
                params: { veiculoId: veiculo.id },
              })
            }
          />
        ) : (
          <>
            <Segmented<PeriodoId>
              options={[
                { value: 'tudo', label: 'Tudo' },
                { value: 'ano', label: 'Este ano' },
                { value: 'doze', label: '12 meses' },
              ]}
              value={periodoId}
              onChange={setPeriodoId}
            />

            {tiposPresentes.length > 1 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: theme.spacing.md }}
                contentContainerStyle={styles.filtros}
              >
                {tiposPresentes.map((tipo) => {
                  const ativo = tiposAtivos.includes(tipo);
                  return (
                    <Pressable
                      key={tipo}
                      onPress={() => alternarTipo(tipo)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: ativo }}
                      accessibilityLabel={tiposManutencao[tipo].nome}
                      style={({ pressed }) => [
                        styles.chip,
                        {
                          borderRadius: theme.radius.pill,
                          backgroundColor: ativo
                            ? theme.colors.brand
                            : theme.colors.surface,
                          borderColor: ativo
                            ? theme.colors.brand
                            : theme.colors.line,
                          opacity: pressed ? 0.75 : 1,
                        },
                      ]}
                    >
                      <Txt
                        variant="label"
                        color={
                          ativo ? theme.colors.textOnBrand : theme.colors.text
                        }
                      >
                        {tiposManutencao[tipo].nome}
                      </Txt>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : null}

            <Card style={{ marginTop: theme.spacing.lg }} flush>
              <View style={{ padding: theme.spacing.lg, paddingBottom: 0 }}>
                <SectionHeader
                  title={`${filtradas.length} ${filtradas.length === 1 ? 'registro' : 'registros'}`}
                  action={
                    <Txt variant="meterMD">{formatCurrency(total)}</Txt>
                  }
                />
              </View>

              {filtradas.length === 0 ? (
                <View style={{ padding: theme.spacing.xxl }}>
                  <Txt variant="body" tone="muted" align="center">
                    Nenhum servico com esses filtros.
                  </Txt>
                  <Button
                    label="Limpar filtros"
                    variant="ghost"
                    onPress={() => {
                      setTiposAtivos([]);
                      setPeriodoId('tudo');
                    }}
                    style={{ marginTop: theme.spacing.md }}
                  />
                </View>
              ) : (
                <View style={{ paddingHorizontal: theme.spacing.lg }}>
                  {filtradas.map((m, i) => (
                    <MaintenanceRow
                      key={m.id}
                      manutencao={m}
                      onPress={() => setDetalhe(m)}
                      last={i === filtradas.length - 1}
                    />
                  ))}
                </View>
              )}
            </Card>
          </>
        )}
      </Screen>

      <MaintenanceDetailSheet
        manutencao={detalhe}
        onClose={() => setDetalhe(null)}
        onDelete={confirmarExclusao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filtros: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderWidth: 1,
    minHeight: 38,
    justifyContent: 'center',
  },
});
