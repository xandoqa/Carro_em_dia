# Planejamento de execução — 7 dias

Entrega do trabalho: **17/11**. Apresentações em **17/11** e **24/11**.
Este plano cobre 04/11 a 10/11, deixando a semana seguinte para ajustes,
testes em aparelho real e ensaio da apresentação.

## Princípio de priorização

A ordem é: **o que a disciplina exige** → **o que o usuário precisa** →
**o que impressiona**. Nada entra na frente de um requisito obrigatório, e
nenhuma melhoria visual entra antes de a funcionalidade correspondente
funcionar.

## Requisitos obrigatórios e onde foram atendidos

| Requisito | Onde está | Situação |
|-----------|-----------|----------|
| App em React Native | Expo SDK 53 + Expo Router | Feito |
| Notificação | `src/services/notificationService.ts` | Feito |
| Requisição de Web Service | `src/services/fipeService.ts` (BrasilAPI / FIPE) | Feito |
| Persistência de dados | `src/data/` (AsyncStorage) | Feito |
| Mínimo 4 telas interativas | 9 telas | Feito |
| Versionado no GitHub com Git Flow | `main` / `develop` / `feature/*` | Feito |
| Finalidade além de ver informações | Registra serviços, calcula prazos, agenda avisos, exporta relatório | Feito |
| Não ser app de filmes ou livros | Manutenção de veículos | Feito |

## Dia 1 — Fundação (04/11) — concluído

- [x] Ler a documentação e as 8 telas do protótipo; mapear entidades e fluxo.
- [x] Definir a identidade visual: conceito, 4 temas, tipografia, raio como
      hierarquia, ícones próprios.
- [x] Estrutura de pastas e configuração: Expo, TypeScript estrito, ESLint,
      Prettier, CI.
- [x] Camada de domínio: modelos, regras de lembrete, agregação de gastos,
      utilidades de data e formatação.
- [x] **102 testes** cobrindo as regras de negócio.

## Dia 2 — Dados e integrações (05/11) — concluído

- [x] Persistência com AsyncStorage e repositórios.
- [x] Integração com a tabela FIPE, com cache de 7 dias e fallback offline.
- [x] Notificações locais com reagendamento automático.
- [x] Contexto único de estado da garagem.

## Dia 3 — Telas principais (06/11) — concluído

- [x] Biblioteca de componentes base e de domínio.
- [x] Garagem, Alertas e Gastos.
- [x] Faixa de medida animada (elemento assinatura).
- [x] Gráficos sem dependência externa.

## Dia 4 — Formulários e detalhe (07/11) — concluído

- [x] Cadastro de veículo com consulta FIPE.
- [x] Registro de manutenção com anexo de nota.
- [x] Histórico com filtros e detalhe do registro.
- [x] Aparência (troca de tema) e Ajustes.
- [x] Dados de exemplo para a apresentação.

## Dia 5 — Verificação em aparelho (08/11)

- [ ] `npm install` e `npx expo install --fix` para alinhar as versões ao SDK
      instalado.
- [ ] `npx expo-doctor` e correção do que ele apontar.
- [ ] Rodar no Android e no iOS; conferir as 9 telas nos 4 temas.
- [ ] Testar notificação real: conceder permissão, registrar manutenção com
      prazo curto, confirmar que o aviso chega.
- [ ] Testar a FIPE com internet e em modo avião (deve cair no cache).
- [ ] Conferir alvos de toque e leitor de tela em pelo menos 3 telas.
- [ ] Testar em tela pequena (largura de 360 dp) e com fonte do sistema
      aumentada.

## Dia 6 — Ajustes e polimento (09/11)

- [ ] Corrigir o que o dia 5 revelar.
- [ ] Conferir o comportamento com teclado aberto nos formulários longos.
- [ ] Rever textos de erro e de estado vazio.
- [ ] Capturas de tela dos 4 temas para o README e para a apresentação.

## Dia 7 — Fechamento (10/11)

- [ ] `npm run verify` limpo.
- [ ] README e docs revisados.
- [ ] Merge de `develop` em `main` e tag `v1.0.0`.
- [ ] Roteiro da apresentação: abrir com dados de exemplo, mostrar um alerta
      vencido, registrar o serviço, ver o alerta sumir, trocar de tema,
      mostrar o relatório.

## Reserva — 11/11 a 16/11

Margem para imprevisto. Se sobrar tempo, nesta ordem:

1. Exportar o histórico em PDF (consta como ideia futura na documentação).
2. Editar uma manutenção já registrada (hoje só dá para excluir e refazer).
3. Tela de login, se o grupo decidir que o trabalho precisa dela — hoje os
   dados ficam no aparelho e não há conta, o que torna o login uma tela sem
   função real.

## Fora de escopo, com justificativa

| Ideia | Por que ficou de fora |
|-------|-----------------------|
| Gráficos 3D / `three.js` / `expo-gl` | Custo alto de bundle e bateria para enfeitar dado que uma barra comunica melhor. A animação da faixa de medida dá o impacto visual sem esse custo. |
| Backend com contas de usuário | Fora do escopo de uma semana, e a disciplina pede persistência — que está atendida localmente. A camada de dados já é assíncrona, então trocar por um backend não exige mexer em tela. |
| Biblioteca de gráficos | Centenas de kB para o que cabe em 40 linhas de `View`. |
| Fonte própria baixada | Mais um passo de carregamento e risco de falha. O sistema de tipos já diferencia interface de medida. |
