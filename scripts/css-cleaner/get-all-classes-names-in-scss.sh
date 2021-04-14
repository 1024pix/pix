#!/bin/bash

set -euo pipefail;

function create_temp_file_without_ember_dependancies() {
  sed '/['\''"]ember/s/.*//' $SCOPE/styles/app.scss > $SCOPE/styles/app-temp.scss
}

function search_classes_in_scss_files() {
  CLASSES_REGEX="\.[a-z-]+_*[a-z-]*"

  # etape 1 : on compile tous les fichiers scss en fichier css
  # etape 2 : on ne récupère que le nom des classes avec leur . devant
  # etape 3 : on vire les .
  # etape 4 : on vire les doublons
  # etape 5 : on tris les nom des classes
  npx sass --style=expanded $SCOPE/styles/app-temp.scss | grep -Eio $CLASSES_REGEX | sed -e 's/\.//g' | sort | uniq >  "$APP-classes-names-in-scss.txt"
  echo "Voici la liste des classes CSS de l'app $APP:  $APP-classes-names-in-scss.txt"
}

function remove_temp_file() {
  rm $SCOPE/styles/app-temp.scss
}

function get_all_classes_names_in_scss() {
  create_temp_file_without_ember_dependancies
  search_classes_in_scss_files
  remove_temp_file
}
