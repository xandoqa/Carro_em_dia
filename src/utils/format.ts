/**
 * Formatacao de numeros no padrao brasileiro.
 *
 * Os valores sao exibidos em fonte monoespacada no app, entao a formatacao
 * precisa ser estavel em largura: sempre duas casas em moeda, sempre separador
 * de milhar em quilometragem.
 */

/** `114500` -> `114.500`. */
export function formatKm(value: number): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  return safe.toLocaleString('pt-BR');
}

/** `114500` -> `114.500 km`. */
export function formatKmUnit(value: number): string {
  return `${formatKm(value)} km`;
}

/** `280.5` -> `R$ 280,50`. */
export function formatCurrency(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return safe.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** `280.5` -> `280,50`, sem o simbolo. Para colunas onde o R$ ja esta no cabecalho. */
export function formatAmount(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return safe.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** `0.4512` -> `45%`. */
export function formatPercent(fraction: number): string {
  const safe = Number.isFinite(fraction) ? fraction : 0;
  return `${Math.round(safe * 100)}%`;
}

/** `32.14` -> `32,1 L`. */
export function formatLiters(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `${safe.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} L`;
}

/**
 * Normaliza placa para armazenamento: caixa alta, sem hifen nem espaco.
 * Aceita tanto o padrao antigo `ABC1234` quanto o Mercosul `ABC1D23`.
 */
export function normalizePlaca(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** Exibe a placa com separacao visual: `BRA2E19` -> `BRA 2E19`. */
export function formatPlaca(value: string): string {
  const clean = normalizePlaca(value);
  if (clean.length !== 7) return clean;
  return `${clean.slice(0, 3)} ${clean.slice(3)}`;
}

const PLACA_ANTIGA = /^[A-Z]{3}\d{4}$/;
const PLACA_MERCOSUL = /^[A-Z]{3}\d[A-Z]\d{2}$/;

export function isPlacaValida(value: string): boolean {
  const clean = normalizePlaca(value);
  return PLACA_ANTIGA.test(clean) || PLACA_MERCOSUL.test(clean);
}

/**
 * Converte texto digitado em numero.
 * Aceita `1.234,56`, `1234,56` e `1234.56`, devolvendo `null` se nao der.
 */
export function parseNumberInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Remove tudo que nao for digito, virgula, ponto ou sinal.
  const cleaned = trimmed.replace(/[^\d.,-]/g, '');
  if (!cleaned) return null;

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');

  let normalized: string;
  if (lastComma > lastDot) {
    // Virgula e o separador decimal: tira os pontos de milhar.
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (lastDot > lastComma) {
    // Ponto e o separador decimal: tira as virgulas de milhar.
    normalized = cleaned.replace(/,/g, '');
  } else {
    normalized = cleaned;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Texto curto de quanto falta, usado nos cartoes de alerta. */
export function formatRestante(
  kmRestantes: number | undefined,
  diasRestantes: number | undefined,
): string {
  if (kmRestantes !== undefined && kmRestantes < 0) {
    return `Venceu ha ${formatKm(Math.abs(kmRestantes))} km`;
  }
  if (diasRestantes !== undefined && diasRestantes < 0) {
    const dias = Math.abs(diasRestantes);
    return `Venceu ha ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
  }
  if (kmRestantes !== undefined && diasRestantes !== undefined) {
    return `Faltam ${formatKm(kmRestantes)} km ou ${diasRestantes} dias`;
  }
  if (kmRestantes !== undefined) {
    return `Faltam ${formatKm(kmRestantes)} km`;
  }
  if (diasRestantes !== undefined) {
    return `Faltam ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}`;
  }
  return 'Sem previsao';
}
