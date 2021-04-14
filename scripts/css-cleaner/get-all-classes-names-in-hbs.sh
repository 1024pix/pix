#!/bin/bash

set -euo pipefail;

if [ $# -eq 0 ]; then
  echo "Merci de fournir le nom d'une app front en argument (admin, certif, mon-pix ou orga)."
  exit 1
fi

APP=$1
SCOPE="../../$APP/app"
ALL_HBS_FILES=$(find $SCOPE -type f -name '*.hbs')

function ensure_correct_given_app() {
  if [ $# -eq 0 -a $APP != "admin" -a $APP != "certif" -a $APP != "mon-pix" -a $APP != "orga" ]; then
    echo -e "Merci de fournir le nom de l'application front sur laquelle vous voulez lancer le script.\n"
    exit 1
  fi
}

function get_all_classes_names_in_hbs() {
  for fileName in "$ALL_HBS_FILES"
  do
    # etape 1 : on récupère les attributs class et leur contenu
    # etape 2 : on enlève le nom de l'attribut, soit la string "class="
    # etape 3 : on ne match que le nom des classes, autrement dit on vire tous les guillemets
    # etape 4 : on tris les nom des classes
    grep -Eio 'class="([a-z-]*_*[a-z-]* *)*"' $fileName | sed -e 's/[c|C]lass=//g' | grep -Eio '[a-z-]+_*[a-z-]*' | sort | uniq > "$APP-classes-names-in-hbs.txt"

    echo "Voici la liste des classes HBS de l'app $APP:  $APP-classes-names-in-hbs.txt"
  done
}

ensure_correct_given_app
get_all_classes_names_in_hbs
