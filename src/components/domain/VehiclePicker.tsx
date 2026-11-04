/**
 * Seletor de veiculo em faixa horizontal.
 *
 * Um menu suspenso esconderia quais veiculos existem e exigiria dois toques
 * para trocar. Como o usuario tipico tem de um a tres veiculos, mostrar todos
 * numa faixa rolavel resolve em um toque e deixa a garagem visivel.
 */

import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import type { Veiculo } from '../../domain/models';
import { useTheme } from '../../theme/ThemeProvider';
import { Txt } from '../base/Text';
import { VehicleGlyph } from './VehicleGlyph';

export interface VehiclePickerProps {
  veiculos: Veiculo[];
  /** `undefined` representa "todos", quando `allowAll` estiver ligado. */
  value?: string;
  onChange: (id: string | undefined) => void;
  /** Adiciona a opcao "Todos" no inicio. */
  allowAll?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function VehiclePicker({
  veiculos,
  value,
  onChange,
  allowAll = false,
  style,
}: VehiclePickerProps) {
  const theme = useTheme();

  const opcoes: { id: string | undefined; label: string; veiculo?: Veiculo }[] =
    [
      ...(allowAll ? [{ id: undefined, label: 'Todos' }] : []),
      ...veiculos.map((v) => ({ id: v.id, label: v.apelido, veiculo: v })),
    ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={styles.faixa}
      accessibilityRole="tablist"
    >
      {opcoes.map((opcao) => {
        const ativo = opcao.id === value;
        return (
          <Pressable
            key={opcao.id ?? 'todos'}
            onPress={() => onChange(opcao.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativo }}
            accessibilityLabel={opcao.label}
            style={({ pressed }) => [
              styles.item,
              {
                borderRadius: theme.radius.pill,
                backgroundColor: ativo
                  ? theme.colors.brand
                  : theme.colors.surface,
                borderColor: ativo ? theme.colors.brand : theme.colors.line,
                minHeight: 38,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            {opcao.veiculo ? (
              <VehicleGlyph
                tipo={opcao.veiculo.tipo}
                size={18}
                color={ativo ? theme.colors.textOnBrand : theme.colors.textMuted}
              />
            ) : null}
            <Txt
              variant="titleSM"
              color={ativo ? theme.colors.textOnBrand : theme.colors.text}
              numberOfLines={1}
            >
              {opcao.label}
            </Txt>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  faixa: {
    gap: 8,
    paddingRight: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
});
