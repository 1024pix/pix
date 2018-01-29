#!/usr/bin/env bash

set -e # https://www.gnu.org/software/bash/manual/bashref.html#The-Set-Builtin
set -o pipefail

# Set colors
RESET_COLOR="$(tput sgr0)"
BOLD=$(tput smso)
OFFBOLD=$(tput rmso)

# Colors (bold)
RED="$(tput bold ; tput setaf 1)"
GREEN="$(tput bold ; tput setaf 2)"
YELLOW="$(tput bold ; tput setaf 3)"
BLUE="$(tput bold ; tput setaf 4)"
CYAN="$(tput bold ; tput setaf 6)"

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

echo -e "Updating local version of ${YELLOW}master${RESET_COLOR} branch.\n"
git checkout master
git pull

for env in preview maths
do 
  echo -e "Updating ${GREEN}${env}${RESET_COLOR} environment.\n"

  echo -e "Rebasing ${YELLOW}${env}${RESET_COLOR} on ${YELLOW}master${RESET_COLOR}.\n"
  git checkout ${env}
  git pull
  git rebase master

  git commit -m "[RELEASE] Updating the ${env} environment to the new version ${PACKAGE_VERSION}." --allow-empty

  git push origin ${env} --force

  echo -e "${YELLOW}${env}${RESET_COLOR} environement is updated to ${YELLOW}master${RESET_COLOR}.\n"
  echo -e "Circle CI will deploy the new version within few minutes.\n"
done

git checkout dev
