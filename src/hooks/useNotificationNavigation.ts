/**
 * Abre o veículo certo quando o usuário toca numa notificação.
 *
 * O agendamento já guardava `veiculoId` nos dados do aviso, mas ninguém lia:
 * tocar no lembrete abria o app na garagem, e o usuário tinha que procurar
 * sozinho de qual veículo era o aviso. Uma notificação que não leva ao
 * assunto dela desperdiça o único toque que ela ganha.
 */

import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

interface DadosNotificacao {
  veiculoId?: string;
  lembreteId?: string;
}

export function useNotificationNavigation() {
  const router = useRouter();

  useEffect(() => {
    // No navegador nao ha notificacao para tocar, e o expo-notifications
    // lanca erro ao consultar a ultima resposta — foi o que derrubava a web.
    if (Platform.OS === 'web') return;

    // Caso 1: o app estava aberto ou em segundo plano.
    const inscricao = Notifications.addNotificationResponseReceivedListener(
      (resposta: unknown) => {
        navegar(dadosDaResposta(resposta));
      },
    );

    // Caso 2: o app estava fechado e foi aberto pela notificação. O evento
    // acima já passou, então a última resposta é consultada na montagem.
    let ativo = true;
    void Notifications.getLastNotificationResponseAsync?.().then(
      (ultima: unknown) => {
        if (ativo && ultima) navegar(dadosDaResposta(ultima));
      },
    );

    /**
     * Tira o `data` de dentro da resposta da notificação.
     *
     * O parâmetro é `unknown` de propósito. Descrever a forma exata do
     * `NotificationResponse` aqui amarra o código à versão do
     * expo-notificações instalada, e foi o que quebrou a checagem de tipos na
     * atualização para o SDK 58: a biblioteca passou a declarar `data` como
     * opcional, e a descrição escrita à mão exigia obrigatório.
     */
    function dadosDaResposta(resposta: unknown): unknown {
      if (!resposta || typeof resposta !== 'object') return undefined;
      const r = resposta as {
        notification?: { request?: { content?: { data?: unknown } } };
      };
      return r.notification?.request?.content?.data;
    }

    function navegar(dados: unknown) {
      const { veiculoId } = (dados ?? {}) as DadosNotificacao;
      if (!veiculoId) return;
      router.push(`/veiculo/${veiculoId}`);
    }

    return () => {
      ativo = false;
      inscricao.remove();
    };
  }, [router]);
}
