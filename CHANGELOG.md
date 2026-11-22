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
- Aplicativo em React Native com Expo SDK 53 e Expo Router.
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
