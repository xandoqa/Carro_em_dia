/**
 * Mantém uma folha inferior visível acima do teclado.
 *
 * As folhas do app (atualizar quilometragem, escolher marca e modelo) ficam
 * presas na base da tela, dentro de um Modal. No iPhone o teclado se sobrepõe
 * ao Modal e nada empurra a folha para cima: ao tocar em "Atualizar", o
 * teclado numérico abria por cima da folha inteira, e o campo onde se digita
 * ficava escondido atrás dele.
 *
 * Envolve o conteúdo do Modal. No iOS, acrescenta embaixo um espaço do
 * tamanho do teclado, e a folha sobe junto. No Android o sistema já
 * redimensiona a janela sozinho, então não faz nada — aplicar os dois faria
 * a folha subir o dobro.
 */

import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

export function AcimaDoTeclado({ children }: { children: ReactNode }) {
  return (
    <KeyboardAvoidingView
      style={styles.raiz}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1 },
});
