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

echo -e "Updating ${GREEN}preview${RESET_COLOR} environment.\n"

echo -e "Updating local version of ${YELLOW}master${RESET_COLOR} branch.\n"
git checkout master
git pull

echo -e "Rebasing ${YELLOW}preview${RESET_COLOR} on ${YELLOW}master${RESET_COLOR}.\n"
git checkout preview
git pull
git rebase master
git push origin preview --force

git checkout dev

echo -e "${YELLOW}Preview${RESET_COLOR} environement is updated to ${YELLOW}master${RESET_COLOR}.\n"
echo -e "Circle CI will deploy the new version within few minutes"
