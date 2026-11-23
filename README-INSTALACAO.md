# Como instalar e rodar o CarroEmDia

> Este é o guia de instalação. Para entender o que o projeto é, as decisões
> técnicas e a arquitetura, veja o [README principal](README.md).

Tutorial do zero, para quem nunca viu o projeto. Cobre **Linux**, **Windows** e
**macOS**.

> **Antes de qualquer coisa:** se algo der errado em qualquer etapa, rode
> `npm run doctor`. Ele verifica o ambiente e diz o que fazer, com o comando
> pronto para copiar. É a primeira coisa a tentar, não a última.

> ### Só quer ver o app funcionando?
>
> **[xandoqa.github.io/Carro_em_dia](https://xandoqa.github.io/Carro_em_dia/)** —
> a versão web, publicada a cada versão. Nada para instalar.

> ### Já tem o projeto e continua dando erro?
>
> Na maioria das vezes é **pasta antiga**: o erro já foi corrigido, mas o código
> na sua máquina é de antes da correção. Confira:
>
> ```bash
> grep '"version"' package.json
> ```
>
> Se não for a versão do selo no topo do [README](README.md), baixe de novo
> numa pasta nova — **feche o terminal antes**, porque um terminal aberto
> dentro de uma pasta apagada continua rodando nela:
>
> ```bash
> cd ~/Documentos
> rm -rf Carro_em_dia-main Carro_em_dia.zip
> curl -L -o Carro_em_dia.zip https://github.com/xandoqa/Carro_em_dia/archive/refs/heads/main.zip
> unzip Carro_em_dia.zip && cd Carro_em_dia-main
> npm run setup
> npm run start:limpo
> ```
>
> O `setup` reinstala **exatamente** as versões que passam no
> [CI](https://github.com/xandoqa/Carro_em_dia/actions/workflows/ci.yml), e o
> `start:limpo` apaga o cache do bundler, que guarda o código anterior.

---

## Resumo (Linux)

Se você já tem Node 20 ou maior:

```bash
# Baixe e extraia o .zip do projeto, ou clone com git:
# https://github.com/xandoqa/Carro_em_dia/archive/refs/heads/main.zip

cd Carro_em_dia-main     # ou Carro_em_dia, se clonou com git
npm run setup
npx expo login           # uma vez só: a mesma conta do Expo Go do celular
npm run start:limpo
```

Leia o QR Code com o app **Expo Go** no celular. No navegador: `npm run web`.
Pronto.

O resto deste documento explica cada etapa em detalhe e o que fazer quando não
funciona.

---

## Sumário

1. [O que o projeto é (e o que ele não precisa)](#1-o-que-o-projeto-é-e-o-que-ele-não-precisa)
2. [Ferramentas necessárias](#2-ferramentas-necessárias)
3. [Instalando no Linux](#3-instalando-no-linux)
4. [Instalando no Windows](#4-instalando-no-windows)
5. [Instalando no macOS](#5-instalando-no-macos)
6. [Baixando o projeto e instalando as dependências](#6-baixando-o-projeto-e-instalando-as-dependências)
7. [Rodando o aplicativo](#7-rodando-o-aplicativo)
8. [Rodando pelo terminal do VS Code](#8-rodando-pelo-terminal-do-vs-code)
9. [Como saber se está funcionando](#9-como-saber-se-está-funcionando)
10. [Erros comuns e soluções](#10-erros-comuns-e-soluções)
11. [Comandos disponíveis](#11-comandos-disponíveis)

---

## 1. O que o projeto é (e o que ele não precisa)

O CarroEmDia é um **aplicativo de celular** feito em React Native com Expo.
Entender isso evita procurar coisas que não existem:

| Pergunta | Resposta |
|----------|----------|
| Tem backend para subir? | **Não.** O app roda inteiro no celular. |
| Tem banco de dados para configurar? | **Não.** Os dados ficam no próprio aparelho (AsyncStorage). |
| Tem arquivo `.env` ou variáveis de ambiente? | **Não.** Nenhuma chave, senha ou URL precisa ser configurada. |
| Precisa de servidor rodando? | Só o do Expo, que `npm start` sobe sozinho. |
| Usa internet? | Só para consultar a tabela FIPE (API pública, sem cadastro). O resto funciona offline. |

Ou seja: **instalar e rodar é instalar as dependências e dar `npm start`.** Não
há configuração de ambiente além disso.

---

## 2. Ferramentas necessárias

| Ferramenta | Versão | Para quê | Obrigatório? |
|------------|--------|----------|--------------|
| **Node.js** | 20 ou maior | Roda o projeto e o bundler | Sim |
| **npm** | vem com o Node | Instala as dependências | Sim |
| **Git** | qualquer | Baixa o repositório (opcional: dá para usar o .zip) | Não |
| **Expo Go** (celular) | da loja | Abre o app no seu telefone | Sim, se for usar celular |
| **Android Studio** | qualquer | Emulador Android | Só para emulador |
| **Xcode** | qualquer | Simulador iPhone | Só no macOS |
| **VS Code** | qualquer | Editar o código | Recomendado |

> **Node 18 ou mais antigo não serve.** O Expo exige Node 20+. Com versão antiga
> o erro aparece no meio do bundle e não diz que a causa é a versão.

### No celular

| Sistema | Onde baixar |
|---------|-------------|
| Android | [Expo Go na Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) |
| iPhone | [Expo Go na App Store](https://apps.apple.com/app/expo-go/id982107779) |

O celular e o computador precisam estar **na mesma rede Wi-Fi**. Se não puderem,
veja a opção `--tunnel` na [seção 10](#10-erros-comuns-e-soluções).

### As dependências do projeto você não instala

As 27 bibliotecas que o aplicativo usa estão declaradas no `package.json` e vêm
todas no `npm run setup` da [seção 6.2](#62-instalar). **Você não digita nenhum
nome de pacote.**

A lista completa, com a versão e o papel de cada uma, está no
[README principal → Rodando o projeto](README.md#rodando-o-projeto). Em resumo:

| Grupo | Quantas | Exemplos |
|-------|---------|----------|
| Plataforma e navegação | 6 | `expo`, `expo-router`, `react-native` |
| Requisitos da disciplina | 3 | `async-storage` (persistência), `expo-notifications` (notificações), e a FIPE por `fetch` (web service) |
| Interface e animação | 8 | `reanimated`, `react-native-svg`, `safe-area-context` |
| Recursos do aparelho | 4 | `expo-image-picker`, `expo-haptics`, `expo-linking` |
| Ferramentas de desenvolvimento | 6 | `typescript`, `eslint`, `prettier`, `tsx` |

### Não é necessário nada disso

Para evitar instalação por engano: o projeto **não** usa nem precisa de conta no
Expo, chave de API, arquivo `.env`, banco de dados, servidor próprio, Docker,
Python, Java, Watchman, Yarn, pnpm nem CocoaPods. Um `npm run setup` e o Expo Go
bastam.

---

## 3. Instalando no Linux

> Esta é a plataforma usada no desenvolvimento do projeto.

### 3.1 Node.js pelo nvm (recomendado)

Não use `sudo apt install nodejs`: a maioria das distribuições entrega uma
versão antiga demais. O **nvm** instala a versão certa e permite trocar depois.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

Feche e reabra o terminal (ou rode `source ~/.bashrc`), depois:

```bash
nvm install --lts
nvm use --lts
```

**Conferindo:**

```bash
node --version    # precisa mostrar v20 ou maior
npm --version
```

### 3.2 Git

```bash
# Debian, Ubuntu, Mint, Pop!_OS
sudo apt update && sudo apt install git

# Fedora
sudo dnf install git

# Arch, Manjaro
sudo pacman -S git
```

**Conferindo:** `git --version`

### 3.3 Aumentar o limite de observadores de arquivo

**Esta etapa é específica do Linux e resolve um erro muito comum.**

O Metro (bundler do React Native) observa milhares de arquivos ao mesmo tempo. O
limite padrão de várias distribuições é baixo demais, e aí aparece:

```
Error: ENOSPC: System limit for number of file watchers reached
```

A mensagem parece falta de espaço em disco, mas não é. Para resolver de vez:

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**Conferindo:**

```bash
cat /proc/sys/fs/inotify/max_user_watches    # precisa mostrar 524288
```

> O `npm run doctor` verifica isso automaticamente e avisa se estiver baixo.

### 3.4 Emulador Android no Linux

Funciona igual ao do Windows: é o mesmo Android Studio, mesma interface.

**1. Baixar o Android Studio**

[developer.android.com/studio](https://developer.android.com/studio) → baixe o
`.tar.gz` para Linux.

```bash
cd ~/Downloads
tar -xzf android-studio-*-linux.tar.gz
sudo mv android-studio /opt/
/opt/android-studio/bin/studio.sh
```

Na primeira execução ele baixa o SDK do Android (alguns GB). Aceite o padrão.

**2. Criar o aparelho virtual**

Na tela inicial do Android Studio:

1. **More Actions** → **Virtual Device Manager**
2. **Create Device**
3. Escolha **Pixel 6** (ou outro) → **Next**
4. Baixe uma imagem do sistema — pegue uma com **Google Play** → **Next**
5. **Finish**
6. Clique no ▶ para ligar o emulador

**3. Deixar os comandos disponíveis no terminal**

Sem isso o `npm run android` não acha o emulador. Adicione ao fim do seu
`~/.bashrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
```

Recarregue e confira:

```bash
source ~/.bashrc
adb --version          # deve responder
emulator -list-avds    # deve listar o aparelho que você criou
```

**4. Rodar o projeto nele**

Com o emulador **já aberto**:

```bash
npm run android
```

**Se a aceleração por hardware falhar** (emulador lento ou que não abre):

```bash
sudo apt install qemu-kvm
sudo usermod -aG kvm $USER
```

Saia da sessão e entre de novo. Conferir:

```bash
kvm-ok     # precisa dizer "KVM acceleration can be used"
```

> **Alternativa mais leve:** o [Genymotion](https://www.genymotion.com/) tem
> versão gratuita para uso pessoal e costuma ser mais rápido que o emulador do
> Android Studio em máquinas modestas.

### 3.5 Celular Android por cabo USB (alternativa ao emulador)

Mais leve que emulador e mais próximo do real.

1. No celular: **Ajustes** → **Sobre o telefone** → toque 7 vezes em **Número da
   compilação** para liberar as opções de desenvolvedor.
2. **Ajustes** → **Opções do desenvolvedor** → ligue **Depuração USB**.
3. Conecte o cabo e autorize no celular.

```bash
adb devices     # deve listar o aparelho
npm run android
```

### 3.6 iPhone no Linux

**Você não precisa de Mac para testar no iPhone.** O Expo Go funciona:

```bash
npm start
```

Leia o QR Code com a **câmera do iPhone** e toque na notificação.

> O que **não** funciona no Linux é o comando `npm run ios`, que abre o
> simulador do Xcode — software da Apple que só roda no macOS. Com iPhone
> físico e Expo Go, nada disso é necessário.

## 4. Instalando no Windows

### 4.1 Node.js

Baixe o instalador **LTS** em [nodejs.org](https://nodejs.org) e execute. Aceite
as opções padrão.

**Conferindo** (abra o PowerShell):

```powershell
node --version
npm --version
```

### 4.2 Git

Baixe em [git-scm.com](https://git-scm.com/download/win) e instale. Nas opções,
deixe o padrão.

**Conferindo:** `git --version`

### 4.3 Se os comandos não forem reconhecidos

Se o PowerShell disser *"O termo 'node' não é reconhecido"*, o PATH não foi
atualizado. **Feche e reabra o PowerShell.** Se continuar, reinicie o
computador.

### 4.4 Permissão de execução de scripts

O Windows pode bloquear o `npm` com *"execução de scripts foi desabilitada"*.
Abra o PowerShell **como administrador** e rode:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Responda `S` (ou `Y`).

### 4.5 Emulador Android (opcional)

Instale o [Android Studio](https://developer.android.com/studio) e crie um
dispositivo virtual em *Virtual Device Manager*.

> **No Windows não existe simulador de iPhone.** `npm run ios` só funciona no
> macOS.

### 4.6 Observação sobre o WSL

Se você usa WSL (Linux dentro do Windows), siga as instruções da
[seção 3](#3-instalando-no-linux), mas saiba que o celular pode não enxergar o
servidor por causa da rede virtual. Nesse caso use `npm run start:tunnel`.

---

## 5. Instalando no macOS

### 5.1 Homebrew (se ainda não tiver)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 5.2 Node.js e Git

```bash
brew install node git
```

Ou instale o Node pelo [nodejs.org](https://nodejs.org) (versão LTS).

**Conferindo:**

```bash
node --version    # v20 ou maior
npm --version
git --version
```

### 5.3 Simulador de iPhone (opcional)

1. Instale o [Xcode](https://apps.apple.com/app/xcode/id497799835) pela App Store
   (é grande, reserve tempo).
2. Abra o Xcode uma vez e aceite os termos.
3. Instale as ferramentas de linha de comando:

```bash
xcode-select --install
```

Depois disso `npm run ios` funciona.

### 5.4 Emulador Android (opcional)

Mesmo processo do Linux: [Android Studio](https://developer.android.com/studio)
→ *Virtual Device Manager*.

---

## 6. Baixando o projeto e instalando as dependências

A partir daqui os comandos são **iguais nos três sistemas**.

Há três formas de obter o projeto. **Escolha uma.**

| | Precisa de Git? | Baixa `.zip` à mão? | Atualizar depois |
|---|---|---|---|
| **6.1a** `.zip` | Não | Sim | Baixar o zip de novo |
| **6.1b** `git clone` | Sim | Não | `git pull` |
| **6.1c** VS Code | Sim (o VS Code o chama) | Não | Botão de sincronizar |

### 6.1a Pelo arquivo .zip (sem Git)

Se você não tem Git ou prefere não usá-lo.

**Baixar:**

- Pelo navegador: abra
  [github.com/xandoqa/Carro_em_dia](https://github.com/xandoqa/Carro_em_dia) →
  botão verde **Code** → **Download ZIP**.
- Ou pelo link direto:
  [Carro_em_dia-main.zip](https://github.com/xandoqa/Carro_em_dia/archive/refs/heads/main.zip)

**Extrair e entrar na pasta:**

```bash
# Linux e macOS
unzip Carro_em_dia-main.zip
cd Carro_em_dia-main
```

```powershell
# Windows (PowerShell)
Expand-Archive Carro_em_dia-main.zip -DestinationPath .
cd Carro_em_dia-main
```

> No Windows você também pode clicar com o botão direito no `.zip` →
> *Extrair tudo*.

**Duas diferenças de quem usa o .zip:**

| | Com Git | Com .zip |
|---|---|---|
| Atualizar o projeto | `git pull` | Baixar o zip de novo |
| Recuperar arquivo alterado | `git checkout <arquivo>` | Baixar o zip e copiar o arquivo |

O `npm run doctor` detecta qual dos dois você está usando e ajusta os comandos
que sugere. Fora isso, **tudo funciona igual**.

### 6.1b Pelo Git (recomendado se você já tem)

```bash
git clone https://github.com/xandoqa/Carro_em_dia.git
cd Carro_em_dia
```

### 6.1c Direto pelo VS Code, sem baixar .zip

O VS Code clona o repositório por você — nenhum arquivo passa pela pasta de
downloads.

**1.** Abra a paleta de comandos:

| Sistema | Atalho |
|---------|--------|
| Linux e Windows | `Ctrl` + `Shift` + `P` |
| macOS | `Cmd` + `Shift` + `P` |

**2.** Digite `Git: Clone` e dê `Enter`.

**3.** Cole a URL e dê `Enter`:

```
https://github.com/xandoqa/Carro_em_dia.git
```

**4.** Escolha a pasta onde o projeto vai ficar — por exemplo `~/Documentos`.
O VS Code cria a subpasta `Carro_em_dia` ali dentro.

**5.** Quando ele perguntar, clique em **Abrir** (ou *Open*).

Pronto: o projeto está aberto e o terminal integrado já começa dentro da pasta
certa. Siga para o [6.2](#62-instalar).

**Se o VS Code disser que não encontrou o Git:**

```bash
# Linux
sudo apt install git     # Debian, Ubuntu, Mint, Pop!_OS
sudo dnf install git     # Fedora
```

No Windows, instale pelo [git-scm.com](https://git-scm.com/download/win). Em
qualquer um dos dois, **feche e reabra o VS Code** depois — ele só procura o Git
ao iniciar.

#### Entrando com a conta do GitHub (opcional)

Só é necessário se você for **enviar** commits. Para apenas baixar e rodar, o
repositório é público e não pede login.

Na barra lateral: ícone de conta (canto inferior esquerdo) → **Sign in with
GitHub** → o navegador abre e volta autorizado. A partir daí o botão de
sincronizar, no canto inferior, envia e recebe commits sem terminal.

#### Sem instalar nada: `github.dev` e Codespaces

Para **rodar** o app, as dependências precisam existir em algum disco — os
~700 MB do `node_modules` não têm como ser evitados. O que muda é **de quem é o
disco**.

| Caminho | Como abrir | Dá para rodar o app? |
|---------|-----------|----------------------|
| **github.dev** | Na página do repositório no GitHub, aperte a tecla **`.`** (ponto). Também funciona trocando `github.com` por `github.dev` na URL. | **Não.** É o VS Code no navegador: lê, edita, faz commit — mas não tem terminal, então não existe `npm` nem Expo. |
| **GitHub Codespaces** | Na página do repositório: **Code** → aba **Codespaces** → **Create codespace on main**. | **Só no navegador.** Roda `npm run setup` e `npm run web` numa máquina Linux da nuvem. Não serve para celular nem emulador, e o plano gratuito tem limite de horas. |
| **Clone pelo VS Code** (6.1c) | Os passos acima | **Sim** — celular, emulador e navegador |

> Para a apresentação, use o clone (6.1c). O `github.dev` é útil para mostrar o
> código num computador que não é o seu: abre em dois segundos, sem instalar
> nada, e exibe a estrutura de pastas inteira.

### 6.2 Instalar

```bash
npm run setup
```

Esse comando faz duas coisas:

| Etapa | O que faz |
|-------|-----------|
| `npm ci` | Apaga o `node_modules` antigo, se houver, e instala **exatamente** as versões do `package-lock.json` |
| `node scripts/doctor.mjs` | Verifica se ficou tudo certo e avisa o que falta |

O `package-lock.json` é gerado e testado no
[CI](https://github.com/xandoqa/Carro_em_dia/actions/workflows/ci.yml): a cada
mudança, uma máquina limpa instala o projeto, roda o `expo-doctor`, os tipos, o
lint e os testes, e compila o app para iPhone, Android e web. O que você instala
é o mesmo conjunto que passou ali — **Expo SDK 58, React 19.3, React Native
0.88**.

> Demora alguns minutos na primeira vez, quase tudo em download. Se o `npm ci`
> falhar por algum motivo, o script tenta a instalação comum sozinho e avisa.

### 6.3 Confirmar que deu certo

Ao final, o `setup` imprime o diagnóstico. Você quer ver:

```
Tudo certo. O projeto está pronto para rodar.
```

Se aparecer algum problema, ele vem com a explicação e o comando para resolver.
Rode o comando indicado e depois:

```bash
npm run doctor
```

---

## 7. Rodando o aplicativo

### 7.1 No celular (recomendado)

**Antes, uma vez só: entre na sua conta Expo no terminal.** Se o Expo Go do
celular estiver entrado numa conta, ele só abre o projeto quando o computador
estiver entrado na **mesma**. Sem isso, o QR Code conecta e o terminal repete
*"You need to be signed in to Expo Go and Expo CLI"*.

```bash
npx expo login       # mesmo usuário e senha do Expo Go
npx expo whoami      # confere: precisa responder com o seu usuário
```

Fica salvo no computador. Esqueceu a senha? Redefina em
[expo.dev](https://expo.dev), na tela de login.

Depois:

```bash
npm start
```

Um QR Code aparece no terminal.

| Sistema do celular | O que fazer |
|--------------------|-------------|
| **Android** | Abra o **Expo Go** → *Scan QR code* → aponte para o terminal |
| **iPhone** | Abra a **câmera** → aponte para o QR Code → toque na notificação |

O app compila (de 30 segundos a 2 minutos na primeira vez) e abre no celular.

### 7.2 No emulador Android

Com o emulador já aberto:

```bash
npm run android
```

### 7.3 No simulador de iPhone (só macOS)

```bash
npm run ios
```

### 7.4 No navegador

```bash
npm run web
```

> **Atenção:** no navegador as **notificações não funcionam** (dependem do
> sistema do celular) e a câmera/galeria se comportam de forma diferente. Serve
> para conferir layout rapidamente, não para testar o app de verdade.

> **Se o navegador der `Unable to resolve module ...`:** é instalação
> incompleta ou com versões misturadas — a compilação web passa no CI. Reinstale
> as versões travadas:
>
> ```bash
> npm run setup
> ```

### 7.5 Teclas úteis enquanto roda

| Tecla | O que faz |
|-------|-----------|
| `r` | Recarrega o app |
| `m` | Abre o menu de desenvolvedor no celular |
| `j` | Abre o depurador |
| `Ctrl + C` | Para o servidor |

Salvar um arquivo recarrega o app sozinho.

---

## 8. Rodando pelo terminal do VS Code

### 8.1 Abrir o projeto

```bash
code .
```

Ou: VS Code → *File* → *Open Folder* → escolha a pasta `Carro_em_dia`.

### 8.2 Abrir o terminal integrado

| Sistema | Atalho |
|---------|--------|
| Linux e Windows | `Ctrl` + `'` (crase) |
| macOS | `Cmd` + `'` (crase) |

Ou pelo menu: *Terminal* → *New Terminal*.

O terminal já abre dentro da pasta do projeto, então é só rodar:

```bash
npm run setup     # primeira vez
npm start         # todas as outras
```

### 8.3 Se o terminal do VS Code não achar o Node

Acontece principalmente no Linux com nvm: o VS Code abre um terminal que não
carrega o `~/.bashrc`.

**Solução:** feche o VS Code completamente e abra pelo terminal com `code .` —
assim ele herda o ambiente correto.

### 8.4 Extensões recomendadas (opcional)

| Extensão | Para quê |
|----------|----------|
| ESLint | Mostra problemas enquanto você digita |
| Prettier | Formata o código |
| Expo Tools | Autocompletar do `app.json` |

---

## 9. Como saber se está funcionando

### 9.1 Verificação automática

```bash
npm run doctor
```

Verifica ambiente, dependências, versões, arquivos e porta. Se tudo estiver bem:

```
Tudo certo. O projeto está pronto para rodar.
```

### 9.2 Verificação do código

```bash
npm run verify
```

Roda três checagens em sequência:

| Checagem | O que confirma |
|----------|----------------|
| `typecheck` | O TypeScript não tem erro de tipo |
| `lint` | O código segue o padrão do projeto |
| `test` | As 127 regras de negócio passam |

O resultado dos testes deve terminar com `# pass 127` e `# fail 0`.

### 9.3 Verificação no app

Abra o app e faça este roteiro:

1. **Ajustes** (engrenagem no topo) → **Dados** → **Carregar dados de exemplo**.
   Devem aparecer 2 veículos com histórico.
2. Volte para a garagem: deve mostrar serviços **vencidos** (vermelho) e
   **chegando** (âmbar).
3. Toque num veículo → o painel abre com odômetro e a faixa de medida.
4. **Ajustes** → **Notificações** → ligue → **Enviar aviso de teste**. A
   notificação deve chegar em alguns segundos.
5. **Ajustes** → **Tema** → troque para *Asfalto*. O app inteiro muda de cor.
6. Feche o app completamente e abra de novo: os dados e o tema continuam lá.

Se esses seis passos funcionarem, o app está funcionando.

---

## 10. Erros comuns e soluções

> **Primeiro passo sempre:** `npm run doctor`. Ele identifica a maioria destes
> casos automaticamente e já dá o comando.

### "You need to be signed in to Expo Go and Expo CLI" / "signed in to Expo Go as ..., but not signed in to Expo CLI"

**Causa:** o Expo Go do celular está entrado numa conta Expo e o terminal do
computador não está. O projeto em si está funcionando — o celular chegou até
ele.

```bash
npx expo login      # mesmo usuário e senha do Expo Go
npm start
```

### `Failed to resolve the Android SDK path` / `spawn adb ENOENT`

**Causa:** foi pressionada a tecla `a` (abrir no Android) sem o emulador
instalado. Para usar o celular, ignore e leia o QR Code. Para instalar o
emulador, veja a [seção 3.4](#34-emulador-android-no-linux).

### `ExpoNotifications.getLastNotificationResponse is not available on web`, ou linhas `λ Bundled ... render.js` no terminal

**Causa:** versão antiga do projeto. Esse erro foi corrigido na 1.6.2, e as
linhas `λ` (pré-renderização no servidor) deixaram de existir na 1.7.0. Se elas
aparecem, o código na sua pasta é de antes disso.

**Solução:** o quadro "Já tem o projeto e continua dando erro?", no topo deste
guia.

### "Project is incompatible with this version of Expo Go"

**O mais provável de acontecer.** O Expo Go da loja é mais novo que o SDK do
projeto.

```bash
npm install expo@latest
npx expo install --fix
npm run doctor
```

### `ENOSPC: System limit for number of file watchers reached` (Linux)

Limite de observadores de arquivo. Veja a [seção 3.3](#33-aumentar-o-limite-de-observadores-de-arquivo).

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### "Could not connect to the server" / "There was a problem running the requested project"

O Expo Go chegou a tentar, mas **o celular não alcança o computador**. O projeto
está bem — é rede.

O QR Code aponta para o endereço do computador **dentro da rede Wi-Fi**
(algo como `192.168.0.10:8081`). Esse endereço só existe para quem está na
mesma rede. A causa mais comum, de longe:

> **O celular está nos dados móveis (4G/5G), e não no Wi-Fi.** Olhe o canto
> superior do celular: se aparece `5G` ou `4G` no lugar do ícone do Wi-Fi, é
> isso. Foi exatamente o que aconteceu no primeiro teste no iPhone.

Na ordem:

**1. Mesma rede.** Conecte o celular no **mesmo Wi-Fi do computador** e toque em
*Try again*. Resolve na maior parte das vezes.

**2. Sem Wi-Fi em comum, ou rede que isola os aparelhos** (Wi-Fi de faculdade,
de hotel, roteador com "isolamento de clientes"): use o túnel, que passa pela
internet e funciona até nos dados móveis.

```bash
npm run start:tunnel
```

Na primeira vez ele pede para instalar o `@expo/ngrok`: responda **Y**. Depois,
leia o QR Code novo. É mais lento para carregar, mas funciona em qualquer rede.

**3. Mesma rede e mesmo assim não conecta (Linux):** o firewall pode estar
bloqueando a porta do Expo.

```bash
sudo ufw allow 8081
```

**Na apresentação:** confira antes que o celular está no Wi-Fi da sala, ou já
comece com `npm run start:tunnel`.

### O QR Code não conecta / "Something went wrong"

Mesma causa e mesma solução do erro acima: celular e computador em redes
diferentes, ou firewall bloqueando. Comece pelo passo 1 de lá.

### `Error: Cannot find module` ao iniciar

Instalação incompleta.

```bash
# Linux e macOS
rm -rf node_modules package-lock.json && npm run setup

# Windows (PowerShell)
Remove-Item -Recurse -Force node_modules, package-lock.json
npm run setup
```

### Tela branca, ou erro estranho depois de trocar de branch

Cache do bundler.

```bash
npm run start:limpo
```

### `EADDRINUSE: port 8081 already in use`

Outro servidor já está rodando.

```bash
# Linux e macOS
lsof -ti:8081 | xargs kill -9

# Windows
netstat -ano | findstr :8081
taskkill /PID <numero_do_pid> /F

# Ou simplesmente use outra porta:
npx expo start --port 8082
```

### Erro de worklet ao abrir o app

O `babel.config.js` descobre sozinho qual plugin usar, mas se alguém o editou:

```bash
git checkout babel.config.js
npm run start:limpo
```

### As notificações não chegam

1. Ajustes do celular → Apps → Expo Go → Notificações → **permitir**.
2. No app: **Ajustes** → **Notificações** → ligado.
3. Use **Enviar aviso de teste** para isolar.
4. No **navegador não funciona** — teste no celular.
5. No Android, modo *Não perturbe* e economia de bateria agressiva (Xiaomi,
   Samsung, Motorola) seguram avisos agendados.

### A lista de marcas (FIPE) não carrega

1. Confira a internet **do celular** — a requisição sai dele, não do computador.
2. A BrasilAPI pode estar fora do ar. O app avisa e **continua funcionando**: os
   campos aceitam digitação manual e o cadastro segue normalmente.

### `npm install` falha com erro de permissão (Linux e macOS)

**Não use `sudo` com npm.** Se aparecer `EACCES`:

```bash
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

Para tornar permanente, adicione a linha do `export` ao seu `~/.bashrc` ou
`~/.zshrc`.

### "execução de scripts foi desabilitada" (Windows)

Veja a [seção 4.4](#44-permissão-de-execução-de-scripts).

### `npm audit` aponta vulnerabilidades

**Não rode `npm audit fix --force`.** O próprio terminal sugere esse comando,
mas em projeto Expo ele quebra a instalação: ignora as versões que o SDK exige
e troca pacotes por outros que o Expo não suporta. O app para de iniciar.

As vulnerabilidades reportadas quase sempre vêm de dependências internas das
ferramentas de build — não entram no aplicativo que roda no celular. É ruído
normal em projeto Expo.

Quem cuida das versões é:

```bash
npx expo install --fix
```

Se precisar mesmo investigar:

```bash
npm audit --omit=dev     # ignora as ferramentas de desenvolvimento
```

### Nada do acima resolveu

```bash
npm run doctor:expo
```

Esse é o diagnóstico oficial do Expo e checa coisas que o nosso não cobre.

---

## 11. Comandos disponíveis

### Para rodar

| Comando | O que faz |
|---------|-----------|
| `npm run setup` | Instala com o SDK **atual** e verifica. **Use na primeira vez.** |
| `npm run sdk:atualizar` | Sobe o Expo para um SDK **mais novo que o 58** e realinha as bibliotecas. As versões novas **não** foram testadas no CI — use só quando for atualizar o projeto de propósito |
| `npm run setup:fixo` | Igual ao `npm run setup` (mantido por compatibilidade) |
| `npm start` | Inicia o app (verifica o ambiente antes) |
| `npm run start:limpo` | Inicia limpando o cache do bundler |
| `npm run start:tunnel` | Inicia por túnel, para redes que bloqueiam |
| `npm run android` | Abre no emulador Android |
| `npm run ios` | Abre no simulador iPhone (só macOS) |
| `npm run web` | Abre no navegador |

### Para diagnosticar

| Comando | O que faz |
|---------|-----------|
| `npm run doctor` | Verifica ambiente, dependências, versões e porta |
| `npm run doctor:expo` | Diagnóstico oficial do Expo |
| `npm run fix:deps` | Alinha as bibliotecas ao SDK instalado |

### Para verificar o código

| Comando | O que faz |
|---------|-----------|
| `npm run verify` | typecheck + lint + testes |
| `npm test` | Só os 127 testes |
| `npm run typecheck` | Só os tipos |
| `npm run lint` | Só o padrão de código |
| `npm run lint:fix` | Corrige o que dá para corrigir sozinho |
| `npm run format` | Formata com Prettier |

---

## Ainda travado?

1. `npm run doctor` — resolve a maioria dos casos.
2. Leia a mensagem de erro inteira; o Expo costuma dizer o comando que resolve.
3. [Documentação do Expo](https://docs.expo.dev) (em inglês).
4. Veja a [arquitetura do projeto](docs/arquitetura.md) para entender a estrutura.
