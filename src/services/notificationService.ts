/**
 * Notificacoes locais de manutencao.
 *
 * O app nao tem servidor, entao os avisos sao agendados no proprio aparelho
 * com `expo-notifications`. Isso cobre o caso real: o usuario registra um
 * servico hoje e e lembrado meses depois, mesmo sem abrir o app no periodo.
 *
 * Como funciona o agendamento:
 *
 * - A regra de QUANDO avisar e pura e mora em `domain/notificationSchedule`.
 *   Este arquivo cuida so de conversar com o sistema operacional.
 * - Antes de reagendar, tudo que estava agendado e cancelado. Assim o usuario
 *   nunca recebe um aviso de algo que ja foi feito.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Lembrete, Veiculo } from '../domain/models';
import { calcularDisparo, montarTexto } from '../domain/notificationSchedule';
import { readJson, storageKeys, writeJson } from '../data/storage';

/** Canal do Android. Sem ele, a notificacao chega sem som nem prioridade. */
const CANAL_ID = 'manutencao';

/**
 * Notificacao agendada so existe no celular. No navegador, varias funcoes do
 * expo-notifications nao estao implementadas e lancam erro ao ser chamadas —
 * foi o que derrubou a versao web na abertura. Aqui o servico inteiro vira
 * "indisponivel" no navegador: devolve sem permissao e sem agendamento, e o
 * resto do app segue normal.
 */
export const notificacoesDisponiveis = Platform.OS !== 'web';

/** Controla como a notificacao aparece com o app aberto. */
if (notificacoesDisponiveis) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export interface AgendamentoRegistrado {
  /** Id devolvido pelo expo-notifications, usado para cancelar. */
  id: string;
  /** Id do lembrete que gerou o agendamento. */
  lembreteId: string;
  /** Quando vai disparar, em ISO. */
  quando: string;
}

/* -------------------------------------------------------------------------- */
/* Permissao e canal                                                           */
/* -------------------------------------------------------------------------- */

/** Verifica a permissao sem exibir nenhum pedido ao usuario. */
export async function temPermissao(): Promise<boolean> {
  if (!notificacoesDisponiveis) return false;
  const atual = await Notifications.getPermissionsAsync();
  return atual.granted;
}

/**
 * Pede permissao se ainda nao houver.
 * Devolve `false` quando o usuario recusou — o app continua funcionando, so
 * sem avisos.
 *
 * So deve ser chamada a partir de uma acao do usuario que justifique o
 * pedido: ligar o interruptor nos ajustes, ou salvar a primeira manutencao.
 * Pedir permissao na abertura, antes de existir qualquer veiculo, e o jeito
 * mais rapido de ouvir "nao".
 */
export async function solicitarPermissao(): Promise<boolean> {
  if (!notificacoesDisponiveis) return false;
  const atual = await Notifications.getPermissionsAsync();

  if (atual.granted) return true;
  // No iOS, `canAskAgain` falso significa que so da para mudar nos ajustes.
  if (!atual.canAskAgain) return false;

  const pedida = await Notifications.requestPermissionsAsync();
  return pedida.granted;
}

/** Cria o canal do Android. Em iOS nao faz nada. */
export async function prepararCanal(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(CANAL_ID, {
    name: 'Manutenção',
    description: 'Avisos de serviços próximos do vencimento.',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200, 120, 200],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

async function cancelarTodos(): Promise<void> {
  if (notificacoesDisponiveis) {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
  await writeJson(storageKeys.notificacoes, []);
}

/**
 * Reagenda tudo a partir do estado atual dos lembretes.
 *
 * Chamado depois de qualquer mudanca que afete prazos: registrar uma
 * manutencao, atualizar o odometro, cadastrar ou remover um veiculo, e ao
 * abrir o app.
 *
 * Devolve quantas notificacoes ficaram agendadas.
 */
export async function reagendar(params: {
  lembretes: Lembrete[];
  veiculos: Veiculo[];
  ativado: boolean;
  antecedenciaDias: number;
  horaLembrete: number;
  /**
   * Quando `true`, exibe o pedido de permissao se ainda nao houver.
   * O reagendamento automatico passa `false`: so uma acao do usuario —
   * ligar o interruptor nos ajustes — justifica abrir o pedido.
   */
  solicitar?: boolean;
}): Promise<number> {
  const {
    lembretes,
    veiculos,
    ativado,
    antecedenciaDias,
    horaLembrete,
    solicitar = false,
  } = params;

  await cancelarTodos();
  if (!ativado) return 0;

  const permitido = solicitar
    ? await solicitarPermissao()
    : await temPermissao();
  if (!permitido) return 0;

  await prepararCanal();

  const porId = new Map(veiculos.map((v) => [v.id, v]));
  const registrados: AgendamentoRegistrado[] = [];

  for (const lembrete of lembretes) {
    // Em dia nao gera aviso: so vencido e atencao interessam.
    if (lembrete.status === 'em-dia') continue;

    const veiculo = porId.get(lembrete.veiculoId);
    if (!veiculo) continue;

    const disparo = calcularDisparo(lembrete, antecedenciaDias, horaLembrete);
    if (!disparo) continue;

    const { titulo, corpo } = montarTexto(lembrete, veiculo);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: titulo,
        body: corpo,
        // Permite abrir direto no veiculo certo ao tocar no aviso.
        data: { veiculoId: veiculo.id, lembreteId: lembrete.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: disparo,
        ...(Platform.OS === 'android' ? { channelId: CANAL_ID } : {}),
      },
    });

    registrados.push({
      id,
      lembreteId: lembrete.id,
      quando: disparo.toISOString(),
    });
  }

  await writeJson(storageKeys.notificacoes, registrados);
  return registrados.length;
}

/** O que esta agendado, para a tela de notificacoes mostrar. */
export async function listarAgendados(): Promise<AgendamentoRegistrado[]> {
  return readJson<AgendamentoRegistrado[]>(storageKeys.notificacoes, []);
}

/**
 * Dispara um aviso de teste em poucos segundos.
 * Serve para o usuario conferir que a permissao esta mesmo concedida.
 */
export async function enviarTeste(): Promise<boolean> {
  const permitido = await solicitarPermissao();
  if (!permitido) return false;

  await prepararCanal();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Notificações ativas',
      body: 'É assim que os avisos de manutenção vão chegar.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      ...(Platform.OS === 'android' ? { channelId: CANAL_ID } : {}),
    },
  });

  return true;
}

export { calcularDisparo, montarTexto };

export const notificationService = {
  disponivel: notificacoesDisponiveis,
  temPermissao,
  solicitarPermissao,
  prepararCanal,
  reagendar,
  listarAgendados,
  enviarTeste,
  calcularDisparo,
  montarTexto,
  cancelarTodos,
};
