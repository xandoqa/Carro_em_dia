/**
 * Avisos e confirmações que funcionam no celular e no navegador.
 *
 * O `Alert.alert` do React Native não faz nada no navegador: no
 * react-native-web ele existe, mas está vazio. Avisos simplesmente não
 * apareciam, e — pior — ações que dependiam de um botão do Alert para
 * confirmar (apagar todos os dados, remover veículo, excluir registro) ficavam
 * impossíveis de executar na versão web.
 *
 * No celular continua sendo o Alert nativo. No navegador, usa as caixas do
 * próprio navegador (`alert` e `confirm`), que são feias mas funcionam e
 * bloqueiam até a resposta, como o Alert.
 */

import { Alert, Platform } from 'react-native';

/** O que precisamos do `window` do navegador, sem depender da lib DOM. */
interface CaixasDoNavegador {
  alert: (mensagem: string) => void;
  confirm: (mensagem: string) => boolean;
}

const navegador = (): CaixasDoNavegador =>
  globalThis as unknown as CaixasDoNavegador;

function juntar(titulo: string, mensagem?: string): string {
  return mensagem ? `${titulo}\n\n${mensagem}` : titulo;
}

/** Aviso com um botão de OK. */
export function avisar(titulo: string, mensagem?: string): void {
  if (Platform.OS === 'web') {
    navegador().alert(juntar(titulo, mensagem));
    return;
  }
  Alert.alert(titulo, mensagem);
}

/** Pergunta com Cancelar e um botão de confirmação. */
export function confirmar(opcoes: {
  titulo: string;
  mensagem: string;
  /** Texto do botão que confirma, como "Remover". */
  botao: string;
  /** Pinta o botão de vermelho no iOS. */
  destrutivo?: boolean;
  aoConfirmar: () => void | Promise<void>;
}): void {
  const { titulo, mensagem, botao, destrutivo = false, aoConfirmar } = opcoes;

  if (Platform.OS === 'web') {
    if (navegador().confirm(juntar(titulo, mensagem))) void aoConfirmar();
    return;
  }

  Alert.alert(titulo, mensagem, [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: botao,
      style: destrutivo ? 'destructive' : 'default',
      onPress: () => void aoConfirmar(),
    },
  ]);
}
