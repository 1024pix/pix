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

# Checks we are on branch 'dev'
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "dev" ];
then
  echo "${RED}Wrong branch!${RESET_COLOR} You must be on branch ${GREEN}dev${RESET_COLOR} in order to make a release but your current one is ${RED}${CURRENT_BRANCH}${RESET_COLOR}."
  exit 1
fi

# Checks we have no uncommited changes
if [ -n "$(git status --porcelain)" ];
then
    echo -e "${RED}You have uncommitted changes!${RESET_COLOR} Please commit or stash your changes first.\n"
    git status
    exit 1
fi

# Fetches all last changes
git fetch --all

# Creates new release branch
# https://gist.github.com/DarrenN/8c6a5b969481725a4413
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

# Create new release branch
git checkout -b "release-$PACKAGE_VERSION"
echo "You are now on branch ${YELLOW}release-$PACKAGE_VERSION${RESET_COLOR}"

echo "From now, ${CYAN}edit the CHANGELOG.md file${RESET_COLOR}, then ${CYAN}execute release:perform NPM task ${RESET_COLOR}"
