/**
 * Carga dos dados de demonstracao no armazenamento local.
 *
 * O roteiro em si mora em `demoRoteiros`, que nao depende de disco. Aqui so
 * acontece a gravacao.
 */

import { garageRepository } from './garageRepository';
import { montarRoteiros } from './demoRoteiros';

/**
 * Cria os veiculos e manutencoes de exemplo.
 * Devolve quantos registros foram criados.
 */
export async function carregarDadosDemo(): Promise<{
  veiculos: number;
  manutencoes: number;
}> {
  const roteiros = montarRoteiros();
  let totalManutencoes = 0;

  for (const roteiro of roteiros) {
    const veiculo = await garageRepository.criarVeiculo(roteiro.veiculo);

    for (const manutencao of roteiro.manutencoes) {
      await garageRepository.criarManutencao({
        ...manutencao,
        veiculoId: veiculo.id,
      });
      totalManutencoes += 1;
    }

    // Criar manutencoes sobe o odometro para o maior km registrado. Repor o
    // valor do roteiro mantem os lembretes no estado planejado.
    await garageRepository.atualizarVeiculo(veiculo.id, {
      kmAtual: roteiro.veiculo.kmAtual,
    });
  }

  return { veiculos: roteiros.length, manutencoes: totalManutencoes };
}

export { montarRoteiros } from './demoRoteiros';
