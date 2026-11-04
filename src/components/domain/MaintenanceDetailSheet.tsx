/**
 * Detalhe de uma manutencao.
 *
 * Abre a partir do historico. Mostra tudo que foi registrado, inclusive a
 * foto da nota, e oferece a exclusao.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tiposManutencao, type Manutencao } from '../../domain/models';
import { ServiceIcon } from '../../icons/ServiceIcon';
import { useTheme } from '../../theme/ThemeProvider';
import { formatDate } from '../../utils/date';
import { formatCurrency, formatKmUnit, formatLiters } from '../../utils/format';
import { Button } from '../base/Button';
import { Divider } from '../base/Surfaces';
import { Txt } from '../base/Text';

export interface MaintenanceDetailSheetProps {
  /** `null` mantem a folha fechada. */
  manutencao: Manutencao | null;
  onClose: () => void;
  onDelete: (manutencao: Manutencao) => void;
}

export function MaintenanceDetailSheet({
  manutencao,
  onClose,
  onDelete,
}: MaintenanceDetailSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  if (!manutencao) return null;

  const nome =
    manutencao.tipo === 'outro' && manutencao.descricao
      ? manutencao.descricao
      : (tiposManutencao[manutencao.tipo]?.nome ?? 'Servico');

  const linhas: { rotulo: string; valor: string }[] = [
    { rotulo: 'Data', valor: formatDate(manutencao.data) },
    { rotulo: 'Quilometragem', valor: formatKmUnit(manutencao.km) },
    { rotulo: 'Valor pago', valor: formatCurrency(manutencao.valor) },
    ...(manutencao.litros
      ? [{ rotulo: 'Litros', valor: formatLiters(manutencao.litros) }]
      : []),
    ...(manutencao.oficina
      ? [{ rotulo: 'Oficina', valor: manutencao.oficina }]
      : []),
    ...(manutencao.proximaEmKm
      ? [
          {
            rotulo: 'Proxima em',
            valor: formatKmUnit(manutencao.proximaEmKm),
          },
        ]
      : []),
    ...(manutencao.proximaEmMeses
      ? [
          {
            rotulo: 'Ou em',
            valor: `${manutencao.proximaEmMeses} ${manutencao.proximaEmMeses === 1 ? 'mes' : 'meses'}`,
          },
        ]
      : []),
  ];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={[styles.fundo, { backgroundColor: theme.colors.scrim }]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Fechar"
      />

      <View
        style={[
          styles.folha,
          {
            backgroundColor: theme.colors.surfaceRaised,
            borderTopLeftRadius: theme.radius.object,
            borderTopRightRadius: theme.radius.object,
            paddingBottom: insets.bottom + theme.spacing.lg,
          },
        ]}
      >
        <View style={[styles.puxador, { backgroundColor: theme.colors.line }]} />

        <ScrollView
          contentContainerStyle={{ padding: theme.spacing.lg, paddingTop: 0 }}
        >
          <View style={styles.cabecalho}>
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
              <ServiceIcon
                tipo={manutencao.tipo}
                size={24}
                color={theme.colors.brand}
              />
            </View>
            <Txt variant="titleMD" style={{ flex: 1 }}>
              {nome}
            </Txt>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              style={{
                minWidth: theme.layout.touchTarget,
                minHeight: theme.layout.touchTarget,
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="close" size={24} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <View style={{ marginTop: theme.spacing.lg }}>
            {linhas.map((linha, i) => (
              <View key={linha.rotulo}>
                {i > 0 ? <Divider /> : null}
                <View style={[styles.linha, { paddingVertical: theme.spacing.md }]}>
                  <Txt variant="body" tone="muted">
                    {linha.rotulo}
                  </Txt>
                  <Txt variant="meterMD">{linha.valor}</Txt>
                </View>
              </View>
            ))}
          </View>

          {manutencao.observacoes ? (
            <View style={{ marginTop: theme.spacing.lg }}>
              <Txt variant="label" tone="muted" style={{ marginBottom: 4 }}>
                Observacoes
              </Txt>
              <Txt variant="body">{manutencao.observacoes}</Txt>
            </View>
          ) : null}

          {manutencao.notaUri ? (
            <View style={{ marginTop: theme.spacing.lg }}>
              <Txt variant="label" tone="muted" style={{ marginBottom: 6 }}>
                Nota fiscal
              </Txt>
              <Image
                source={{ uri: manutencao.notaUri }}
                style={[styles.nota, { borderRadius: theme.radius.control }]}
                resizeMode="contain"
                accessibilityLabel="Foto da nota fiscal"
                accessibilityIgnoresInvertColors
              />
            </View>
          ) : null}

          <Button
            label="Excluir registro"
            variant="ghost"
            destructive
            onPress={() => onDelete(manutencao)}
            style={{ marginTop: theme.spacing.xl }}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
  },
  folha: {
    maxHeight: '86%',
    paddingTop: 8,
  },
  puxador: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  icone: {
    width: 42,
    height: 42,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  nota: {
    width: '100%',
    height: 260,
  },
});
