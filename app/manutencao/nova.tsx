/**
 * Registro de manutencao.
 *
 * Vem da tela do veiculo, de um alerta ("registrar como feito") ou do atalho
 * geral. Quando vem de um alerta, o tipo ja chega preenchido.
 *
 * O bloco de proxima troca sugere o intervalo padrao do tipo escolhido, mas
 * deixa o usuario mudar: a recomendacao do fabricante e um ponto de partida,
 * nao uma regra que o app deva impor.
 */

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../src/components/base/Button';
import { Field } from '../../src/components/base/Field';
import { EmptyState, Header, Screen } from '../../src/components/base/Screen';
import { Card, SectionHeader } from '../../src/components/base/Surfaces';
import { Txt } from '../../src/components/base/Text';
import { ServiceTypeGrid } from '../../src/components/domain/ServiceTypeGrid';
import { VehiclePicker } from '../../src/components/domain/VehiclePicker';
import {
  tiposManutencao,
  type TipoManutencaoId,
} from '../../src/domain/models';
import { useGarage } from '../../src/hooks/useGarage';
import { useTheme } from '../../src/theme/ThemeProvider';
import { formatDate, today } from '../../src/utils/date';
import { formatKm, parseNumberInput } from '../../src/utils/format';

interface Erros {
  veiculo?: string;
  data?: string;
  km?: string;
  valor?: string;
  descricao?: string;
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export default function NovaManutencaoScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    veiculoId?: string;
    tipo?: string;
  }>();

  const { veiculos, criarManutencao, veiculoPorId } = useGarage();

  const [veiculoId, setVeiculoId] = useState<string | undefined>(
    params.veiculoId ?? veiculos[0]?.id,
  );
  const [tipo, setTipo] = useState<TipoManutencaoId>(
    (params.tipo as TipoManutencaoId) in tiposManutencao
      ? (params.tipo as TipoManutencaoId)
      : 'oleo',
  );
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(today());
  const [km, setKm] = useState('');
  const [valor, setValor] = useState('');
  const [litros, setLitros] = useState('');
  const [oficina, setOficina] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [notaUri, setNotaUri] = useState<string | undefined>();

  const definicao = tiposManutencao[tipo];
  const [proximaKm, setProximaKm] = useState(
    definicao.intervaloKm ? String(definicao.intervaloKm) : '',
  );
  const [proximaMeses, setProximaMeses] = useState(
    definicao.intervaloMeses ? String(definicao.intervaloMeses) : '',
  );

  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);

  const veiculo = veiculoId ? veiculoPorId(veiculoId) : undefined;

  /** O odometro atual serve de sugestao para o km do servico. */
  const placeholderKm = useMemo(
    () => (veiculo ? formatKm(veiculo.kmAtual) : '0'),
    [veiculo],
  );

  function trocarTipo(proximo: TipoManutencaoId) {
    setTipo(proximo);
    // Ao trocar de tipo, repoe os intervalos sugeridos do novo tipo.
    const d = tiposManutencao[proximo];
    setProximaKm(d.intervaloKm ? String(d.intervaloKm) : '');
    setProximaMeses(d.intervaloMeses ? String(d.intervaloMeses) : '');
  }

  async function anexarNota() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert(
        'Acesso as fotos',
        'Libere o acesso as fotos nos ajustes do celular para anexar a nota fiscal.',
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
    });

    if (!resultado.canceled && resultado.assets?.[0]?.uri) {
      setNotaUri(resultado.assets[0].uri);
    }
  }

  function validar(): Erros {
    const novos: Erros = {};
    const kmNum = parseNumberInput(km);
    const valorNum = parseNumberInput(valor);

    if (!veiculoId) novos.veiculo = 'Escolha o veiculo.';

    if (!ISO.test(data)) {
      novos.data = 'Use o formato AAAA-MM-DD.';
    } else if (data > today()) {
      novos.data = 'A data nao pode estar no futuro.';
    }

    if (!km.trim()) {
      novos.km = 'Informe a quilometragem do servico.';
    } else if (kmNum === null || kmNum < 0) {
      novos.km = 'Informe a quilometragem em numeros.';
    }

    if (valor.trim() && (valorNum === null || valorNum < 0)) {
      novos.valor = 'Informe o valor em numeros.';
    }

    if (tipo === 'outro' && !descricao.trim()) {
      novos.descricao = 'Descreva o servico para reconhecer depois.';
    }

    return novos;
  }

  async function salvar() {
    const novos = validar();
    setErros(novos);
    if (Object.keys(novos).length > 0 || !veiculoId) return;

    setSalvando(true);
    try {
      await criarManutencao({
        veiculoId,
        tipo,
        descricao: descricao.trim() || undefined,
        data,
        km: parseNumberInput(km) ?? 0,
        valor: parseNumberInput(valor) ?? 0,
        oficina: oficina.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
        notaUri,
        litros:
          tipo === 'abastecimento'
            ? (parseNumberInput(litros) ?? undefined)
            : undefined,
        proximaEmKm: parseNumberInput(proximaKm) ?? undefined,
        proximaEmMeses: parseNumberInput(proximaMeses) ?? undefined,
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

        {veiculos.length > 1 ? (
          <View style={{ marginBottom: theme.spacing.lg }}>
            <Txt variant="label" tone="muted" style={{ marginBottom: 6 }}>
              Veiculo
            </Txt>
            <VehiclePicker
              veiculos={veiculos}
              value={veiculoId}
              onChange={setVeiculoId}
            />
            {erros.veiculo ? (
              <Txt variant="bodySM" tone="late" style={{ marginTop: 5 }}>
                {erros.veiculo}
              </Txt>
            ) : null}
          </View>
        ) : null}

        <ServiceTypeGrid
          value={tipo}
          onChange={trocarTipo}
          style={{ marginBottom: theme.spacing.lg }}
        />

        <View style={{ gap: theme.spacing.lg }}>
          {tipo === 'outro' ? (
            <Field
              label="Qual servico"
              placeholder="Troca de correia dentada"
              value={descricao}
              onChangeText={setDescricao}
              error={erros.descricao}
              maxLength={60}
            />
          ) : null}

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <Field
              label="Data"
              placeholder="2026-05-18"
              value={data}
              onChangeText={setData}
              error={erros.data}
              hint={ISO.test(data) ? formatDate(data) : 'AAAA-MM-DD'}
              maxLength={10}
              numeric
              containerStyle={{ flex: 1 }}
            />
            <Field
              label="Quilometragem"
              placeholder={placeholderKm}
              value={km}
              onChangeText={setKm}
              error={erros.km}
              keyboardType="number-pad"
              suffix="km"
              numeric
              containerStyle={{ flex: 1 }}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <Field
              label="Valor pago"
              placeholder="280,00"
              value={valor}
              onChangeText={setValor}
              error={erros.valor}
              keyboardType="decimal-pad"
              suffix="R$"
              numeric
              containerStyle={{ flex: 1 }}
            />
            {tipo === 'abastecimento' ? (
              <Field
                label="Litros"
                placeholder="32,1"
                value={litros}
                onChangeText={setLitros}
                keyboardType="decimal-pad"
                suffix="L"
                numeric
                containerStyle={{ flex: 1 }}
              />
            ) : (
              <View style={{ flex: 1 }} />
            )}
          </View>

          <Field
            label="Oficina ou posto"
            placeholder="Oficina do Ze"
            value={oficina}
            onChangeText={setOficina}
            maxLength={60}
          />

          <Field
            label="Observacoes"
            placeholder="Oleo sintetico 5W40 e filtro original"
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
            numberOfLines={3}
            maxLength={280}
          />
        </View>

        <Card style={{ marginTop: theme.spacing.lg }}>
          <SectionHeader title="Nota fiscal" />
          {notaUri ? (
            <View>
              <Image
                source={{ uri: notaUri }}
                style={[styles.nota, { borderRadius: theme.radius.control }]}
                resizeMode="cover"
                accessibilityLabel="Foto da nota fiscal anexada"
                accessibilityIgnoresInvertColors
              />
              <Button
                label="Remover anexo"
                variant="ghost"
                destructive
                onPress={() => setNotaUri(undefined)}
                style={{ marginTop: theme.spacing.sm }}
              />
            </View>
          ) : (
            <Button
              label="Anexar foto da nota"
              variant="secondary"
              onPress={anexarNota}
              icon={
                <Ionicons
                  name="camera-outline"
                  size={18}
                  color={theme.colors.brand}
                />
              }
            />
          )}
        </Card>

        <Card style={{ marginTop: theme.spacing.md }}>
          <SectionHeader title="Proxima troca" />
          <Txt variant="bodySM" tone="muted" style={{ marginBottom: theme.spacing.md }}>
            {definicao.geraLembrete
              ? 'Sugerimos o intervalo padrao deste servico. Ajuste se a sua oficina indicou outro, ou apague para nao criar lembrete.'
              : 'Este tipo de registro normalmente nao gera lembrete, mas voce pode definir um.'}
          </Txt>

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <Field
              label="Avisar em"
              placeholder="10000"
              value={proximaKm}
              onChangeText={setProximaKm}
              keyboardType="number-pad"
              suffix="km"
              numeric
              containerStyle={{ flex: 1 }}
            />
            <Field
              label="Ou em"
              placeholder="12"
              value={proximaMeses}
              onChangeText={setProximaMeses}
              keyboardType="number-pad"
              suffix="meses"
              numeric
              containerStyle={{ flex: 1 }}
            />
          </View>
        </Card>

        <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.xxl }}>
          <Button
            label="Salvar manutencao"
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
    </View>
  );
}

const styles = StyleSheet.create({
  nota: {
    width: '100%',
    height: 180,
  },
});
