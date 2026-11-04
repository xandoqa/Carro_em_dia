/**
 * Grade de tipos de servico.
 *
 * Oito opcoes numa grade de tres colunas, com o icone proprio de cada tipo.
 * Uma lista suspensa esconderia as opcoes atras de um toque; como o tipo e a
 * primeira decisao do formulario e sao poucas alternativas, mostrar todas de
 * uma vez e mais rapido e deixa claro o que o app sabe registrar.
 */

import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  tiposManutencao,
  tiposManutencaoOrdem,
  type TipoManutencaoId,
} from '../../domain/models';
import { ServiceIcon } from '../../icons/ServiceIcon';
import { useTheme } from '../../theme/ThemeProvider';
import { Txt } from '../base/Text';

export interface ServiceTypeGridProps {
  value: TipoManutencaoId;
  onChange: (value: TipoManutencaoId) => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export function ServiceTypeGrid({
  value,
  onChange,
  label = 'Tipo de servico',
  style,
}: ServiceTypeGridProps) {
  const theme = useTheme();

  return (
    <View style={style}>
      <Txt variant="label" tone="muted" style={{ marginBottom: 8 }}>
        {label}
      </Txt>

      <View style={styles.grade} accessibilityRole="radiogroup">
        {tiposManutencaoOrdem.map((id) => {
          const ativo = id === value;
          const definicao = tiposManutencao[id];

          return (
            <Pressable
              key={id}
              onPress={() => onChange(id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: ativo }}
              accessibilityLabel={definicao.nome}
              style={({ pressed }) => [
                styles.item,
                {
                  borderRadius: theme.radius.control,
                  borderWidth: ativo ? 2 : 1,
                  borderColor: ativo ? theme.colors.brand : theme.colors.line,
                  backgroundColor: ativo
                    ? theme.colors.brandSoft
                    : theme.colors.surface,
                  // Compensa a borda mais grossa para o item nao mudar de tamanho.
                  padding: ativo ? theme.spacing.md - 1 : theme.spacing.md,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <ServiceIcon
                tipo={id}
                size={26}
                color={ativo ? theme.colors.brand : theme.colors.textMuted}
              />
              <Txt
                variant="label"
                tone={ativo ? 'brand' : 'default'}
                align="center"
                numberOfLines={2}
                style={{ marginTop: 7 }}
              >
                {nomeCurto(id, definicao.nome)}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Nomes curtos para caber na grade sem quebrar em tres linhas.
 * O nome completo continua valendo no historico e nos alertas.
 */
function nomeCurto(id: TipoManutencaoId, completo: string): string {
  const curtos: Partial<Record<TipoManutencaoId, string>> = {
    oleo: 'Oleo e filtro',
    revisao: 'Revisao geral',
    abastecimento: 'Abastecer',
    outro: 'Outro',
  };
  return curtos[id] ?? completo;
}

const styles = StyleSheet.create({
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  item: {
    // Tres colunas: cada item ocupa um terco, descontando os dois vaos de 8.
    width: '31.5%',
    minHeight: 86,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
