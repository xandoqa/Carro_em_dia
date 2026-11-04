/**
 * Relatorio de gastos.
 *
 * Filtros de veiculo e periodo no topo, total, evolucao mensal, distribuicao
 * por categoria e os maiores gastos — a mesma estrutura do protótipo, com os
 * numeros calculados pelo dominio.
 */

import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Segmented } from '../../src/components/base/Field';
import { EmptyState, Header, Loading, Screen } from '../../src/components/base/Screen';
import { Card, Readout, SectionHeader } from '../../src/components/base/Surfaces';
import { Txt } from '../../src/components/base/Text';
import { BarChart } from '../../src/components/charts/BarChart';
import { CategoryBreakdown } from '../../src/components/charts/CategoryBreakdown';
import { MaintenanceRow } from '../../src/components/domain/MaintenanceRow';
import { VehiclePicker } from '../../src/components/domain/VehiclePicker';
import {
  consumoMedio,
  custoPorKm,
  filtrarManutencoes,
  periodoAno,
  periodoDozeMeses,
  periodoMes,
  resumirGastos,
} from '../../src/domain/expenses';
import { useGarage } from '../../src/hooks/useGarage';
import { useTheme } from '../../src/theme/ThemeProvider';
import { formatCurrency } from '../../src/utils/format';

type PeriodoId = 'mes' | 'ano' | 'doze';

export default function GastosScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { veiculos, manutencoes, carregando } = useGarage();

  /** `undefined` significa "todos os veiculos". */
  const [veiculoId, setVeiculoId] = useState<string | undefined>(undefined);
  const [periodoId, setPeriodoId] = useState<PeriodoId>('doze');

  const periodo = useMemo(() => {
    if (periodoId === 'mes') return periodoMes();
    if (periodoId === 'ano') return periodoAno();
    return periodoDozeMeses();
  }, [periodoId]);

  const filtradas = useMemo(
    () => filtrarManutencoes(manutencoes, { veiculoId, periodo }),
    [manutencoes, veiculoId, periodo],
  );

  const resumo = useMemo(
    () => resumirGastos(filtradas, periodo),
    [filtradas, periodo],
  );

  const consumo = useMemo(() => consumoMedio(filtradas), [filtradas]);
  const porKm = useMemo(() => custoPorKm(filtradas), [filtradas]);

  const nomeVeiculo = veiculoId
    ? veiculos.find((v) => v.id === veiculoId)?.apelido
    : undefined;

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Screen>
        <Header
          title="Gastos"
          subtitle={nomeVeiculo ?? 'Todos os veiculos'}
        />

        {carregando ? (
          <Loading />
        ) : manutencoes.length === 0 ? (
          <EmptyState
            title="Nenhum gasto registrado"
            description="Cada manutencao que voce registrar entra neste relatorio, separada por categoria e por mes."
            actionLabel={
              veiculos.length === 0 ? 'Cadastrar veiculo' : 'Registrar manutencao'
            }
            onAction={() =>
              router.push(
                veiculos.length === 0 ? '/veiculo/novo' : '/manutencao/nova',
              )
            }
          />
        ) : (
          <>
            {veiculos.length > 1 ? (
              <VehiclePicker
                veiculos={veiculos}
                value={veiculoId}
                onChange={setVeiculoId}
                allowAll
                style={{ marginBottom: theme.spacing.md }}
              />
            ) : null}

            <Segmented<PeriodoId>
              options={[
                { value: 'mes', label: 'Mes' },
                { value: 'ano', label: 'Ano' },
                { value: 'doze', label: '12 meses' },
              ]}
              value={periodoId}
              onChange={setPeriodoId}
              style={{ marginBottom: theme.spacing.lg }}
            />

            <Card>
              <Txt variant="label" tone="muted">
                Total no periodo
              </Txt>
              <Txt variant="meterXL" style={{ marginTop: 2 }} adjustsFontSizeToFit numberOfLines={1}>
                {formatCurrency(resumo.total)}
              </Txt>
              <Txt variant="bodySM" tone="muted" style={{ marginTop: 4 }}>
                {resumo.quantidade}{' '}
                {resumo.quantidade === 1 ? 'registro' : 'registros'} ·{' '}
                {formatCurrency(resumo.mediaMensal)} por mes
              </Txt>

              <View style={{ marginTop: theme.spacing.lg }}>
                <SectionHeader title="Evolucao mensal" />
                <BarChart data={resumo.porMes} />
              </View>
            </Card>

            {/* Indicadores que so existem com dados suficientes. Mostrar
                "—" em um painel vazio nao ajuda ninguem. */}
            {(consumo !== null || porKm !== null) && (
              <View style={[styles(theme).indicadores]}>
                {consumo !== null ? (
                  <Readout
                    label="Consumo medio"
                    value={`${consumo.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km/L`}
                    hint="Entre abastecimentos"
                    style={{ flex: 1 }}
                  />
                ) : null}
                {porKm !== null ? (
                  <Readout
                    label="Custo por km"
                    value={formatCurrency(porKm)}
                    hint="No periodo"
                    style={{ flex: 1 }}
                  />
                ) : null}
              </View>
            )}

            <Card style={{ marginTop: theme.spacing.md }}>
              <SectionHeader title="Por categoria" />
              <CategoryBreakdown data={resumo.porCategoria} />
            </Card>

            {resumo.maiores.length > 0 ? (
              <Card style={{ marginTop: theme.spacing.md }} flush>
                <View style={{ padding: theme.spacing.lg, paddingBottom: 0 }}>
                  <SectionHeader title="Maiores gastos" />
                </View>
                <View style={{ paddingHorizontal: theme.spacing.lg }}>
                  {resumo.maiores.map((m, i) => (
                    <MaintenanceRow
                      key={m.id}
                      manutencao={m}
                      last={i === resumo.maiores.length - 1}
                      veiculoNome={
                        veiculoId
                          ? undefined
                          : veiculos.find((v) => v.id === m.veiculoId)?.apelido
                      }
                    />
                  ))}
                </View>
              </Card>
            ) : null}
          </>
        )}
      </Screen>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => ({
  indicadores: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
});
