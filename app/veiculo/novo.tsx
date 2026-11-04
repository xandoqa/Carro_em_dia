/**
 * Cadastro de veiculo.
 *
 * Marca e modelo vem da tabela FIPE, nao de campos livres. Isso evita grafia
 * divergente ("VW" e "Volkswagen" no mesmo app), preenche o ano e o
 * combustivel sozinho e ainda guarda o valor de referencia do veiculo.
 *
 * A consulta e um atalho, nao uma exigencia: se a API estiver fora do ar, os
 * campos aceitam digitacao e o cadastro segue normalmente. Travar o cadastro
 * de um veiculo porque um servico externo caiu seria inaceitavel.
 */

import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../src/components/base/Button';
import { Field, Segmented } from '../../src/components/base/Field';
import {
  PickerField,
  PickerSheet,
  type PickerItem,
} from '../../src/components/base/PickerSheet';
import { Header, Screen } from '../../src/components/base/Screen';
import { Card } from '../../src/components/base/Surfaces';
import { Txt } from '../../src/components/base/Text';
import { VehicleGlyph } from '../../src/components/domain/VehicleGlyph';
import {
  combustiveisLabel,
  type Combustivel,
  type TipoVeiculo,
} from '../../src/domain/models';
import { useFipe } from '../../src/hooks/useFipe';
import { useGarage } from '../../src/hooks/useGarage';
import { useTheme } from '../../src/theme/ThemeProvider';
import { normalizarCombustivel } from '../../src/utils/fipe';
import {
  formatCurrency,
  isPlacaValida,
  normalizePlaca,
  parseNumberInput,
} from '../../src/utils/format';

type Folha = 'marca' | 'modelo' | 'combustivel' | null;

interface Erros {
  apelido?: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  placa?: string;
  km?: string;
}

export default function NovoVeiculoScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { criarVeiculo, veiculos } = useGarage();

  const [tipo, setTipo] = useState<TipoVeiculo>('carro');
  const [apelido, setApelido] = useState('');
  const [marca, setMarca] = useState('');
  const [marcaCodigo, setMarcaCodigo] = useState<string | undefined>();
  const [modelo, setModelo] = useState('');
  const [modeloCodigo, setModeloCodigo] = useState<string | undefined>();
  const [ano, setAno] = useState('');
  const [placa, setPlaca] = useState('');
  const [combustivel, setCombustivel] = useState<Combustivel>('flex');
  const [km, setKm] = useState('');
  const [fotoUri, setFotoUri] = useState<string | undefined>();

  const [folha, setFolha] = useState<Folha>(null);
  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);

  const fipe = useFipe(tipo);

  const itensMarca: PickerItem[] = useMemo(
    () => fipe.marcas.dados.map((m) => ({ value: m.valor, label: m.nome })),
    [fipe.marcas.dados],
  );

  const itensModelo: PickerItem[] = useMemo(
    () =>
      fipe.modelos.dados.map((m) => ({
        value: String(m.valor),
        label: m.modelo,
      })),
    [fipe.modelos.dados],
  );

  const itensCombustivel: PickerItem[] = useMemo(
    () =>
      (Object.keys(combustiveisLabel) as Combustivel[]).map((c) => ({
        value: c,
        label: combustiveisLabel[c],
      })),
    [],
  );

  /* ---------------------------------------------------------------------- */

  function escolherMarca(item: PickerItem) {
    setMarca(item.label);
    setMarcaCodigo(item.value);
    // Trocar de marca invalida o modelo escolhido antes.
    setModelo('');
    setModeloCodigo(undefined);
    fipe.limpar();
    setFolha(null);
    void fipe.carregarModelos(item.value);
  }

  async function escolherModelo(item: PickerItem) {
    setModelo(item.label);
    setModeloCodigo(item.value);
    setFolha(null);

    // O codigo FIPE do modelo abre a consulta de preco e ficha tecnica.
    const referencia = await fipe.consultarPreco(item.value);
    if (!referencia) return;

    // So preenche o que o usuario ainda nao digitou, para nao sobrescrever
    // uma correcao manual.
    setAno((atual) => atual || String(referencia.ano));
    setCombustivel(normalizarCombustivel(referencia.combustivel));
  }

  async function escolherFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert(
        'Acesso as fotos',
        'Libere o acesso as fotos nos ajustes do celular para escolher uma imagem do veiculo.',
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

  /* ---------------------------------------------------------------------- */

  function validar(): Erros {
    const novos: Erros = {};
    const anoNum = Number(ano);
    const kmNum = parseNumberInput(km);
    const anoLimite = new Date().getFullYear() + 1;

    if (!apelido.trim()) {
      novos.apelido = 'Dê um nome para reconhecer o veiculo na lista.';
    }
    if (!marca.trim()) novos.marca = 'Escolha a marca.';
    if (!modelo.trim()) novos.modelo = 'Escolha o modelo.';

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
      veiculos.some((v) => v.placa === normalizePlaca(placa))
    ) {
      novos.placa = 'Ja existe um veiculo com essa placa.';
    }

    if (km.trim() && (kmNum === null || kmNum < 0)) {
      novos.km = 'Informe a quilometragem em numeros.';
    }

    return novos;
  }

  async function salvar() {
    const novos = validar();
    setErros(novos);
    if (Object.keys(novos).length > 0) return;

    setSalvando(true);
    try {
      await criarVeiculo({
        apelido: apelido.trim(),
        tipo,
        marca: marca.trim(),
        modelo: modelo.trim(),
        ano: Number(ano),
        placa: normalizePlaca(placa),
        combustivel,
        kmAtual: parseNumberInput(km) ?? 0,
        fotoUri,
        fipeCodigo: modeloCodigo,
        fipeValor: fipe.referencia?.valor,
      });
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

  /* ---------------------------------------------------------------------- */

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Screen>
        <Header title="Novo veiculo" back />

        <Segmented<TipoVeiculo>
          label="Tipo"
          options={[
            { value: 'carro', label: 'Carro' },
            { value: 'moto', label: 'Moto' },
          ]}
          value={tipo}
          onChange={(proximo) => {
            setTipo(proximo);
            // As listas da FIPE sao diferentes por tipo; recomeca a escolha.
            setMarca('');
            setMarcaCodigo(undefined);
            setModelo('');
            setModeloCodigo(undefined);
          }}
          style={{ marginBottom: theme.spacing.lg }}
        />

        <Pressable
          onPress={escolherFoto}
          accessibilityRole="button"
          accessibilityLabel="Escolher foto do veiculo"
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

        <View style={{ gap: theme.spacing.lg }}>
          <Field
            label="Apelido"
            placeholder="Gol do trabalho"
            value={apelido}
            onChangeText={setApelido}
            error={erros.apelido}
            hint="Como voce chama esse veiculo no dia a dia."
            maxLength={40}
          />

          <PickerField
            label="Marca"
            selectedLabel={marca || undefined}
            placeholder={
              fipe.marcas.carregando ? 'Carregando marcas...' : 'Escolher marca'
            }
            onPress={() => setFolha('marca')}
            error={erros.marca ?? fipe.marcas.erro}
            hint="Lista da tabela FIPE."
          />

          <PickerField
            label="Modelo"
            selectedLabel={modelo || undefined}
            placeholder={
              !marcaCodigo
                ? 'Escolha a marca primeiro'
                : fipe.modelos.carregando
                  ? 'Carregando modelos...'
                  : 'Escolher modelo'
            }
            onPress={() => setFolha('modelo')}
            disabled={!marcaCodigo}
            error={erros.modelo ?? fipe.modelos.erro}
          />

          {/* O valor FIPE e informacao de apoio, nao campo do formulario. */}
          {fipe.referencia ? (
            <Card style={{ padding: theme.spacing.md }}>
              <Txt variant="label" tone="muted">
                Valor de referencia FIPE
              </Txt>
              <Txt variant="meterLG" style={{ marginTop: 2 }}>
                {formatCurrency(fipe.referencia.valor)}
              </Txt>
              <Txt variant="bodySM" tone="muted" style={{ marginTop: 2 }}>
                Tabela de {fipe.referencia.mesReferencia}
              </Txt>
            </Card>
          ) : null}

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
            onPress={() => setFolha('combustivel')}
          />

          <Field
            label="Quilometragem atual"
            placeholder="85000"
            value={km}
            onChangeText={setKm}
            error={erros.km}
            keyboardType="number-pad"
            suffix="km"
            numeric
            hint="Pode deixar em branco e atualizar depois."
          />
        </View>

        <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.xxl }}>
          <Button label="Salvar veiculo" onPress={salvar} loading={salvando} />
          <Button
            label="Cancelar"
            variant="ghost"
            onPress={() => router.back()}
          />
        </View>
      </Screen>

      <PickerSheet
        visible={folha === 'marca'}
        title="Marca"
        items={itensMarca}
        value={marcaCodigo}
        onSelect={escolherMarca}
        onClose={() => setFolha(null)}
        loading={fipe.marcas.carregando}
        emptyMessage={
          fipe.marcas.erro ??
          'Nao foi possivel carregar as marcas. Verifique a conexao.'
        }
      />

      <PickerSheet
        visible={folha === 'modelo'}
        title="Modelo"
        items={itensModelo}
        value={modeloCodigo}
        onSelect={(item) => void escolherModelo(item)}
        onClose={() => setFolha(null)}
        loading={fipe.modelos.carregando}
        emptyMessage={
          fipe.modelos.erro ?? 'Nenhum modelo encontrado para essa marca.'
        }
      />

      <PickerSheet
        visible={folha === 'combustivel'}
        title="Combustivel"
        items={itensCombustivel}
        value={combustivel}
        onSelect={(item) => {
          setCombustivel(item.value as Combustivel);
          setFolha(null);
        }}
        onClose={() => setFolha(null)}
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
