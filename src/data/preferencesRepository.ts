/**
 * Preferencias do usuario: tema, notificacoes e estado de onboarding.
 *
 * Fica separado dos repositorios de dominio porque e lido muito cedo, antes
 * mesmo da primeira tela montar, e nao deve depender de mais nada.
 */

import { readJson, storageKeys, writeJson } from './storage';

export interface Preferencias {
  /** Id de tema ou 'system'. Validado em quem le, nao aqui. */
  tema: string;
  /** Notificacoes de manutencao ligadas. */
  notificacoes: boolean;
  /** Hora do lembrete diario, de 0 a 23. */
  horaLembrete: number;
  /** Quantos dias antes do vencimento comecar a avisar. */
  antecedenciaDias: number;
  /** Se o usuario ja passou pela apresentacao inicial. */
  onboardingConcluido: boolean;
}

export const preferenciasPadrao: Preferencias = {
  tema: 'system',
  notificacoes: true,
  horaLembrete: 9,
  antecedenciaDias: 7,
  onboardingConcluido: false,
};

async function ler(): Promise<Preferencias> {
  const salvas = await readJson<Partial<Preferencias>>(
    storageKeys.preferencias,
    {},
  );
  // Mescla com o padrao para que uma preferencia nova nao quebre instalacoes
  // antigas que ainda nao a gravaram.
  return { ...preferenciasPadrao, ...salvas };
}

async function gravar(patch: Partial<Preferencias>): Promise<Preferencias> {
  const atuais = await ler();
  const proximas = { ...atuais, ...patch };
  await writeJson(storageKeys.preferencias, proximas);
  return proximas;
}

export const preferencesRepository = {
  get: ler,
  update: gravar,

  async getThemePreference(): Promise<string> {
    return (await ler()).tema;
  },

  async setThemePreference(tema: string): Promise<void> {
    await gravar({ tema });
  },

  async getNotificacoes(): Promise<boolean> {
    return (await ler()).notificacoes;
  },

  async setNotificacoes(notificacoes: boolean): Promise<void> {
    await gravar({ notificacoes });
  },
};
