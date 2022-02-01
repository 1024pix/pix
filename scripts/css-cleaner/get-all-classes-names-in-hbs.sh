#!/bin/bash

set -euo pipefail;

ALL_HBS_FILES=$(find $SCOPE -type f -name '*.hbs')

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
