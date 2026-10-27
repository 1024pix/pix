#!/bin/sh
#
# Lance la commande passée en arguments, avec `MALLOC_ARENA_MAX` posé si le
# conteneur courant est visé par `MALLOC_ARENA_MAX_CONTAINERS`.
#
#   web: exec ./scripts/with-malloc-arena-max.sh node -r ./tracing.js index.js
#
# Le réglage limite le nombre d'arenas de glibc malloc. Sur un conteneur web, la
# mémoire native hors tas V8 pèse 110 à 160 Mo du RSS, et pousse les conteneurs
# M au-delà de leurs 512 Mo, donc en swap (cf. docs/fr/profiling-memoire-node.md).
# Il ne vise que certains conteneurs pour pouvoir comparer, sur les métriques
# `process_memory_bytes`, les conteneurs réglés aux autres.
#
# glibc ne lit la variable qu'au démarrage du process : elle ne peut pas être
# posée depuis Node, d'où ce passage par le Procfile.
#
# Variables d'environnement :
#
# - `MALLOC_ARENA_MAX_CONTAINERS` : conteneurs visés, avec la grammaire de
#   `container-selector.js` — `web-2`, `web-2,web-5`, `web`, `web-%3`, `all`.
#   Vide ou absente : aucun conteneur n'est visé ;
# - `MALLOC_ARENA_MAX_VALUE` : nombre d'arenas, 2 par défaut.
#
# Un `MALLOC_ARENA_MAX` déjà posé dans l'environnement s'applique à tous les
# conteneurs et n'est pas modifié ici.

set -u

# Rend 0 si le conteneur $2 est visé par le sélecteur $1. Même grammaire que
# `matchesContainerSelector` : seul `*` est un joker.
matches_container_selector() {
  selector=$1
  container=$2

  [ -n "$selector" ] && [ -n "$container" ] || return 1

  index=${container##*-}

  # le sélecteur est découpé sur les virgules et les espaces : sans `set -f`,
  # un motif `*` serait développé en noms de fichiers
  set -f
  for pattern in $(printf '%s' "$selector" | tr ',' ' '); do
    case $pattern in
      all | '*')
        set +f
        return 0
        ;;
      *-%*)
        prefix=${pattern%-%*}
        divisor=${pattern##*-%}
        case $container in "$prefix"-*) ;; *) continue ;; esac
        case $index in '' | *[!0-9]*) continue ;; esac
        case $divisor in '' | *[!0-9]*) continue ;; esac
        if [ "$divisor" -gt 0 ] && [ $((index % divisor)) -eq 0 ]; then
          set +f
          return 0
        fi
        ;;
      *-*)
        # le motif reste non quoté pour que `*` y soit un joker
        # shellcheck disable=SC2254
        case $container in $pattern)
          set +f
          return 0
          ;;
        esac
        ;;
      *)
        # un motif sans tiret désigne un type de conteneur : `web` vaut `web-*`
        case $container in "$pattern"-*)
          set +f
          return 0
          ;;
        esac
        ;;
    esac
  done
  set +f
  return 1
}

if [ $# -eq 0 ]; then
  echo "usage : $0 <commande> [arguments…]" >&2
  exit 64
fi

if [ -z "${MALLOC_ARENA_MAX:-}" ] &&
  matches_container_selector "${MALLOC_ARENA_MAX_CONTAINERS:-}" "${CONTAINER:-}"; then
  MALLOC_ARENA_MAX=${MALLOC_ARENA_MAX_VALUE:-2}
  export MALLOC_ARENA_MAX
  echo "${CONTAINER} : MALLOC_ARENA_MAX=${MALLOC_ARENA_MAX}" >&2
fi

# `exec` pour que node reçoive directement les signaux de Scalingo (cf. Procfile)
exec "$@"
