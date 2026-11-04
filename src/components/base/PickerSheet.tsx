/**
 * Folha de selecao com busca.
 *
 * Usada onde a lista e longa demais para caber na tela: marcas e modelos da
 * FIPE passam de cem itens. A busca aparece quando ha mais de dez opcoes;
 * abaixo disso ela so atrapalharia.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeProvider';
import { Loading } from './Screen';
import { Txt } from './Text';

export interface PickerItem {
  value: string;
  label: string;
  /** Linha secundaria, ex.: o valor FIPE do modelo. */
  hint?: string;
}

export interface PickerSheetProps {
  visible: boolean;
  title: string;
  items: PickerItem[];
  value?: string;
  onSelect: (item: PickerItem) => void;
  onClose: () => void;
  loading?: boolean;
  /** Mensagem quando a lista vem vazia ou falhou. */
  emptyMessage?: string;
}

/** A partir daqui a lista justifica um campo de busca. */
const LIMIAR_BUSCA = 10;

export function PickerSheet({
  visible,
  title,
  items,
  value,
  onSelect,
  onClose,
  loading = false,
  emptyMessage,
}: PickerSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [busca, setBusca] = useState('');

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return items;
    return items.filter((i) => i.label.toLowerCase().includes(termo));
  }, [items, busca]);

  // Limpa a busca ao fechar, para a proxima abertura comecar do zero.
  const fechar = () => {
    setBusca('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={fechar}
    >
      <Pressable
        style={[styles.fundo, { backgroundColor: theme.colors.scrim }]}
        onPress={fechar}
        accessibilityLabel="Fechar"
        accessibilityRole="button"
      />

      <View
        style={[
          styles.folha,
          {
            backgroundColor: theme.colors.surfaceRaised,
            borderTopLeftRadius: theme.radius.object,
            borderTopRightRadius: theme.radius.object,
            paddingBottom: insets.bottom + theme.spacing.md,
          },
        ]}
      >
        <View style={[styles.puxador, { backgroundColor: theme.colors.line }]} />

        <View style={[styles.cabecalho, { paddingHorizontal: theme.spacing.lg }]}>
          <Txt variant="titleMD" style={{ flex: 1 }} numberOfLines={1}>
            {title}
          </Txt>
          <Pressable
            onPress={fechar}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            style={{
              minWidth: theme.layout.touchTarget,
              minHeight: theme.layout.touchTarget,
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="close" size={24} color={theme.colors.textMuted} />
          </Pressable>
        </View>

        {items.length > LIMIAR_BUSCA ? (
          <View
            style={[
              styles.busca,
              {
                backgroundColor: theme.colors.surfaceSunken,
                borderColor: theme.colors.line,
                borderRadius: theme.radius.control,
                marginHorizontal: theme.spacing.lg,
                minHeight: theme.layout.touchTarget,
              },
            ]}
          >
            <Ionicons name="search" size={18} color={theme.colors.textMuted} />
            <TextInput
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar"
              placeholderTextColor={theme.colors.textMuted}
              style={[
                styles.buscaInput,
                theme.typography.body,
                { color: theme.colors.text },
              ]}
              accessibilityLabel={`Buscar em ${title}`}
              autoCorrect={false}
            />
          </View>
        ) : null}

        {loading ? (
          <Loading label="Carregando" />
        ) : filtrados.length === 0 ? (
          <View style={{ padding: theme.spacing.xxl }}>
            <Txt variant="body" tone="muted" align="center">
              {busca
                ? `Nada encontrado para "${busca}".`
                : (emptyMessage ?? 'Nenhuma opcao disponivel.')}
            </Txt>
          </View>
        ) : (
          <FlatList
            data={filtrados}
            keyExtractor={(item: PickerItem) => item.value}
            style={{ marginTop: theme.spacing.sm }}
            contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }: { item: PickerItem }) => {
              const selecionado = item.value === value;
              return (
                <Pressable
                  onPress={() => {
                    setBusca('');
                    onSelect(item);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selecionado }}
                  accessibilityLabel={item.label}
                  style={({ pressed }) => [
                    styles.item,
                    {
                      borderBottomColor: theme.colors.line,
                      minHeight: theme.layout.touchTarget,
                      opacity: pressed ? 0.6 : 1,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Txt
                      variant={selecionado ? 'titleSM' : 'body'}
                      tone={selecionado ? 'brand' : 'default'}
                      numberOfLines={2}
                    >
                      {item.label}
                    </Txt>
                    {item.hint ? (
                      <Txt variant="bodySM" tone="muted" numberOfLines={1}>
                        {item.hint}
                      </Txt>
                    ) : null}
                  </View>
                  {selecionado ? (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={theme.colors.brand}
                    />
                  ) : null}
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
  },
  folha: {
    maxHeight: '82%',
    paddingTop: 8,
  },
  puxador: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  buscaInput: {
    flex: 1,
    paddingVertical: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

/* -------------------------------------------------------------------------- */
/* Campo que abre a folha                                                      */
/* -------------------------------------------------------------------------- */

export interface PickerFieldProps {
  label: string;
  /** Texto do item escolhido, ou `undefined` para mostrar o placeholder. */
  selectedLabel?: string;
  placeholder: string;
  onPress: () => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
}

export function PickerField({
  label,
  selectedLabel,
  placeholder,
  onPress,
  error,
  hint,
  disabled = false,
}: PickerFieldProps) {
  const theme = useTheme();

  return (
    <View>
      <Txt variant="label" tone="muted" style={{ marginBottom: 6 }}>
        {label}
      </Txt>

      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selectedLabel ?? placeholder}`}
        accessibilityState={{ disabled }}
        style={({ pressed }) => [
          styles.busca,
          {
            backgroundColor: theme.colors.surfaceSunken,
            borderColor: error ? theme.colors.late : theme.colors.line,
            borderWidth: error ? 2 : 1,
            borderRadius: theme.radius.control,
            minHeight: theme.layout.touchTarget,
            marginHorizontal: 0,
            opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
          },
        ]}
      >
        <Txt
          variant="body"
          tone={selectedLabel ? 'default' : 'muted'}
          style={{ flex: 1 }}
          numberOfLines={1}
        >
          {selectedLabel ?? placeholder}
        </Txt>
        <Ionicons
          name="chevron-down"
          size={18}
          color={theme.colors.textMuted}
        />
      </Pressable>

      {error ? (
        <Txt variant="bodySM" tone="late" style={{ marginTop: 5 }}>
          {error}
        </Txt>
      ) : hint ? (
        <Txt variant="bodySM" tone="muted" style={{ marginTop: 5 }}>
          {hint}
        </Txt>
      ) : null}
    </View>
  );
}
