/**
 * Painel do veiculo.
 *
 * Foto, identificacao, odometro e os tres blocos de resumo, seguidos das abas
 * de historico, alertas e gastos — a estrutura do protótipo, com os numeros
 * vindos do dominio.
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../../src/components/base/Button';
import { Segmented } from '../../../src/components/base/Field';
import {
  EmptyState,
  Header,
  Loading,
  Screen,
} from '../../../src/components/base/Screen';
import {
  Card,
  Readout,
  SectionHeader,
} from '../../../src/components/base/Surfaces';
import { StatusChip } from '../../../src/components/base/StatusChip';
import { Txt } from '../../../src/components/base/Text';
import { CategoryBreakdown } from '../../../src/components/charts/CategoryBreakdown';
import { AlertCard } from '../../../src/components/domain/AlertCard';
import { MaintenanceRow } from '../../../src/components/domain/MaintenanceRow';
import { MeasureStrip } from '../../../src/components/domain/MeasureStrip';
import { UpdateKmSheet } from '../../../src/components/domain/UpdateKmSheet';
import { VehicleGlyph } from '../../../src/components/domain/VehicleGlyph';
import {
  filtrarManutencoes,
  periodoMes,
  resumirGastos,
} from '../../../src/domain/expenses';
import { useGarage } from '../../../src/hooks/useGarage';
import { useTheme } from '../../../src/theme/ThemeProvider';
import {
  formatCurrency,
  formatKmUnit,
  formatPlaca,
  formatRestante,
} from '../../../src/utils/format';

type Aba = 'historico' | 'alertas' | 'gastos';

export default function PainelVeiculoScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    veiculoPorId,
    manutencoesDoVeiculo,
    lembretesDoVeiculo,
    removerVeiculo,
    carregando,
  } = useGarage();

  const [aba, setAba] = useState<Aba>('historico');
  const [atualizandoKm, setAtualizandoKm] = useState(false);

  const veiculo = veiculoPorId(id);
  const manutencoes = useMemo(
    () => (veiculo ? manutencoesDoVeiculo(veiculo.id) : []),
    [veiculo, manutencoesDoVeiculo],
  );
  const lembretes = useMemo(
    () => (veiculo ? lembretesDoVeiculo(veiculo.id) : []),
    [veiculo, lembretesDoVeiculo],
  );

  const gastoMes = useMemo(() => {
    const periodo = periodoMes();
    return resumirGastos(
      filtrarManutencoes(manutencoes, { periodo }),
      periodo,
    );
  }, [manutencoes]);

  const gastoTotal = useMemo(
    () => manutencoes.reduce((soma, m) => soma + m.valor, 0),
    [manutencoes],
  );

  const proximo = lembretes[0];

  if (carregando) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <Screen>
          <Header title="Veiculo" back />
          <Loading />
        </Screen>
      </View>
    );
  }

  if (!veiculo) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <Screen>
          <Header title="Veiculo" back />
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

  function confirmarRemocao() {
    if (!veiculo) return;
    Alert.alert(
      `Remover ${veiculo.apelido}?`,
      `Isso apaga tambem as ${manutencoes.length} ${manutencoes.length === 1 ? 'manutencao registrada' : 'manutencoes registradas'} deste veiculo. Nao da para desfazer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await removerVeiculo(veiculo.id);
            router.replace('/(tabs)');
          },
        },
      ],
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Screen>
        <Header
          title={veiculo.apelido}
          subtitle={`${veiculo.marca} ${veiculo.modelo} · ${veiculo.ano}`}
          back
          right={
            <Pressable
              onPress={() => router.push(`/veiculo/${veiculo.id}/editar`)}
              accessibilityRole="button"
              accessibilityLabel="Editar veiculo"
              hitSlop={10}
              style={({ pressed }: { pressed: boolean }) => [
                styles.acaoHeader,
                {
                  minWidth: theme.layout.touchTarget,
                  minHeight: theme.layout.touchTarget,
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
            >
              <Ionicons
                name="create-outline"
                size={22}
                color={theme.colors.text}
              />
            </Pressable>
          }
        />

        <Card flush style={{ overflow: 'hidden' }}>
          <View
            style={[
              styles.capa,
              { backgroundColor: theme.colors.surfaceSunken },
            ]}
          >
            {veiculo.fotoUri ? (
              <Image
                source={{ uri: veiculo.fotoUri }}
                style={styles.capaImagem}
                accessibilityIgnoresInvertColors
                accessibilityLabel={`Foto de ${veiculo.apelido}`}
              />
            ) : (
              <VehicleGlyph
                tipo={veiculo.tipo}
                size={56}
                color={theme.colors.line}
              />
            )}
          </View>

          <View style={{ padding: theme.spacing.lg }}>
            <View style={styles.identificacao}>
              <Txt variant="meterSM" tone="muted">
                {formatPlaca(veiculo.placa)}
              </Txt>
              {proximo ? <StatusChip status={proximo.status} size="sm" /> : null}
            </View>

            <View
              style={[styles.odometro, { marginTop: theme.spacing.md }]}
            >
              <View style={{ flex: 1 }}>
                <Txt variant="label" tone="muted">
                  Odometro
                </Txt>
                <Txt variant="meterXL" numberOfLines={1} adjustsFontSizeToFit>
                  {formatKmUnit(veiculo.kmAtual)}
                </Txt>
              </View>
              <Button
                label="Atualizar"
                variant="secondary"
                block={false}
                onPress={() => setAtualizandoKm(true)}
                icon={
                  <Ionicons
                    name="speedometer-outline"
                    size={17}
                    color={theme.colors.brand}
                  />
                }
              />
            </View>

            {proximo ? (
              <View style={{ marginTop: theme.spacing.lg }}>
                <View style={styles.linhaProximo}>
                  <Txt variant="titleSM" style={{ flex: 1 }} numberOfLines={1}>
                    {proximo.nome}
                  </Txt>
                  <Txt
                    variant="bodySM"
                    tone={
                      proximo.status === 'vencido'
                        ? 'late'
                        : proximo.status === 'atencao'
                          ? 'warn'
                          : 'muted'
                    }
                  >
                    {formatRestante(proximo.kmRestantes, proximo.diasRestantes)}
                  </Txt>
                </View>
                <MeasureStrip
                  progress={proximo.progresso}
                  status={proximo.status}
                  startLabel={
                    proximo.kmUltimoServico !== undefined
                      ? formatKmUnit(proximo.kmUltimoServico)
                      : undefined
                  }
                  endLabel={
                    proximo.kmPrevisto !== undefined
                      ? formatKmUnit(proximo.kmPrevisto)
                      : undefined
                  }
                  style={{ marginTop: theme.spacing.sm }}
                />
              </View>
            ) : null}
          </View>
        </Card>

        <View style={[styles.resumos, { marginTop: theme.spacing.md }]}>
          <Readout
            label="Gasto no mes"
            value={formatCurrency(gastoMes.total)}
            hint={`${gastoMes.quantidade} ${gastoMes.quantidade === 1 ? 'registro' : 'registros'}`}
            style={{ flex: 1 }}
          />
          <Readout
            label="Total acumulado"
            value={formatCurrency(gastoTotal)}
            hint={`${manutencoes.length} ${manutencoes.length === 1 ? 'servico' : 'servicos'}`}
            style={{ flex: 1 }}
          />
        </View>

        <Segmented<Aba>
          options={[
            { value: 'historico', label: 'Historico' },
            {
              value: 'alertas',
              label: `Alertas${lembretes.length > 0 ? ` (${lembretes.length})` : ''}`,
            },
            { value: 'gastos', label: 'Gastos' },
          ]}
          value={aba}
          onChange={setAba}
          style={{ marginVertical: theme.spacing.lg }}
        />

        {aba === 'historico' ? (
          <HistoricoAba
            manutencoes={manutencoes}
            onVerTodos={() =>
              router.push({
                pathname: '/veiculo/historico',
                params: { veiculoId: veiculo.id },
              })
            }
          />
        ) : aba === 'alertas' ? (
          <AlertasAba
            lembretes={lembretes}
            veiculo={veiculo}
            onRegistrar={(tipo) =>
              router.push({
                pathname: '/manutencao/nova',
                params: { veiculoId: veiculo.id, tipo },
              })
            }
          />
        ) : (
          <GastosAba manutencoes={manutencoes} total={gastoTotal} />
        )}

        <Button
          label="Registrar manutencao"
          onPress={() =>
            router.push({
              pathname: '/manutencao/nova',
              params: { veiculoId: veiculo.id },
            })
          }
          style={{ marginTop: theme.spacing.xxl }}
          icon={
            <Ionicons name="add" size={19} color={theme.colors.textOnBrand} />
          }
        />

        <Button
          label="Remover veiculo"
          variant="ghost"
          destructive
          onPress={confirmarRemocao}
          style={{ marginTop: theme.spacing.sm }}
        />
      </Screen>

      <UpdateKmSheet
        visible={atualizandoKm}
        veiculo={veiculo}
        onClose={() => setAtualizandoKm(false)}
      />
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Abas                                                                        */
/* -------------------------------------------------------------------------- */

function HistoricoAba({
  manutencoes,
  onVerTodos,
}: {
  manutencoes: ReturnType<typeof useGarage>['manutencoes'];
  onVerTodos: () => void;
}) {
  const theme = useTheme();
  const recentes = manutencoes.slice(0, 5);

  if (recentes.length === 0) {
    return (
      <EmptyState
        title="Nenhum servico registrado"
        description="Registre a primeira manutencao para o app montar o historico e calcular os proximos prazos."
      />
    );
  }

  return (
    <Card flush>
      <View style={{ padding: theme.spacing.lg, paddingBottom: 0 }}>
        <SectionHeader
          title="Ultimos registros"
          action={
            manutencoes.length > recentes.length ? (
              <Button
                label={`Ver todos (${manutencoes.length})`}
                variant="ghost"
                block={false}
                onPress={onVerTodos}
              />
            ) : undefined
          }
        />
      </View>
      <View style={{ paddingHorizontal: theme.spacing.lg }}>
        {recentes.map((m, i) => (
          <MaintenanceRow
            key={m.id}
            manutencao={m}
            last={i === recentes.length - 1}
          />
        ))}
      </View>
    </Card>
  );
}

function AlertasAba({
  lembretes,
  veiculo,
  onRegistrar,
}: {
  lembretes: ReturnType<typeof useGarage>['lembretes'];
  veiculo: NonNullable<ReturnType<ReturnType<typeof useGarage>['veiculoPorId']>>;
  onRegistrar: (tipo: string) => void;
}) {
  const theme = useTheme();

  if (lembretes.length === 0) {
    return (
      <EmptyState
        title="Sem lembretes ainda"
        description="Os lembretes aparecem depois do primeiro registro de cada tipo de servico, quando o app ja sabe quando foi a ultima vez."
      />
    );
  }

  return (
    <View style={{ gap: theme.spacing.md }}>
      {lembretes.map((lembrete) => (
        <AlertCard
          key={lembrete.id}
          lembrete={lembrete}
          veiculo={veiculo}
          onRegistrar={() => onRegistrar(lembrete.tipo)}
        />
      ))}
    </View>
  );
}

function GastosAba({
  manutencoes,
  total,
}: {
  manutencoes: ReturnType<typeof useGarage>['manutencoes'];
  total: number;
}) {
  const theme = useTheme();
  const resumo = useMemo(
    () => resumirGastos(manutencoes, { de: '1970-01-01', ate: '2999-12-31' }),
    [manutencoes],
  );

  if (manutencoes.length === 0) {
    return (
      <EmptyState
        title="Nenhum gasto neste veiculo"
        description="Os valores que voce informar em cada manutencao aparecem aqui separados por categoria."
      />
    );
  }

  return (
    <Card>
      <Txt variant="label" tone="muted">
        Total gasto com este veiculo
      </Txt>
      <Txt variant="meterXL" style={{ marginTop: 2 }} numberOfLines={1} adjustsFontSizeToFit>
        {formatCurrency(total)}
      </Txt>
      <View style={{ marginTop: theme.spacing.lg }}>
        <SectionHeader title="Por categoria" />
        <CategoryBreakdown data={resumo.porCategoria} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  acaoHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -10,
  },
  capa: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capaImagem: {
    width: '100%',
    height: '100%',
  },
  identificacao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  odometro: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  linhaProximo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  resumos: {
    flexDirection: 'row',
    gap: 8,
  },
});
