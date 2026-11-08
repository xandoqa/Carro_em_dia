/**
 * Editar um veículo cadastrado.
 *
 * Faltava: dava para cadastrar e remover, mas não para corrigir. Quem
 * digitasse o apelido ou a placa errado só tinha a saída de excluir o
 * veículo — o que apaga junto todo o histórico de manutenções. Uma letra
 * errada custava o registro inteiro.
 *
 * A quilometragem não é editada aqui. Ela tem regra própria (não anda para
 * trás, e corrigir exige confirmação), então continua na folha do painel,
 * em um lugar só.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../../src/components/base/Button';
import { useFeedback } from '../../../src/components/base/Feedback';
import { Field, Segmented } from '../../../src/components/base/Field';
import {
  PickerField,
  PickerSheet,
  type PickerItem,
} from '../../../src/components/base/PickerSheet';
import {
  EmptyState,
  Header,
  Loading,
  Screen,
} from '../../../src/components/base/Screen';
import { Txt } from '../../../src/components/base/Text';
import { VehicleGlyph } from '../../../src/components/domain/VehicleGlyph';
import {
  combustiveisLabel,
  type Combustivel,
  type TipoVeiculo,
} from '../../../src/domain/models';
import { useGarage } from '../../../src/hooks/useGarage';
import { useTheme } from '../../../src/theme/ThemeProvider';
import {
  isPlacaValida,
  normalizePlaca,
} from '../../../src/utils/format';

interface Erros {
  apelido?: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  placa?: string;
}

export default function EditarVeiculoScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { mostrar } = useFeedback();
  const { veiculoPorId, atualizarVeiculo, veiculos, carregando } = useGarage();

  const veiculo = veiculoPorId(id);

  const [apelido, setApelido] = useState(veiculo?.apelido ?? '');
  const [tipo, setTipo] = useState<TipoVeiculo>(veiculo?.tipo ?? 'carro');
  const [marca, setMarca] = useState(veiculo?.marca ?? '');
  const [modelo, setModelo] = useState(veiculo?.modelo ?? '');
  const [ano, setAno] = useState(veiculo ? String(veiculo.ano) : '');
  const [placa, setPlaca] = useState(veiculo?.placa ?? '');
  const [combustivel, setCombustivel] = useState<Combustivel>(
    veiculo?.combustivel ?? 'flex',
  );
  const [fotoUri, setFotoUri] = useState<string | undefined>(veiculo?.fotoUri);

  const [folhaCombustivel, setFolhaCombustivel] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);

  const itensCombustivel: PickerItem[] = useMemo(
    () =>
      (Object.keys(combustiveisLabel) as Combustivel[]).map((c) => ({
        value: c,
        label: combustiveisLabel[c],
      })),
    [],
  );

  async function escolherFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert(
        'Acesso as fotos',
        'Libere o acesso as fotos nos ajustes do celular para escolher uma imagem.',
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!resultado.canceled && resultado.assets?.[0]?.uri) {
      setFotoUri(resultado.assets[0].uri);
    }
  }

  function validar(): Erros {
    const novos: Erros = {};
    const anoNum = Number(ano);
    const anoLimite = new Date().getFullYear() + 1;

    if (!apelido.trim()) {
      novos.apelido = 'Dê um nome para reconhecer o veiculo na lista.';
    }
    if (!marca.trim()) novos.marca = 'Informe a marca.';
    if (!modelo.trim()) novos.modelo = 'Informe o modelo.';

    if (!ano.trim()) {
      novos.ano = 'Informe o ano.';
    } else if (!Number.isInteger(anoNum) || anoNum < 1950 || anoNum > anoLimite) {
      novos.ano = `Use um ano entre 1950 e ${anoLimite}.`;
    }

    if (!placa.trim()) {
      novos.placa = 'Informe a placa.';
    } else if (!isPlacaValida(placa)) {
      novos.placa = 'Use o formato ABC1234 ou ABC1D23.';
    } else if (
      veiculos.some((v) => v.placa === normalizePlaca(placa) && v.id !== id)
    ) {
      novos.placa = 'Ja existe outro veiculo com essa placa.';
    }

    return novos;
  }

  async function salvar() {
    const novos = validar();
    setErros(novos);
    if (Object.keys(novos).length > 0 || !veiculo) return;

    setSalvando(true);
    try {
      await atualizarVeiculo(veiculo.id, {
        apelido: apelido.trim(),
        tipo,
        marca: marca.trim(),
        modelo: modelo.trim(),
        ano: Number(ano),
        placa: normalizePlaca(placa),
        combustivel,
        fotoUri,
      });
      mostrar('Veiculo atualizado');
      router.back();
    } catch (erro) {
      Alert.alert(
        'Nao foi possivel salvar',
        erro instanceof Error ? erro.message : 'Tente de novo.',
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <Screen>
          <Header title="Editar veiculo" back />
          <Loading />
        </Screen>
      </View>
    );
  }

  if (!veiculo) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <Screen>
          <Header title="Editar veiculo" back />
          <EmptyState
            title="Veiculo nao encontrado"
            description="Ele pode ter sido removido. Volte para a garagem para ver a lista atual."
            actionLabel="Voltar para a garagem"
            onAction={() => router.replace('/(tabs)')}
          />
        </Screen>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Screen avoidKeyboard>
        <Header title="Editar veiculo" subtitle={veiculo.apelido} back />

        <Segmented<TipoVeiculo>
          label="Tipo"
          options={[
            { value: 'carro', label: 'Carro' },
            { value: 'moto', label: 'Moto' },
          ]}
          value={tipo}
          onChange={setTipo}
          style={{ marginBottom: theme.spacing.lg }}
        />

        <Pressable
          onPress={escolherFoto}
          accessibilityRole="button"
          accessibilityLabel="Trocar foto do veiculo"
          style={({ pressed }) => [
            styles.foto,
            {
              backgroundColor: theme.colors.surfaceSunken,
              borderColor: theme.colors.line,
              borderRadius: theme.radius.object,
              marginBottom: theme.spacing.lg,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          {fotoUri ? (
            <Image
              source={{ uri: fotoUri }}
              style={styles.fotoImagem}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <>
              <VehicleGlyph tipo={tipo} size={40} color={theme.colors.textMuted} />
              <Txt variant="bodySM" tone="muted" style={{ marginTop: 6 }}>
                Adicionar foto (opcional)
              </Txt>
            </>
          )}
        </Pressable>

        {fotoUri ? (
          <Button
            label="Remover foto"
            variant="ghost"
            onPress={() => setFotoUri(undefined)}
            style={{ marginBottom: theme.spacing.lg }}
          />
        ) : null}

        <View style={{ gap: theme.spacing.lg }}>
          <Field
            label="Apelido"
            placeholder="Gol do trabalho"
            value={apelido}
            onChangeText={setApelido}
            error={erros.apelido}
            maxLength={40}
          />

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <Field
              label="Marca"
              placeholder="Volkswagen"
              value={marca}
              onChangeText={setMarca}
              error={erros.marca}
              containerStyle={{ flex: 1 }}
            />
            <Field
              label="Modelo"
              placeholder="Gol 1.0"
              value={modelo}
              onChangeText={setModelo}
              error={erros.modelo}
              containerStyle={{ flex: 1 }}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <Field
              label="Ano"
              placeholder="2018"
              value={ano}
              onChangeText={setAno}
              error={erros.ano}
              keyboardType="number-pad"
              maxLength={4}
              numeric
              containerStyle={{ flex: 1 }}
            />
            <Field
              label="Placa"
              placeholder="ABC1D23"
              value={placa}
              onChangeText={(t: string) => setPlaca(t.toUpperCase())}
              error={erros.placa}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={8}
              numeric
              containerStyle={{ flex: 1 }}
            />
          </View>

          <PickerField
            label="Combustivel"
            selectedLabel={combustiveisLabel[combustivel]}
            placeholder="Escolher"
            onPress={() => setFolhaCombustivel(true)}
          />
        </View>

        <Txt
          variant="bodySM"
          tone="muted"
          style={{ marginTop: theme.spacing.lg }}
        >
          A quilometragem e atualizada no painel do veiculo, onde ela tem regra
          propria.
        </Txt>

        <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.xxl }}>
          <Button
            label="Salvar alteracoes"
            onPress={salvar}
            loading={salvando}
          />
          <Button
            label="Cancelar"
            variant="ghost"
            onPress={() => router.back()}
          />
        </View>
      </Screen>

      <PickerSheet
        visible={folhaCombustivel}
        title="Combustivel"
        items={itensCombustivel}
        value={combustivel}
        onSelect={(item) => {
          setCombustivel(item.value as Combustivel);
          setFolhaCombustivel(false);
        }}
        onClose={() => setFolhaCombustivel(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  foto: {
    height: 148,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fotoImagem: {
    width: '100%',
    height: '100%',
  },
});
