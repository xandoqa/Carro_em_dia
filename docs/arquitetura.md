# Arquitetura

## Visão geral

Quatro camadas, com dependência em um só sentido: a de cima conhece a de
baixo, nunca o contrário.

```
   app/                      telas (Expo Router)
     │
     ▼
   src/components/           componentes de UI
     │
     ▼
   src/hooks/                estado compartilhado
     │
     ├──────────────┐
     ▼              ▼
   src/domain/    src/data/ + src/services/
   (regras)       (persistência e rede)
```

A regra que mais importa: **`src/domain/` não importa nada do React Native**.
É isso que permite rodar as regras de negócio no Node puro, sem emulador, e é
por isso que existem 102 testes rodando em menos de um segundo.

## Pastas

```
app/                      Rotas. O arquivo define a URL.
  (tabs)/                 Garagem, Alertas, Gastos
  veiculo/                novo, [id], historico
  manutencao/             nova
  aparencia.tsx           escolha de tema
  ajustes.tsx             notificações e dados

src/
  domain/                 Regras puras. Sem React, sem React Native.
    models.ts             Entidades e intervalos padrão
    reminders.ts          Cálculo de lembretes e status
    expenses.ts           Agregação de gastos, consumo, custo por km
  data/                   Persistência
    storage.ts            Camada fina sobre o AsyncStorage
    garageRepository.ts   CRUD de veículos e manutenções
    preferencesRepository.ts
    demoRoteiros.ts       Cenário de exemplo (puro)
    demoData.ts           Gravação do cenário
  services/               Mundo externo
    http.ts               Cliente sobre fetch
    fipeService.ts        Tabela FIPE com cache
    notificationService.ts
  hooks/
    useGarage.tsx         Contexto único de estado
    useFipe.ts            Consulta FIPE para o formulário
  theme/
    tokens.ts             Espaçamento, raio, tipografia, movimento
    fonts.ts              Único arquivo do tema que toca a plataforma
    palettes.ts           Os quatro temas
    ThemeProvider.tsx     Preferência persistida
  components/
    base/                 Text, Button, Card, Field, Screen, …
    domain/               VehicleCard, AlertCard, MeasureStrip, …
    charts/               BarChart, CategoryBreakdown
  icons/                  Conjunto próprio de ícones
  utils/                  Data, formatação, conversões FIPE
  __tests__/              Testes das camadas puras
```

## Decisões e o porquê

### Lembretes são calculados, nunca salvos

O modelo da documentação prevê uma entidade `Lembrete` persistida. Aqui ela
existe como tipo, mas é **derivada** a cada leitura, a partir das manutenções
e da quilometragem atual.

O motivo é concreto: o odômetro muda toda vez que o usuário registra um
serviço ou atualiza o km. Um lembrete salvo ficaria desatualizado em silêncio,
e o app passaria a mentir sobre o que está vencido. Calcular custa
microssegundos e elimina a classe inteira de bugs de sincronia.

### A previsão do usuário vale sozinha

Cada tipo de serviço tem um intervalo padrão (óleo: 10.000 km / 12 meses). Mas
se o usuário informar uma previsão no registro, ela passa a valer **sozinha**.

Quem escolheu "avisar em 10.000 km" e deixou os meses em branco não quer um
vencimento por data herdado do padrão. Essa regra foi descoberta escrevendo os
testes — a primeira versão herdava o padrão e criava prazos que o usuário não
tinha pedido.

### Janela de atenção proporcional

O aviso de "chegando" começa a 15% do intervalo, com piso de 300 km e teto de
2.000 km.

Sem proporção, um valor fixo erraria dos dois lados: 1.000 km de antecedência é
cedo demais para uma troca de óleo de 3.000 km numa moto, e tarde demais para
pneus de 40.000 km. O piso e o teto evitam que a proporção produza janelas
absurdas nos extremos.

### Odômetro não anda para trás

`atualizarKm` recusa valor menor que o atual. Aceitar um km menor por erro de
digitação recalcularia todos os lembretes do veículo para o estado errado, e o
usuário não teria como saber o que aconteceu.

Registrar uma manutenção com km maior, por outro lado, **sobe** o odômetro
automaticamente: é o que a documentação descreve e evita digitar o mesmo número
duas vezes.

### Leitura do disco nunca lança

`storage.readJson` devolve o valor padrão quando o conteúdo está corrompido ou
o disco não responde. Um app de manutenção que não abre porque uma chave ficou
ilegível é pior do que um app que abre vazio.

Escrita, essa sim, propaga o erro: o usuário precisa saber que o registro não
foi salvo.

### A camada de dados é assíncrona de propósito

Hoje tudo é local. A interface dos repositórios é assíncrona mesmo onde não
precisaria ser, para que trocar o AsyncStorage por chamadas a um backend — como
a documentação original prevê — não exija mexer em nenhuma tela.

### Contexto em vez de biblioteca de estado

São duas coleções e meia dúzia de ações. Redux ou Zustand resolveriam o mesmo
com mais arquivos e mais uma dependência. Os lembretes saem de `useMemo` sobre
veículos e manutenções, então não há estado derivado para sincronizar.

### Reagendamento de notificações em um efeito

Fica em `useGarage`, reagindo a mudanças de lembretes e veículos, e não dentro
de cada ação. Qualquer caminho que altere prazos precisa do mesmo
reagendamento — inclusive a carga inicial, quando o app abre depois de meses
fechado.

### Gráficos desenhados à mão

`BarChart` e `CategoryBreakdown` usam `View`. São poucas barras; uma biblioteca
de gráficos custaria centenas de kB no bundle para fazer o que cabe em 40
linhas, e ainda traria um tema próprio para brigar com o nosso.

## Fluxo de dados

Registrar uma manutenção, do toque ao aviso agendado:

```
Tela (manutencao/nova)
  └─ useGarage.criarManutencao()
       └─ garageRepository.criarManutencao()
            ├─ grava a manutenção
            └─ sobe o odômetro se o km for maior
       └─ recarregar()  → novo estado
            └─ useMemo  → lembretes recalculados
                 └─ efeito → notificationService.reagendar()
                      ├─ cancela tudo que estava agendado
                      └─ agenda os novos prazos com data
```

Cancelar tudo antes de reagendar é o que garante que o usuário nunca receba um
aviso de algo que já foi feito.

## Verificação

| Comando | O que faz |
|---------|-----------|
| `npm test` | 102 testes das camadas puras, no Node, sem emulador |
| `npm run typecheck` | TypeScript estrito |
| `npm run lint` | ESLint + Prettier |
| `npm run verify` | Os três acima |
| `npm run tokens` | Regera `design/tokens/tokens.json` a partir de `src/theme` |

O que os testes cobrem: cálculo de lembrete em todas as combinações de prazo,
ordenação por urgência, agregação de gastos, consumo médio, custo por km,
aritmética de datas (incluindo fim de mês e virada de ano), formatação
brasileira, validação de placa e conversão dos valores da FIPE.

O que eles **não** cobrem: renderização de componentes e navegação. Testar UI
exigiria `@testing-library/react-native` e um ambiente de emulação; dentro de
uma semana, o retorno é menor que o de cobrir bem as regras de negócio, que são
onde os erros custam caro.
