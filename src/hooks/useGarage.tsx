/**
 * Estado compartilhado da garagem.
 *
 * Um unico contexto guarda veiculos e manutencoes. As telas leem daqui e
 * chamam as acoes; nenhuma tela fala com o repositorio direto.
 *
 * Por que contexto e nao uma biblioteca de estado: sao duas colecoes e meia
 * duzia de acoes. Redux ou Zustand resolveriam o mesmo com mais arquivos e
 * mais uma dependencia no bundle.
 *
 * Os lembretes sao derivados com useMemo a partir de veiculos, manutencoes e
 * da data de hoje — nunca guardados em estado, para nao existir a
 * possibilidade de ficarem defasados em relacao ao odometro.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { garageRepository } from '../data/garageRepository';
import { preferencesRepository } from '../data/preferencesRepository';
import { ensureSchema } from '../data/storage';
import {
  calcularLembretes,
  calcularTodosLembretes,
  contarPorStatus,
} from '../domain/reminders';
import type {
  Lembrete,
  Manutencao,
  NovaManutencao,
  NovoVeiculo,
  StatusLembrete,
  Veiculo,
} from '../domain/models';
import { notificationService } from '../services/notificationService';
import { today } from '../utils/date';

interface GarageContextValue {
  veiculos: Veiculo[];
  manutencoes: Manutencao[];
  lembretes: Lembrete[];
  contagem: Record<StatusLembrete, number>;
  carregando: boolean;
  erro?: string;

  recarregar: () => Promise<void>;
  criarVeiculo: (dados: NovoVeiculo) => Promise<Veiculo>;
  atualizarVeiculo: (id: string, patch: Partial<NovoVeiculo>) => Promise<void>;
  atualizarKm: (id: string, km: number) => Promise<void>;
  /** Baixa o odometro para desfazer erro de digitacao. */
  corrigirKm: (id: string, km: number) => Promise<void>;
  /** Maior km ja registrado no historico do veiculo. */
  kmMinimoPermitido: (veiculoId: string) => number;
  removerVeiculo: (id: string) => Promise<void>;

  criarManutencao: (dados: NovaManutencao) => Promise<Manutencao>;
  atualizarManutencao: (
    id: string,
    patch: Partial<NovaManutencao>,
  ) => Promise<void>;
  removerManutencao: (id: string) => Promise<void>;

  /** Helpers de leitura, para as telas nao refazerem filtros. */
  veiculoPorId: (id: string) => Veiculo | undefined;
  manutencoesDoVeiculo: (veiculoId: string) => Manutencao[];
  lembretesDoVeiculo: (veiculoId: string) => Lembrete[];
}

const GarageContext = createContext<GarageContextValue | null>(null);

export function GarageProvider({ children }: { children: ReactNode }) {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | undefined>();

  // Fixa a data no carregamento para que todos os calculos de uma sessao usem
  // a mesma referencia, em vez de cada render chamar `new Date()`.
  const hoje = useMemo(() => today(), []);

  const recarregar = useCallback(async () => {
    try {
      setErro(undefined);
      const [v, m] = await Promise.all([
        garageRepository.listarVeiculos(),
        garageRepository.listarManutencoes(),
      ]);
      setVeiculos(v);
      setManutencoes(m);
    } catch {
      setErro('Nao foi possivel carregar seus dados. Feche e abra o app.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void ensureSchema().then(recarregar);
  }, [recarregar]);

  const lembretes = useMemo(
    () => calcularTodosLembretes(veiculos, manutencoes, hoje),
    [veiculos, manutencoes, hoje],
  );

  const contagem = useMemo(() => contarPorStatus(lembretes), [lembretes]);

  /**
   * Reagenda as notificacoes sempre que os prazos mudam.
   *
   * Fica num efeito, e nao dentro de cada acao, porque qualquer caminho que
   * altere veiculos ou manutencoes precisa do mesmo reagendamento — inclusive
   * a carga inicial, quando o app abre depois de meses fechado.
   */
  useEffect(() => {
    if (carregando) return;

    let ativo = true;
    void (async () => {
      try {
        const prefs = await preferencesRepository.get();
        if (!ativo) return;
        await notificationService.reagendar({
          lembretes,
          veiculos,
          ativado: prefs.notificacoes,
          antecedenciaDias: prefs.antecedenciaDias,
          horaLembrete: prefs.horaLembrete,
        });
      } catch {
        // Falhar ao agendar nao pode impedir o uso do app. O usuario ve o
        // estado real na tela de notificacoes.
      }
    })();

    return () => {
      ativo = false;
    };
  }, [lembretes, veiculos, carregando]);

  /* ---------------------------------------------------------------------- */
  /* Acoes                                                                   */
  /* ---------------------------------------------------------------------- */

  const criarVeiculo = useCallback(
    async (dados: NovoVeiculo) => {
      const veiculo = await garageRepository.criarVeiculo(dados);
      await recarregar();
      return veiculo;
    },
    [recarregar],
  );

  const atualizarVeiculo = useCallback(
    async (id: string, patch: Partial<NovoVeiculo>) => {
      await garageRepository.atualizarVeiculo(id, patch);
      await recarregar();
    },
    [recarregar],
  );

  const atualizarKm = useCallback(
    async (id: string, km: number) => {
      await garageRepository.atualizarKm(id, km);
      await recarregar();
    },
    [recarregar],
  );

  const corrigirKm = useCallback(
    async (id: string, km: number) => {
      await garageRepository.corrigirKm(id, km);
      await recarregar();
    },
    [recarregar],
  );

  /**
   * Calculado do estado ja em memoria, e nao do disco: a folha de correcao
   * precisa do valor para montar a mensagem antes de o usuario confirmar.
   */
  const kmMinimoPermitido = useCallback(
    (veiculoId: string) => {
      const doVeiculo = manutencoes.filter((m) => m.veiculoId === veiculoId);
      if (doVeiculo.length === 0) return 0;
      return Math.max(...doVeiculo.map((m) => m.km));
    },
    [manutencoes],
  );

  const removerVeiculo = useCallback(
    async (id: string) => {
      await garageRepository.removerVeiculo(id);
      await recarregar();
    },
    [recarregar],
  );

  const criarManutencao = useCallback(
    async (dados: NovaManutencao) => {
      const manutencao = await garageRepository.criarManutencao(dados);
      await recarregar();
      return manutencao;
    },
    [recarregar],
  );

  const atualizarManutencao = useCallback(
    async (id: string, patch: Partial<NovaManutencao>) => {
      await garageRepository.atualizarManutencao(id, patch);
      await recarregar();
    },
    [recarregar],
  );

  const removerManutencao = useCallback(
    async (id: string) => {
      await garageRepository.removerManutencao(id);
      await recarregar();
    },
    [recarregar],
  );

  /* ---------------------------------------------------------------------- */
  /* Leitura                                                                 */
  /* ---------------------------------------------------------------------- */

  const veiculoPorId = useCallback(
    (id: string) => veiculos.find((v) => v.id === id),
    [veiculos],
  );

  const manutencoesDoVeiculo = useCallback(
    (veiculoId: string) => manutencoes.filter((m) => m.veiculoId === veiculoId),
    [manutencoes],
  );

  const lembretesDoVeiculo = useCallback(
    (veiculoId: string) => {
      const veiculo = veiculos.find((v) => v.id === veiculoId);
      if (!veiculo) return [];
      return calcularLembretes(veiculo, manutencoes, hoje);
    },
    [veiculos, manutencoes, hoje],
  );

  const value = useMemo<GarageContextValue>(
    () => ({
      veiculos,
      manutencoes,
      lembretes,
      contagem,
      carregando,
      erro,
      recarregar,
      criarVeiculo,
      atualizarVeiculo,
      atualizarKm,
      corrigirKm,
      kmMinimoPermitido,
      removerVeiculo,
      criarManutencao,
      atualizarManutencao,
      removerManutencao,
      veiculoPorId,
      manutencoesDoVeiculo,
      lembretesDoVeiculo,
    }),
    [
      veiculos,
      manutencoes,
      lembretes,
      contagem,
      carregando,
      erro,
      recarregar,
      criarVeiculo,
      atualizarVeiculo,
      atualizarKm,
      corrigirKm,
      kmMinimoPermitido,
      removerVeiculo,
      criarManutencao,
      atualizarManutencao,
      removerManutencao,
      veiculoPorId,
      manutencoesDoVeiculo,
      lembretesDoVeiculo,
    ],
  );

  return (
    <GarageContext.Provider value={value}>{children}</GarageContext.Provider>
  );
}

export function useGarage(): GarageContextValue {
  const ctx = useContext(GarageContext);
  if (!ctx) {
    throw new Error('useGarage precisa estar dentro de <GarageProvider>.');
  }
  return ctx;
}
