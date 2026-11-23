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

## [1.7.2] — 2026-11-23

### Documentação
- **"Could not connect to the server" no Expo Go**, documentado com causa e
  solução. Aconteceu no teste no iPhone: o celular estava nos dados móveis
  (5G), e o QR Code aponta para o endereço do computador dentro da rede Wi-Fi,
  que só existe para quem está nela. Resolvido conectando o iPhone no mesmo
  Wi-Fi. O tutorial traz os três passos, na ordem: mesma rede, túnel
  (`npm run start:tunnel`, que funciona até nos dados móveis) e liberar a porta
  8081 no firewall do Linux. O README e o checklist da apresentação ganharam o
  aviso.

---

## [1.7.1] — 2026-11-23

### Adicionado
- **Versão web online**, em
  [xandoqa.github.io/Carro_em_dia](https://xandoqa.github.io/Carro_em_dia/).
  O workflow `pages.yml` compila a web a cada push em `main` e publica na
  branch `gh-pages`. `app.config.js` acrescenta o caminho-base
  (`/Carro_em_dia`) só quando a publicação pede; `npm start`, `npm run web` e
  o Expo Go não mudam. Testado antes de publicar: a compilação foi servida no
  subcaminho e percorrida tela a tela, sem erro.
- **O CI passa a testar o servidor de desenvolvimento**, que é o que roda na
  máquina de quem usa o projeto (`npm start`, `npm run web`). Até aqui só a
  compilação final era testada, e o modo de desenvolvimento mostra na tela
  erros e avisos que a compilação esconde. Agora o CI sobe o servidor, percorre
  as telas e reprova se o terminal do Expo mostrar `ERROR`.

### Corrigido
- **Aviso amarelo do Reanimated no gráfico de gastos**: a animação de entrada e
  a opacidade da barra estavam no mesmo elemento ("Property [opacity] may be
  overwritten by a layout animation"). No celular, aparecia como aviso na tela.
  A animação foi para um invólucro.

### Documentação
- Passo a passo atualizado: versão online, conferência da versão antes de rodar
  (pasta antiga era a causa de "ainda dá o mesmo erro"), `npm run start:limpo`
  depois de baixar uma versão nova, e o erro `getLastNotificationResponse` /
  linhas `λ` explicados como sinal de versão antiga.
- Roteiro da apresentação: a versão online vira o plano B, no lugar da maquete.

---

## [1.7.0] — 2026-11-22

O app visto rodando pela primeira vez e comparado, tela a tela, com a maquete
do repositório (`design/preview`). O teste da web fotografa cada tela; as fotos
foram postas lado a lado com as da maquete. A estrutura das 11 telas e os 4
temas batem — cores, tipografia, componentes e o botão flutuante. Cinco
diferenças não batiam:

### Corrigido
- **Acentos em todo o app.** "veiculos", "Historico", "Odometro", "ha 300 km"
  viraram "veículos", "Histórico", "Odômetro", "há 300 km": 298 trechos em 42
  arquivos, 11 plurais, e os pedidos de permissão do iPhone no `app.json`. A
  troca foi feita pelo compilador do TypeScript, não por busca e substituição:
  só texto exibido. Identificadores, rotas (`/aparencia`), chaves de
  armazenamento e ids gravados (`oleo`, `eletrico`, status `atencao`) ficaram
  intactos, e os que sobraram foram conferidos um a um. Palavras ambíguas
  (esta/está, tem/têm, e/é, da/dá, a/à) foram decididas pelo contexto.
- **Marcas da régua sumiam quando o prazo vencia.** Eram desenhadas por baixo do
  preenchimento: no prazo, ele é translúcido e elas apareciam; vencido, é sólido
  e as cobria, e o elemento-assinatura virava uma barra lisa justamente quando
  mais importa. Agora ficam por cima, como no design.
- **Valores cortados no navegador** ("114.500 …", "R$ 1.377,…").
  `adjustsFontSizeToFit` reduz a fonte no iPhone e no Android, mas não existe
  na web. Como os números usam fonte monoespaçada, a largura é calculável, e o
  `Txt` passou a reduzir a fonte no navegador na proporção que falta.
- **Gráfico de gastos.** Com doze meses, os rótulos viravam "d… j… f…": acima
  de seis colunas fica a inicial. O valor da maior barra era cortado em "3…"
  porque, no navegador, texto de uma linha herda a largura da coluna; o
  posicionamento foi para um contêiner em volta.
- **Linha do histórico** cortava os litros; usa duas linhas, como no design.

### Alterado
- O teste da web abre o painel de **cada** veículo de exemplo, não só do
  primeiro — o odômetro que cortava era o do segundo.

---

## [1.6.2] — 2026-11-22

### Corrigido
- **iPhone: o teclado cobria a folha de atualizar a quilometragem.** Ao tocar
  em "Atualizar", o teclado numérico abria por cima da folha inteira, e o campo
  e o botão Salvar ficavam escondidos. No iOS o teclado se sobrepõe ao Modal
  sem empurrar nada. `AcimaDoTeclado` sobe a folha junto com o teclado. A busca
  da lista de marcas e modelos da FIPE tinha o mesmo defeito e recebeu a mesma
  correção. Achado pelo Alexandre no primeiro uso no iPhone.
- **A versão web quebrava na abertura** com
  `ExpoNotifications.getLastNotificationResponse is not available on web`. O
  serviço de notificações passa a ser explicitamente indisponível no navegador,
  e os Ajustes explicam que os avisos só existem no celular.
- **Confirmações mortas no navegador.** O `Alert.alert` do React Native não faz
  nada na web, então apagar todos os dados, remover veículo e excluir registro
  eram impossíveis lá. `src/utils/dialogo.ts` usa o Alert nativo no celular e as
  caixas do navegador na web; os 14 usos foram migrados.
- **Erro de hidratação do React (#418) na web.** A web era pré-renderizada no
  servidor, sem dados, e renderizada de novo no navegador com os dados do
  aparelho. Num app em que todo dado vive no aparelho, isso não traz nada.
  Passa a ser aplicação de página única (`web.output: "single"`).

### Adicionado
- **Teste da web num navegador de verdade no CI** (`scripts/ci/testar-web.mjs`).
  Compilar não é rodar: o CI compilava a web e mesmo assim ela quebrava ao
  abrir. Agora um Chromium com tamanho de celular percorre as 11 rotas, com e
  sem dados, nos 4 temas, carrega os dados de exemplo pelo botão dos Ajustes,
  fotografa cada tela e falha em qualquer erro de JavaScript. As fotos ficam
  como artefato de cada execução.
- Antes de confiar no teste, ele foi rodado sobre o código **antigo** (PR #7,
  fechado sem mesclar) e acusou o erro original em todas as telas.

---

## [1.6.1] — 2026-11-22

### Adicionado
- **Login no Expo CLI no passo a passo.** Primeiro teste no iPhone: o QR Code
  conectou, o Expo Go chegou ao projeto e parou em *"You're signed in to Expo
  Go as xandoqa, but not signed in to Expo CLI"*. Quando o Expo Go está
  entrado numa conta, o terminal precisa estar na mesma — `npx expo login`,
  uma vez só. O passo entrou no README, no tutorial (seção 7.1) e no roteiro
  da apresentação.
- **`npm run doctor` avisa antes do erro.** Consulta `expo whoami` e, se o
  terminal não estiver entrado, explica e dá o comando. Fica fora do modo
  rápido que roda a cada `npm start`, porque consulta a rede; sem internet, não
  acusa nada.
- Dois erros novos na lista de problemas comuns do tutorial: o do login e o
  `spawn adb ENOENT`, que aparece ao apertar `a` sem o emulador instalado.

---

## [1.6.0] — 2026-11-22

O projeto passa a instalar e compilar numa máquina limpa — verificado, não
suposto. Até aqui nenhuma instalação tinha sido feita fora da máquina do
Alexandre, e o ambiente onde o código é mantido não alcança o registro do npm.
A saída foi usar o **GitHub Actions como máquina de teste**: os servidores do
GitHub alcançam o npm, e cada problema abaixo foi encontrado lá, com log.

### Corrigido
- **O CI nunca tinha rodado.** Faltava o `package-lock.json`, e o workflow
  quebrava no segundo passo desde o primeiro commit — um ❌ em cada commit do
  repositório.
- **`package.json` misturado entre dois SDKs**: `expo` no 53, parte das
  dependências de desenvolvimento no 58. Cada instalação tentava acertar isso
  com `expo install --fix` e tropeçava no conflito que ela mesma criava. As 23
  dependências agora estão nas versões que o próprio Expo declara para o
  **SDK 58** — o único que o Expo Go das lojas abre.
- **`expo-font` voltou.** O `@expo/vector-icons`, que desenha os ícones das
  abas, o exige. Eu o removi na 1.5.0 achando que não era usado; o
  `expo-doctor` apontou.
- **`react-native-worklets` adicionado**, exigido pelo Reanimated 4.
- **Três campos do `app.json` que o SDK 58 removeu**: `newArchEnabled` (a nova
  arquitetura virou obrigatória), `android.edgeToEdgeEnabled` (idem) e
  `splash`, que virou configuração do plugin `expo-splash-screen`. O
  `doctor` lê a imagem da splash no lugar novo.
- **Lint que nunca rodou.** O `.eslintrc.js` estendia `prettier` e carregava o
  plugin `prettier` sem declarar nenhum dos dois. Fica só o
  `eslint-config-prettier`; a formatação é do Prettier, em `npm run format`.
- **Regra nova do React, `set-state-in-effect`, em quatro lugares.** Estado
  zerado ao abrir uma folha (`UpdateKmSheet`, `DateSheet`) ou ao trocar
  carro/moto (`useFipe`) passou a ser ajustado durante a renderização,
  comparando com o valor anterior — o padrão que a documentação do React
  recomenda. Num efeito, a tela renderizava uma vez com o dado velho. As
  buscas assíncronas (`useFipe`, `ajustes.tsx`) só mudam estado na resposta.
- **Cor dos ícones das abas**: o tipo passou a incluir `number`; um auxiliar
  devolve só texto, que é o que as cores do tema são.
- **Tipos do Node não eram carregados** — o tsconfig base do Expo 58 restringe
  os `@types`. Uma referência em `src/types/node.d.ts` os inclui sem
  sobrescrever a lista do Expo.
- `import/namespace` do ESLint desligada para TypeScript: acusava
  `AndroidImportance` como inexistente, sendo que ele existe e compila. O
  compilador faz essa checagem com mais precisão.

### Alterado
- **`npm run setup` usa `npm ci`.** Instala exatamente o conjunto do
  `package-lock.json`, que é o mesmo que passa no CI. Não resolve versão na
  hora, então não há conflito possível, e apaga o `node_modules` antigo antes.
  **Deixou de pular sozinho para o SDK mais recente**: versão nova não testada
  é risco, não melhoria. Atualizar o SDK é decisão e tem comando próprio,
  `npm run sdk:atualizar`.
- **CI completo**, a cada push em `main` e `develop`: `npm ci`, conferência
  das versões com o SDK, `expo-doctor`, teste do plugin de Babel, diagnóstico,
  tipos, lint, testes, e **compilação para iPhone, Android e web**.

### Adicionado
- **Fluxo por Pull Request.** Tudo passa a entrar em `develop` e `main` por PR,
  com o CI rodando antes do merge. Os commits de merge são criados e assinados
  pelo próprio GitHub, então aparecem como **Verified** com o Alexandre como
  autor — sem depender de chave de assinatura em máquina nenhuma. A chave do
  ambiente onde o código é mantido não serve para isso: o GitHub recusou
  cadastrá-la na conta do Alexandre porque ela já pertence a outra conta.
- **Tags publicadas pelo GitHub Actions** (`versoes.yml`). A cada push em
  `main`, a versão do `package.json` vira tag. Na primeira execução, publica
  também as 19 versões de 1.0.0 a 1.5.6, que existiam só localmente — o envio
  de tags era bloqueado no ambiente de desenvolvimento.

### Verificado
- Medido no CI que o plugin de worklets roda **uma vez só**: a saída do Babel
  com o `babel.config.js` do projeto é idêntica à do preset puro. Rodar duas
  vezes compilaria sem erro e quebraria as animações no aparelho — por isso o
  teste virou passo permanente do CI (`scripts/ci/testar-babel.cjs`).
- Resultado da primeira execução verde: `expo-doctor` 20/20, 0 erros de tipo,
  0 problemas de lint, 127/127 testes, bundles de iPhone (4,7 MB), Android
  (4,7 MB) e web gerados.

---

## [1.5.6] — 2026-11-22

### Corrigido
- **Os 41 erros de tipo do SDK 58, agora verificados de fato.** A 1.5.5 acertou
  três dos quatro pontos e errou um: eu anotei os parâmetros de `tabBarIcon`
  como `{ color: string }`, supondo que o erro fosse inferência faltando. Não
  era. O log completo mostra `TS2322`: o `color` que o React Native entrega
  pode ser `null`, e `@expo/vector-icons` não aceita `null`. A anotação não
  resolvia e ainda brigava com a variância do tipo esperado. Revertida; no
  lugar, `color ?? undefined` no ponto de uso, que é o que o erro pedia.
- **`@types/node` resolvia mais do que eu tinha calculado.** Além dos 29 erros
  de `import` sem tipo, ele desfaz os 17 `possibly null` e `possibly undefined`
  nos testes: sem os tipos do Node, `assert.ok(x)` não é reconhecido como
  função de asserção, então o TypeScript não estreita `x` nas linhas seguintes.
  São 36 dos 41 erros num pacote só.

### Alterado
- A verificação de tipos feita durante o desenvolvimento passou a incluir
  `src/__tests__/` e `scripts/`, com os tipos reais do Node. **A configuração
  anterior excluía os testes** — foi por isso que 17 erros chegaram na máquina
  do Alexandre sem eu ter visto nenhum. `npm run typecheck` sempre cobriu esses
  arquivos; quem não cobria era a minha verificação.

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
  - `tabBarIcon` em `app/(tabs)/_layout.tsx` — diagnóstico errado nesta
    versão, corrigido na 1.5.6.
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

[1.7.2]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.7.2
[1.7.1]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.7.1
[1.7.0]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.7.0
[1.6.2]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.6.2
[1.6.1]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.6.1
[1.6.0]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.6.0
[1.5.6]: https://github.com/xandoqa/Carro_em_dia/releases/tag/v1.5.6
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
