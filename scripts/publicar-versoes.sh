#!/usr/bin/env bash
#
# Publica no GitHub todas as tags de versão que ainda não subiram.
#
# Existe porque o ambiente onde boa parte do projeto foi escrita bloqueia o
# envio de tags (HTTP 403 no proxy). As tags foram criadas localmente e ficam
# esperando este comando.
#
# Uso:
#   bash scripts/publicar-versoes.sh
#
# Não apaga nem altera nada: só envia o que falta.

set -euo pipefail

cd "$(dirname "$0")/.."

azul()     { printf '\033[36m%s\033[0m\n' "$1"; }
verde()    { printf '\033[32m%s\033[0m\n' "$1"; }
amarelo()  { printf '\033[33m%s\033[0m\n' "$1"; }
vermelho() { printf '\033[31m%s\033[0m\n' "$1"; }

if [ ! -d .git ]; then
  vermelho 'Esta pasta não é um repositório git.'
  echo
  echo 'Isso acontece quando o projeto foi baixado pelo .zip, que não traz'
  echo 'histórico. Para publicar versões você precisa do clone:'
  echo
  azul '  git clone https://github.com/xandoqa/Carro_em_dia.git'
  exit 1
fi

printf '\033[1m%s\033[0m\n' 'Publicando versões'
echo

locais=$(git tag -l 'v*' --sort=version:refname)
if [ -z "$locais" ]; then
  amarelo 'Nenhuma tag de versão encontrada localmente.'
  echo 'Crie uma antes:'
  azul '  git tag -a v1.0.0 -m "descrição"'
  exit 0
fi

echo 'Consultando o que já existe no GitHub...'
remotas=$(git ls-remote --tags origin 2>/dev/null | sed 's|.*refs/tags/||;s|\^{}||' | sort -u || true)
echo

enviadas=0
puladas=0
falhas=0

for tag in $locais; do
  if echo "$remotas" | grep -qx "$tag"; then
    printf '  %-10s já publicada\n' "$tag"
    puladas=$((puladas + 1))
    continue
  fi

  printf '  %-10s enviando... ' "$tag"
  if git push origin "$tag" >/dev/null 2>&1; then
    verde 'ok'
    enviadas=$((enviadas + 1))
  else
    vermelho 'falhou'
    falhas=$((falhas + 1))
  fi
done

echo
if [ "$enviadas" -gt 0 ]; then
  verde "$enviadas versão(ões) publicada(s)."
fi
if [ "$puladas" -gt 0 ]; then
  echo "$puladas já estavam no GitHub."
fi

if [ "$falhas" -gt 0 ]; then
  echo
  vermelho "$falhas falharam."
  echo
  echo 'Causas mais comuns:'
  echo '  1. Sem permissão de escrita no repositório.'
  echo '     Confira: git remote -v'
  echo '  2. Autenticação. Teste com:'
  azul '       git push origin --dry-run'
  echo '  3. A tag aponta para um commit que não está no GitHub.'
  echo '     Envie os branches primeiro:'
  azul '       git push origin main develop'
  exit 1
fi

echo
echo 'Veja as versões em:'
azul '  https://github.com/xandoqa/Carro_em_dia/tags'
