/**
 * Conversoes de dados da tabela FIPE.
 *
 * Fica separado de `services/fipeService` de proposito: aqui nao ha acesso a
 * rede nem a disco, entao estas funcoes podem ser testadas sozinhas e
 * reaproveitadas sem arrastar o AsyncStorage junto.
 */

/**
 * Converte o valor em texto da API para numero.
 * `"R$ 45.231,00"` vira `45231`. Devolve 0 quando nao houver numero legivel.
 */
export function parseValorFipe(texto: string): number {
  const limpo = texto
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const valor = Number(limpo);
  return Number.isFinite(valor) ? valor : 0;
}

/**
 * Normaliza o nome do combustivel da FIPE para o conjunto usado no app.
 * A API devolve rotulos como "Gasolina", "Alcool" e "Diesel".
 */
export function normalizarCombustivel(
  texto: string,
): 'flex' | 'gasolina' | 'etanol' | 'diesel' | 'gnv' | 'eletrico' | 'hibrido' {
  const t = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

  if (t.includes('flex')) return 'flex';
  if (t.includes('alcool') || t.includes('etanol')) return 'etanol';
  if (t.includes('diesel')) return 'diesel';
  if (t.includes('gnv') || t.includes('gas natural')) return 'gnv';
  if (t.includes('eletric')) return 'eletrico';
  if (t.includes('hibrid')) return 'hibrido';
  return 'gasolina';
}

/**
 * Separa o ano do nome do modelo quando ele vem embutido,
 * como em "Gol 1.0 Flex 2018".
 */
export function extrairAnoDoModelo(modelo: string): number | undefined {
  const match = /\b(19|20)\d{2}\b/.exec(modelo);
  if (!match) return undefined;
  const ano = Number(match[0]);
  const anoLimite = new Date().getFullYear() + 1;
  return ano >= 1950 && ano <= anoLimite ? ano : undefined;
}
