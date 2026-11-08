/**
 * Seletor de data em calendário.
 *
 * Por que existe: o formulário pedia a data digitada como `2026-11-08`. Num
 * celular isso é lento, erra fácil e o teclado numérico nem traz o hífen. Era
 * o pior momento do app.
 *
 * Por que desenhado à mão em vez de uma biblioteca: o seletor nativo
 * (`@react-native-community/datetimepicker`) é mais uma dependência, tem
 * aparência diferente em cada plataforma e não aceita o tema do app. Um
 * calendário de um mês cabe em pouca coisa e fica igual nos quatro temas.
 *
 * Datas futuras ficam desabilitadas: um serviço só é registrado depois de
 * feito, e a validação do formulário já recusava isso — melhor não deixar
 * nem tocar.
 */

import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IsoDate } from '../../domain/models';
import { useTheme } from '../../theme/ThemeProvider';
import { parseIsoDate, toIsoDate, today } from '../../utils/date';
import { Button } from './Button';
import { Txt } from './Text';

export interface DateSheetProps {
  visible: boolean;
  /** Data selecionada no formato `YYYY-MM-DD`. */
  value: IsoDate;
  onSelect: (data: IsoDate) => void;
  onClose: () => void;
  /** Bloqueia datas depois de hoje. */
  maxToday?: boolean;
  title?: string;
}

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

interface Celula {
  dia: number;
  iso: IsoDate;
  desabilitada: boolean;
}

/**
 * Monta a grade do mês, com casas vazias antes do dia 1 para a primeira
 * semana começar no dia da semana certo.
 */
function montarGrade(
  ano: number,
  mes: number,
  limite?: IsoDate,
): (Celula | null)[] {
  const primeiro = new Date(ano, mes, 1);
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const vazias = primeiro.getDay();

  const celulas: (Celula | null)[] = Array.from({ length: vazias }, () => null);

  for (let dia = 1; dia <= diasNoMes; dia += 1) {
    const iso = toIsoDate(new Date(ano, mes, dia));
    celulas.push({
      dia,
      iso,
      desabilitada: limite !== undefined && iso > limite,
    });
  }

  return celulas;
}

export function DateSheet({
  visible,
  value,
  onSelect,
  onClose,
  maxToday = true,
  title = 'Escolher data',
}: DateSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const selecionada = useMemo(() => {
    try {
      return parseIsoDate(value);
    } catch {
      // Valor inválido no campo não deve impedir o calendário de abrir.
      return new Date();
    }
  }, [value]);

  const [cursor, setCursor] = useState(() => ({
    ano: selecionada.getFullYear(),
    mes: selecionada.getMonth(),
  }));

  // Reposiciona no mês da data atual a cada abertura.
  React.useEffect(() => {
    if (visible) {
      setCursor({
        ano: selecionada.getFullYear(),
        mes: selecionada.getMonth(),
      });
    }
  }, [visible, selecionada]);

  const limite = maxToday ? today() : undefined;
  const hoje = today();

  const grade = useMemo(
    () => montarGrade(cursor.ano, cursor.mes, limite),
    [cursor, limite],
  );

  /** Impede avançar para um mês inteiramente no futuro. */
  const podeAvancar = useMemo(() => {
    if (!limite) return true;
    const primeiroDoProximo = toIsoDate(new Date(cursor.ano, cursor.mes + 1, 1));
    return primeiroDoProximo <= limite;
  }, [cursor, limite]);

  function mover(delta: number) {
    setCursor((atual) => {
      const d = new Date(atual.ano, atual.mes + delta, 1);
      return { ano: d.getFullYear(), mes: d.getMonth() };
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
            padding: theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing.lg,
          },
        ]}
      >
        <View style={[styles.puxador, { backgroundColor: theme.colors.line }]} />

        <Txt variant="titleMD">{title}</Txt>

        <View style={[styles.navMes, { marginTop: theme.spacing.lg }]}>
          <Pressable
            onPress={() => mover(-1)}
            accessibilityRole="button"
            accessibilityLabel="Mês anterior"
            hitSlop={8}
            style={({ pressed }) => [
              styles.setaMes,
              {
                borderColor: theme.colors.line,
                borderRadius: theme.radius.control,
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Txt variant="titleMD" tone="muted">
              ‹
            </Txt>
          </Pressable>

          <Txt variant="titleSM" style={styles.mesAtual}>
            {MESES[cursor.mes]} de {cursor.ano}
          </Txt>

          <Pressable
            onPress={() => podeAvancar && mover(1)}
            disabled={!podeAvancar}
            accessibilityRole="button"
            accessibilityLabel="Próximo mês"
            accessibilityState={{ disabled: !podeAvancar }}
            hitSlop={8}
            style={({ pressed }) => [
              styles.setaMes,
              {
                borderColor: theme.colors.line,
                borderRadius: theme.radius.control,
                opacity: !podeAvancar ? 0.3 : pressed ? 0.6 : 1,
              },
            ]}
          >
            <Txt variant="titleMD" tone="muted">
              ›
            </Txt>
          </Pressable>
        </View>

        <View style={[styles.semana, { marginTop: theme.spacing.md }]}>
          {DIAS_SEMANA.map((d, i) => (
            <Txt
              key={i}
              variant="label"
              tone="muted"
              align="center"
              style={styles.celula}
            >
              {d}
            </Txt>
          ))}
        </View>

        <View style={styles.grade}>
          {grade.map((celula, i) => {
            if (!celula) return <View key={`v${i}`} style={styles.celula} />;

            const ativa = celula.iso === value;
            const ehHoje = celula.iso === hoje;

            return (
              <Pressable
                key={celula.iso}
                onPress={() => {
                  if (celula.desabilitada) return;
                  onSelect(celula.iso);
                  onClose();
                }}
                disabled={celula.desabilitada}
                accessibilityRole="button"
                accessibilityLabel={`${celula.dia} de ${MESES[cursor.mes]}`}
                accessibilityState={{
                  selected: ativa,
                  disabled: celula.desabilitada,
                }}
                style={[styles.celula, styles.dia]}
              >
                <View
                  style={[
                    styles.diaInterno,
                    {
                      backgroundColor: ativa ? theme.colors.brand : 'transparent',
                      // Hoje ganha contorno em vez de preenchimento, para não
                      // competir com o dia selecionado.
                      borderColor:
                        ehHoje && !ativa ? theme.colors.brand : 'transparent',
                    },
                  ]}
                >
                  <Txt
                    variant="meterSM"
                    color={
                      celula.desabilitada
                        ? theme.colors.lineStrong
                        : ativa
                          ? theme.colors.textOnBrand
                          : theme.colors.text
                    }
                  >
                    {celula.dia}
                  </Txt>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
          <Button
            label="Hoje"
            variant="secondary"
            onPress={() => {
              onSelect(hoje);
              onClose();
            }}
          />
          <Button label="Cancelar" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1 },
  folha: { paddingTop: 8 },
  puxador: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  navMes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  setaMes: {
    width: 44,
    height: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mesAtual: {
    flex: 1,
    textAlign: 'center',
  },
  semana: {
    flexDirection: 'row',
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  celula: {
    // Sete colunas exatas.
    width: `${100 / 7}%`,
  },
  dia: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diaInterno: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
