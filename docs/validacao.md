# Validação: o que foi testado e o que ainda precisa de atenção

Relatório honesto do que foi verificado de fato, do que foi verificado por
análise estática, e do que **só pode ser confirmado na sua máquina**.

---

## A limitação que molda este relatório

O ambiente onde o código foi escrito **não tem acesso ao registro npm**. O
`npm install` é bloqueado por política de rede (erro 403). Isso significa que
não foi possível, aqui:

- instalar as dependências;
- rodar `npx expo start`;
- rodar `npx expo-doctor`;
- abrir o app num emulador ou celular;
- rodar o `tsc` com os tipos reais das bibliotecas.

A primeira resposta a essa limitação foi o `npm run doctor`: a verificação que
não pôde ser feita aqui, você faz em um comando.

**A segunda, a partir da 1.6.0, foi usar o GitHub Actions como máquina de
teste.** Os servidores do GitHub alcançam o npm. Desde então, tudo que exige
instalar o projeto é verificado lá, numa máquina Linux limpa, a cada push —
e os resultados abaixo vêm de execuções reais, com log.

---

## ✅ Testado em máquina limpa (GitHub Actions, a cada push)

Fluxo do [`ci.yml`](../.github/workflows/ci.yml), executado do zero em Ubuntu
com Node 22. Primeira execução totalmente verde: 22/11/2026.

| Etapa | Comando | Resultado |
|-------|---------|-----------|
| **Instalação travada** | `npm ci` | 902 pacotes, sem conflito, sem `--legacy-peer-deps` |
| **Versões x SDK 58** | `npx expo install --check` | Todas alinhadas |
| **Verificação oficial do Expo** | `npx expo-doctor` | **20/20, nenhum problema** |
| **Plugin de worklets** | `node scripts/ci/testar-babel.cjs` | Roda uma vez só; saída idêntica à do preset puro |
| **Diagnóstico do projeto** | `node scripts/doctor.mjs` | Sem falso positivo sobre um `node_modules` real |
| **Tipos (TypeScript 6, tipos reais)** | `npm run typecheck` | 0 erros, incluindo testes e scripts |
| **Lint** | `npm run lint` | 0 problemas |
| **Testes** | `npm test` | 127/127 |
| **Compilação para iPhone** | `npx expo export --platform ios` | Bundle Hermes de 4,7 MB |
| **Compilação para Android** | `npx expo export --platform android` | Bundle Hermes de 4,7 MB |
| **Compilação para web** | `npx expo export --platform web` | Site estático gerado, com renderização no servidor |

A compilação é o que o Expo Go carrega: se ela passa, o JavaScript do app —
todas as telas, componentes e regras — monta sem erro para cada plataforma.

**O que o CI não prova:** o comportamento no aparelho. Notificação chegando,
câmera abrindo, toque, aparência na tela real. Isso continua na seção
"Precisa do aparelho", abaixo.

### Como o CI encontrou o que faltava

Antes de ficar verde, a mesma máquina limpa acusou, em sequência:

1. **Não havia `package-lock.json`** — o CI quebrava no segundo passo, desde o
   primeiro commit. Nunca tinha instalado nada.
2. **`package.json` misturado**: `expo` no SDK 53 e parte das dependências de
   desenvolvimento no 58. Cada instalação tentava acertar isso na hora, com
   `expo install --fix`, e tropeçava no conflito que ela mesma criava.
3. **`expo-font` ausente** — o `@expo/vector-icons` o exige. Foi removido por
   engano na 1.5.0.
4. **`react-native-worklets` ausente** — o Reanimated 4 o exige.
5. **Três campos do `app.json` que o SDK 58 removeu**: `newArchEnabled`,
   `android.edgeToEdgeEnabled` e `splash` (que virou configuração do plugin
   `expo-splash-screen`).
6. **Lint que nunca rodou**: o `.eslintrc.js` usava `prettier` sem declarar o
   pacote.
7. **Regra nova do React** (`set-state-in-effect`) em quatro lugares.
8. **Tipos do Node não carregados** — o tsconfig base do Expo 58 restringe
   quais `@types` entram.

---

## ✅ Testado no ambiente de desenvolvimento

Executado, com saída observada, sem as dependências instaladas.

| O quê | Como | Resultado |
|-------|------|-----------|
| **127 testes de regra de negócio** | `node --test` com `tsx` | 127 passando, 0 falhando, ~1,4 s |
| **Script de diagnóstico** | `node scripts/doctor.mjs` | Detectou corretamente a ausência de `node_modules` |
| **Diagnóstico, modo preflight** | `node scripts/doctor.mjs --preflight` | Saída curta, código de saída 1 (bloqueia o `expo start`) |
| **Diagnóstico, modo JSON** | `node scripts/doctor.mjs --json` | JSON válido com erros e avisos separados |
| **Diagnóstico sem cores** | `NO_COLOR=1` | Texto limpo, sem códigos de escape |
| **Detecção de SDK 53 + Reanimated 3** | `node_modules` simulado | Reconheceu as versões e avisou sobre o Expo Go |
| **Detecção de SDK 57 + Reanimated 4** | `node_modules` simulado | Reconheceu, sem falso alarme |
| **Armadilha do Babel** | Reanimated 4 + plugin antigo fixado | Detectou e explicou a causa |
| **Babel auto-detectável** | `require()` do `babel.config.js` | Escolheu `react-native-worklets/plugin` quando disponível |
| **Verificação do limite de inotify** | Linux real | Detectou limite baixo (63.968) e deu o comando |
| **Links da documentação** | Varredura de todos os `.md` | Nenhum link quebrado |
| **Âncoras do sumário** | `docs/como-rodar.md` | Todas resolvem |
| **Geração dos tokens** | `tsx scripts/export-tokens.ts` | `tokens.json` com os 4 temas |
| **Protótipo em HTML** | Renderizado e inspecionado | Sem erro de console nas 11 telas |

---

## 🔍 Verificado por análise estática

Conferido lendo o código, sem executar.

| O quê | Método | Resultado |
|-------|--------|-----------|
| **Checagem de tipos** | `tsc` com stubs das bibliotecas | 0 erros no código do projeto |
| **Imports locais** | Varredura de todos os `.ts`/`.tsx` | Todos resolvem |
| **Rotas vs `_layout`** | Comparação arquivo a arquivo | 9 rotas declaradas, todas existem |
| **Plugins do `app.json`** | Cruzamento com `package.json` | Os 3 plugins têm dependência |
| **Imagens do `app.json`** | Verificação de existência | Ícone, splash e favicon no lugar |
| **Imports órfãos** | `tsc --noUnusedLocals` | 33 encontrados e corrigidos na 1.5.3 |
| **Testes e scripts** | `tsc` incluindo `src/__tests__/` e `scripts/` | 0 erros — **só a partir da 1.5.6** |

> **Sobre os stubs de tipo:** como as bibliotecas não puderam ser instaladas,
> os tipos de `react`, `react-native` e afins foram substituídos por
> declarações mínimas. Isso valida a **coerência interna do código** (um
> componente passando a prop errada para outro, por exemplo), mas **não**
> valida o uso correto das APIs das bibliotecas. O `npm run typecheck` na sua
> máquina é que fecha essa lacuna.

> **Segunda correção, 1.5.6.** A configuração de verificação **excluía
> `src/__tests__/`** e não incluía `scripts/`. O `npm run typecheck` do projeto
> sempre cobriu esses arquivos; quem não cobria era a verificação feita aqui. O
> resultado: 41 erros de tipo chegaram na máquina do Alexandre sem nenhum ter
> aparecido antes — 17 deles dentro dos testes excluídos. A configuração passou
> a incluir testes e scripts, com os tipos reais do Node.

> **Correção de um resultado que estava errado aqui.** Até a versão 1.5.2 esta
> tabela afirmava "imports órfãos: nenhum". Era falso: havia 33, e
> `npm run typecheck` falharia na sua máquina com 33 erros `TS6133`. A causa do
> engano foi o próprio stub — ele declarava `namespace React` globalmente, o que
> apagava a diferença entre o import que sobra e o import obrigatório.
> O stub foi acertado para espelhar o `@types/react` de verdade e passou a ser
> testado contra três arquivos de prova (um com import sobrando, um usando
> `React.ReactNode` sem importar, e um correto) antes de qualquer resultado
> daqui ser considerado válido. Detalhe em
> [melhorias.md § 11](melhorias.md).

---

## ⚠️ Precisa do aparelho

Em ordem de risco.

### 1. Instalação das dependências — RESOLVIDO na 1.6.0

Era o maior risco: as versões tinham sido fixadas sem poder consultar o
registro npm. Hoje elas vêm do `package-lock.json` gerado e testado no CI, e
`npm run setup` instala exatamente esse conjunto com `npm ci`.

### 2. Abrir no Expo Go — RESOLVIDO em 22/11

**O que era:** o projeto estava preso no SDK 53, de 2025. O Expo Go das lojas
acompanha o SDK mais recente e recusa projetos antigos com a mensagem
*"Project is incompatible with this version of Expo Go"*.

**Como ficou:** o `npm run setup` instala o SDK corrente. Confirmado na máquina
do Alexandre em 22/11: **SDK 58.0.0, 815 pacotes, instalação sem erro.**

O caminho até aí expôs um defeito no próprio `setup`, corrigido na 1.5.4: a
ordem dos comandos fazia o `npm install` falhar com `ERESOLVE` antes de o
`expo install --fix` ter chance de alinhar as versões. Ver o CHANGELOG.

### 3. Funcionalidades que dependem do aparelho — RISCO MÉDIO

Nenhuma destas pôde ser executada:

| Funcionalidade | Como testar |
|----------------|-------------|
| Notificações | Ajustes → Notificações → ligar → Enviar aviso de teste |
| Consulta FIPE | Cadastrar veículo → tocar em Marca |
| Cache da FIPE | Consultar uma vez, ligar modo avião, consultar de novo |
| Anexar foto | Registrar manutenção → Anexar foto da nota |
| Persistência | Carregar dados de exemplo → fechar o app → reabrir |
| Troca de tema | Ajustes → Tema → trocar → fechar e reabrir |
| Puxar para atualizar | Puxar a lista da garagem para baixo |
| Calendário | Registrar manutenção → campo Data |

### 4. Aparência real nas telas — RISCO BAIXO

O design foi validado pelo protótipo em HTML, que usa os mesmos tokens. Mas
fonte, densidade de pixels e área segura variam no aparelho real.

**Conferir:** as 11 telas nos 4 temas, em tela pequena (360 dp) e com a fonte do
sistema aumentada.

---

## Roteiro de validação antes de apresentar

Na ordem. Se um passo falhar, pare e resolva antes de seguir.

```bash
# 1. Baixar
git clone https://github.com/xandoqa/Carro_em_dia.git
cd Carro_em_dia

# 2. Instalar e verificar  →  precisa terminar com "Tudo certo"
npm run setup

# 3. Verificar o código  →  precisa terminar com "# pass 127"
npm run verify

# 4. Iniciar
npm start
```

**5.** Ler o QR Code com o Expo Go.
**6.** Ajustes → Dados → Carregar dados de exemplo.
**7.** Percorrer o roteiro da [seção 9.3 do tutorial](../README-INSTALACAO.md#9-como-saber-se-está-funcionando).

Se os passos 2 e 3 passarem, **o projeto está instalado e o código está
íntegro** — os mesmos passos que passam no CI. Se o 5 falhar com
*"Project is incompatible with this version of Expo Go"*, atualize o Expo Go na
loja: o projeto está no SDK 58.

---

## O que fazer se travar

```bash
npm run doctor
```

Para cada problema ele diz o que aconteceu, por quê, qual arquivo está
envolvido, como resolver e o comando. Se ele disser "Tudo certo" e mesmo assim
não funcionar:

```bash
npm run doctor:expo
```

E se nada resolver, a [seção 10 do tutorial](../README-INSTALACAO.md#10-erros-comuns-e-soluções)
tem os casos conhecidos, com os comandos para Linux, Windows e macOS.
