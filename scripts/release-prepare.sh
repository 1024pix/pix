#!/usr/bin/env bash

# https://www.gnu.org/software/bash/manual/bashref.html#The-Set-Builtin
set -e
set -o pipefail

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Checks we are on branch 'dev'
if [ "$CURRENT_BRANCH" != "dev" ];
then
  echo "You must be on branch 'dev' in order to make a release."
  exit 1
fi

# Checks we have no uncommited changes
if [ -n "$(git status --porcelain)" ];
then
    echo "You have uncommitted changes. Please commit or stash your changes first."
    git status
    exit 1
fi

# Fetches last changes to be up-to-date

