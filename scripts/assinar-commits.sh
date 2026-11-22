#!/usr/bin/env bash
#
# Configura assinatura de commits, para o GitHub mostrar "Verified".
#
# POR QUE ESTE SCRIPT EXISTE, EM VEZ DE A CHAVE JA VIR PRONTA
#
# Assinar commit exige uma chave privada. Essa chave e a sua identidade: quem
# a tem pode assinar commits como voce. Por isso ela precisa nascer e ficar na
# SUA maquina — uma chave gerada em outro lugar nao prova nada sobre voce.
#
# Este script faz o caminho inteiro na sua maquina, em dois modos:
#
#   bash scripts/assinar-commits.sh              configura para os PROXIMOS commits
#   bash scripts/assinar-commits.sh --historico  reassina TODOS os commits ja feitos
#
# O modo --historico reescreve o historico: todos os hashes mudam e e preciso
# forcar o envio. So use se quiser o selo "Verified" tambem nos commits
# antigos, e avise quem mais tiver um clone.

set -euo pipefail
cd "$(dirname "$0")/.."

azul()     { printf '\033[36m%s\033[0m\n' "$1"; }
verde()    { printf '\033[32m%s\033[0m\n' "$1"; }
amarelo()  { printf '\033[33m%s\033[0m\n' "$1"; }
vermelho() { printf '\033[31m%s\033[0m\n' "$1"; }
titulo()   { printf '\n\033[1m%s\033[0m\n' "$1"; }

HISTORICO=0
[ "${1:-}" = "--historico" ] && HISTORICO=1

CHAVE="$HOME/.ssh/id_ed25519"

titulo 'Assinatura de commits'

if [ ! -d .git ]; then
  vermelho 'Esta pasta não é um repositório git.'
  echo 'Assinatura só funciona em um clone. Use:'
  azul '  git clone https://github.com/xandoqa/Carro_em_dia.git'
  exit 1
fi

# ---------------------------------------------------------------------------
# 1. Versão do Git
# ---------------------------------------------------------------------------
# Assinatura por SSH existe a partir do Git 2.34. É bem mais simples que GPG:
# aproveita a mesma chave que você já usa para autenticar.
versao=$(git --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
maior=${versao%%.*}
menor=${versao##*.}
if [ "$maior" -lt 2 ] || { [ "$maior" -eq 2 ] && [ "$menor" -lt 34 ]; }; then
  vermelho "Git $versao é antigo demais."
  echo 'Assinatura por SSH precisa do Git 2.34 ou maior.'
  azul '  sudo apt update && sudo apt install git'
  exit 1
fi
verde "Git $versao"

# ---------------------------------------------------------------------------
# 2. Chave SSH
# ---------------------------------------------------------------------------
if [ -f "$CHAVE" ]; then
  verde "Chave encontrada em $CHAVE"
else
  amarelo "Nenhuma chave em $CHAVE."
  echo 'Vou criar uma agora. Pode deixar a senha em branco (basta dar Enter).'
  echo
  ssh-keygen -t ed25519 -C "129068386+xandoqa@users.noreply.github.com" -f "$CHAVE"
  verde 'Chave criada.'
fi

PUBLICA=$(cat "$CHAVE.pub")

# ---------------------------------------------------------------------------
# 3. Configuração do Git
# ---------------------------------------------------------------------------
git config user.name 'Alexandre Rodrigues Costa'
git config user.email '129068386+xandoqa@users.noreply.github.com'
git config gpg.format ssh
git config user.signingkey "$CHAVE.pub"
git config commit.gpgsign true
git config tag.gpgsign true

# O arquivo de assinantes permitidos faz o `git log --show-signature` validar
# localmente. O GitHub não usa este arquivo, mas ajuda a conferir na máquina.
PERMITIDOS="$HOME/.config/git/allowed_signers"
mkdir -p "$(dirname "$PERMITIDOS")"
if ! grep -qF "$PUBLICA" "$PERMITIDOS" 2>/dev/null; then
  echo "129068386+xandoqa@users.noreply.github.com $PUBLICA" >> "$PERMITIDOS"
fi
git config gpg.ssh.allowedSignersFile "$PERMITIDOS"

verde 'Git configurado para assinar.'

# ---------------------------------------------------------------------------
# 4. Cadastrar a chave no GitHub — etapa manual, e tem que ser
# ---------------------------------------------------------------------------
titulo 'Agora a parte que só você pode fazer'
cat <<MSG

O GitHub só mostra "Verified" se conhecer a sua chave pública. Cadastre assim:

  1. Abra:  https://github.com/settings/ssh/new
  2. Title: qualquer nome (ex.: "Notebook Linux")
  3. Key type: escolha  >>> Signing Key <<<   (NÃO é Authentication Key)
  4. Key: cole exatamente a linha abaixo

MSG
printf '\033[36m%s\033[0m\n\n' "$PUBLICA"
cat <<'MSG'
  5. Clique em "Add SSH key"

Se já existir essa chave cadastrada como "Authentication Key", cadastre
de novo escolhendo "Signing Key": o GitHub trata os dois tipos
separadamente, e só o de assinatura gera o selo Verified.

MSG

read -r -p 'Já cadastrou a chave no GitHub? [s/N] ' resposta
case "$resposta" in
  s|S|sim|Sim|y|Y) ;;
  *)
    amarelo 'Tudo bem. Cadastre e rode este script de novo.'
    echo 'A configuração do Git já está pronta, então é só repetir depois.'
    exit 0
    ;;
esac

# ---------------------------------------------------------------------------
# 5. Reassinar o histórico (opcional)
# ---------------------------------------------------------------------------
if [ "$HISTORICO" -eq 1 ]; then
  titulo 'Reassinando o histórico'
  cat <<'MSG'
Isto reescreve TODOS os commits. Consequências:

  - todos os hashes mudam;
  - o envio precisa ser forçado (--force);
  - quem tiver um clone precisa refazê-lo.

MSG
  read -r -p 'Continuar? [s/N] ' confirma
  case "$confirma" in
    s|S|sim|Sim|y|Y) ;;
    *) amarelo 'Cancelado. Nada foi alterado.'; exit 0 ;;
  esac

  BACKUP="backup-antes-de-assinar-$(date +%Y%m%d-%H%M%S)"
  git branch "$BACKUP"
  verde "Backup criado no branch $BACKUP"

  echo 'Reassinando... (pode demorar um pouco)'
  FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f \
    --commit-filter 'git commit-tree -S "$@"' \
    --tag-name-filter cat -- --branches --tags

  verde 'Histórico reassinado.'
  echo
  amarelo 'Agora envie, forçando:'
  azul '  git push --force origin main develop'
  azul '  bash scripts/publicar-versoes.sh'
  echo
  echo "Se algo sair errado, o estado anterior está em: $BACKUP"
else
  titulo 'Pronto'
  cat <<'MSG'
Os PRÓXIMOS commits serão assinados automaticamente.

Para testar agora:

MSG
  azul '  git commit --allow-empty -m "teste de assinatura"'
  azul '  git log --show-signature -1'
  echo
  echo 'Deve aparecer "Good signature". Depois do push, o GitHub mostra'
  echo '"Verified" ao lado do commit.'
  echo
  echo 'Para assinar também os commits ANTIGOS:'
  azul '  bash scripts/assinar-commits.sh --historico'
fi
