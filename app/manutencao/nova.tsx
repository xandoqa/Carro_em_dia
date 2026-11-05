/**
 * Registrar manutencao.
 *
 * Chega daqui de tres lugares: do painel do veiculo, de um alerta
 * ("registrar como feito", que ja traz o tipo preenchido) e do atalho geral.
 *
 * A tela e fina de proposito: o formulario mora em `MaintenanceForm`, que e o
 * mesmo usado na edicao.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, Header, Screen } from '../../src/components/base/Screen';
import { MaintenanceForm } from '../../src/components/domain/MaintenanceForm';
import type { TipoManutencaoId } from '../../src/domain/models';
import { useGarage } from '../../src/hooks/useGarage';

export default function NovaManutencaoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    veiculoId?: string;
    tipo?: string;
  }>();

  const { veiculos } = useGarage();

  if (veiculos.length === 0) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <Screen>
          <Header title="Registrar manutencao" back />
          <EmptyState
            title="Cadastre um veiculo primeiro"
            description="Toda manutencao pertence a um veiculo. Cadastre o seu para comecar a registrar os servicos."
            actionLabel="Cadastrar veiculo"
            onAction={() => router.replace('/veiculo/novo')}
          />
        </Screen>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Screen>
        <Header title="Registrar manutencao" back />
        <MaintenanceForm
          veiculoIdInicial={params.veiculoId}
          tipoInicial={params.tipo as TipoManutencaoId | undefined}
          onSalvo={() => router.back()}
          onCancelar={() => router.back()}
        />
      </Screen>
    </View>
  );
}
