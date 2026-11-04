/**
 * Consulta FIPE para o formulario de cadastro.
 *
 * Isola o estado de carregamento, erro e cancelamento do servico, para a tela
 * so se preocupar com o que mostrar.
 *
 * Cancelamento importa aqui: se o usuario troca de marca enquanto a lista de
 * modelos da anterior ainda esta vindo, a resposta atrasada nao pode
 * sobrescrever a nova.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type { TipoVeiculo } from '../domain/models';
import {
  fipeService,
  type FipeMarca,
  type FipeModelo,
  type ReferenciaFipe,
} from '../services/fipeService';

interface EstadoLista<T> {
  dados: T[];
  carregando: boolean;
  erro?: string;
}

/**
 * Estado inicial. E uma funcao, e nao uma constante compartilhada, para cada
 * lista receber o proprio array: devolver sempre o mesmo objeto deixaria duas
 * listas apontando para o mesmo `dados`.
 */
function vazio<T>(): EstadoLista<T> {
  return { dados: [], carregando: false };
}

export function useFipe(tipo: TipoVeiculo) {
  const [marcas, setMarcas] = useState<EstadoLista<FipeMarca>>(vazio<FipeMarca>());
  const [modelos, setModelos] = useState<EstadoLista<FipeModelo>>(vazio<FipeModelo>());
  const [referencia, setReferencia] = useState<ReferenciaFipe | null>(null);
  const [consultandoPreco, setConsultandoPreco] = useState(false);

  // Um controlador por consulta em andamento, para poder abortar a anterior.
  const abortMarcas = useRef<AbortController | null>(null);
  const abortModelos = useRef<AbortController | null>(null);

  const carregarMarcas = useCallback(async () => {
    abortMarcas.current?.abort();
    const controller = new AbortController();
    abortMarcas.current = controller;

    setMarcas({ dados: [], carregando: true });
    try {
      const dados = await fipeService.listarMarcas(tipo, {
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setMarcas({ dados, carregando: false });
    } catch (erro) {
      if (controller.signal.aborted) return;
      setMarcas({
        dados: [],
        carregando: false,
        erro: fipeService.mensagemDeErro(erro),
      });
    }
  }, [tipo]);

  // Recarrega ao trocar entre carro e moto; as listas sao diferentes.
  useEffect(() => {
    void carregarMarcas();
    setModelos(vazio<FipeModelo>());
    setReferencia(null);
    return () => abortMarcas.current?.abort();
  }, [carregarMarcas]);

  const carregarModelos = useCallback(
    async (codigoMarca: string) => {
      abortModelos.current?.abort();
      const controller = new AbortController();
      abortModelos.current = controller;

      setModelos({ dados: [], carregando: true });
      setReferencia(null);
      try {
        const dados = await fipeService.listarModelos(tipo, codigoMarca, {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setModelos({ dados, carregando: false });
      } catch (erro) {
        if (controller.signal.aborted) return;
        setModelos({
          dados: [],
          carregando: false,
          erro: fipeService.mensagemDeErro(erro),
        });
      }
    },
    [tipo],
  );

  /**
   * Busca o preco de referencia.
   * Falhar aqui nao bloqueia o cadastro: o valor FIPE e um extra, nao um
   * campo obrigatorio.
   */
  const consultarPreco = useCallback(async (codigoFipe: string, ano?: number) => {
    setConsultandoPreco(true);
    try {
      const resultado = await fipeService.consultarPreco(codigoFipe, ano);
      setReferencia(resultado);
      return resultado;
    } catch {
      setReferencia(null);
      return null;
    } finally {
      setConsultandoPreco(false);
    }
  }, []);

  const limpar = useCallback(() => {
    setModelos(vazio<FipeModelo>());
    setReferencia(null);
  }, []);

  return {
    marcas,
    modelos,
    referencia,
    consultandoPreco,
    carregarMarcas,
    carregarModelos,
    consultarPreco,
    limpar,
  };
}
