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

## Histórico até aqui

```
main
 └── develop
      ├── feature/design-system          tokens e os quatro temas
      ├── feature/dominio                regras de lembrete e gastos
      ├── feature/persistencia           AsyncStorage e repositórios
      ├── feature/web-service            integração FIPE
      ├── feature/scaffold               configuração do Expo
      ├── feature/identidade-visual      marca, ícones, faixa de medida
      ├── feature/telas-principais       garagem, alertas, gastos
      ├── feature/cadastro-e-registro    formulários, histórico, ajustes
      └── feature/documentacao           README, docs, CI, dados de exemplo
```

Ver o grafo:

```bash
git log --oneline --graph --all
```

## Combinados do grupo

1. Ninguém faz commit direto em `main` nem em `develop`.
2. Uma `feature/` por assunto. Se a branch está crescendo demais, provavelmente
   são duas.
3. Antes de abrir PR, rodar `npm run verify`.
4. Merge sempre com `--no-ff`.
5. Apagar a branch depois do merge.
6. Se a mudança altera comportamento, o README ou os docs mudam no mesmo
   commit.
