/**
 * Cliente HTTP do app.
 *
 * Nao usa biblioteca externa: `fetch` ja existe no React Native e o que falta
 * (timeout, erro tipado, retentativa) cabe em poucas linhas. Uma dependencia a
 * menos para carregar no bundle.
 */

/** Erro de rede ou de resposta, com o suficiente para a tela decidir o que dizer. */
export class HttpError extends Error {
  readonly status: number;
  /** `true` quando o pedido nem chegou ao servidor (offline, DNS, timeout). */
  readonly offline: boolean;

  constructor(message: string, status: number, offline = false) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.offline = offline;
  }

  /** Mensagem pronta para mostrar ao usuario, sem jargao de rede. */
  get mensagemUsuario(): string {
    if (this.offline) {
      return 'Sem conexao. Verifique a internet e tente de novo.';
    }
    if (this.status === 404) {
      return 'Nao encontramos esse item na consulta.';
    }
    if (this.status >= 500) {
      return 'O servico de consulta esta fora do ar. Tente mais tarde.';
    }
    return 'Nao foi possivel completar a consulta.';
  }
}

export interface RequestOptions {
  /** Tempo maximo em ms antes de desistir. */
  timeout?: number;
  /** Quantas vezes tentar de novo em falha de rede ou erro 5xx. */
  retries?: number;
  signal?: AbortSignal;
}

const TIMEOUT_PADRAO = 10_000;
const RETRIES_PADRAO = 1;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * GET que devolve JSON tipado.
 *
 * Retenta apenas em falha de rede e erro 5xx: um 404 nao melhora na segunda
 * tentativa, so faz o usuario esperar mais.
 */
export async function getJson<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    timeout = TIMEOUT_PADRAO,
    retries = RETRIES_PADRAO,
    signal,
  } = options;

  let ultimoErro: HttpError | undefined;

  for (let tentativa = 0; tentativa <= retries; tentativa += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    // Encerra junto se quem chamou cancelar (ex.: a tela foi fechada).
    const abortarExterno = () => controller.abort();
    signal?.addEventListener('abort', abortarExterno);

    try {
      const resposta = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      if (!resposta.ok) {
        const erro = new HttpError(
          `Resposta ${resposta.status} para ${url}`,
          resposta.status,
        );
        // 4xx nao se resolve repetindo.
        if (resposta.status < 500) throw erro;
        ultimoErro = erro;
      } else {
        return (await resposta.json()) as T;
      }
    } catch (causa) {
      if (causa instanceof HttpError) {
        if (causa.status < 500) throw causa;
        ultimoErro = causa;
      } else {
        // AbortError do cancelamento externo nao deve virar retentativa.
        if (signal?.aborted) {
          throw new HttpError('Consulta cancelada.', 0, false);
        }
        ultimoErro = new HttpError('Falha de rede.', 0, true);
      }
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abortarExterno);
    }

    // Espera crescente antes da proxima tentativa.
    if (tentativa < retries) {
      await sleep(400 * (tentativa + 1));
    }
  }

  throw ultimoErro ?? new HttpError('Falha de rede.', 0, true);
}
