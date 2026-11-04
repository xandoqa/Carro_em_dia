/**
 * Ajustes: aparencia, notificacoes e dados.
 *
 * A tela de notificacoes mostra quantos avisos estao agendados de verdade, em
 * vez de so um interruptor: assim o usuario consegue conferir que o
 * agendamento funcionou, que e a duvida mais comum com lembretes locais.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../src/components/base/Button';
import { Header, Screen } from '../src/components/base/Screen';
import { Card, Divider, SectionHeader } from '../src/components/base/Surfaces';
import { Txt } from '../src/components/base/Text';
import { carregarDadosDemo } from '../src/data/demoData';
import { preferencesRepository } from '../src/data/preferencesRepository';
import { clearAll } from '../src/data/storage';
import { useGarage } from '../src/hooks/useGarage';
import { BrandMark } from '../src/icons/ServiceIcon';
import { notificationService } from '../src/services/notificationService';
import { useTheme } from '../src/theme/ThemeProvider';

export default function AjustesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { veiculos, manutencoes, lembretes, recarregar } = useGarage();

  const [notificacoes, setNotificacoes] = useState(true);
  const [agendadas, setAgendadas] = useState(0);
  const [antecedencia, setAntecedencia] = useState(7);
  const [carregandoExemplo, setCarregandoExemplo] = useState(false);

  const carregarPreferencias = useCallback(async () => {
    const prefs = await preferencesRepository.get();
    setNotificacoes(prefs.notificacoes);
    setAntecedencia(prefs.antecedenciaDias);
    setAgendadas((await notificationService.listarAgendados()).length);
  }, []);

  useEffect(() => {
    void carregarPreferencias();
  }, [carregarPreferencias]);

  async function alternarNotificacoes(valor: boolean) {
    setNotificacoes(valor);
    await preferencesRepository.setNotificacoes(valor);

    const prefs = await preferencesRepository.get();
    const total = await notificationService.reagendar({
      lembretes,
      veiculos,
      ativado: valor,
      antecedenciaDias: prefs.antecedenciaDias,
      horaLembrete: prefs.horaLembrete,
    });
    setAgendadas(total);

    // Ligar e continuar com zero agendadas quase sempre significa permissao
    // negada no sistema. Vale dizer isso em vez de deixar o usuario achando
    // que esta tudo certo.
    if (valor && total === 0 && lembretes.some((l) => l.dataPrevista)) {
      Alert.alert(
        'Avisos nao agendados',
        'O celular nao autorizou as notificacoes do CarroEmDia. Libere nos ajustes do sistema para receber os lembretes.',
      );
    }
  }

  async function testar() {
    const enviou = await notificationService.enviarTeste();
    if (!enviou) {
      Alert.alert(
        'Permissao necessaria',
        'Libere as notificacoes do CarroEmDia nos ajustes do celular para receber o teste.',
      );
      return;
    }
    Alert.alert('Aviso enviado', 'Ele deve chegar em alguns segundos.');
  }

  async function carregarExemplo() {
    setCarregandoExemplo(true);
    try {
      const { veiculos: v, manutencoes: m } = await carregarDadosDemo();
      await recarregar();
      Alert.alert(
        'Dados de exemplo carregados',
        `${v} veiculos e ${m} registros, com servicos vencidos, proximos do prazo e em dia.`,
      );
    } catch {
      Alert.alert('Nao foi possivel carregar', 'Tente de novo.');
    } finally {
      setCarregandoExemplo(false);
    }
  }

  function confirmarLimpeza() {
    Alert.alert(
      'Apagar todos os dados?',
      `Isso remove ${veiculos.length} ${veiculos.length === 1 ? 'veiculo' : 'veiculos'} e ${manutencoes.length} ${manutencoes.length === 1 ? 'registro' : 'registros'} deste aparelho. Nao da para desfazer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar tudo',
          style: 'destructive',
          onPress: async () => {
            await notificationService.cancelarTodos();
            await clearAll();
            await recarregar();
            router.replace('/(tabs)');
          },
        },
      ],
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Screen>
        <Header title="Ajustes" back />

        <SectionHeader title="Aparencia" />
        <Card flush>
          <LinhaNavegacao
            titulo="Tema"
            descricao={`Usando ${theme.name}`}
            onPress={() => router.push('/aparencia')}
          />
        </Card>

        <SectionHeader title="Notificacoes" />
        <Card>
          <View style={styles.linhaSwitch}>
            <View style={{ flex: 1 }}>
              <Txt variant="titleSM">Avisos de manutencao</Txt>
              <Txt variant="bodySM" tone="muted" style={{ marginTop: 2 }}>
                {notificacoes
                  ? `${agendadas} ${agendadas === 1 ? 'aviso agendado' : 'avisos agendados'}, ${antecedencia} dias antes do prazo.`
                  : 'Desligado. Os prazos continuam sendo calculados no app.'}
              </Txt>
            </View>
            <Switch
              value={notificacoes}
              onValueChange={(v: boolean) => void alternarNotificacoes(v)}
              trackColor={{
                false: theme.colors.line,
                true: theme.colors.brand,
              }}
              thumbColor={theme.colors.surface}
              accessibilityLabel="Avisos de manutencao"
            />
          </View>

          {notificacoes ? (
            <>
              <Divider style={{ marginVertical: theme.spacing.md }} />
              <Txt variant="bodySM" tone="muted">
                Servicos que vencem so por quilometragem nao tem data para
                agendar. Esses aparecem na aba Alertas assim que o odometro
                chega perto do limite.
              </Txt>
              <Button
                label="Enviar aviso de teste"
                variant="secondary"
                onPress={testar}
                style={{ marginTop: theme.spacing.md }}
              />
            </>
          ) : null}
        </Card>

        <SectionHeader title="Dados" />
        <Card>
          <View style={styles.numeros}>
            <View style={{ flex: 1 }}>
              <Txt variant="meterLG">{veiculos.length}</Txt>
              <Txt variant="bodySM" tone="muted">
                {veiculos.length === 1 ? 'veiculo' : 'veiculos'}
              </Txt>
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="meterLG">{manutencoes.length}</Txt>
              <Txt variant="bodySM" tone="muted">
                {manutencoes.length === 1 ? 'registro' : 'registros'}
              </Txt>
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="meterLG">{lembretes.length}</Txt>
              <Txt variant="bodySM" tone="muted">
                {lembretes.length === 1 ? 'lembrete' : 'lembretes'}
              </Txt>
            </View>
          </View>

          <Txt variant="bodySM" tone="muted" style={{ marginTop: theme.spacing.md }}>
            Tudo fica guardado neste aparelho. Nada e enviado para servidor,
            exceto a consulta publica da tabela FIPE no cadastro de veiculos.
          </Txt>

          {/* Util na apresentacao: um app vazio nao mostra historico, nem
              grafico, nem alerta vencido. */}
          {veiculos.length === 0 ? (
            <Button
              label="Carregar dados de exemplo"
              variant="secondary"
              onPress={carregarExemplo}
              loading={carregandoExemplo}
              style={{ marginTop: theme.spacing.md }}
            />
          ) : (
            <Button
              label="Apagar todos os dados"
              variant="ghost"
              destructive
              onPress={confirmarLimpeza}
              style={{ marginTop: theme.spacing.md }}
            />
          )}
        </Card>

        <View style={[styles.rodape, { marginTop: theme.spacing.xxl }]}>
          <BrandMark size={30} color={theme.colors.textMuted} accent={theme.colors.brand} />
          <Txt variant="bodySM" tone="muted" align="center" style={{ marginTop: 8 }}>
            CarroEmDia 1.0
          </Txt>
          <Txt variant="bodySM" tone="muted" align="center">
            Engenharia de Software · UCB
          </Txt>
        </View>
      </Screen>
    </View>
  );
}

function LinhaNavegacao({
  titulo,
  descricao,
  onPress,
}: {
  titulo: string;
  descricao: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${titulo}. ${descricao}`}
      style={({ pressed }) => [
        styles.navegacao,
        {
          padding: theme.spacing.lg,
          minHeight: theme.layout.touchTarget,
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Txt variant="titleSM">{titulo}</Txt>
        <Txt variant="bodySM" tone="muted" style={{ marginTop: 2 }}>
          {descricao}
        </Txt>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  linhaSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  numeros: {
    flexDirection: 'row',
    gap: 12,
  },
  navegacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rodape: {
    alignItems: 'center',
  },
});
