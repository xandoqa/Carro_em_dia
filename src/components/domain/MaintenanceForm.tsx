/**
 * Formulario de manutencao, usado para criar e para editar.
 *
 * Os dois casos sao o mesmo formulario com os mesmos campos e as mesmas
 * validacoes; o que muda e de onde vem o estado inicial e o que acontece ao
 * salvar. Manter um componente so evita que uma regra de validacao seja
 * corrigida em um lugar e esquecida no outro.
 *
 * O bloco de proxima troca sugere o intervalo padrao do tipo escolhido, mas
 * deixa o usuario mudar: a recomendacao do fabricante e um ponto de partida,
 * nao uma regra que o app deva impor.
 */

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';

import {
  tiposManutencao,
  type Manutencao,
  type NovaManutencao,
  type TipoManutencaoId,
} from '../../domain/models';
import { useGarage } from '../../hooks/useGarage';
import { useTheme } from '../../theme/ThemeProvider';
import { today } from '../../utils/date';
import { formatDate } from '../../utils/date';
import { formatKm, parseNumberInput } from '../../utils/format';
import { Button } from '../base/Button';
import { Field } from '../base/Field';
import { Card, SectionHeader } from '../base/Surfaces';
import { Txt } from '../base/Text';
import { ServiceTypeGrid } from './ServiceTypeGrid';
import { VehiclePicker } from './VehiclePicker';

export interface MaintenanceFormProps {
  /** Quando presente, o formulario edita este registro em vez de criar um. */
  manutencao?: Manutencao;
  /** Veiculo pre-selecionado ao criar. Ignorado na edicao. */
  veiculoIdInicial?: string;
  /** Tipo pre-selecionado ao criar, usado pelo "registrar como feito". */
  tipoInicial?: TipoManutencaoId;
  /** Chamado depois de salvar com sucesso. */
  onSalvo: () => void;
  onCancelar: () => void;
}

interface Erros {
  veiculo?: string;
  data?: string;
  km?: string;
  valor?: string;
  descricao?: string;
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Numero para o campo de texto, com string vazia quando nao ha valor. */
function paraCampo(valor: number | undefined): string {
  return valor === undefined ? '' : String(valor);
}

export function MaintenanceForm({
  manutencao,
  veiculoIdInicial,
  tipoInicial,
  onSalvo,
  onCancelar,
}: MaintenanceFormProps) {
  const theme = useTheme();
  const { veiculos, criarManutencao, atualizarManutencao, veiculoPorId } =
    useGarage();

  const editando = manutencao !== undefined;

  /* ---------------------------------------------------------------------- */
  /* Estado inicial: do registro em edicao, ou dos parametros de criacao     */
  /* ---------------------------------------------------------------------- */

  const [veiculoId, setVeiculoId] = useState<string | undefined>(
    manutencao?.veiculoId ?? veiculoIdInicial ?? veiculos[0]?.id,
  );

  const [tipo, setTipo] = useState<TipoManutencaoId>(
    manutencao?.tipo ??
      (tipoInicial && tipoInicial in tiposManutencao ? tipoInicial : 'oleo'),
  );

  const [descricao, setDescricao] = useState(manutencao?.descricao ?? '');
  const [data, setData] = useState(manutencao?.data ?? today());
  const [km, setKm] = useState(paraCampo(manutencao?.km));
  const [valor, setValor] = useState(paraCampo(manutencao?.valor));
  const [litros, setLitros] = useState(paraCampo(manutencao?.litros));
  const [oficina, setOficina] = useState(manutencao?.oficina ?? '');
  const [observacoes, setObservacoes] = useState(manutencao?.observacoes ?? '');
  const [notaUri, setNotaUri] = useState<string | undefined>(
    manutencao?.notaUri,
  );

  const definicaoInicial = tiposManutencao[
    manutencao?.tipo ?? tipoInicial ?? 'oleo'
  ];

  // Na edicao, mostra exatamente o que foi salvo — inclusive em branco, se o
  // usuario tinha apagado o intervalo para nao gerar lembrete. Na criacao,
  // sugere o padrao do tipo.
  const [proximaKm, setProximaKm] = useState(
    editando
      ? paraCampo(manutencao?.proximaEmKm)
      : paraCampo(definicaoInicial.intervaloKm),
  );
  const [proximaMeses, setProximaMeses] = useState(
    editando
      ? paraCampo(manutencao?.proximaEmMeses)
      : paraCampo(definicaoInicial.intervaloMeses),
  );

  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);

  const definicao = tiposManutencao[tipo];
  const veiculo = veiculoId ? veiculoPorId(veiculoId) : undefined;

  /** O odometro atual serve de sugestao para o km do servico. */
  const placeholderKm = useMemo(
    () => (veiculo ? formatKm(veiculo.kmAtual) : '0'),
    [veiculo],
  );

  /* ---------------------------------------------------------------------- */

  function trocarTipo(proximo: TipoManutencaoId) {
    setTipo(proximo);

    // Ao trocar de tipo num registro novo, repoe os intervalos sugeridos.
    // Editando, nao mexe: o usuario pode estar so corrigindo a categoria de
    // um servico cujo prazo ja esta certo.
    if (editando) return;

    const d = tiposManutencao[proximo];
    setProximaKm(paraCampo(d.intervaloKm));
    setProximaMeses(paraCampo(d.intervaloMeses));
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

  /** Monta o objeto a partir dos campos, igual para criar e para editar. */
  function montarDados(idDoVeiculo: string): NovaManutencao {
    return {
      veiculoId: idDoVeiculo,
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
    };
  }

  async function salvar() {
    const novos = validar();
    setErros(novos);
    if (Object.keys(novos).length > 0 || !veiculoId) return;

    setSalvando(true);
    try {
      const dados = montarDados(veiculoId);

      if (manutencao) {
        await atualizarManutencao(manutencao.id, dados);
      } else {
        await criarManutencao(dados);
      }

      onSalvo();
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
    <>
      {/* Na edicao o veiculo nao muda: mover um servico de veiculo
          recalcularia o odometro dos dois e quase sempre e erro de leitura,
          nao intencao. Para mover, exclua e registre de novo. */}
      {!editando && veiculos.length > 1 ? (
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

      {editando && veiculo ? (
        <Txt variant="bodySM" tone="muted" style={{ marginBottom: theme.spacing.lg }}>
          {veiculo.apelido}
        </Txt>
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
        <Txt
          variant="bodySM"
          tone="muted"
          style={{ marginBottom: theme.spacing.md }}
        >
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
          label={editando ? 'Salvar alteracoes' : 'Salvar manutencao'}
          onPress={salvar}
          loading={salvando}
        />
        <Button label="Cancelar" variant="ghost" onPress={onCancelar} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  nota: {
    width: '100%',
    height: 180,
  },
});
