# Melhorias: o que foi encontrado, corrigido e o que fica mapeado

Revisão do app procurando lacunas reais de funcionamento — não ideias soltas,
mas coisas que um usuário encontraria usando. Cada item diz **como se
manifesta** para quem usa, porque é isso que decide a prioridade.

---

## Corrigido

### 1. Erro de digitação no odômetro ficava preso para sempre

**Gravidade: alta.** Era a pior falha encontrada.

Registrar uma manutenção com quilometragem maior sobe o odômetro
automaticamente. `atualizarKm` só aceita valores maiores. Excluir o registro
não abaixa nada.

Resultado: quem digitasse `1.145.000` em vez de `114.500` inflava o odômetro
**sem nenhum caminho de volta no app** — e todos os lembretes daquele veículo
passavam a mostrar "vencido há 1.030.000 km" para sempre.

**Correção:** um valor menor não é mais recusado de vez. A folha pede
confirmação e corrige, com piso no maior km já registrado no histórico — abaixo
disso o dado seria incoerente com os serviços feitos. A regra está em
`src/domain/odometer.ts`, com 11 testes.

### 2. Serviços vencidos nunca geravam notificação

**Gravidade: alta.** O app falhava justamente no que promete.

O disparo era calculado como "X dias antes da data prevista". Para algo que já
venceu, essa conta cai no passado, e não existe agendar no passado. O resultado
é que o serviço atrasado — o mais urgente de todos — era o único que nunca
avisava.

**Correção:** um lembrete vencido agora avisa na próxima ocorrência do horário
configurado. Também cobre o caso de a janela de antecedência já ter passado com
o prazo ainda em aberto, em que o aviso era simplesmente perdido.

### 3. Não dava para corrigir um veículo cadastrado

**Gravidade: alta**, pela perda de dados.

Dava para cadastrar e remover, nunca corrigir. Quem errasse uma letra no
apelido ou um dígito na placa só tinha a saída de excluir o veículo — o que
apaga junto **todo o histórico de manutenções**. Uma letra errada custava o
registro inteiro.

**Correção:** tela de edição em `app/veiculo/[id]/editar.tsx`, acessível pelo
ícone no painel do veículo. A quilometragem não entra ali de propósito: ela tem
regra própria e continua na folha do painel, em um lugar só.

### 4. A data era digitada à mão como `2026-11-08`

**Gravidade: média**, mas atinge o formulário mais usado do app.

Num celular, digitar uma data em formato ISO é lento, erra fácil, e o teclado
numérico nem oferece o hífen. Era o pior momento da experiência.

**Correção:** calendário em folha (`src/components/base/DateSheet.tsx`),
desenhado com os componentes do próprio app. Datas futuras ficam desabilitadas,
"hoje" tem contorno, e há atalho para hoje.

> Não usamos `@react-native-community/datetimepicker`: é mais uma dependência,
> tem aparência diferente em cada plataforma e não aceita os quatro temas.

### 5. Tocar na notificação não levava a lugar nenhum

**Gravidade: média.**

O agendamento já guardava `veiculoId` nos dados do aviso, mas ninguém lia.
Tocar no lembrete abria a garagem, e o usuário tinha que descobrir sozinho de
qual veículo era. Uma notificação que não leva ao assunto dela desperdiça o
único toque que ela ganha.

**Correção:** `src/hooks/useNotificationNavigation.ts` abre o painel do veículo
certo, tanto com o app em segundo plano quanto quando ele foi aberto pela
própria notificação.

### 6. Salvar não confirmava nada

**Gravidade: média.**

Salvar um registro simplesmente voltava para a tela anterior. Numa tela cheia
de campos, "salvou e voltou" e "falhou e voltou" eram indistinguíveis.

**Correção:** confirmação em toast (`src/components/base/Feedback.tsx`), que
aparece sobre tudo e some sozinho. `Alert` nativo continua para o que exige
resposta, como excluir.

### 7. O gesto de puxar para atualizar não fazia nada

**Gravidade: baixa**, mas é o primeiro gesto que todo mundo tenta.

Recarregar exigia fechar e abrir o app.

**Correção:** puxar para atualizar na garagem, nos alertas e nos gastos.

### 8. No iOS o teclado cobria os campos de baixo

**Gravidade: média** nos formulários longos.

Sem `KeyboardAvoidingView`, o campo abaixo do teclado fica inacessível e o
usuário digita às cegas.

**Correção:** aplicado nos três formulários.

### 9. O botão de cadastrar sumia de vista

O botão ficava no fim da lista. Com três ou quatro veículos, era preciso rolar
tudo para alcançá-lo.

**Correção:** botão flutuante, como o protótipo original previa. Encolhe ao
rolar para não cobrir conteúdo.

### 10. Previsão só em km criava um vencimento por data invisível

Quem escolhia "avisar em 10.000 km" e deixava os meses em branco recebia, sem
pedir, o prazo em meses padrão do tipo de serviço. O app mostrava um
vencimento que o usuário nunca definiu.

**Correção:** uma previsão informada passa a valer sozinha. Encontrado
escrevendo os testes.

### 11. `npm run typecheck` falhava em 33 arquivos

Trinta e três arquivos `.tsx` tinham `import React from 'react'` sem usar
`React` em nenhum lugar. O `tsconfig.json` do projeto combina duas opções que
tornam isso erro, não aviso:

```jsonc
"jsx": "react-jsx",       // JSX não precisa mais do React em escopo
"noUnusedLocals": true    // import sem uso é erro
```

Com o JSX automático, o import virou mesmo desnecessário — e o compilador passou
a cobrar. Resultado: `npm run typecheck` e, por consequência, `npm run verify`
terminavam com 33 erros `TS6133`. O aplicativo **rodava**, porque o Babel ignora
import não usado; quebrava só a verificação.

**Correção:** import removido nos 33, e **mantido** nos 3 que usam `React` como
namespace de tipo (`React.ReactNode` em `Button.tsx`, `Fab.tsx` e
`Surfaces.tsx`) — ali o import é obrigatório, e removê-lo trocaria um erro por
outro.

O defeito ficou escondido porque a verificação local rodava com um stub de
tipos que declarava `namespace React` globalmente. Com ele, os 3 arquivos
corretos apareciam como errados e a diferença entre os dois casos desaparecia. O
stub foi acertado para espelhar o `@types/react` de verdade, e a correção só foi
aceita depois de provar que ele acusa os dois erros e aprova o caso correto.

### 12. O projeto não instalava numa máquina limpa

Nenhuma instalação tinha sido feita fora da máquina do Alexandre. Quando uma
máquina limpa — o GitHub Actions — tentou, apareceram oito problemas em
sequência: não havia `package-lock.json` (o CI nunca tinha rodado), o
`package.json` estava metade no SDK 53 e metade no 58, faltavam `expo-font`,
`react-native-worklets` e `eslint-config-prettier`, o `app.json` tinha três
campos que o SDK 58 removeu, e havia quatro usos de `setState` dentro de
efeito que a regra nova do React acusa.

**Correção:** todas as dependências nas versões exatas do SDK 58, travadas num
`package-lock.json` gerado no próprio CI; `npm run setup` passou a usar
`npm ci`; e o CI instala do zero e **compila o app para iPhone, Android e web**
a cada push. Detalhe no CHANGELOG da 1.6.0.

**Por que ficou escondido tanto tempo:** o ambiente onde o código era mantido
não alcança o registro do npm, então toda verificação era feita com tipos
simulados. Simulação confere a coerência do código consigo mesmo, não com as
bibliotecas reais. A lição: verificação que não roda as dependências de
verdade não prova que o projeto instala.

---

## Mapeado, não implementado

Em ordem de utilidade. Os três primeiros cabem no tempo que resta antes da
entrega, se o grupo quiser.

### A. Exportar o histórico

**Por que importa:** a documentação do projeto justifica o app em parte pela
venda do veículo — "quem tem o histórico organizado consegue provar que cuidou
dele". Hoje não há como tirar o histórico de dentro do app.

**Como fazer rápido:** a API `Share` do React Native já vem incluída e gera um
texto formatado que vai por WhatsApp ou e-mail. Sem dependência nova, cabe em
uma tarde.

**Versão completa:** PDF com `expo-print`, que gera a partir de HTML. Mais uma
dependência, resultado bem melhor.

### B. Fotos podem se perder

**O problema:** `ImagePicker` devolve um caminho para o cache do sistema. Esse
cache é limpo pelo sistema operacional quando o espaço aperta, e aí a foto da
nota fiscal vira um retângulo quebrado — justamente o comprovante que o usuário
guardou com cuidado.

**Como corrigir:** copiar o arquivo para o diretório do app com
`expo-file-system` (`FileSystem.documentDirectory`) e guardar esse caminho. É
uma função de dez linhas no momento de anexar.

### C. Adiar um lembrete

Hoje um serviço vencido fica vermelho até ser registrado. Quem decidiu adiar a
troca conscientemente convive com um alerta permanente, e alerta que sempre
aparece deixa de ser lido.

**Como fazer:** um botão "adiar" que soma um intervalo à previsão, guardando a
data do adiamento no lembrete.

### D. Login e sincronização

A documentação original descreve conta com e-mail e senha, e o protótipo tem a
tela. Não foi implementado porque os dados ficam no aparelho: sem servidor, o
login seria uma tela que não protege nem sincroniza nada — teatro.

A camada de dados já é assíncrona de propósito, então trocar o AsyncStorage por
um backend não exige mexer em nenhuma tela.

**Decisão para o grupo:** se a disciplina esperar a tela de login mesmo sem
backend, vale implementar e deixar claro na apresentação que ela é local.

### E. Testes de componente

A cobertura atual é das regras de negócio (127 testes). A interface é
verificada à mão e pelo protótipo em HTML. Testar UI exigiria
`@testing-library/react-native` e um ambiente de emulação.

### F. Busca e ordenação na garagem

Só vale a partir de uns cinco ou seis veículos. Para o público do app — uma a
três placas — adicionaria peso sem resolver nada.

---

## O que foi avaliado e descartado

| Ideia | Por que não |
|-------|-------------|
| Gráficos ou elementos em 3D (`three.js`, `expo-gl`) | Custo alto de bundle e bateria para enfeitar um dado que uma barra comunica melhor. A animação da faixa de medida dá o impacto visual sem esse custo. |
| Biblioteca de gráficos | Centenas de kB para o que cabe em 40 linhas de `View`, e traria um tema próprio para brigar com o nosso. |
| Biblioteca de estado (Redux, Zustand) | Duas coleções e meia dúzia de ações cabem num contexto. |
| Axios | `fetch` já existe; timeout, retentativa e erro tipado são 90 linhas em `services/http.ts`. |
| Fonte própria baixada | Mais um passo de carregamento e risco de falha. O sistema de tipos já separa interface de medida. |
| Animação de entrada escalonada nos cards | Competiria com a animação da faixa de medida, que é o momento de movimento do app. Um movimento que chama atenção vale mais que vários. |

---

## Como verificar o que foi corrigido

```bash
npm test          # 127 testes das regras de negócio
npm run verify    # tipos, lint e testes
```

Roteiro manual dos itens 1 a 5, no aparelho:

1. **Odômetro:** registre uma manutenção com km absurdo (`1145000`), depois
   abra o painel → Atualizar → digite o valor certo → confirme a correção.
2. **Vencido notifica:** ligue as notificações em Ajustes e confira o contador
   de avisos agendados com os dados de exemplo carregados.
3. **Editar veículo:** painel do veículo → ícone de lápis no topo.
4. **Calendário:** registrar manutenção → campo Data.
5. **Notificação navega:** Ajustes → Enviar aviso de teste → toque no aviso.
