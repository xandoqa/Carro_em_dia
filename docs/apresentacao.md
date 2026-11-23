# Guia da apresentação

Checklist para apresentar o CarroEmDia sem sustos.

---

## Preparar o emulador Android (faça antes do dia)

Apresentar pelo emulador no notebook é mais seguro que pelo celular: a tela já
aparece no projetor, sem precisar espelhar nada.

### 1. Instalar o adb e o emulador

```bash
# Debian, Ubuntu, Mint, Pop!_OS
sudo apt update
sudo apt install android-tools-adb android-sdk-platform-tools-common

# Fedora
sudo dnf install android-tools

# Arch, Manjaro
sudo pacman -S android-tools
```

**Conferir:**

```bash
adb --version
```

> O `adb` sozinho **não cria** o emulador — ele só conversa com aparelhos
> Android. Para ter um aparelho virtual você precisa do Android Studio, a
> seguir.

### 2. Android Studio e o aparelho virtual

```bash
cd ~/Downloads
tar -xzf android-studio-*-linux.tar.gz
sudo mv android-studio /opt/
/opt/android-studio/bin/studio.sh
```

Na primeira execução ele baixa o SDK do Android (alguns GB — **não deixe para
segunda à noite**).

Depois, na tela inicial:

1. **More Actions** → **Virtual Device Manager**
2. **Create Device** → escolha **Pixel 6** → **Next**
3. Baixe uma imagem do sistema (prefira uma com **Google Play**) → **Next**
4. **Finish**

### 3. Deixar os comandos no PATH

Sem isso o `npm run android` não encontra o emulador. Adicione ao fim do
`~/.bashrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
```

```bash
source ~/.bashrc
emulator -list-avds     # deve listar o aparelho criado
```

### 4. Aceleração por hardware

Sem KVM o emulador fica lento a ponto de atrapalhar a apresentação.

```bash
sudo apt install qemu-kvm
sudo usermod -aG kvm $USER
```

**Saia da sessão e entre de novo**, depois confira:

```bash
kvm-ok      # precisa dizer "KVM acceleration can be used"
```

### 5. Teste completo

```bash
emulator -avd $(emulator -list-avds | head -1) &
# espere o Android abrir, depois:
npm run android
```

---

## Plano B (tenha os três prontos)

Apresentação em que o único caminho falha é apresentação perdida.

| Plano | Como | Quando usar |
|-------|------|-------------|
| **A** | iPhone com Expo Go (`npm run start:limpo` + QR) | Padrão: é o app de verdade, com notificação e câmera |
| **B** | **[xandoqa.github.io/Carro_em_dia](https://xandoqa.github.io/Carro_em_dia/)** no navegador | Se o celular ou a rede falharem: é o mesmo app React, já publicado, sem instalar nada |
| **C** | `npm run web` no notebook | Se não houver internet para o plano B |

> O plano B **é o aplicativo**, não uma maquete: o mesmo código React,
> compilado para web e publicado pelo GitHub Actions. Só notificações e câmera
> ficam de fora, porque dependem do celular.

---

## Na véspera

```bash
cd ~/Documentos/Carro_em_dia
git pull
npx expo whoami       # precisa responder com o seu usuário; se não, npx expo login
npm run doctor        # precisa dizer "Tudo certo" ou só avisos
npm run verify        # precisa terminar com "# pass 127"
npm start             # confirme que o QR aparece
```

Depois, **dentro do app**:

1. **Ajustes** → **Dados** → **Carregar dados de exemplo**
2. Confira que aparecem 2 veículos, com alertas vermelhos e âmbar

Deixe os dados de exemplo **já carregados** antes de apresentar. Um app vazio
não mostra gráfico, histórico nem alerta vencido.

---

## Roteiro sugerido (8 a 10 minutos)

| # | O que mostrar | O que dizer |
|---|---------------|-------------|
| 1 | **Garagem** com os 2 veículos | O problema: ninguém lembra quando foi a última troca de óleo. O app mostra o estado de cada veículo de relance. |
| 2 | A **faixa de medida** no card | Não é barra de progresso: é uma régua com as duas pontas. O usuário quer saber que está em 114.500 e que o limite é 115.000. |
| 3 | Aba **Alertas** | Vencido, chegando e em dia. O cálculo projeta por quilometragem, por data ou pelos dois. |
| 4 | **Registrar como feito** num vencido | Fluxo completo de registro — e o alerta some da lista. |
| 5 | **Cadastrar veículo** → tocar em Marca | **Requisito de Web Service:** a lista vem da tabela FIPE. Mostre o valor de referência aparecendo. |
| 6 | **Ajustes** → Notificações → Enviar teste | **Requisito de notificação**, funcionando no aparelho. |
| 7 | Fechar e reabrir o app | **Requisito de persistência**: os dados continuam lá. |
| 8 | **Ajustes** → **Tema** → trocar | Quatro temas, escolha salva. |
| 9 | **Aba Gastos** | Evolução mensal, categorias, consumo médio, custo por km. |
| 10 | GitHub: branches e CHANGELOG | **Requisito de Git Flow**: `main`, `develop`, as branches de feature, as versões no CHANGELOG, Pull Requests e o CI verde na aba Actions. |

---

## Se perguntarem

**"Tem backend?"**
Não. Os dados ficam no aparelho, com AsyncStorage. A camada de dados é
assíncrona de propósito, então trocar por um servidor não exige mexer em
nenhuma tela.

**"Por que não tem login?"**
Sem servidor, o login seria uma tela que não protege nem sincroniza nada. A
branch `feature/login` está criada para quando houver backend.

**"Como vocês testaram?"**
Em duas camadas. **127 testes das regras de negócio**, rodando no Node sem
emulador em menos de dois segundos — rode `npm test` ao vivo se quiserem ver.
E **integração contínua no GitHub Actions**: a cada push, uma máquina limpa
instala o projeto do zero, roda a verificação oficial do Expo, tipos, lint e
testes, e **compila o app para iPhone, Android e web**. Mostre a aba
**Actions** do repositório, com os ✅. O que cada camada cobre e o que só o
aparelho prova está em `docs/validacao.md`.

**"Quais problemas vocês encontraram?"**
`docs/melhorias.md` lista os defeitos corrigidos, com como cada um se
manifestava. Vale citar o do odômetro: digitar 1.145.000 em vez de 114.500
inflava o valor **sem nenhum caminho de volta**, e todos os lembretes do
veículo passavam a mentir. Foi encontrado em revisão, não por usuário.

**"O que falta?"**
Exportar o histórico, guardar as fotos no diretório do app, adiar lembrete e
login. Todos mapeados em `docs/melhorias.md`, com branch criada para cada um.

---

## No dia

- [ ] Notebook carregado e na tomada
- [ ] Emulador **já aberto** antes de começar
- [ ] `npm start` **já rodando** (o primeiro bundle demora)
- [ ] Dados de exemplo carregados
- [ ] iPhone com Expo Go, como plano B
- [ ] [xandoqa.github.io/Carro_em_dia](https://xandoqa.github.io/Carro_em_dia/) aberto numa aba, como plano B
- [ ] Wi-Fi conferido — se a rede da faculdade isolar os aparelhos, use
      `npm run start:tunnel`
