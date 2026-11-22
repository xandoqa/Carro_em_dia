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

**Nada neste repositório afirma que essas etapas foram testadas.** Onde elas
aparecem, aparecem como passos para você executar.

A resposta a essa limitação foi construir o `npm run doctor`: a verificação que
não pôde ser feita aqui, você faz em um comando.

---

## ✅ Testado de verdade

Executado, com saída observada.

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
| **Imports órfãos** | `tsc --noUnusedLocals` | Nenhum |

> **Sobre os stubs de tipo:** como as bibliotecas não puderam ser instaladas,
> os tipos de `react`, `react-native` e afins foram substituídos por
> declarações mínimas. Isso valida a **coerência interna do código** (um
> componente passando a prop errada para outro, por exemplo), mas **não**
> valida o uso correto das APIs das bibliotecas. O `npm run typecheck` na sua
> máquina é que fecha essa lacuna.

---

## ⚠️ Não testado — precisa da sua máquina

Em ordem de risco.

### 1. Instalação das dependências — RISCO ALTO

```bash
npm run setup
```

**Por que é o maior risco:** as versões do `package.json` foram fixadas sem
poder consultar o registro npm. Elas podem não existir exatamente assim.

**O que fazer se falhar:** o `--fix` dentro do `setup` corrige a maior parte.
Se não resolver:

```bash
npm install expo@latest
npx expo install --fix
npm run doctor
```

### 2. Abrir no Expo Go — RISCO ALTO

**Por quê:** o projeto está no SDK 53, de 2025. O Expo Go das lojas acompanha o
SDK mais recente e recusa projetos antigos com a mensagem *"Project is
incompatible with this version of Expo Go"*.

**Como resolver:** o comando acima. O `doctor` já avisa sobre isso antes de você
esbarrar no problema.

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

## Roteiro de validação para segunda-feira

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
**7.** Percorrer o roteiro da [seção 9.3 do tutorial](como-rodar.md#9-como-saber-se-está-funcionando).

Se os passos 2 e 3 passarem, **o projeto está instalado e o código está
íntegro**. Se o 5 falhar com incompatibilidade de Expo Go, rode
`npm install expo@latest && npx expo install --fix` e tente de novo.

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

E se nada resolver, a [seção 10 do tutorial](como-rodar.md#10-erros-comuns-e-soluções)
tem os casos conhecidos, com os comandos para Linux, Windows e macOS.
