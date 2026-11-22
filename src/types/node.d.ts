/**
 * Tipos do Node para os testes (`node:test`, `node:assert`) e para os scripts
 * de `scripts/`.
 *
 * O tsconfig base do Expo restringe quais pacotes `@types/*` entram na
 * checagem, então o `@types/node` instalado não era carregado sozinho. Esta
 * referência o inclui sem sobrescrever a lista do Expo — sobrescrevê-la no
 * tsconfig.json tiraria de cena os tipos que o próprio Expo precisa.
 *
 * Os timers do app usam `ReturnType<typeof setTimeout>`, que funciona tanto
 * com os tipos do Node quanto com os do React Native.
 */
/// <reference types="node" />
