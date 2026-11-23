/**
 * Editar uma manutencao registrada.
 *
 * O protótipo previa "Editar ou excluir" no detalhe do historico; esta e a
 * parte de editar. Usa o mesmo formulario do registro novo, para as
 * validacoes nao divergirem entre os dois caminhos.
 *
 * Salvar aqui recalcula os lembretes do veiculo, porque data, quilometragem e
 * intervalo da proxima troca sao exatamente as entradas desse calculo.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  EmptyState,
  Header,
  Loading,
  Screen,
} from '../../src/components/base/Screen';
import { MaintenanceForm } from '../../src/components/domain/MaintenanceForm';
import { tiposManutencao } from '../../src/domain/models';
import { useGarage } from '../../src/hooks/useGarage';

export default function EditarManutencaoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { manutencoes, carregando } = useGarage();
  const manutencao = manutencoes.find((m) => m.id === id);

  if (carregando) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <Screen>
          <Header title="Editar manutenção" back />
          <Loading />
        </Screen>
      </View>
    );
  }

  if (!manutencao) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <Screen>
          <Header title="Editar manutenção" back />
          <EmptyState
            title="Registro não encontrado"
            description="Ele pode ter sido excluído. Volte ao histórico para ver a lista atual."
            actionLabel="Voltar"
            onAction={() => router.back()}
          />
        </Screen>
      </View>
    );
  }

  const nome =
    manutencao.tipo === 'outro' && manutencao.descricao
      ? manutencao.descricao
      : (tiposManutencao[manutencao.tipo]?.nome ?? 'Serviço');

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Screen avoidKeyboard>
        <Header title="Editar manutenção" subtitle={nome} back />
        <MaintenanceForm
          manutencao={manutencao}
          onSalvo={() => router.back()}
          onCancelar={() => router.back()}
        />
      </Screen>
    </View>
  );
}
