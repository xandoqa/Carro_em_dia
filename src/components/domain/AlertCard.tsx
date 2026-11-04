/**
 * Cartao de alerta da tela de lembretes.
 *
 * Mostra o servico, o veiculo a que pertence, a faixa de medida e a acao
 * direta de registrar o servico como feito.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { Lembrete, Veiculo } from '../../domain/models';
import { ServiceIcon } from '../../icons/ServiceIcon';
import { useTheme } from '../../theme/ThemeProvider';
import { formatDateShort } from '../../utils/date';
import { formatKmUnit, formatRestante } from '../../utils/format';
import { Button } from '../base/Button';
import { StatusChip } from '../base/StatusChip';
import { Card } from '../base/Surfaces';
import { Txt } from '../base/Text';
import { MeasureStrip } from './MeasureStrip';

export interface AlertCardProps {
  lembrete: Lembrete;
  veiculo: Veiculo;
  /** Abre o registro de manutencao com o tipo ja preenchido. */
  onRegistrar: () => void;
}

export function AlertCard({ lembrete, veiculo, onRegistrar }: AlertCardProps) {
  const theme = useTheme();

  const corStatus =
    lembrete.status === 'vencido'
      ? theme.colors.late
      : lembrete.status === 'atencao'
        ? theme.colors.warn
        : theme.colors.ok;

  return (
    <Card
      accentColor={lembrete.status === 'vencido' ? theme.colors.late : undefined}
    >
      <View style={styles.topo}>
        <View
          style={[
            styles.icone,
            {
              backgroundColor: theme.colors.surfaceSunken,
              borderColor: theme.colors.line,
              borderRadius: theme.radius.control,
            },
          ]}
        >
          <ServiceIcon tipo={lembrete.tipo} size={22} color={corStatus} />
        </View>

        <View style={styles.texto}>
          <Txt variant="titleSM" numberOfLines={2}>
            {lembrete.nome}
          </Txt>
          <Txt variant="bodySM" tone="muted" numberOfLines={1}>
            {veiculo.apelido}
          </Txt>
        </View>

        <StatusChip
          status={lembrete.status}
          label={formatRestante(lembrete.kmRestantes, lembrete.diasRestantes)}
          size="sm"
        />
      </View>

      <MeasureStrip
        progress={lembrete.progresso}
        status={lembrete.status}
        startLabel={
          lembrete.kmUltimoServico !== undefined
            ? formatKmUnit(lembrete.kmUltimoServico)
            : lembrete.dataUltimoServico
              ? formatDateShort(lembrete.dataUltimoServico)
              : undefined
        }
        endLabel={
          lembrete.kmPrevisto !== undefined
            ? formatKmUnit(lembrete.kmPrevisto)
            : lembrete.dataPrevista
              ? formatDateShort(lembrete.dataPrevista)
              : undefined
        }
        style={{ marginTop: theme.spacing.md }}
      />

      {/* Quando ha prazo por km e por data, mostrar os dois evita que o
          usuario ache que o app esqueceu de um deles. */}
      {lembrete.kmPrevisto !== undefined && lembrete.dataPrevista ? (
        <Txt variant="bodySM" tone="muted" style={{ marginTop: theme.spacing.sm }}>
          Tambem vence em {formatDateShort(lembrete.dataPrevista)}.
        </Txt>
      ) : null}

      <Button
        label="Registrar como feito"
        onPress={onRegistrar}
        variant={lembrete.status === 'vencido' ? 'primary' : 'secondary'}
        style={{ marginTop: theme.spacing.md }}
        accessibilityHint={`Abre o registro de ${lembrete.nome} para ${veiculo.apelido}.`}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  topo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  icone: {
    width: 40,
    height: 40,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    flex: 1,
    minWidth: 0,
  },
});
