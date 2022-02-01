#!/bin/bash

set -euo pipefail;

if [ $# -eq 0 ]; then
  echo "Merci de fournir le nom d'une app front en argument (admin, certif, mon-pix ou orga)."
  exit 1
fi

APP=$1
SCOPE="../../$APP/app"

function ensure_correct_given_app() {
  if [ $# -eq 0 -a $APP != "admin" -a $APP != "certif" -a $APP != "mon-pix" -a $APP != "orga" ]; then
    echo -e "Merci de fournir le nom de l'application front sur laquelle vous voulez lancer le script.\n"
    exit 1
  fi
}

source "./get-all-classes-names-in-hbs.sh"
source "./get-all-classes-names-in-scss.sh"

ensure_correct_given_app
get_all_classes_names_in_hbs
get_all_classes_names_in_scss