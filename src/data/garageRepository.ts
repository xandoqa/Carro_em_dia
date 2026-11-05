/**
 * Repositorio de veiculos e manutencoes.
 *
 * Guarda tudo localmente no AsyncStorage. A interface e assincrona de
 * proposito: trocar esta implementacao por chamadas a um backend (como a
 * documentacao do projeto prevê) nao exige mexer em nenhuma tela.
 *
 * Regra de negocio que vive aqui, e nao na tela: registrar uma manutencao com
 * quilometragem maior que a atual atualiza o odometro do veiculo. E o que a
 * documentacao descreve e evita que o usuario precise digitar o km duas vezes.
 */

import {
  type Manutencao,
  type NovaManutencao,
  type NovoVeiculo,
  type Veiculo,
} from '../domain/models';
import { kmMinimoPermitido as minimoDoHistorico } from '../domain/odometer';
import { normalizePlaca } from '../utils/format';
import { generateId, readJson, storageKeys, writeJson } from './storage';

function agora(): string {
  return new Date().toISOString();
}

/* -------------------------------------------------------------------------- */
/* Veiculos                                                                    */
/* -------------------------------------------------------------------------- */

async function listarVeiculos(): Promise<Veiculo[]> {
  const veiculos = await readJson<Veiculo[]>(storageKeys.veiculos, []);
  // Mais recente primeiro, para que um veiculo recem-cadastrado apareca no topo.
  return [...veiculos].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

async function salvarVeiculos(veiculos: Veiculo[]): Promise<void> {
  await writeJson(storageKeys.veiculos, veiculos);
}

async function obterVeiculo(id: string): Promise<Veiculo | undefined> {
  const veiculos = await listarVeiculos();
  return veiculos.find((v) => v.id === id);
}

async function criarVeiculo(dados: NovoVeiculo): Promise<Veiculo> {
  const veiculos = await listarVeiculos();
  const placa = normalizePlaca(dados.placa);

  if (veiculos.some((v) => v.placa === placa)) {
    throw new Error('Ja existe um veiculo com essa placa.');
  }

  const veiculo: Veiculo = {
    ...dados,
    placa,
    id: generateId('vei'),
    criadoEm: agora(),
    atualizadoEm: agora(),
  };

  await salvarVeiculos([...veiculos, veiculo]);
  return veiculo;
}

async function atualizarVeiculo(
  id: string,
  patch: Partial<NovoVeiculo>,
): Promise<Veiculo> {
  const veiculos = await listarVeiculos();
  const indice = veiculos.findIndex((v) => v.id === id);
  if (indice === -1) {
    throw new Error('Veiculo nao encontrado.');
  }

  const placa = patch.placa ? normalizePlaca(patch.placa) : undefined;
  if (placa && veiculos.some((v) => v.placa === placa && v.id !== id)) {
    throw new Error('Ja existe um veiculo com essa placa.');
  }

  const atualizado: Veiculo = {
    ...veiculos[indice],
    ...patch,
    ...(placa ? { placa } : {}),
    atualizadoEm: agora(),
  };

  veiculos[indice] = atualizado;
  await salvarVeiculos(veiculos);
  return atualizado;
}

/**
 * Atualiza o odometro.
 * Recusa valor menor que o atual: odometro nao anda para tras, e aceitar isso
 * por engano bagunçaria todos os lembretes do veiculo.
 *
 * Para desfazer um erro de digitacao, use `corrigirKm`.
 */
async function atualizarKm(id: string, km: number): Promise<Veiculo> {
  const veiculo = await obterVeiculo(id);
  if (!veiculo) throw new Error('Veiculo nao encontrado.');

  if (km < veiculo.kmAtual) {
    throw new Error(
      `A quilometragem nao pode ser menor que a atual (${veiculo.kmAtual.toLocaleString('pt-BR')} km).`,
    );
  }

  return atualizarVeiculo(id, { kmAtual: km });
}

/**
 * Menor odometro que ainda faz sentido para o veiculo: o maior km ja
 * registrado numa manutencao. Nao da para ter rodado menos que o ultimo
 * servico feito.
 */
async function kmMinimoPermitido(veiculoId: string): Promise<number> {
  const historico = await listarManutencoes(veiculoId);
  return minimoDoHistorico(historico, veiculoId);
}

/**
 * Corrige o odometro para baixo, desfazendo um erro de digitacao.
 *
 * Existe porque `atualizarKm` so aceita valores maiores, e registrar uma
 * manutencao com km maior sobe o odometro automaticamente. Sem esta funcao,
 * quem digitasse 1.145.000 em vez de 114.500 ficaria preso: o valor inflado
 * nao poderia ser desfeito por nenhum caminho do app.
 *
 * O piso e o maior km do historico, porque abaixo disso o dado seria
 * incoerente com os servicos ja registrados.
 */
async function corrigirKm(id: string, km: number): Promise<Veiculo> {
  const veiculo = await obterVeiculo(id);
  if (!veiculo) throw new Error('Veiculo nao encontrado.');

  if (km < 0) {
    throw new Error('A quilometragem nao pode ser negativa.');
  }

  const minimo = await kmMinimoPermitido(id);
  if (km < minimo) {
    throw new Error(
      `Ha uma manutencao registrada em ${minimo.toLocaleString('pt-BR')} km. ` +
        'Corrija ou exclua esse registro antes de baixar o odometro.',
    );
  }

  return atualizarVeiculo(id, { kmAtual: km });
}

/** Remove o veiculo e, junto, todo o historico dele. */
async function removerVeiculo(id: string): Promise<void> {
  const [veiculos, manutencoes] = await Promise.all([
    listarVeiculos(),
    listarManutencoes(),
  ]);

  await Promise.all([
    salvarVeiculos(veiculos.filter((v) => v.id !== id)),
    salvarManutencoes(manutencoes.filter((m) => m.veiculoId !== id)),
  ]);
}

/* -------------------------------------------------------------------------- */
/* Manutencoes                                                                 */
/* -------------------------------------------------------------------------- */

async function listarManutencoes(veiculoId?: string): Promise<Manutencao[]> {
  const todas = await readJson<Manutencao[]>(storageKeys.manutencoes, []);
  const filtradas = veiculoId
    ? todas.filter((m) => m.veiculoId === veiculoId)
    : todas;

  // Mais recente primeiro; empate de data resolve pelo maior km.
  return [...filtradas].sort((a, b) => {
    if (a.data !== b.data) return b.data.localeCompare(a.data);
    return b.km - a.km;
  });
}

async function salvarManutencoes(manutencoes: Manutencao[]): Promise<void> {
  await writeJson(storageKeys.manutencoes, manutencoes);
}

async function obterManutencao(id: string): Promise<Manutencao | undefined> {
  const todas = await listarManutencoes();
  return todas.find((m) => m.id === id);
}

/**
 * Registra um servico.
 *
 * Alem de gravar, sincroniza o odometro do veiculo quando o km informado e
 * maior que o conhecido — e o que mantem os lembretes coerentes sem pedir o
 * mesmo numero duas vezes ao usuario.
 */
async function criarManutencao(dados: NovaManutencao): Promise<Manutencao> {
  const manutencao: Manutencao = {
    ...dados,
    id: generateId('man'),
    criadoEm: agora(),
  };

  const todas = await readJson<Manutencao[]>(storageKeys.manutencoes, []);
  await salvarManutencoes([...todas, manutencao]);

  const veiculo = await obterVeiculo(dados.veiculoId);
  if (veiculo && dados.km > veiculo.kmAtual) {
    await atualizarVeiculo(veiculo.id, { kmAtual: dados.km });
  }

  return manutencao;
}

async function atualizarManutencao(
  id: string,
  patch: Partial<NovaManutencao>,
): Promise<Manutencao> {
  const todas = await readJson<Manutencao[]>(storageKeys.manutencoes, []);
  const indice = todas.findIndex((m) => m.id === id);
  if (indice === -1) {
    throw new Error('Manutencao nao encontrada.');
  }

  const atualizada: Manutencao = { ...todas[indice], ...patch };
  todas[indice] = atualizada;
  await salvarManutencoes(todas);

  const veiculo = await obterVeiculo(atualizada.veiculoId);
  if (veiculo && atualizada.km > veiculo.kmAtual) {
    await atualizarVeiculo(veiculo.id, { kmAtual: atualizada.km });
  }

  return atualizada;
}

async function removerManutencao(id: string): Promise<void> {
  const todas = await readJson<Manutencao[]>(storageKeys.manutencoes, []);
  await salvarManutencoes(todas.filter((m) => m.id !== id));
}

/* -------------------------------------------------------------------------- */

export const garageRepository = {
  listarVeiculos,
  obterVeiculo,
  criarVeiculo,
  atualizarVeiculo,
  atualizarKm,
  corrigirKm,
  kmMinimoPermitido,
  removerVeiculo,

  listarManutencoes,
  obterManutencao,
  criarManutencao,
  atualizarManutencao,
  removerManutencao,
};
