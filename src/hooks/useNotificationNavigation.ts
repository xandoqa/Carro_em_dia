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

interface DadosNotificacao {
  veiculoId?: string;
  lembreteId?: string;
}

export function useNotificationNavigation() {
  const router = useRouter();

  useEffect(() => {
    // Caso 1: o app estava aberto ou em segundo plano.
    const inscricao = Notifications.addNotificationResponseReceivedListener(
      (resposta: { notification: { request: { content: { data: unknown } } } }) => {
        navegar(resposta.notification.request.content.data);
      },
    );

    // Caso 2: o app estava fechado e foi aberto pela notificação. O evento
    // acima já passou, então a última resposta é consultada na montagem.
    let ativo = true;
    void Notifications.getLastNotificationResponseAsync?.().then(
      (ultima: { notification: { request: { content: { data: unknown } } } } | null) => {
        if (ativo && ultima) {
          navegar(ultima.notification.request.content.data);
        }
      },
    );

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
