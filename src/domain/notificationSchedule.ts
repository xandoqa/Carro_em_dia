/**
 * Quando disparar o aviso de um lembrete.
 *
 * Mora no dominio, e nao junto do `notificationService`, porque e regra pura:
 * assim pode ser testada sem carregar o `expo-notifications`. O servico fica
 * responsavel so por conversar com o sistema operacional.
 */

import type { Lembrete, Veiculo } from './models';
import { parseIsoDate } from '../utils/date';
import { formatKm } from '../utils/format';

/**
 * Proxima ocorrencia de `hora` a partir de agora.
 * Se a hora de hoje ja passou, cai para amanha.
 */
function proximaHora(hora: number, agora: Date): Date {
  const alvo = new Date(agora);
  alvo.setHours(hora, 0, 0, 0);
  if (alvo.getTime() <= agora.getTime()) {
    alvo.setDate(alvo.getDate() + 1);
  }
  return alvo;
}

/**
 * Momento do disparo do aviso.
 *
 * Tres casos:
 *
 * - Lembrete vencido: avisa na proxima ocorrencia da hora escolhida. Nao da
 *   para agendar no passado, e deixar um servico vencido sem aviso nenhum
 *   seria falhar justamente no que o app promete.
 * - Lembrete com data prevista: `antecedenciaDias` antes dela, na hora
 *   escolhida. Se essa janela ja passou mas o prazo ainda nao venceu, cai
 *   para a proxima hora cheia em vez de perder o aviso.
 * - Sem data prevista e dentro do prazo: `null`. Esses vencem so por
 *   quilometragem, e nao ha data para marcar; aparecem na aba Alertas quando
 *   o odometro chega perto.
 */
export function calcularDisparo(
  lembrete: Lembrete,
  antecedenciaDias: number,
  horaLembrete: number,
  agora: Date = new Date(),
): Date | null {
  if (lembrete.status === 'vencido') {
    return proximaHora(horaLembrete, agora);
  }

  if (!lembrete.dataPrevista) return null;

  const prevista = parseIsoDate(lembrete.dataPrevista);
  const disparo = new Date(prevista);
  disparo.setDate(disparo.getDate() - antecedenciaDias);
  disparo.setHours(horaLembrete, 0, 0, 0);

  if (disparo.getTime() <= agora.getTime()) {
    return proximaHora(horaLembrete, agora);
  }

  return disparo;
}

/** Titulo e corpo do aviso. Texto direto, sem alarme desnecessario. */
export function montarTexto(
  lembrete: Lembrete,
  veiculo: Veiculo,
): { titulo: string; corpo: string } {
  const titulo =
    lembrete.status === 'vencido'
      ? `${lembrete.nome} venceu`
      : `${lembrete.nome} esta chegando`;

  const partes: string[] = [veiculo.apelido];

  if (lembrete.kmPrevisto !== undefined) {
    partes.push(`previsto para ${formatKm(lembrete.kmPrevisto)} km`);
  }
  if (lembrete.diasRestantes !== undefined && lembrete.diasRestantes >= 0) {
    partes.push(
      lembrete.diasRestantes === 0
        ? 'vence hoje'
        : `faltam ${lembrete.diasRestantes} ${lembrete.diasRestantes === 1 ? 'dia' : 'dias'}`,
    );
  }

  return { titulo, corpo: partes.join(' — ') };
}
