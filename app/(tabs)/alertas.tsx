/**
 * Alertas e lembretes de todos os veiculos.
 *
 * A lista ja chega ordenada por urgencia pelo dominio. Aqui so agrupamos por
 * estado, com um filtro no topo, porque "o que esta vencido" e uma pergunta
 * diferente de "o que vence em breve".
 */

import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Segmented } from '../../src/components/base/Field';
import { EmptyState, Header, Loading, Screen } from '../../src/components/base/Screen';
import { SectionHeader } from '../../src/components/base/Surfaces';
import { AlertCard } from '../../src/components/domain/AlertCard';
import { useGarage } from '../../src/hooks/useGarage';
import { BrandMark } from '../../src/icons/ServiceIcon';
import { useTheme } from '../../src/theme/ThemeProvider';
import type { StatusLembrete } from '../../src/domain/models';

type Filtro = 'pendentes' | 'todos';

export default function AlertasScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lembretes, veiculos, contagem, carregando, veiculoPorId, recarregar } =
    useGarage();

  const [filtro, setFiltro] = useState<Filtro>('pendentes');

  const visiveis = useMemo(
    () =>
      filtro === 'pendentes'
        ? lembretes.filter((l) => l.status !== 'em-dia')
        : lembretes,
    [lembretes, filtro],
  );

  /** Agrupa preservando a ordem de urgencia que o dominio ja definiu. */
  const grupos = useMemo(() => {
    const ordem: StatusLembrete[] = ['vencido', 'atencao', 'em-dia'];
    const titulos: Record<StatusLembrete, string> = {
      vencido: 'Vencidos',
      atencao: 'Chegando no prazo',
      'em-dia': 'Em dia',
    };

    return ordem
      .map((status) => ({
        status,
        titulo: titulos[status],
        itens: visiveis.filter((l) => l.status === status),
      }))
      .filter((g) => g.itens.length > 0);
  }, [visiveis]);

  const pendentes = contagem.vencido + contagem.atencao;

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Screen onRefresh={recarregar}>
        <Header
          title="Alertas"
          subtitle={
            pendentes > 0
              ? `${pendentes} ${pendentes === 1 ? 'servico pendente' : 'servicos pendentes'}`
              : 'Nada pendente'
          }
        />

        {carregando ? (
          <Loading />
        ) : lembretes.length === 0 ? (
          <EmptyState
            icon={
              <BrandMark size={56} color={theme.colors.line} accent={theme.colors.brand} />
            }
            title="Ainda nao ha o que lembrar"
            description={
              veiculos.length === 0
                ? 'Cadastre um veiculo e registre a primeira manutencao. A partir dai o app calcula os proximos prazos.'
                : 'Registre uma manutencao para o app calcular quando o proximo servico vence.'
            }
            actionLabel={
              veiculos.length === 0 ? 'Cadastrar veiculo' : 'Registrar manutencao'
            }
            onAction={() =>
              router.push(
                veiculos.length === 0 ? '/veiculo/novo' : '/manutencao/nova',
              )
            }
          />
        ) : (
          <>
            <Segmented<Filtro>
              options={[
                { value: 'pendentes', label: `Pendentes (${pendentes})` },
                { value: 'todos', label: `Todos (${lembretes.length})` },
              ]}
              value={filtro}
              onChange={setFiltro}
              style={{ marginBottom: theme.spacing.lg }}
            />

            {visiveis.length === 0 ? (
              <EmptyState
                title="Tudo em dia"
                description="Nenhum servico esta vencido ou perto do prazo. Veja a lista completa para conferir os proximos."
                actionLabel="Ver todos"
                onAction={() => setFiltro('todos')}
              />
            ) : (
              grupos.map((grupo) => (
                <View key={grupo.status} style={{ marginBottom: theme.spacing.xl }}>
                  <SectionHeader title={`${grupo.titulo} · ${grupo.itens.length}`} />
                  <View style={{ gap: theme.spacing.md }}>
                    {grupo.itens.map((lembrete) => {
                      const veiculo = veiculoPorId(lembrete.veiculoId);
                      if (!veiculo) return null;
                      return (
                        <AlertCard
                          key={lembrete.id}
                          lembrete={lembrete}
                          veiculo={veiculo}
                          onRegistrar={() =>
                            router.push({
                              pathname: '/manutencao/nova',
                              params: {
                                veiculoId: veiculo.id,
                                tipo: lembrete.tipo,
                              },
                            })
                          }
                        />
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </Screen>
    </View>
  );
}
