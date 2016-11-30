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

# Checks that current branch is a 'release' one
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != release-* ]];
then
  echo "${RED}Wrong branch!${RESET_COLOR} You must be on a release branch as ${GREEN}release-x.y.z${RESET_COLOR} in order to perform the release but your current one is ${RED}${CURRENT_BRANCH}${RESET_COLOR}."
  exit 1
fi

# Checks that only CHANGELOG.md file is edited
MODIFIED_FILES=$(git diff --name-only)
if [ "CHANGELOG.md" != $MODIFIED_FILES ];
then
    echo "${RED}Too much files edited!${RESET_COLOR} You must only edit ${GREEN}CHANGELOG.md${RESET_COLOR} file during the release process."
    exit 1
fi

# Persist changes
git add CHANGELOG.md
git commit -m "Update CHANGELOG.md"
git push origin $CURRENT_BRANCH

#
