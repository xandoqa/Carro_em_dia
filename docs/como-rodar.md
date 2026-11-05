# Como rodar o CarroEmDia

Guia completo, do zero até o app rodando no celular. Se você nunca mexeu com
React Native, siga na ordem — nada aqui pressupõe conhecimento prévio de Expo.

**Tempo estimado na primeira vez:** 15 a 20 minutos, quase todo em download.

---

## Sumário

1. [O que você precisa instalar](#1-o-que-você-precisa-instalar)
2. [Baixando o projeto](#2-baixando-o-projeto)
3. [Instalando as dependências](#3-instalando-as-dependências)
4. [Rodando no celular](#4-rodando-no-celular)
5. [Rodando no emulador](#5-rodando-no-emulador)
6. [Primeiro uso: dados de exemplo](#6-primeiro-uso-dados-de-exemplo)
7. [Testando os requisitos da disciplina](#7-testando-os-requisitos-da-disciplina)
8. [Rodando os testes](#8-rodando-os-testes)
9. [Quando dá errado](#9-quando-dá-errado)
10. [Comandos do dia a dia](#10-comandos-do-dia-a-dia)
11. [Trabalhando em equipe](#11-trabalhando-em-equipe)

---

## 1. O que você precisa instalar

### No computador

| O quê | Versão | Como conferir | Onde baixar |
|-------|--------|---------------|-------------|
| **Node.js** | 20 ou mais novo | `node --version` | [nodejs.org](https://nodejs.org) (escolha a versão **LTS**) |
| **Git** | qualquer | `git --version` | [git-scm.com](https://git-scm.com) |

> **Node 18 ou mais antigo não serve.** O Expo SDK 53 exige Node 20+. Se o
> `node --version` mostrar `v18.x` ou menos, instale a versão LTS do site.

### No celular

Instale o **Expo Go**, que é o app que roda projetos Expo sem precisar gerar
um APK:

- **Android:** [Expo Go na Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iPhone:** [Expo Go na App Store](https://apps.apple.com/app/expo-go/id982107779)

> **Importante:** o celular e o computador precisam estar na **mesma rede
> Wi-Fi**. Rede de celular ou Wi-Fi de visitante com isolamento de clientes
> não funciona — veja a [seção 9](#9-quando-dá-errado).

Você **não** precisa instalar Android Studio nem Xcode para rodar no celular
com o Expo Go. Eles só são necessários para o emulador (seção 5).

---

## 2. Baixando o projeto

```bash
git clone https://github.com/xandoqa/Carro_em_dia.git
cd Carro_em_dia
```

Se você vai desenvolver, mude para a branch de trabalho:

```bash
git checkout develop
```

> `main` tem o que está entregue; `develop` tem o que está em andamento. Veja
> [git-flow.md](git-flow.md).

---

## 3. Instalando as dependências

São **dois** comandos, e o segundo é tão importante quanto o primeiro:

```bash
npm install
npx expo install --fix
```

### Por que o segundo comando

O `package.json` fixa as versões do Expo SDK 53. O `expo install --fix`
confere se cada biblioteca é compatível com o SDK que acabou de ser instalado e
corrige o que estiver fora. Rodar isso na primeira vez evita a maior parte dos
erros estranhos de inicialização.

Se ele alterar o `package.json`, está tudo certo — é o esperado. Vale commitar
a mudança.

### Conferindo que deu certo

```bash
npx expo-doctor
```

Deve terminar com todos os itens marcados. Se apontar algo, a mensagem já diz
o comando que resolve.

---

## 4. Rodando no celular

```bash
npm start
```

Vai aparecer um QR Code no terminal.

| Sistema | O que fazer |
|---------|-------------|
| **Android** | Abra o **Expo Go** → *Scan QR code* → aponte para o terminal |
| **iPhone** | Abra a **câmera** do iOS → aponte para o QR Code → toque na notificação que aparece |

O app compila (demora de 30 s a 2 min na primeira vez) e abre no celular.

### Enquanto roda

Com o terminal aberto, você pode digitar:

| Tecla | O que faz |
|-------|-----------|
| `r` | Recarrega o app |
| `m` | Abre o menu de desenvolvedor no celular |
| `j` | Abre o depurador |
| `Ctrl+C` | Para o servidor |

Salvar um arquivo recarrega o app automaticamente (*fast refresh*).

---

## 5. Rodando no emulador

Só se você preferir o emulador ao celular físico.

### Android

Precisa do [Android Studio](https://developer.android.com/studio) com um
dispositivo virtual criado (*Device Manager* → *Create Device*).

```bash
npm run android
```

### iPhone

Só funciona em **Mac**, com [Xcode](https://apps.apple.com/app/xcode/id497799835)
instalado.

```bash
npm run ios
```

### Navegador

```bash
npm run web
```

> **Atenção:** no navegador, as **notificações não funcionam** (dependem do
> sistema operacional do celular) e a câmera / galeria se comportam diferente.
> Serve para conferir layout rapidamente, não para testar os requisitos da
> disciplina.

---

## 6. Primeiro uso: dados de exemplo

O app começa vazio. Para ver tudo funcionando sem digitar nada:

> **Ajustes** (engrenagem no topo da Garagem) → seção **Dados** → **Carregar
> dados de exemplo**

Isso cria 2 veículos com histórico completo, já produzindo:

- **2 serviços vencidos** (um por km, um por data)
- **3 chegando no prazo**
- **2 em dia**
- Abastecimentos suficientes para o app calcular consumo médio em km/L

É o que usamos na apresentação. As datas são calculadas a partir de *hoje*,
então o cenário continua coerente em qualquer dia.

Para limpar: **Ajustes → Dados → Apagar todos os dados**.

---

## 7. Testando os requisitos da disciplina

Roteiro para conferir cada requisito funcionando. Útil antes da apresentação.

### Persistência de dados

1. Carregue os dados de exemplo.
2. **Feche o app completamente** (não só minimize — tire da lista de apps
   recentes).
3. Abra de novo.

✅ Os veículos, o histórico e o tema escolhido continuam lá.

### Requisição de Web Service (tabela FIPE)

1. Garagem → **Cadastrar veículo**.
2. Toque em **Marca** — a lista vem da API da FIPE pela BrasilAPI.
3. Escolha uma marca → toque em **Modelo** → escolha um.
4. O app consulta o preço e mostra o **valor de referência FIPE**, além de
   preencher ano e combustível sozinho.

**Para mostrar o cache funcionando:**

1. Faça a consulta acima uma vez (com internet).
2. Ligue o **modo avião**.
3. Abra o cadastro de novo e toque em Marca.

✅ A lista aparece mesmo offline, vinda do cache de 7 dias.

### Notificação

1. **Ajustes → Notificações → Avisos de manutenção** → ligue o interruptor.
2. Aceite a permissão que o sistema pedir.
3. Toque em **Enviar aviso de teste**.

✅ A notificação chega em alguns segundos.

A tela mostra **quantos avisos estão realmente agendados**, então dá para
provar que o agendamento aconteceu.

**Para demonstrar um aviso de manutenção real:**

1. Registre uma manutenção com **"Avisar em (meses)" = 1** e data de **hoje**.
2. Em Ajustes, o contador de avisos agendados aumenta.

> O aviso em si dispararia dias antes do vencimento. Serviços **já vencidos**
> são avisados na próxima vez que der a hora configurada (9h por padrão).

### Mínimo de 4 telas interativas

O app tem **9**. Caminho para passar por todas:

```
Garagem → Cadastrar veículo → (volta) → toca no card →
Painel do veículo → Registrar manutenção → (volta) →
aba Histórico → Ver todos → Histórico completo → toca num registro →
(fecha) → aba Alertas → aba Gastos → Ajustes → Aparência
```

### Git Flow

```bash
git log --oneline --graph --all
```

✅ Mostra `main`, `develop` e as branches `feature/*` com merges `--no-ff`.

### Finalidade além de ver informações

O app **calcula** (projeta prazos a partir do histórico), **agenda** (avisos no
sistema operacional), **sincroniza** (o odômetro sobe ao registrar serviço com
km maior) e **agrega** (relatório de gastos, consumo médio, custo por km).

---

## 8. Rodando os testes

```bash
npm test
```

✅ Deve terminar com `# pass 116` e `# fail 0`.

Os testes rodam no Node puro, sem emulador, em menos de um segundo. Eles cobrem
as regras de negócio: cálculo de lembretes, agregação de gastos, aritmética de
datas, formatação brasileira e validação de placa.

Verificação completa antes de abrir um Pull Request:

```bash
npm run verify     # typecheck + lint + testes
```

---

## 9. Quando dá errado

### O QR Code não conecta / fica "Something went wrong"

**Causa mais comum:** celular e computador em redes diferentes.

1. Confirme que os dois estão no **mesmo Wi-Fi**.
2. Se estiver numa rede da faculdade ou de visitante, ela provavelmente isola
   os dispositivos. Use o **roteamento por túnel**:

```bash
npx expo start --tunnel
```

É mais lento, mas funciona em qualquer rede. Também resolve quando o firewall
do Windows está bloqueando.

3. Como alternativa, ligue o **ponto de acesso do celular** e conecte o
   computador nele.

### `Error: Cannot find module` ao iniciar

Instalação incompleta. Apague e refaça:

```bash
rm -rf node_modules package-lock.json
npm install
npx expo install --fix
```

No Windows (PowerShell):

```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
npx expo install --fix
```

### "Project is incompatible with this version of Expo Go"

O Expo Go da loja ficou mais novo que o SDK do projeto. Atualize o projeto:

```bash
npm install expo@latest
npx expo install --fix
```

Depois rode `npx expo-doctor` e corrija o que ele apontar.

### Tela branca ou erro estranho depois de trocar de branch

Cache do bundler. Limpe:

```bash
npx expo start --clear
```

### `EADDRINUSE: port 8081 already in use`

Já existe um servidor rodando. Feche o outro terminal, ou:

```bash
npx expo start --port 8082
```

### As notificações não chegam

1. **Ajustes do celular** → Apps → Expo Go → Notificações → **permitir**.
2. Confira que o interruptor está ligado em **Ajustes → Notificações**.
3. Use **Enviar aviso de teste** para isolar o problema.
4. Em **web** as notificações não funcionam — teste no celular.
5. No Android, o modo **Não perturbe** e a economia de bateria agressiva
   (comum em Xiaomi, Samsung e Motorola) podem segurar avisos agendados.

### A lista de marcas não carrega

1. Confira a internet do **celular** (a requisição sai dele, não do computador).
2. A BrasilAPI pode estar fora do ar. O app mostra a mensagem e continua
   funcionando: **os campos aceitam digitação manual**, e o cadastro segue
   normalmente.

### `npm install` falha com erro de permissão (Linux/Mac)

Não use `sudo` com npm. Se aparecer `EACCES`:

```bash
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### "Metro has encountered an error" depois de editar um arquivo

Quase sempre é erro de sintaxe no arquivo que você acabou de salvar. A
mensagem no terminal aponta o arquivo e a linha. Corrija e salve de novo — o
app recarrega sozinho.

---

## 10. Comandos do dia a dia

| Comando | O que faz |
|---------|-----------|
| `npm start` | Inicia o servidor de desenvolvimento |
| `npm start -- --clear` | Inicia limpando o cache |
| `npm run android` | Abre no emulador Android |
| `npm run ios` | Abre no simulador iOS (só Mac) |
| `npm run web` | Abre no navegador |
| `npm test` | Roda os 116 testes |
| `npm run typecheck` | Confere os tipos do TypeScript |
| `npm run lint` | Confere estilo e problemas comuns |
| `npm run lint:fix` | Corrige o que dá para corrigir sozinho |
| `npm run format` | Formata o código com Prettier |
| `npm run verify` | typecheck + lint + testes |
| `npm run tokens` | Regera `design/tokens/tokens.json` a partir de `src/theme` |
| `npx expo-doctor` | Diagnostica incompatibilidade de versões |
| `npx expo install --fix` | Alinha as bibliotecas ao SDK instalado |

---

## 11. Trabalhando em equipe

### Antes de começar a mexer

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nome-do-que-voce-vai-fazer
```

### Antes de subir

```bash
npm run verify
```

Se passar:

```bash
git add .
git commit -m "feat(escopo): o que mudou"
git push origin feature/nome-do-que-voce-vai-fazer
```

Depois abra o Pull Request no GitHub, com `develop` como destino.

### Regras combinadas

1. Ninguém faz commit direto em `main` nem em `develop`.
2. Uma branch `feature/` por assunto.
3. `npm run verify` tem que passar antes do PR.
4. Merge sempre com `--no-ff`.
5. Se o comportamento mudou, atualize o README ou os docs no mesmo commit.

Detalhes completos em [git-flow.md](git-flow.md).

### Onde mexer no quê

| Quero mudar... | Vá em |
|----------------|-------|
| Uma tela | `app/` — o arquivo define a rota |
| Cores, fontes, espaçamento | `src/theme/` |
| Uma regra de negócio | `src/domain/` — e escreva o teste junto |
| Como os dados são salvos | `src/data/` |
| A consulta à FIPE ou as notificações | `src/services/` |
| Um componente reaproveitável | `src/components/` |

> A regra mais importante da arquitetura: **`src/domain/` não importa nada do
> React Native.** É isso que permite rodar as regras de negócio no Node, sem
> emulador. Se você precisar importar algo de `react-native` dentro de
> `domain/`, provavelmente aquilo pertence a outra camada.

Mais contexto em [arquitetura.md](arquitetura.md).

---

## Ainda travado?

1. `npx expo-doctor` — resolve a maioria dos problemas de ambiente.
2. Leia a mensagem de erro inteira; o Expo costuma dizer o comando que resolve.
3. [Documentação do Expo](https://docs.expo.dev) (em inglês).
4. Chame alguém do grupo — provavelmente já passou pelo mesmo.
