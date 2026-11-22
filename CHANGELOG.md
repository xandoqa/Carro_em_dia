# Histórico de versões

Todas as mudanças relevantes do CarroEmDia, da mais recente para a mais antiga.

O projeto segue [versionamento semântico](https://semver.org/lang/pt-BR/):
`MAIOR.MENOR.CORREÇÃO`.

| Parte | Quando muda |
|-------|-------------|
| **MAIOR** | Mudança que quebra o que existia |
| **MENOR** | Funcionalidade nova, compatível com o que já havia |
| **CORREÇÃO** | Correção de defeito ou ajuste de documentação |

---

## [1.5.5] — 2026-11-22

### Corrigido
- **O diagnóstico barrava o `npm start` por um problema que não existia.**
  Ele acusava 8 dependências instaladas como ausentes — `@expo/cli`,
  `expo-modules-core`, `@radix-ui/react-slot` e outras — e, como `npm start`
  roda a verificação antes de iniciar, o app não abria. Dois enganos meus na
  mesma função: eu procurava os pacotes **a partir da raiz do projeto**, sem
  enxergar o que o npm aninhou em `node_modules/<pai>/node_modules/`; e
  tratava `ERR_PACKAGE_PATH_NOT_EXPORTED` como ausência, quando ele significa
  o contrário — o pacote existe e só não expõe o próprio `package.json`, coisa
  comum em pacote com `exports`.
  Agora a pergunta é feita a partir de quem precisa do pacote, por três
  caminhos, e essa checagem **nunca mais bloqueia o `npm start`**: leitura
  errada minha sobre o conteúdo de `node_modules` não pode ser o motivo de o
  app não abrir.
- **`npm run typecheck` acusava 41 erros com o SDK 58.** Quatro causas:
  - `@types/node` não estava nas dependências, então todo `import` de
    `node:test` e `node:assert` nos testes e em `scripts/export-tokens.ts`
    ficava sem tipo — sozinho, respondia por cerca de 29 dos 41 erros. Nunca
    funcionou; só não aparecia porque a verificação daqui usava stubs próprios.
  - `StyleSheet.absoluteFillObject` saiu da API do React Native na 0.88. O
    objeto passou a ser escrito à mão em `MeasureStrip.tsx`, sem depender de
    versão.
  - `tabBarIcon` deixou de inferir os parâmetros em `app/(tabs)/_layout.tsx`.
    Anotados explicitamente.
  - `useNotificationNavigation.ts` descrevia à mão a forma do
    `NotificationResponse`, e a biblioteca passou a declarar `data` como
    opcional. A descrição saiu: o parâmetro agora é `unknown` e os campos são
    lidos com encadeamento opcional, que não amarra o código à versão.

### Alterado
- `@types/node` entrou nas dependências de desenvolvimento.

---

## [1.5.4] — 2026-11-22

### Corrigido
- **`npm run setup` falhava com `ERESOLVE` e não instalava nada.** A sequência
  era `npm install expo@latest && npm install && npx expo install --fix`, e o
  `npm install` do meio quebrava sempre que o SDK novo exigia uma versão que o
  `package.json` ainda prendia na antiga — enquanto o passo que conserta
  exatamente isso (`expo install --fix`) só rodava depois, ou seja, nunca.
  Caso real: o SDK 58 traz `react-native@0.88`, que pede
  `@types/react@^19.1.1`, e o projeto prendia `~19.0.10`.

  A instalação virou [`scripts/setup.mjs`](scripts/setup.mjs), com a ordem
  certa: instala tolerando o conflito só para ter o CLI do Expo em mãos,
  pergunta ao Expo quais versões combinam com o SDK — o que reescreve o
  `package.json` —, e só então faz a instalação limpa, que já resolve sem
  exceção nenhuma. Quando encontra `ERESOLVE`, explica o que é e segue sozinho,
  em vez de parar e mandar o usuário decidir entre `--force` e
  `--legacy-peer-deps`.

### Alterado
- Versões de desenvolvimento alinhadas ao **SDK 58.0.0**, conforme o próprio
  `expo install --fix` reporta: `@types/react` `~19.3.0`,
  `eslint-config-expo` `~58.0.4`, `typescript` `~6.0.3`.
- `react` e `react-dom` deixaram de ser presos em `19.0.0` exato. Pino exato em
  biblioteca com peer dependency é o que cria o conflito que trava a instalação.
- `npm run sdk:atualizar` passa a usar o mesmo script de instalação.

---

## [1.5.3] — 2026-11-22

### Corrigido
- **`npm run typecheck` falhava em 33 arquivos.** Eles tinham
  `import React from 'react'` sem usar `React` — e o `tsconfig.json` combina
  `jsx: "react-jsx"` (o JSX não precisa mais do React em escopo) com
  `noUnusedLocals: true` (import sem uso é erro). Resultado: 33 erros `TS6133`
  em `npm run typecheck` e em `npm run verify`. O app rodava, porque o Babel
  ignora import não usado; quebrava só a verificação — justamente o comando
  que se roda antes de apresentar.
  O import foi removido nos 33 e **mantido** nos 3 que usam `React` como
  namespace de tipo (`Button.tsx`, `Fab.tsx`, `Surfaces.tsx`), onde ele é
  obrigatório.

### Adicionado
- **Lista completa das dependências no README**, com a versão e o papel de cada
  uma das 27 — separando o que você instala na máquina (Node, npm, Expo Go) do
  que o `npm install` baixa sozinho. Inclui a lista do que o projeto **não**
  precisa (conta no Expo, `.env`, banco, Docker, Java, Python), para evitar
  instalação por engano.
- **Passo a passo numerado do zero até o app na mão**, com o comando de
  conferência depois de cada etapa — a versão anterior já dava os comandos, mas
  não dizia como saber se cada um deu certo antes de seguir.
- **Como puxar o projeto direto pelo VS Code** (`Git: Clone` na paleta de
  comandos), sem baixar `.zip`. Virou a seção 6.1c do tutorial, ao lado do zip e
  do `git clone`.
- Seção sobre **`github.dev` e Codespaces**, com o que cada um permite de fato:
  `github.dev` lê e edita no navegador mas não tem terminal, então não roda o
  app; Codespaces roda, mas só no navegador e numa máquina da nuvem.
- **[`docs/apresentacao.md`](docs/apresentacao.md)**: preparação do emulador
  Android e do `adb` no Linux, planos B e C, roteiro de 10 passos ligando cada
  tela ao requisito da disciplina, e as respostas para as perguntas previsíveis.
- **27 branches de feature publicadas no GitHub.** Elas existiam só localmente —
  o repositório remoto mostrava apenas `main` e `develop`, então o Git Flow não
  aparecia para quem olhasse de fora. Cinco são novas, uma para cada melhoria
  mapeada em `docs/melhorias.md`.
- `docs/git-flow.md` ganhou a tabela das 29 branches, separando as integradas das
  abertas.

---

## [1.5.2] — 2026-11-22

### Adicionado
- **Ordem sugerida de correção** no diagnóstico, quando há mais de um aviso.
  Listar três avisos sem dizer por onde começar deixa a decisão com quem menos
  conhece o assunto. Cada verificação passa a declarar sua prioridade: resolver
  antes de tentar rodar, resolver para rodar no celular, ou só se for usar o
  recurso.

---

## [1.5.1] — 2026-11-22

### Adicionado
- Aviso sobre **`npm audit fix --force`**, no README e no tutorial. O próprio
  terminal sugere esse comando depois de qualquer instalação, mas em projeto
  Expo ele quebra a instalação: ignora as versões que o SDK exige e troca
  pacotes por outros incompatíveis. As vulnerabilidades reportadas vêm de
  dependências internas das ferramentas de build e não entram no aplicativo.

---

## [1.5.0] — 2026-11-22

### Corrigido
- **O bundler web quebrava com `Unable to resolve module expo-asset`.**
  `expo-font` estava nas dependências sem ser usado por nenhuma tela — o app
  usa as fontes do sistema. O build web dele importa `expo-asset`, que não
  estava instalado, então o projeto falhava num pacote que não precisava
  existir. `expo-font` foi removido e `expo-asset` entrou.
- O comentário em `src/theme/fonts.ts` citava `expo-font` como se estivesse
  instalado.

### Alterado
- **`npm run setup` passa a instalar o Expo SDK atual**, em vez das versões
  fixadas no `package.json`. A versão fixada ficava velha e o Expo Go das lojas
  recusava o projeto; agora o npm da máquina resolve qual é a versão corrente.
- `npm run setup:fixo` mantém o comportamento antigo, para quem precisa das
  versões exatas.

### Adicionado
- `npm run sdk:atualizar`: atualiza o Expo e realinha todas as bibliotecas.
- **Verificação de dependências de terceiros** no diagnóstico. Lê o
  `package.json` de cada dependência direta e confere se o que ela declara está
  instalado. É a checagem que teria apontado o `expo-asset` ausente antes de o
  bundler falhar.
- Guia do **emulador Android no Linux**: instalação do Android Studio, criação
  do aparelho virtual, `ANDROID_HOME` no `.bashrc`, aceleração por KVM e
  alternativa por cabo USB.
- Seção explicando que **iPhone no Linux funciona pelo Expo Go** — só o comando
  `npm run ios`, que abre o simulador do Xcode, é que não.

---

## [1.4.2] — 2026-11-21

### Adicionado
- Seção **"O que foi implementado e corrigido"** no README, explicando cada
  funcionalidade, defeito corrigido, peça de infraestrutura e decisão de
  design — com o motivo de cada um. O CHANGELOG conta a história por versão;
  esta seção organiza por assunto, para quem quer entender o projeto sem
  percorrer o histórico.

---

## [1.4.1] — 2026-11-21

### Alterado
- O tutorial de instalação saiu de `docs/como-rodar.md` e virou
  **`README-INSTALACAO.md`**, na raiz do projeto. Era o documento mais
  procurado e estava no lugar mais difícil de achar — a ponto de ser preciso
  perguntar se existia.
- O README principal passa a apontar para ele logo no topo.

---

## [1.4.0] — 2026-11-21

### Adicionado
- **Versionamento semântico.** Este arquivo, e tags `v*` para cada marco do
  projeto, de 1.0.0 a 1.4.0.
- `npm run versoes`: publica no GitHub as tags que ainda não subiram.
- `npm run assinar`: configura assinatura de commits, para o GitHub mostrar
  "Verified". Gera a chave na máquina de quem roda — chave de assinatura é
  identidade e não deve nascer em outro lugar.
- O campo `version` do `package.json` passa a acompanhar a release.

---

## [1.3.1] — 2026-11-21

### Adicionado
- Execução a partir do `.zip`, sem precisar de Git. O tutorial ganhou a seção
  com download e extração em Linux, Windows e macOS.

### Corrigido
- O diagnóstico sugeria `git checkout <arquivo>` para recuperar arquivos. Quem
  baixa o `.zip` não tem histórico, então o comando falhava. Agora o diagnóstico
  detecta a ausência de `.git` e manda baixar o projeto de novo, com o link.
- Um `app.json` ausente gerava dois problemas, sendo o segundo consequência do
  primeiro.

### Alterado
- Git deixou de ser pré-requisito na documentação.

---

## [1.3.0] — 2026-11-21

### Adicionado
- **Sistema de diagnóstico no terminal** (`npm run doctor`). Verifica Node,
  dependências, versão do SDK, plugin de Babel, arquivos essenciais, porta 8081
  e, no Linux, o limite de *file watchers* do inotify. Para cada problema diz o
  que aconteceu, por quê, qual arquivo está envolvido, como resolver e o
  comando. Roda sem nenhuma dependência instalada.
- `npm run setup`: instala, alinha as versões ao SDK e verifica, em um comando.
- Verificação automática antes de `npm start`, que explica em vez de deixar o
  Expo falhar com mensagem crua.
- `docs/validacao.md`: separa o que foi testado de fato do que só pode ser
  confirmado na máquina de quem instala.

### Corrigido
- **`babel.config.js` fixava o plugin antigo do Reanimated.** A partir do SDK 54
  o Reanimated 4 usa o plugin do pacote `react-native-worklets`; atualizar o SDK
  quebrava o app na abertura com um erro de worklet que não aponta a causa.
  Agora o arquivo descobre sozinho qual plugin existe.
- **`MediaTypeOptions` do `expo-image-picker` está depreciado** e some em
  versões novas. Em três telas isso viraria erro de propriedade indefinida no
  momento de anexar a foto — falha que só aparece em uso.

### Alterado
- O tutorial de instalação foi reescrito cobrindo Linux, Windows e macOS.
- O README ganhou módulos, comandos, configuração de ambiente, problemas
  conhecidos e orientações de manutenção.

---

## [1.2.3] — 2026-11-21

### Corrigido
- Os papéis da dupla estavam invertidos na documentação. Alexandre escreve o
  código, Felipe revisa e corrige.
- Autoria dos commits corrigida para Alexandre Rodrigues Costa (xandoqa).

---

## [1.2.2] — 2026-11-15

### Adicionado
- Registro da autoria do desenvolvimento no README, no `git-flow.md` e no
  tutorial de instalação.

---

## [1.2.1] — 2026-11-08

### Alterado
- Deixa explícito que o protótipo em `design/preview` **não é o aplicativo**:
  é HTML puro, sem React e sem regra de negócio. O aviso aparece no README e na
  própria página.
- A maquete ganhou a tela de editar veículo, igualando as 11 telas do app.

---

## [1.2.0] — 2026-11-08

### Adicionado
- **Protótipo navegável** das 11 telas em moldura de celular, com troca de tema
  ao vivo. Abre no navegador sem instalar nada.
- Puxar para atualizar na garagem, nos alertas e nos gastos.
- Esqueleto de carregamento no lugar do indicador girando.
- Botão flutuante na garagem, como o protótipo original previa.
- Confirmação ao salvar: antes o app voltava em silêncio e "salvou" era
  indistinguível de "falhou".
- Calendário para escolher a data, no lugar do campo digitado `AAAA-MM-DD`.
- Tocar na notificação abre o veículo correspondente.
- Retorno tátil ao trocar de aba.

### Corrigido
- No iOS o teclado cobria os campos de baixo nos formulários.
- Quatro defeitos de CSS no protótipo, incluindo um que deixava o gráfico de
  barras invisível.

---

## [1.1.0] — 2026-11-04

### Adicionado
- **Edição de manutenção.** O protótipo previa "editar ou excluir", mas só
  excluir existia.
- Primeiro tutorial de instalação (`README-INSTALACAO.md`).

### Corrigido
- **Erro de digitação no odômetro ficava preso para sempre.** Registrar uma
  manutenção com km maior sobe o odômetro, `atualizarKm` só aceitava valores
  maiores e excluir o registro não abaixava nada: quem digitasse 1.145.000 em
  vez de 114.500 inflava o odômetro sem nenhum caminho de volta, e todos os
  lembretes do veículo passavam a mentir.

---

## [1.0.1] — 2026-11-03

### Corrigido
- **Serviços vencidos nunca geravam notificação.** O disparo era calculado como
  "X dias antes do prazo", conta que para algo já vencido cai no passado. O
  serviço mais urgente era justamente o único que nunca avisava.
- O app pedia permissão de notificação na abertura, antes de existir qualquer
  veículo.

---

## [1.0.0] — 2026-11-03

Primeira versão completa — entrega N2.

### Adicionado
- Aplicativo em React Native com Expo e Expo Router.
- Cadastro de veículos com consulta à tabela FIPE (BrasilAPI).
- Registro de manutenções com foto da nota fiscal.
- Cálculo de lembretes por quilometragem, por data ou pelos dois.
- Notificações locais agendadas no aparelho.
- Relatório de gastos com evolução mensal, categorias, consumo médio e custo
  por quilômetro.
- Quatro temas com a escolha salva no aparelho.
- Persistência local com AsyncStorage.
- Identidade visual própria, com a faixa de medida como elemento assinatura.
- 127 testes das regras de negócio, rodando sem emulador.
- Git Flow com `main`, `develop` e branches `feature/*`.

---

## Como versionar daqui para frente

Ao concluir um conjunto de mudanças:

1. Some uma entrada no topo deste arquivo, com a data.
2. Atualize `"version"` no `package.json`.
3. Faça o commit e o merge em `main`.
4. Crie a tag e publique:

```bash
git tag -a v1.3.2 -m "CarroEmDia 1.3.2 — resumo da versão"
git push origin v1.3.2
```

Para publicar todas as tags que ainda não subiram de uma vez:

```bash
bash scripts/publicar-versoes.sh
```

[1.5.5]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.5.5
[1.5.4]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.5.4
[1.5.3]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.5.3
[1.5.2]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.5.2
[1.5.1]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.5.1
[1.5.0]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.5.0
[1.4.2]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.4.2
[1.4.1]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.4.1
[1.4.0]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.4.0
[1.3.1]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.3.1
[1.3.0]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.3.0
[1.2.3]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.2.3
[1.2.2]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.2.2
[1.2.1]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.2.1
[1.2.0]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.2.0
[1.1.0]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.1.0
[1.0.1]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.0.1
[1.0.0]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.0.0
