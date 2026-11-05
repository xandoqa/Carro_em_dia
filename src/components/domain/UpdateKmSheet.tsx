/**
 * Folha para atualizar o odometro.
 *
 * Atualizar o km e a acao mais frequente do app depois de registrar um
 * servico, e nao vale a pena abrir uma tela inteira para um campo. A folha
 * mostra o valor atual como referencia e recusa valor menor, porque odometro
 * nao anda para tras e aceitar isso bagunçaria todos os lembretes.
 */

import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Veiculo } from '../../domain/models';
import { validarNovoKm } from '../../domain/odometer';
import { useGarage } from '../../hooks/useGarage';
import { useTheme } from '../../theme/ThemeProvider';
import { formatKm, formatKmUnit, parseNumberInput } from '../../utils/format';
import { Button } from '../base/Button';
import { Field } from '../base/Field';
import { Txt } from '../base/Text';

export interface UpdateKmSheetProps {
  visible: boolean;
  veiculo: Veiculo;
  onClose: () => void;
}

export function UpdateKmSheet({
  visible,
  veiculo,
  onClose,
}: UpdateKmSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { atualizarKm, corrigirKm, kmMinimoPermitido } = useGarage();

  const [valor, setValor] = useState('');
  const [erro, setErro] = useState<string | undefined>();
  const [salvando, setSalvando] = useState(false);
  /** Guarda o valor menor que o usuario digitou, aguardando confirmacao. */
  const [correcaoPendente, setCorrecaoPendente] = useState<number | null>(null);

  // Comeca em branco a cada abertura, em vez de manter o que foi digitado
  // numa tentativa anterior.
  useEffect(() => {
    if (visible) {
      setValor('');
      setErro(undefined);
      setCorrecaoPendente(null);
    }
  }, [visible]);

  const minimo = kmMinimoPermitido(veiculo.id);

  async function salvar() {
    const km = parseNumberInput(valor);

    if (km === null) {
      setErro('Informe a quilometragem em numeros.');
      return;
    }

    const resultado = validarNovoKm({
      novo: km,
      atual: veiculo.kmAtual,
      minimo,
    });

    if (resultado.tipo === 'invalido') {
      setErro(resultado.motivo);
      return;
    }

    // Valor menor nao e recusado de vez: quase sempre e correcao de um erro
    // de digitacao anterior, e sem esta saida o numero errado ficaria preso
    // para sempre. Pede confirmacao em vez de barrar.
    if (resultado.tipo === 'correcao') {
      setErro(undefined);
      setCorrecaoPendente(km);
      return;
    }

    if (resultado.tipo === 'ok') {
      // Mesmo valor: nada a fazer.
      onClose();
      return;
    }

    setSalvando(true);
    try {
      await atualizarKm(veiculo.id, km);
      onClose();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Nao foi possivel salvar.');
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarCorrecao() {
    if (correcaoPendente === null) return;

    setSalvando(true);
    try {
      await corrigirKm(veiculo.id, correcaoPendente);
      onClose();
    } catch (e) {
      setCorrecaoPendente(null);
      setErro(e instanceof Error ? e.message : 'Nao foi possivel corrigir.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
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

        <Txt variant="titleMD">Atualizar quilometragem</Txt>
        <Txt variant="bodySM" tone="muted" style={{ marginTop: 2 }}>
          {veiculo.apelido} esta com {formatKmUnit(veiculo.kmAtual)}.
        </Txt>

        <Field
          label="Nova quilometragem"
          placeholder={formatKm(veiculo.kmAtual + 500)}
          value={valor}
          onChangeText={(t: string) => {
            setValor(t);
            if (erro) setErro(undefined);
            if (correcaoPendente !== null) setCorrecaoPendente(null);
          }}
          error={erro}
          keyboardType="number-pad"
          suffix="km"
          numeric
          autoFocus
          containerStyle={{ marginTop: theme.spacing.lg }}
        />

        {correcaoPendente !== null ? (
          <View
            style={[
              styles.aviso,
              {
                backgroundColor: theme.colors.warnSoft,
                borderColor: theme.colors.warn,
                borderRadius: theme.radius.control,
                padding: theme.spacing.md,
                marginTop: theme.spacing.md,
              },
            ]}
            accessibilityRole="alert"
          >
            <Txt variant="titleSM" tone="warn">
              Baixar o odometro?
            </Txt>
            <Txt variant="bodySM" tone="muted" style={{ marginTop: 4 }}>
              O valor vai de {formatKm(veiculo.kmAtual)} para{' '}
              {formatKm(correcaoPendente)} km. Faca isso so para corrigir um
              erro de digitacao — os lembretes serao recalculados.
            </Txt>
          </View>
        ) : (
          <Txt
            variant="bodySM"
            tone="muted"
            style={{ marginTop: theme.spacing.sm }}
          >
            Os lembretes sao recalculados com o novo valor.
          </Txt>
        )}

        <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
          {correcaoPendente !== null ? (
            <Button
              label="Confirmar correcao"
              onPress={confirmarCorrecao}
              loading={salvando}
            />
          ) : (
            <Button label="Salvar" onPress={salvar} loading={salvando} />
          )}
          <Button label="Cancelar" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
  },
  folha: {
    paddingTop: 8,
  },
  puxador: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  aviso: {
    borderWidth: 1,
  },
});
