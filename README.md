<div align="center">

<img src="assets/images/icon.png" width="96" alt="CarroEmDia" />

# CarroEmDia

**O histórico de manutenção do seu carro ou moto, num lugar só.**

Registre o que foi feito, saiba quanto falta para o próximo serviço e veja
para onde o dinheiro está indo.

[![CI](https://github.com/xandoqa/Carro_em_dia/actions/workflows/ci.yml/badge.svg)](https://github.com/xandoqa/Carro_em_dia/actions/workflows/ci.yml)
![Expo SDK 58](https://img.shields.io/badge/Expo-SDK%2058-0F4D45)
![React 19.3](https://img.shields.io/badge/React-19.3-0F4D45)
![React Native 0.88](https://img.shields.io/badge/React%20Native-0.88-0F4D45)
![TypeScript estrito](https://img.shields.io/badge/TypeScript-estrito-0F4D45)
![127 testes](https://img.shields.io/badge/testes-127%20passando-2F7D5B)
![versão 1.7.2](https://img.shields.io/badge/vers%C3%A3o-1.7.2-0F4D45)

<br>

Desenvolvido por **Alexandre Rodrigues Costa**, em dupla com
**Felipe do Nascimento Vitelli Peixoto**
<br>
<sub>Engenharia de Software · Universidade Católica de Brasília</sub>

<br>

**[📘 Como instalar e rodar](README-INSTALACAO.md)** ·
[Histórico de versões](CHANGELOG.md) ·
[Arquitetura](docs/arquitetura.md)

</div>

---

> ## 🚀 Quer só rodar o projeto?
>
> ### **→ [README-INSTALACAO.md](README-INSTALACAO.md) ←**
>
> Tutorial passo a passo para **Linux, Windows e macOS**: o que instalar, como
> conferir, como executar e como resolver os erros mais comuns. Escrito para
> quem nunca viu o projeto.
>
> **Sem instalar nada:** a versão web roda em
> **[xandoqa.github.io/Carro_em_dia](https://xandoqa.github.io/Carro_em_dia/)** —
> publicada automaticamente a cada versão.
>
> **Com pressa?** Baixe o
> [.zip](https://github.com/xandoqa/Carro_em_dia/archive/refs/heads/main.zip),
> extraia e rode `npm run setup` seguido de `npm start`.

---

## O problema

Muita gente não sabe dizer quando foi a última troca de óleo. As notas ficam na
gaveta, no porta-luvas ou numa conversa de WhatsApp com a oficina, e quando
precisa da informação ninguém acha.

Esquecer sai caro: uma revisão que passa do prazo vira problema no motor, no
freio ou nos pneus, e o conserto custa muito mais do que a manutenção que ficou
para trás. E na hora de vender, quem tem o histórico organizado consegue provar
que cuidou do veículo.

O CarroEmDia guarda esse histórico e avisa **antes** do prazo vencer.

## O que o app faz

- **Garagem** — vários veículos, cada um com foto, placa, odômetro e o estado
  do próximo serviço.
- **Registro de serviços** — tipo, data, quilometragem, valor, oficina,
  observações e foto da nota fiscal.
- **Lembretes calculados** — o app projeta o próximo serviço por quilometragem,
  por data ou pelos dois, e classifica em em dia, chegando ou vencido.
- **Avisos no celular** — notificação local alguns dias antes do prazo, mesmo
  com o app fechado.
- **Relatório de gastos** — total do período, evolução mês a mês, distribuição
  por categoria, maiores gastos, consumo médio em km/L e custo por quilômetro.
- **Consulta à tabela FIPE** — marca e modelo vêm de uma lista oficial no
  cadastro, com o valor de referência do veículo.
- **Quatro temas** — a escolha fica salva e vale na próxima vez que abrir.

## Como ficou

Garagem, painel do veículo e alertas, nos quatro temas:

<div align="center">
<img src="design/preview/temas.png" width="920" alt="Telas do CarroEmDia nos temas Oficina, Asfalto, Âmbar e Pista" />
</div>

### Protótipo navegável

Abra **[`design/preview/index.html`](design/preview/index.html)** no navegador:
são as 11 telas clicáveis, com troca de tema ao vivo. Nenhuma instalação,
nenhum servidor — dois cliques no arquivo e funciona. Toque nos cartões para
navegar, ou use <kbd>←</kbd> <kbd>→</kbd> para percorrer as telas.

> ### ⚠️ O protótipo não é o aplicativo
>
> | | O app | O protótipo |
> |---|---|---|
> | Onde | `app/` e `src/` | `design/preview/` |
> | Tecnologia | **React Native** (React 19, Expo 53) | HTML, CSS e JavaScript puro |
> | Arquivos | 67 em TypeScript | 2 |
> | Regras de negócio | Sim — calcula prazos, salva, notifica, consulta a FIPE | Nenhuma: é uma fotografia navegável |
> | Vale nota | Sim | Não |
>
> O protótipo foi escrito sem framework **de propósito**: ele precisa abrir
> sem `npm install`, sem build e sem servidor — se dependesse de React,
> dependeria justamente do que ele existe para dispensar.
>
> Ele usa os mesmos tokens de `design/tokens/tokens.json`, então desenha as
> telas com fidelidade. Serve para ver o resultado antes de conseguir rodar o
> Expo, revisar o design sem build, e como plano B se o celular falhar na
> apresentação. **Na apresentação, o que se mostra é o app no celular.**

## Rodando o projeto

### Sem instalar nada

**[xandoqa.github.io/Carro_em_dia](https://xandoqa.github.io/Carro_em_dia/)** —
a versão web, publicada pelo GitHub Actions a cada versão que chega à `main`.
Abre em qualquer navegador, do computador ou do celular. Os dados ficam no
navegador de quem usa; notificações e câmera só existem no app no celular.

### Na sua máquina

> **📘 [Tutorial completo de instalação](README-INSTALACAO.md)** — o passo a
> passo desta seção, expandido para **Linux, Windows e macOS**, desde instalar o
> Node até resolver os erros mais comuns. Se algo não subir, comece por aí.

### Tudo que precisa estar instalado

São **duas coisas obrigatórias**. O resto é opcional ou o próprio `npm` baixa.

#### 1. O que você instala na máquina

| Ferramenta | Versão | Obrigatório? | Para que serve |
|------------|--------|--------------|----------------|
| **Node.js** | **20 ou mais novo** | **Sim** | Executa o bundler, os scripts e os testes. O `npm` vem junto. |
| **npm** | 10+ | **Sim** (vem com o Node) | Instala as dependências do projeto |
| **Expo Go** (celular) | atual, da loja | **Sim**, se for rodar no celular | É o aplicativo que abre o projeto no aparelho. [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) · [iPhone](https://apps.apple.com/app/expo-go/id982107779) |
| Git | qualquer | Não | Só se quiser clonar em vez de baixar o `.zip` |
| VS Code | qualquer | Não | Editor. Veja [puxar direto pelo VS Code](#puxando-o-projeto-direto-pelo-vs-code) |
| Android Studio + `adb` | atual | Não | Só para o **emulador** Android. Guia em [README-INSTALACAO.md §3.4](README-INSTALACAO.md) |
| Xcode | atual | Não | Só para o simulador de iPhone, e só existe no macOS |

**Não precisa de:** conta no Expo, chave de API, banco de dados, servidor,
Docker, Python, Java, Android Studio (se usar o celular), Watchman, `.env` nem
qualquer cadastro. A única chamada externa é a tabela FIPE pela BrasilAPI, que é
pública e aberta.

No Linux há **um ajuste de sistema** necessário, senão o bundler falha com
`ENOSPC: System limit for number of file watchers reached`:

```bash
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

#### 2. O que o `npm install` baixa sozinho

Você **não digita nenhum destes nomes** — estão declarados no `package.json` e
vêm no `npm run setup`. A lista está aqui porque a disciplina pede as
dependências documentadas.

> **Sobre as versões.** O projeto está no **Expo SDK 58**, com **React 19.3**
> e **React Native 0.88**. Cada versão exata está travada no
> `package-lock.json`, que é o que o `npm run setup` instala — o mesmo conjunto
> que o [CI](https://github.com/xandoqa/Carro_em_dia/actions/workflows/ci.yml)
> instala, verifica e compila para iPhone, Android e web a cada push. Por isso
> a tabela não repete os números: a fonte é o `package.json`, e
> `npm ls --depth=0` mostra o que está instalado de fato.

**Dependências de execução (23):**

| Pacote | O que faz no projeto |
|--------|----------------------|
| `expo` | Plataforma: build, bundler e APIs nativas |
| `expo-router` | Navegação por arquivo — cada arquivo em `app/` é uma tela |
| `react` | Biblioteca de componentes |
| `react-native` | Renderiza os componentes como telas nativas |
| `react-dom` | Necessário para o alvo web |
| `react-native-web` | Faz o app rodar no navegador |
| `@react-native-async-storage/async-storage` | **Persistência**: salva veículos, manutenções e tema no aparelho |
| `expo-notifications` | **Notificações** locais agendadas |
| `expo-image-picker` | Foto da nota fiscal, pela câmera ou galeria |
| `react-native-reanimated` | Animação da faixa de medida, fora da thread de JS |
| `react-native-gesture-handler` | Gestos (exigido pelo router e pelo Reanimated) |
| `react-native-svg` | Os ícones próprios, desenhados no projeto |
| `react-native-safe-area-context` | Respeita notch e barra de gestos |
| `react-native-screens` | Telas nativas na navegação |
| `@expo/vector-icons` | Ícones de interface |
| `expo-haptics` | Retorno tátil ao trocar de aba |
| `expo-linking` | Tocar na notificação abre o veículo certo |
| `expo-constants` | Lê a configuração do `app.json` em tempo de execução |
| `expo-splash-screen` | Tela de abertura |
| `expo-status-bar` | Cor da barra de status conforme o tema |
| `expo-asset` | Carrega ícone e splash — **exigido pelo build web** |
| `expo-font` | Carrega a fonte dos ícones — **exigido pelo `@expo/vector-icons`** |
| `react-native-worklets` | Executa as animações fora da thread de JS — **exigido pelo Reanimated 4** |

**Dependências de desenvolvimento (8)** — não vão para o aplicativo:

| Pacote | Para que |
|--------|----------|
| `typescript` | Checagem de tipos (`npm run typecheck`) |
| `@types/react` | Tipos do React |
| `tsx` | Roda os testes em TypeScript sem compilar |
| `eslint` | Análise estática |
| `eslint-config-expo` | Regras de ESLint do Expo |
| `eslint-config-prettier` | Desliga as regras de ESLint que brigam com o Prettier |
| `prettier` | Formatação |
| `@types/node` | Tipos do Node, usados pelos testes e scripts |

> **Nenhuma dependência pesada.** Não há biblioteca de gráficos, de estado
> (Redux, Zustand), de HTTP (Axios) nem de 3D. O motivo de cada ausência está
> em [Tecnologias](#tecnologias).

### Passo a passo, do zero até o app na mão

**1. Instale o Node 20+**

```bash
# Linux e macOS — pelo nvm, que não exige sudo
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# feche e reabra o terminal
nvm install 22
```

No Windows, baixe o instalador LTS em [nodejs.org](https://nodejs.org/) e marque
*"Add to PATH"*.

**Confirme antes de seguir** — se este comando não responder, nada depois
funciona:

```bash
node --version    # precisa ser v20.x ou mais alto
npm --version     # precisa ser 10.x ou mais alto
```

**2. Instale o Expo Go no celular**

Pela loja: [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
ou [iPhone](https://apps.apple.com/app/expo-go/id982107779). O celular precisa
estar **na mesma rede Wi-Fi** do computador.

**3. No Linux, aumente o limite de observadores de arquivo**

```bash
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**4. Traga o projeto para a máquina** — três caminhos, escolha um:

```bash
# a) Pelo VS Code, sem baixar .zip  →  veja a seção abaixo

# b) Com Git
git clone https://github.com/xandoqa/Carro_em_dia.git
cd Carro_em_dia

# c) Sem Git, pelo .zip
# baixe https://github.com/xandoqa/Carro_em_dia/archive/refs/heads/main.zip
unzip Carro_em_dia-main.zip
cd Carro_em_dia-main
```

**Confira que é a versão atual** antes de seguir. Pasta antiga é a causa mais
comum de "ainda dá o mesmo erro":

```bash
grep '"version"' package.json    # precisa bater com o selo de versão no topo deste README
```

**5. Instale as dependências**

```bash
npm run setup
```

Instala **exatamente** as versões do `package-lock.json` (`npm ci`) — as
mesmas que passam no CI — e roda o diagnóstico no fim. Não resolve versão
nenhuma na hora, então não existe conflito possível, e apaga qualquer
`node_modules` antigo antes, desfazendo instalações pela metade.
**Demora de 2 a 5 minutos** e baixa cerca de 700 MB — é a única etapa pesada.

Ao final, se aparecer aviso de vulnerabilidades:

> **Não rode `npm audit fix --force`.** O terminal sugere isso, mas em projeto
> Expo o comando ignora as versões que o SDK exige e quebra a instalação. Os
> alertas vêm de dependências internas das ferramentas de build e não entram no
> aplicativo.

**6. Confira que o ambiente está sadio**

```bash
npm run doctor
```

Precisa terminar em **`Tudo certo`** ou só com avisos. Se listar bloqueios, cada
um vem com o arquivo envolvido e o comando exato da correção.

**7. Entre na sua conta Expo (uma vez só) e inicie**

O Expo Go do celular só abre o projeto se o terminal estiver entrado na
**mesma** conta Expo que ele:

```bash
npx expo login       # mesmo usuário e senha do Expo Go
npm run start:limpo  # inicia limpando o cache do bundler
```

Use `npm run start:limpo` sempre que tiver baixado uma versão nova: o cache do
bundler guarda o código anterior e pode mostrar erros que já foram corrigidos.
Nas outras vezes, `npm start` basta.

Um QR Code aparece no terminal.

- **Android:** abra o Expo Go e toque em *Scan QR code*
- **iPhone:** aponte a câmera do sistema e toque na notificação

**O celular precisa estar no mesmo Wi-Fi do computador** — nos dados móveis
(4G/5G) o Expo Go mostra *"Could not connect to the server"*. Sem Wi-Fi em
comum, ou numa rede que isola os aparelhos (como a da faculdade), use o túnel,
que funciona em qualquer rede:

```bash
npm run start:tunnel
```

**8. Carregue os dados de exemplo**

No app: **Ajustes → Dados → Carregar dados de exemplo**. Cria dois veículos com
histórico, já com serviços vencidos, chegando no prazo e em dia. Sem isso as
telas de alerta e de gastos aparecem vazias.

**Outros destinos:** `npm run android` (emulador), `npm run ios` (simulador,
só macOS) ou `npm run web` (navegador).

### Puxando o projeto direto pelo VS Code

Sem baixar `.zip` e sem digitar `git clone`.

**1. Abra a paleta de comandos:** `Ctrl+Shift+P` (no Mac, `Cmd+Shift+P`)

**2. Digite `Git: Clone` e dê Enter**

**3. Cole a URL:**

```
https://github.com/xandoqa/Carro_em_dia.git
```

**4. Escolha a pasta** onde ele vai ficar (por exemplo `~/Documentos`)

**5. Clique em *Abrir*** quando o VS Code perguntar

O projeto abre já na pasta certa. Depois, **Terminal → Novo Terminal**
(`Ctrl+Shift+'`) e siga do passo 5 acima: `npm run setup`.

> Precisa ter o Git instalado — é o VS Code que o chama. Se ele reclamar que não
> encontrou o Git, instale com `sudo apt install git` e reabra o VS Code.

#### E sem baixar absolutamente nada?

Dá, mas com limite. Para **rodar** o app, as dependências têm de existir em
algum disco — não há como fugir dos 700 MB. O que muda é **de quem é o disco**:

| Caminho | Como | Dá para rodar? |
|---------|------|----------------|
| **VS Code na web** | Abra o repositório no GitHub e aperte a tecla **`.`** (ponto). Vira `github.dev` — VS Code no navegador, nada instalado. | **Não.** Lê, edita e faz commit, mas não tem terminal: nem `npm`, nem Expo. |
| **GitHub Codespaces** | Na página do repositório: **Code → Codespaces → Create codespace**. Máquina Linux na nuvem, VS Code no navegador. | **Só no navegador** (`npm run web`). O download acontece na máquina da nuvem, não na sua. Para celular ou emulador, não serve. |
| **Clone pelo VS Code** | Os 5 passos acima | **Sim**, tudo: celular, emulador e navegador |

Para a apresentação de terça, use o clone normal. `github.dev` é ótimo para
mostrar o código num computador que não é o seu — abre em dois segundos e mostra
a estrutura de pastas inteira.

### Se algo der errado

```bash
npm run doctor
```

O diagnóstico verifica ambiente, dependências, versões, arquivos e porta. Para
cada problema ele diz **o que aconteceu, por quê, qual arquivo está envolvido,
como resolver e o comando exato** para executar. Roda sem nenhuma dependência
instalada — justamente para funcionar quando o `npm install` falhou.

### Configuração do ambiente

**Não há nenhuma.** O projeto não usa variáveis de ambiente, arquivo `.env`,
banco de dados nem servidor próprio. Tudo que é configurável está em arquivos
versionados:

| Arquivo | Para que serve |
|---------|----------------|
| `app.json` | Nome, ícone, splash, permissões e plugins do Expo |
| `package.json` | Dependências e comandos |
| `babel.config.js` | Transformações de código (detecta o plugin de worklets sozinho) |
| `tsconfig.json` | Regras do TypeScript |
| `.eslintrc.js` / `.prettierrc` | Padrão de código |

A única chamada externa é a consulta à tabela FIPE pela BrasilAPI, que é pública
e não exige cadastro nem chave.

### Primeiro uso

Em **Ajustes → Dados → Carregar dados de exemplo** o app cria dois veículos com
histórico — já com serviços vencidos, chegando no prazo e em dia. É o caminho
mais rápido para ver tudo funcionando, e o que usamos na apresentação.

### Verificando

```bash
npm run verify   # typecheck + lint + os 127 testes
```

## Requisitos da disciplina

| Requisito | Onde está |
|-----------|-----------|
| App em React Native | Expo SDK 58 com Expo Router |
| Notificação | [`src/services/notificationService.ts`](src/services/notificationService.ts) |
| Requisição de Web Service | [`src/services/fipeService.ts`](src/services/fipeService.ts) — tabela FIPE pela BrasilAPI |
| Persistência de dados | [`src/data/`](src/data/) — AsyncStorage |
| Mínimo 4 telas interativas | 11 telas |
| GitHub com Git Flow | `main` / `develop` / `feature/*` — ver [`docs/git-flow.md`](docs/git-flow.md) |
| Finalidade além de ver informações | Registra serviços, calcula prazos, agenda avisos, gera relatório |

### As 11 telas

| # | Tela | Arquivo |
|---|------|---------|
| 1 | Garagem | `app/(tabs)/index.tsx` |
| 2 | Alertas | `app/(tabs)/alertas.tsx` |
| 3 | Gastos | `app/(tabs)/gastos.tsx` |
| 4 | Cadastro de veículo | `app/veiculo/novo.tsx` |
| 5 | Painel do veículo | `app/veiculo/[id]/index.tsx` |
| 6 | Editar veículo | `app/veiculo/[id]/editar.tsx` |
| 7 | Histórico | `app/veiculo/historico.tsx` |
| 8 | Registrar manutenção | `app/manutencao/nova.tsx` |
| 9 | Aparência | `app/aparencia.tsx` |
| 10 | Editar manutenção | `app/manutencao/[id].tsx` |
| 11 | Ajustes | `app/ajustes.tsx` |

## Como os lembretes funcionam

Esta é a regra central do app, então vale explicar.

Cada serviço tem um intervalo padrão — óleo a cada 10.000 km ou 12 meses, por
exemplo. Ao registrar um serviço, o app projeta o próximo a partir dali:

```
último serviço: 105.000 km, 10/01/2026
intervalo:      10.000 km
                ↓
próximo:        115.000 km
odômetro hoje:  114.500 km
                ↓
faltam 500 km → janela de atenção é 1.500 km → "chegando"
```

Três decisões que valem registrar:

**A previsão que o usuário informa vale sozinha.** Quem escolheu "avisar em
10.000 km" e deixou os meses em branco não recebe um vencimento por data
herdado do padrão do tipo. Essa regra apareceu escrevendo os testes: a primeira
versão herdava o padrão e criava prazos que ninguém tinha pedido.

**A janela de atenção é proporcional** — 15% do intervalo, com piso de 300 km e
teto de 2.000 km. Um valor fixo erraria dos dois lados: 1.000 km é cedo demais
para uma troca de 3.000 km de moto, e tarde demais para pneus de 40.000 km.

**Lembretes nunca são salvos.** São recalculados a cada leitura, porque o
odômetro muda. Um lembrete gravado ficaria desatualizado em silêncio e o app
passaria a mentir sobre o que está vencido.

## Identidade visual

O protótipo no Figma era um wireframe em preto e branco: definiu a estrutura da
informação, não a aparência. A direção visual veio do mundo do usuário —
oficina, odômetro, etiqueta de revisão no para-brisa — e não de um estilo
genérico de aplicativo.

### A faixa de medida

O elemento assinatura. Uma régua graduada com as duas pontas rotuladas e um
cursor na posição atual:

```
┌───────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│   │
└───────────────────────────────────────┘
 105.000 km                    115.000 km
```

O usuário não quer saber "72% concluído", quer saber que está em 114.500 e que
o limite é 115.000. A régua mostra os três números que respondem à pergunta, e
as marcas de escala dão a noção de distância que uma barra lisa não dá. Quando
o prazo vence, ela preenche sólida na cor de atraso em vez de parar em 100%.

### O raio da borda carrega informação

| Raio | Significa | Onde |
|------|-----------|------|
| 20 | objeto | cartão de veículo, de alerta |
| 10 | controle | botão, campo, aba |
| 4 | leitura | odômetro, faixa de medida |
| 999 | estado | pílula de em dia / chegando / vencido |

### Cor com regra

Verde, âmbar e vermelho pertencem ao **estado do veículo**. Aparecem na pílula
de estado e na faixa de medida, nunca como decoração. É isso que faz a cor
significar alguma coisa: quando o usuário vê vermelho, é porque algo venceu.

### Números são o conteúdo

Toda medida — quilometragem, valores, datas, placa — usa fonte monoespaçada.
Não é estética: em uma lista de dez serviços, a coluna de valores é lida
verticalmente, e com fonte proporcional `180,00` e `1.190,00` não alinham.

Detalhes completos em [`design/identidade/README.md`](design/identidade/README.md).

## O que mudou em relação ao protótipo

| Protótipo | Aqui | Por quê |
|-----------|------|---------|
| Gráfico de pizza nos gastos | Lista com barra empilhada | Numa tela de celular a pizza exige legenda, e a legenda ocupa o mesmo espaço da lista sem permitir ler o valor exato. |
| Barra de progresso simples | Faixa de medida graduada | Mostra as duas pontas e a posição em vez de uma porcentagem abstrata. |
| Rótulos em CAIXA ALTA | Sentence case | Mais rápido de ler, menos ruído. |
| Lista suspensa de tipo de serviço | Grade com as 8 opções visíveis | O tipo é a primeira decisão do formulário. |
| Marca e modelo digitados | Lista da tabela FIPE | Evita "VW" e "Volkswagen" no mesmo app, e traz o valor de referência. |
| Tela de login | Ainda não implementada | Os dados ficam no aparelho e não há contas, então hoje o login seria uma tela sem função. Ver *Próximos passos*. |

## O que foi implementado e corrigido

Tudo que entrou no projeto desde a primeira versão, com o motivo de cada coisa.
A ordem cronológica, por versão, está no [CHANGELOG.md](CHANGELOG.md).

### Funcionalidades do aplicativo

| O que | Por que existe |
|-------|----------------|
| **Cadastro de veículos com consulta FIPE** | Marca e modelo vêm de uma lista oficial em vez de campo livre. Evita "VW" e "Volkswagen" no mesmo app, preenche ano e combustível sozinho e guarda o valor de referência. Com a API fora do ar o cadastro continua por digitação — travar o cadastro porque um serviço externo caiu seria inaceitável. |
| **Registro de manutenções** | Tipo, data, quilometragem, valor, oficina, observações e foto da nota. É o dado que alimenta todo o resto. |
| **Edição de manutenção** | O protótipo previa "editar ou excluir", mas só excluir existia. Sem edição, corrigir um valor exigia apagar e refazer. |
| **Edição de veículo** | Faltava completamente. Quem errasse uma letra no apelido só tinha a saída de excluir o veículo — o que apaga junto **todo o histórico**. Uma letra errada custava o registro inteiro. |
| **Cálculo de lembretes** | Projeta o próximo serviço por quilometragem, por data ou pelos dois, e classifica em em dia, chegando ou vencido. É a regra central do app. |
| **Notificações locais** | Avisam dias antes do prazo mesmo com o app fechado. Sem isso o app seria um caderno: só serve se você lembrar de abrir. |
| **Relatório de gastos** | Total do período, evolução mensal, categorias, consumo médio em km/L e custo por quilômetro. |
| **Histórico com filtros** | Por tipo e por período, mostrando o total do que está filtrado. "Quanto já gastei só com freio" é uma das perguntas que levam o usuário ali. |
| **Quatro temas persistentes** | Claro, escuro, âmbar noturno e alto contraste. A escolha sobrevive a fechar o app. |
| **Correção do odômetro** | Permite baixar a quilometragem para desfazer erro de digitação, com piso no maior km registrado. Ver as correções abaixo. |
| **Dados de exemplo** | Um toque cria 2 veículos com histórico já produzindo os três estados de lembrete. Um app vazio não mostra gráfico nem alerta vencido — e digitar dez registros ao vivo na apresentação seria perda de tempo. |

### Correções de defeitos

Cada um destes foi encontrado na revisão ou escrevendo testes, não reportado por
usuário. O detalhamento está em [`docs/melhorias.md`](docs/melhorias.md).

| Defeito | Como se manifestava | Gravidade |
|---------|---------------------|-----------|
| **Odômetro inflado ficava preso** | Registrar manutenção com km maior sobe o odômetro; `atualizarKm` só aceitava valores maiores; excluir o registro não abaixava nada. Quem digitasse 1.145.000 em vez de 114.500 **não tinha caminho de volta**, e todos os lembretes do veículo passavam a mentir. | Alta |
| **Vencidos nunca notificavam** | O disparo era "X dias antes do prazo" — conta que, para algo já vencido, cai no passado. O serviço mais urgente era o único que nunca avisava. | Alta |
| **Plugin de Babel do Reanimated** | O arquivo fixava o nome antigo. Atualizar o SDK — necessário para o Expo Go atual — quebrava o app na abertura com um erro de worklet que não aponta a causa. Agora detecta sozinho. | Alta |
| **API depreciada do seletor de imagens** | `MediaTypeOptions` some em versões novas. Viraria erro de propriedade indefinida **na hora de anexar a foto** — falha que só aparece em uso, não na inicialização. | Média |
| **Previsão em km criava prazo invisível** | Quem escolhia "avisar em 10.000 km" e deixava os meses em branco recebia, sem pedir, o prazo em meses padrão do tipo. O app mostrava um vencimento que o usuário nunca definiu. | Média |
| **Permissão pedida na abertura** | O app pedia notificação antes de existir qualquer veículo — o jeito mais rápido de ouvir "não". | Média |
| **Salvar não confirmava nada** | Voltava em silêncio. Numa tela cheia de campos, "salvou" e "falhou" eram indistinguíveis. | Média |
| **Teclado cobria os campos (iOS)** | Nos formulários longos o campo de baixo ficava inacessível e o usuário digitava às cegas. | Média |
| **Comandos de recuperação inúteis sem Git** | O diagnóstico mandava `git checkout <arquivo>`, que falha para quem baixou o `.zip`. Mandar rodar algo que não funciona é a pior coisa que um diagnóstico pode fazer. | Média |
| **Contraste ilegível no tema Pista** | O botão primário era quase preto sobre quase preto. Achado renderizando os temas lado a lado. | Média |
| **Faixa de medida apagada** | O elemento assinatura era o menos legível do cartão, e as marcas de escala sumiam justamente quando o prazo vencia. | Baixa |
| **Gráfico de barras invisível** | No protótipo, `align-items: flex-end` zerava a altura das colunas e as barras não apareciam. | Baixa |
| **O projeto não instalava numa máquina limpa** | O `package.json` estava metade no SDK 53, metade no 58; o `app.json` tinha três campos que o SDK 58 removeu; faltavam `expo-font`, `react-native-worklets` e `eslint-config-prettier`; e não havia `package-lock.json`, então o CI nunca tinha rodado. Achado usando o GitHub Actions como máquina de teste. | **Alta** |

### Infraestrutura

| O que | Por que existe |
|-------|----------------|
| **Diagnóstico no terminal** (`npm run doctor`) | Verifica Node, dependências, versão do SDK, plugin de Babel, arquivos, porta e o limite de inotify no Linux. Para cada problema diz o que aconteceu, por quê, qual arquivo, como resolver e o comando. Roda sem dependência instalada — precisa funcionar justamente quando o `npm install` falhou. |
| **Verificação antes de iniciar** | `npm start` roda o diagnóstico antes do Expo e explica, em vez de deixar o bundler falhar com mensagem crua. |
| **`npm run setup`** | Instala as versões travadas no `package-lock.json` com `npm ci` e verifica, em um comando. Mesmo conjunto que passa no CI, sem conflito de versão possível. |
| **CI no GitHub Actions** | A cada push em `main` e `develop`, numa máquina limpa: instala, confere as versões com o SDK, roda o `expo-doctor`, tipos, lint e testes, e **compila o app para iPhone, Android e web**. É a prova de que o projeto funciona fora da máquina de quem o escreveu. |
| **`package-lock.json`** | Trava as 902 versões exatas. Sem ele, cada instalação resolvia as versões de novo, e a de uma máquina podia não ser a de outra. |
| **Versionamento semântico** | 11 tags de `v1.0.0` a `v1.4.1`, com CHANGELOG. Antes eram 46 commits sem nenhuma versão: não dava para dizer o que mudou entre dois momentos nem voltar a um estado conhecido. |
| **Script de publicação de versões** | Envia as tags pendentes de uma vez. |
| **Fluxo por Pull Request** | Tudo entra em `develop` e `main` por PR, com o CI rodando antes. O GitHub cria e assina os commits de merge, que aparecem como **Verified** com o Alexandre como autor. |
| **Tags automáticas** | O workflow `versoes.yml` transforma cada versão do `package.json` em tag `vX.Y.Z` ao chegar em `main`. |
| **Script de assinatura** | Para assinar o histórico anterior à 1.6.0 com uma chave própria (`npm run assinar -- --historico`). Reescreve o histórico; ver `docs/git-flow.md`. |
| **127 testes** | Cobrem as regras de negócio, rodando no Node sem emulador em menos de dois segundos. Foram eles que revelaram o prazo invisível. |
| **CI no GitHub Actions** | Typecheck, lint e testes a cada push. |
| **Execução a partir do `.zip`** | Dá para rodar sem Git. |

### Interface e design

| O que | Por que existe |
|-------|----------------|
| **Identidade visual própria** | O protótipo era wireframe em preto e branco: definiu a estrutura, não a aparência. A direção veio do mundo do usuário — oficina, odômetro, etiqueta de revisão. |
| **Faixa de medida** | O elemento assinatura. Uma régua graduada com as duas pontas rotuladas, em vez de "72% concluído": o usuário quer saber que está em 114.500 e que o limite é 115.000. |
| **Raio de borda como hierarquia** | 20 objeto, 10 controle, 4 leitura, pílula estado. O raio carrega informação em vez de decorar. |
| **Ícones desenhados** | As bibliotecas genéricas não têm marca para "troca de óleo" e oferecem uma chave inglesa para tudo, que não distingue um serviço do outro. |
| **Calendário** | A data era digitada como `2026-11-08` no teclado numérico, que nem tem hífen. Era o pior momento do app, no formulário mais usado. |
| **Botão flutuante** | O botão no fim da lista sumia de vista com três ou quatro veículos. |
| **Esqueleto de carregamento** | Tem a forma do cartão real, então a tela não salta quando os dados chegam. |
| **Puxar para atualizar** | Era o único gesto que todo mundo tenta e não fazia nada. |
| **Protótipo navegável** | As 11 telas em HTML, sem instalar nada. Serve para ver o app antes de conseguir rodar o Expo e como plano B na apresentação. |

### Documentação

| Documento | Para quê |
|-----------|----------|
| [`README-INSTALACAO.md`](README-INSTALACAO.md) | Tutorial para Linux, Windows e macOS |
| [`CHANGELOG.md`](CHANGELOG.md) | O que mudou em cada versão |
| [`docs/arquitetura.md`](docs/arquitetura.md) | Decisões técnicas e o porquê de cada uma |
| [`docs/melhorias.md`](docs/melhorias.md) | Defeitos corrigidos e os que ficam mapeados |
| [`docs/validacao.md`](docs/validacao.md) | O que foi testado e o que falta testar |
| [`docs/git-flow.md`](docs/git-flow.md) | Branches, versões e commits verificados |
| [`design/identidade/`](design/identidade/README.md) | O sistema visual |

## Estrutura do repositório

```
app/              telas (Expo Router — o arquivo define a rota)
src/
  domain/         regras de negócio puras, sem React Native
  data/           persistência (AsyncStorage) e repositórios
  services/       FIPE, notificações, cliente HTTP
  hooks/          estado compartilhado
  theme/          tokens, paletas, provedor de tema
  components/     base/, domain/, charts/
  icons/          conjunto próprio de ícones
  utils/          data, formatação, conversões
  __tests__/      testes das camadas puras
design/
  identidade/     o sistema visual e as decisões por trás dele
  tokens/         tokens.json, gerado a partir de src/theme
  wireframes/     o protótipo original do Figma
  preview/        preview dos quatro temas no navegador
docs/             arquitetura, planejamento, Git Flow, documentação original
assets/images/    ícone, splash, favicon
scripts/          diagnóstico e exportação de tokens
.github/          CI e modelos de issue e PR
```

### Principais módulos

| Módulo | Responsabilidade | Depende de |
|--------|------------------|------------|
| `src/domain/models.ts` | Entidades e intervalos padrão por tipo de serviço | nada |
| `src/domain/reminders.ts` | Projeta o próximo serviço e classifica o estado | `models`, `utils/date` |
| `src/domain/expenses.ts` | Agrega gastos, consumo médio e custo por km | `models`, `utils/date` |
| `src/domain/odometer.ts` | Valida leituras de odômetro e correções | `models` |
| `src/domain/notificationSchedule.ts` | Decide **quando** avisar | `models`, `utils/date` |
| `src/data/storage.ts` | Camada fina sobre o AsyncStorage | AsyncStorage |
| `src/data/garageRepository.ts` | CRUD de veículos e manutenções | `storage`, `domain` |
| `src/services/http.ts` | Cliente sobre `fetch`, com timeout e retentativa | nada |
| `src/services/fipeService.ts` | Tabela FIPE com cache de 7 dias | `http`, `storage` |
| `src/services/notificationService.ts` | Conversa com o sistema operacional | `expo-notifications`, `domain` |
| `src/hooks/useGarage.tsx` | Estado compartilhado; deriva os lembretes | `data`, `domain`, `services` |
| `src/theme/` | Tokens, paletas e provedor de tema | nada (exceto `fonts.ts`) |

**A regra que organiza tudo:** `src/domain/` não importa nada do React Native.
É isso que permite rodar as regras de negócio no Node, sem emulador — e é por
isso que os 127 testes rodam em menos de dois segundos.

## Tecnologias

| O quê | Por quê |
|-------|---------|
| Expo SDK 58 + Expo Router | Rotas por arquivo e build sem configuração nativa |
| TypeScript estrito | Erro que o compilador pega é erro que não chega na apresentação |
| AsyncStorage | Persistência local, sem servidor |
| expo-notifications | Avisos agendados no aparelho |
| react-native-reanimated | A animação da faixa de medida, rodando fora da thread de JS |
| react-native-svg | Os ícones próprios |
| BrasilAPI / FIPE | Marca, modelo e valor de referência |

**Dependências que decidimos não usar:**

- *Biblioteca de gráficos* — centenas de kB para o que cabe em 40 linhas de
  `View`.
- *Biblioteca de estado* (Redux, Zustand) — duas coleções e meia dúzia de ações
  cabem num contexto.
- *Axios* — `fetch` já existe; o que faltava (timeout, retentativa, erro
  tipado) são 90 linhas em `services/http.ts`.
- *3D / `three.js`* — custo alto de bundle e bateria para enfeitar um dado que
  uma barra comunica melhor.

## Próximos passos

Em ordem de utilidade:

1. **Exportar o histórico** — a documentação justifica o app em parte pela
   venda do veículo, e hoje não há como tirar o histórico de dentro dele.
2. **Guardar as fotos no diretório do app** — hoje elas apontam para o cache do
   sistema, que pode ser limpo.
3. **Adiar um lembrete** — um alerta que não some deixa de ser lido.
4. **Login e sincronização** — a camada de dados já é assíncrona, então trocar
   o AsyncStorage por um backend não exige mexer em nenhuma tela.

Cada um está detalhado, com o porquê e o caminho,
em [`docs/melhorias.md`](docs/melhorias.md).

## Comandos

| Comando | Finalidade |
|---------|------------|
| `npm run setup` | Instala, alinha versões e verifica. **Primeira vez.** |
| `npm start` | Inicia o app, verificando o ambiente antes |
| `npm run start:limpo` | Inicia limpando o cache do bundler |
| `npm run start:tunnel` | Inicia por túnel, para redes que isolam dispositivos |
| `npm run android` / `ios` / `web` | Abre no emulador, simulador ou navegador |
| `npm run doctor` | Diagnostica ambiente, dependências, versões e porta |
| `npm run doctor:expo` | Diagnóstico oficial do Expo |
| `npm run fix:deps` | Alinha as bibliotecas ao SDK instalado |
| `npm run verify` | typecheck + lint + testes |
| `npm test` | Os 127 testes das regras de negócio |
| `npm run typecheck` | Só a checagem de tipos |
| `npm run lint` / `lint:fix` | Padrão de código |
| `npm run format` | Formata com Prettier |
| `npm run tokens` | Regera `design/tokens/tokens.json` a partir de `src/theme` |

## Problemas conhecidos

| Problema | Causa | Solução |
|----------|-------|---------|
| *"Project is incompatible with this version of Expo Go"* | O Expo Go do celular é de um SDK diferente do 58. Acontece quando a loja já lançou o Expo Go de um SDK mais novo | Atualize o Expo Go na loja; se a loja já estiver num SDK novo, `npm run sdk:atualizar` |
| `Unable to resolve module <nome>` | Instalação incompleta ou com versões misturadas | `npm run setup` — reinstala as versões travadas, que compilam no CI |
| `ENOSPC: System limit for number of file watchers` (Linux) | Limite do inotify baixo demais para o Metro | `echo fs.inotify.max_user_watches=524288 \| sudo tee -a /etc/sysctl.conf && sudo sysctl -p` |
| QR Code não conecta | Celular e computador em redes diferentes, ou firewall | `npm run start:tunnel` |
| Erro de worklet ao abrir | `babel.config.js` editado à mão | `git checkout babel.config.js && npm run start:limpo` |
| Notificações não chegam | Permissão negada, ou economia de bateria agressiva no Android | Ajustes do sistema → Expo Go → permitir notificações |
| Lista da FIPE vazia | BrasilAPI fora do ar ou celular sem internet | O cadastro continua funcionando com digitação manual |
| `npm run ios` falha | Simulador de iPhone só existe no macOS | Use Android ou um iPhone real com Expo Go |
| `npm audit` aponta vulnerabilidades | Dependências internas das ferramentas de build, que não entram no app | **Não use `npm audit fix --force`** — quebra o Expo. Use `npx expo install --fix` |

Todos são detectados pelo `npm run doctor`, que já entrega o comando.

### Limitações conhecidas do app

- **Sem login e sem sincronização.** Os dados ficam no aparelho; trocar de
  celular não leva o histórico junto.
- **As fotos apontam para o cache do sistema.** Se o sistema limpar o cache, a
  imagem da nota fiscal se perde. Ver [`docs/melhorias.md`](docs/melhorias.md),
  item B.
- **Não há exportação do histórico** ainda.
- **Os testes cobrem as regras de negócio, não a interface.** A UI é verificada
  à mão e pelo protótipo em HTML.

## Manutenção e futuras implementações

| Quero mudar... | Mexa em |
|----------------|---------|
| Uma tela | `app/` — o arquivo define a rota |
| Cores, fontes, espaçamento | `src/theme/` — depois rode `npm run tokens` |
| Uma regra de negócio | `src/domain/` — **e escreva o teste junto** |
| Como os dados são salvos | `src/data/` |
| A consulta à FIPE ou as notificações | `src/services/` |
| Um componente reaproveitável | `src/components/` |

**Ao adicionar uma funcionalidade:** se ela tiver regra de negócio, ela vai para
`src/domain/` com teste. Se precisar tocar a plataforma, vai para
`src/services/`. Manter essa separação é o que permite testar sem emulador.

**Ao trocar o armazenamento por um backend:** a interface de
`src/data/garageRepository.ts` já é assíncrona de propósito. Reimplemente as
funções chamando a API e nenhuma tela precisa mudar.

O fluxo de trabalho da dupla e as regras de branch estão em
[`docs/git-flow.md`](docs/git-flow.md).

## Documentação

- [**Como instalar e rodar**](README-INSTALACAO.md) — tutorial para Linux, Windows e macOS
- [**Guia da apresentação**](docs/apresentacao.md) — emulador Android, planos B e C, roteiro e perguntas prováveis
- [**Histórico de versões**](CHANGELOG.md) — o que mudou em cada versão
- [**Validação**](docs/validacao.md) — o que foi testado, o que falta testar e o roteiro de verificação
- [Melhorias: o que foi corrigido e o que fica mapeado](docs/melhorias.md)
- [Arquitetura e decisões técnicas](docs/arquitetura.md)
- [Planejamento de 7 dias](docs/planejamento-7-dias.md)
- [Git Flow do projeto](docs/git-flow.md)
- [Identidade visual](design/identidade/README.md)
- [Documentação original do protótipo](docs/Documentacao_Prototipo_CarroEmDia_UCB.docx)
- [Protótipo do Figma](design/wireframes/prototipo-figma-v1.pdf)

## Equipe

Universidade Católica de Brasília — Engenharia de Software

### Desenvolvimento

**O desenvolvimento do aplicativo e todas as atualizações foram feitos em
dupla por Alexandre Rodrigues Costa e Felipe do Nascimento Vitelli Peixoto.**

A dupla trabalhou assim, do começo ao fim do projeto:

| Etapa | Responsável |
|-------|-------------|
| Escrita do código | Alexandre |
| Correções e ajustes | Felipe |
| Análise e revisão do código | Alexandre e Felipe, juntos |

Cada funcionalidade passava pelas três etapas antes de ser integrada na
`develop`: Alexandre implementava, Felipe revisava e corrigia, e os dois
analisavam o resultado juntos antes do merge. É essa revisão a quatro olhos
que está por trás das correções registradas em
[`docs/melhorias.md`](docs/melhorias.md) — vários dos defeitos listados ali
apareceram justamente na etapa de análise conjunta.

### Grupo

| Integrante | Matrícula |
|------------|-----------|
| Alexandre Rodrigues Costa | UC23101095 |
| Caio Murilo Silva de Oliveira | UC23100307 |
| Ester Yasmin Santos Silva | UC23102494 |
| Felipe do Nascimento Vitelli Peixoto | UC23200011 |

---

<div align="center">
<sub>Trabalho final — N2</sub>
</div>
