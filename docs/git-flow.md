# Git Flow do projeto

A disciplina pede que o grupo organize o repositório seguindo Git Flow. Este
documento registra como o modelo foi aplicado aqui.

## Branches permanentes

| Branch | Papel |
|--------|-------|
| `main` | Código entregue. Só recebe merge de `develop` ou de `hotfix/*`, e cada merge vira uma tag. |
| `develop` | Integração. Todo trabalho novo sai daqui e volta para cá. |

## Branches temporárias

| Prefixo | Sai de | Volta para | Para que |
|---------|--------|------------|----------|
| `feature/*` | `develop` | `develop` | Funcionalidade nova |
| `release/*` | `develop` | `develop` e `main` | Preparar a entrega |
| `hotfix/*` | `main` | `main` e `develop` | Corrigir algo já entregue |

## Comandos

### Começar uma funcionalidade

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nome-curto
```

### Integrar

Sempre com `--no-ff`, para que o histórico mostre que aquele conjunto de
commits foi uma funcionalidade:

```bash
git checkout develop
git merge --no-ff feature/nome-curto -m "merge: feature/nome-curto em develop"
git branch -d feature/nome-curto
git push origin develop
```

### Preparar a entrega

```bash
git checkout -b release/1.0.0 develop
# ajustes finais de versão e documentação
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0 -m "Entrega N2"
git checkout develop
git merge --no-ff release/1.0.0
git push origin main develop --tags
```

### Corrigir algo já entregue

```bash
git checkout -b hotfix/1.0.1 main
# correção
git checkout main && git merge --no-ff hotfix/1.0.1
git tag -a v1.0.1 -m "Correção"
git checkout develop && git merge --no-ff hotfix/1.0.1
```

## Mensagens de commit

Padrão Conventional Commits, com o corpo explicando **por quê**, não o quê —
o diff já mostra o quê.

```
tipo(escopo): resumo em até 72 caracteres

Corpo em linhas de até 72 caracteres, explicando o motivo da mudança e
as decisões que não são óbvias no diff.
```

Tipos em uso: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`.

Exemplo real do repositório:

```
feat(dominio): regras de lembrete, gastos e formatacao com testes

Uma previsao definida pelo usuario passa a valer sozinha: quem escolheu
avisar em km e deixou os meses em branco nao recebe mais um vencimento
por data herdado do padrao do tipo.
```

## Branches no repositório

**29 branches publicadas**: `main`, `develop` e 27 `feature/*`. Todas visíveis
em [github.com/xandoqa/Carro_em_dia/branches](https://github.com/xandoqa/Carro_em_dia/branches).

### Já integradas em `develop`

Na ordem em que foram trabalhadas.

| Branch | O que entrou |
|--------|--------------|
| `feature/scaffold` | Configuração do Expo, TypeScript e Expo Router |
| `feature/design-system` | Tokens, os quatro temas e os componentes base |
| `feature/dominio` | Regras de lembrete, gastos e formatação, com testes |
| `feature/persistencia` | AsyncStorage e a camada de repositórios |
| `feature/web-service` | Integração com a tabela FIPE pela BrasilAPI |
| `feature/identidade-visual` | Marca, ícones próprios e a faixa de medida |
| `feature/telas-principais` | Garagem, alertas e gastos |
| `feature/cadastro-e-registro` | Formulários, histórico e ajustes |
| `feature/documentacao` | README, docs, CI e dados de exemplo |
| `feature/notificacoes-vencidas` | Correção: serviço vencido nunca notificava |
| `feature/editar-manutencao` | Edição de manutenção, prevista no protótipo |
| `feature/melhorias-funcionais` | Correção do odômetro inflado, teclado no iOS |
| `feature/prototipo-navegavel` | As 11 telas em HTML, para revisar sem build |
| `feature/polimento-app` | Esqueleto de carregamento, confirmações, calendário |
| `feature/esclarece-prototipo` | Deixa explícito que a maquete não é o app |
| `feature/guia-execucao` | Primeiro tutorial de instalação |
| `feature/autoria` | Registro da autoria da dupla |
| `feature/diagnostico-e-compat` | `npm run doctor` e as correções de compatibilidade |
| `feature/readme-instalacao` | Tutorial para Linux, Windows e macOS |
| `feature/readme-implementacoes` | Seção "O que foi implementado e corrigido" |
| `feature/versionamento` | CHANGELOG, tags e os scripts de versão e assinatura |
| `feature/corrige-build-web` | Correção do bundler web e atualização do SDK |

### Abertas, para o que vem depois

Uma por item mapeado em [melhorias.md](melhorias.md). Existem para que o próximo
trabalho comece do lugar certo, sem reabrir a discussão do que fazer.

| Branch | O que vai receber |
|--------|-------------------|
| `feature/exportar-historico` | Exportar o histórico do veículo em PDF ou CSV |
| `feature/fotos-no-app` | Copiar as fotos para o diretório do app, fora do cache |
| `feature/adiar-lembrete` | Adiar um alerta por km ou por dias |
| `feature/login` | Autenticação e sincronização, quando houver backend |
| `feature/testes-de-componente` | Testes de renderização das telas |

### Ver o grafo

```bash
git log --oneline --graph --all
```

Só as branches, sem os commits:

```bash
git branch -a
```

## Quem desenvolveu

O desenvolvimento e as atualizações foram feitos por **Alexandre Rodrigues
Costa**, em dupla com **Felipe do Nascimento Vitelli Peixoto**. Todos os
commits do repositório são de Alexandre.

O ciclo de cada `feature/` seguiu sempre a mesma ordem:

```
Alexandre implementa  →  Felipe revisa e corrige  →  os dois analisam juntos
                                                              │
                                                     merge em develop
```

Nenhuma branch foi integrada sem passar pela análise conjunta. Essa etapa é a
que mais rendeu: boa parte dos defeitos registrados em
[melhorias.md](melhorias.md) — como o odômetro que não podia ser corrigido e os
lembretes vencidos que nunca notificavam — apareceu na revisão, não na escrita.

## Pull Requests e commits verificados

A partir da versão 1.6.0, tudo entra em `develop` e em `main` **por Pull
Request**, nunca por `git push` direto:

```
feature/x  ──PR──▶  develop  ──PR──▶  main
           squash             merge
```

| Etapa | Como o PR é mesclado | Por quê |
|-------|----------------------|---------|
| `feature/*` → `develop` | **Squash** | A funcionalidade vira um commit só, com descrição completa |
| `develop` → `main` | **Merge commit** | Preserva o histórico da `develop` e marca a entrega |

Duas coisas vêm de graça com isso:

1. **O CI roda antes do merge.** O PR mostra ✅ ou ❌ para instalação,
   `expo-doctor`, tipos, lint, testes e compilação para iPhone, Android e web.
2. **Os commits saem Verified.** Quem cria o commit de merge é o próprio
   GitHub, que o assina com a chave dele. O autor continua sendo quem abriu o
   PR. Não depende de nenhuma chave configurada na máquina.

Para mesclar: abra o PR no GitHub, espere o ✅ do CI e use o botão
*Squash and merge* (feature → develop) ou *Create a merge commit*
(develop → main).

### Commits anteriores à 1.6.0

Os commits de antes foram enviados por `git push` direto, então aparecem sem
selo ou como *Unverified* (assinados com uma chave que não é da conta). Para
deixá-los Verified é preciso assiná-los de novo com uma chave cadastrada na
conta — e isso reescreve todo o histórico, o que exige `git push --force` em
todas as branches. Se quiser fazer (de preferência depois de uma entrega, não
antes):

```bash
npm run assinar -- --historico
```

O script cria a chave SSH **na sua máquina**, mostra a pública para cadastrar
em [github.com/settings/ssh/new](https://github.com/settings/ssh/new) como
**Signing Key**, assina o histórico e cria uma branch de backup antes.

## Combinados da dupla

1. Ninguém faz commit direto em `main` nem em `develop` — tudo por PR.
2. Uma `feature/` por assunto. Se a branch está crescendo demais, provavelmente
   são duas.
3. Antes de abrir PR, rodar `npm run verify`. O CI roda de novo no PR.
4. Só mesclar com o CI verde.
5. Apagar a branch depois do merge.
6. Se a mudança altera comportamento, o README ou os docs mudam no mesmo
   commit.
7. Nada entra na `develop` sem a análise conjunta da dupla.

## Versões

O projeto segue [versionamento semântico](https://semver.org/lang/pt-BR/). Todas
as versões estão no [CHANGELOG.md](../CHANGELOG.md), e cada uma tem uma tag
`vX.Y.Z` no GitHub.

### Publicar uma versão nova

1. Some a entrada no topo do `CHANGELOG.md` e atualize `"version"` no
   `package.json`.
2. Leve para `main` pelo PR, como sempre.

**A tag é criada sozinha.** O workflow
[`versoes.yml`](../.github/workflows/versoes.yml) roda a cada push em `main` e
cria `v<versão do package.json>` se ela ainda não existir. Ele também publicou
as versões de 1.0.0 a 1.5.6, que tinham sido criadas localmente mas nunca
chegaram ao GitHub.
