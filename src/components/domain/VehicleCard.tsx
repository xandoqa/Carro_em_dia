/**
 * Cartao de veiculo da tela inicial.
 *
 * Responde, nesta ordem, as tres perguntas que o usuario faz ao abrir o app:
 * qual veiculo, como ele esta, e quanto falta para o proximo servico.
 */

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import type { Lembrete, Veiculo } from '../../domain/models';
import { useTheme } from '../../theme/ThemeProvider';
import { formatKmUnit, formatPlaca, formatRestante } from '../../utils/format';
import { Card } from '../base/Surfaces';
import { StatusChip } from '../base/StatusChip';
import { Txt } from '../base/Text';
import { MeasureStrip } from './MeasureStrip';
import { VehicleGlyph } from './VehicleGlyph';

export interface VehicleCardProps {
  veiculo: Veiculo;
  /** Lembrete mais urgente do veiculo, quando houver. */
  lembrete?: Lembrete;
  onPress: () => void;
}

export function VehicleCard({ veiculo, lembrete, onPress }: VehicleCardProps) {
  const theme = useTheme();

  const subtitulo = `${veiculo.marca} ${veiculo.modelo} · ${veiculo.ano}`;

  return (
    <Card
      onPress={onPress}
      accentColor={
        lembrete?.status === 'vencido' ? theme.colors.late : undefined
      }
      accessibilityLabel={`${veiculo.apelido}, ${subtitulo}, ${formatKmUnit(veiculo.kmAtual)}`}
    >
      <View style={styles.topo}>
        <View
          style={[
            styles.miniatura,
            {
              backgroundColor: theme.colors.surfaceSunken,
              borderColor: theme.colors.line,
              borderRadius: theme.radius.control,
            },
          ]}
        >
          {veiculo.fotoUri ? (
            <Image
              source={{ uri: veiculo.fotoUri }}
              style={styles.foto}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <VehicleGlyph tipo={veiculo.tipo} size={28} color={theme.colors.textMuted} />
          )}
        </View>

        <View style={styles.identificacao}>
          <Txt variant="titleMD" numberOfLines={1}>
            {veiculo.apelido}
          </Txt>
          <Txt variant="bodySM" tone="muted" numberOfLines={1}>
            {subtitulo}
          </Txt>
          <Txt variant="meterSM" tone="muted" style={{ marginTop: 3 }}>
            {formatPlaca(veiculo.placa)}
          </Txt>
        </View>

        {lembrete ? <StatusChip status={lembrete.status} size="sm" /> : null}
      </View>

      <View
        style={[
          styles.odometro,
          {
            borderTopColor: theme.colors.line,
            marginTop: theme.spacing.md,
            paddingTop: theme.spacing.md,
          },
        ]}
      >
        <Txt variant="label" tone="muted">
          Odometro
        </Txt>
        <Txt variant="meterLG">{formatKmUnit(veiculo.kmAtual)}</Txt>
      </View>

      {lembrete ? (
        <View style={{ marginTop: theme.spacing.md }}>
          <View style={styles.linhaLembrete}>
            <Txt variant="titleSM" numberOfLines={1} style={{ flex: 1 }}>
              {lembrete.nome}
            </Txt>
            <Txt
              variant="bodySM"
              tone={
                lembrete.status === 'vencido'
                  ? 'late'
                  : lembrete.status === 'atencao'
                    ? 'warn'
                    : 'muted'
              }
            >
              {formatRestante(lembrete.kmRestantes, lembrete.diasRestantes)}
            </Txt>
          </View>

          <MeasureStrip
            progress={lembrete.progresso}
            status={lembrete.status}
            startLabel={
              lembrete.kmUltimoServico !== undefined
                ? formatKmUnit(lembrete.kmUltimoServico)
                : undefined
            }
            endLabel={
              lembrete.kmPrevisto !== undefined
                ? formatKmUnit(lembrete.kmPrevisto)
                : undefined
            }
            style={{ marginTop: theme.spacing.sm }}
          />
        </View>
      ) : (
        <Txt variant="bodySM" tone="muted" style={{ marginTop: theme.spacing.md }}>
          Registre uma manutencao para o app comecar a calcular os lembretes.
        </Txt>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  topo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  miniatura: {
    width: 54,
    height: 54,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  foto: {
    width: '100%',
    height: '100%',
  },
  identificacao: {
    flex: 1,
    minWidth: 0,
  },
  odometro: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  linhaLembrete: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
});
