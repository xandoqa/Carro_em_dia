# Identidade visual do CarroEmDia

## O que o app é

Uma caderneta de manutenção com um painel de instrumentos. O usuário abre o app
para responder três perguntas, sempre as mesmas:

1. O que está vencido?
2. Quanto falta para o próximo serviço?
3. Para onde foi o dinheiro?

Todas as três são **medidas entre dois limites**. É daí que sai a identidade,
não de uma referência estética escolhida de fora.

## Conceito

O protótipo no Figma era um wireframe em preto e branco: ele definiu a estrutura
da informação, não a aparência. A direção visual foi construída a partir do
mundo do usuário — oficina, odômetro, etiqueta de revisão no para-brisa,
manual do proprietário — e não de um estilo genérico de aplicativo.

### Elemento assinatura: a faixa de medida

Uma régua graduada com as duas pontas rotuladas e um cursor na posição atual.

```
 ┌─────────────────────────────────────┐
 │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  │
 └─────────────────────────────────────┘
  105.000 km                  115.000 km
```

Por que régua e não barra de progresso: o usuário não quer saber "72%
concluído", ele quer saber que está em 114.500 e que o limite é 115.000. A
régua mostra os três números que respondem à pergunta, e as marcas de escala
dão a noção de distância que uma barra lisa não dá.

Quando o prazo vence, a faixa preenche sólida na cor de atraso em vez de parar
em 100%. Ver o trilho inteiro virar sinal comunica o atraso melhor do que uma
barra cheia.

## Cor

Quatro temas, cada um com um motivo concreto — não são variações de cor por
variação:

| Tema      | Esquema | Motivo |
|-----------|---------|--------|
| `oficina` | claro   | Esmalte de máquina de oficina sobre papel cinza-frio. Padrão no modo claro. |
| `asfalto` | escuro  | A mesma marca à noite. Padrão no modo escuro. |
| `ambar`   | escuro  | A iluminação de painel em viagem noturna. |
| `pista`   | claro   | Alto contraste, para uso sob sol forte. |

### Regra de cor do produto

**Verde, âmbar e vermelho pertencem ao estado do veículo.** Eles aparecem como
fundo apenas na pílula de estado e na faixa de medida, nunca como decoração.
É isso que faz a cor significar alguma coisa: quando o usuário vê vermelho na
tela, é porque algo venceu.

A cor da marca (petróleo nos temas `oficina` e `asfalto`) carrega ação:
botão primário, seleção, cursor da faixa de medida.

### Valores

Ver [`../tokens/tokens.json`](../tokens/tokens.json) para a tabela completa.

## Tipografia

Duas famílias, com papéis separados:

- **Interface** — grotesca do sistema (San Francisco no iOS, Roboto no Android).
  Invisível, legível, sem download.
- **Medidas** — monoespaçada (Menlo / monospace). **Toda** medida usa esta
  família: quilometragem, valores em reais, datas, placa.

O motivo da monoespaçada não é estético. Números em coluna precisam alinhar
dígito com dígito para poderem ser comparados de relance, como num odômetro.
Em uma lista de dez serviços, a coluna de valores é lida verticalmente; com
fonte proporcional, `180,00` e `1.190,00` não alinham e a comparação some.

Rótulos são em **sentence case**, nunca caixa alta. O protótipo usava
`ODÔMETRO ATUAL`; a versão final usa `Odômetro`, que é mais rápido de ler e
não grita.

## Raio de borda como informação

O raio codifica **o que a coisa é**, não é decoração:

| Raio | Papel    | Onde aparece |
|------|----------|--------------|
| 20   | objeto   | Cartão de veículo, de alerta, bloco de relatório |
| 10   | controle | Botão, campo, aba, chip de filtro |
| 4    | leitura  | Painel de odômetro, faixa de medida, valor |
| 999  | estado   | Pílula de em dia / chegando / vencido |

Quem usa o app aprende isso sem perceber: cantos muito arredondados são coisas,
cantos quase retos são leituras de instrumento.

## Ícones

Desenhados para o domínio, em grade de 24 com traço de 1.8 e pontas
arredondadas.

As bibliotecas genéricas não têm marca para "troca de óleo" ou "pastilha de
freio", e o que oferecem no lugar é uma chave inglesa para tudo — o que não
distingue um serviço do outro. Como o tipo de serviço é a informação que o
usuário procura primeiro em cada linha da lista, cada um tem a sua marca:
gota (óleo), pneu com sulcos, disco com pinça (freio), caixa com polos
(bateria), chave de boca (revisão), elemento plissado (filtro), bomba
(abastecimento).

O símbolo do app é um ponteiro de instrumento dentro de um arco graduado: a
mesma ideia que organiza o app — uma medida entre dois limites — reduzida ao
menor desenho possível.

## Movimento

Uma animação orquestrada, o resto é resposta a toque.

- **A faixa de medida preenche** ao abrir uma tela (620 ms, desacelerando no
  fim como um ponteiro assentando). É a única animação não disparada pelo
  usuário, e existe porque mostra a medida sendo tomada.
- Troca de aba, seleção de chip, abertura de folha: 120–200 ms.
- Não há entrada em cascata de cards nem transição em cada hover.

Todas respeitam a preferência de movimento reduzido do sistema
(`useReducedMotion`).

## O que foi deliberadamente evitado

Para o app não se parecer com qualquer outro:

- Fundo creme com serifada de alto contraste e acento terracota.
- Preto quase puro com um único verde-limão ácido.
- Pilha de cartões idênticos, todos com o mesmo raio e a mesma sombra cinza.
- Rótulo em CAIXA ALTA espaçada acima de cada título.
- Cadeias de metadados ligadas por ponto médio em todo lugar.
- Seta `→` colada no texto dos botões.
- Gradiente como enfeite.

## Decisões que divergem do protótipo

| Protótipo | Versão final | Motivo |
|-----------|--------------|--------|
| Gráfico de pizza nos gastos | Lista com barra empilhada | Numa tela de celular a pizza exige legenda, e a legenda ocupa o mesmo espaço da lista — sem permitir ler o valor exato de cada categoria. |
| Barra de progresso simples | Faixa de medida graduada | Mostra as duas pontas e a posição, em vez de uma porcentagem abstrata. |
| Rótulos em caixa alta | Sentence case | Mais rápido de ler, menos ruído visual. |
| Lista suspensa de tipo de serviço | Grade de 8 opções visíveis | O tipo é a primeira decisão do formulário; mostrar tudo resolve em um toque. |
| Seleção de veículo em dropdown | Faixa horizontal de chips | Com um a três veículos, um dropdown esconde a garagem e custa dois toques. |

## Acessibilidade

Piso que o design precisa atender, verificado componente a componente:

- Alvos de toque com no mínimo 44 pt.
- Estado nunca depende só de cor: a pílula tem ponto e texto, o campo com erro
  engrossa a borda e mostra a mensagem, o item selecionado tem marca própria.
- Rótulo de acessibilidade em todo controle; a faixa de medida se descreve
  por inteiro em uma frase.
- O tema `pista` existe para quem precisa de mais contraste.
- Movimento reduzido respeitado.
