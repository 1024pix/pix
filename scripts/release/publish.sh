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

# Creates new release branch
# https://gist.github.com/DarrenN/8c6a5b969481725a4413
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

echo -e "Beginning release pulication for version ${GREEN}$PACKAGE_VERSION${RESET_COLOR}.\n"

# Checks that current branch is a 'release' one
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != release-* ]];
then
  echo "${RED}Wrong branch!${RESET_COLOR} You must be on a release branch as ${GREEN}release-x.y.z${RESET_COLOR} in order to perform the release but your current one is ${RED}${CURRENT_BRANCH}${RESET_COLOR}."
  exit 1
fi

# Checks we have no uncommited changes
if [ -n "$(git status --porcelain)" ];
then
    echo -e "${RED}You have uncommitted changes!${RESET_COLOR} Please commit or stash your changes first.\n"
    git status
    exit 1
fi

# Merge 'release' branch on 'dev'
git checkout dev
git merge $CURRENT_BRANCH
git push origin dev
echo -e "You are now on branch ${YELLOW}dev${RESET_COLOR}.\n"

# Fetches all last changes
git fetch --all

git checkout master
echo -e "You are now on branch ${YELLOW}master${RESET_COLOR}.\n"

# Merge 'dev' branch on 'master'
git merge dev
git push origin master
git tag -a "v${PACKAGE_VERSION}" -m "Release version $PACKAGE_VERSION"
git push origin "v$PACKAGE_VERSION"

# Remove local branch 'gh-pages' if exists, then fetch it from remote
GH_PAGES_BRANCH="gh-pages"
if git rev-parse --quiet --verify $GH_PAGES_BRANCH > /dev/null;
then
    git branch -D $GH_PAGES_BRANCH
fi
git checkout master
echo -e "You are now on branch ${YELLOW}master${RESET_COLOR}.\n"

# Deploy the application into production
npm run deploy:production

git checkout dev
echo -e "You are now on branch ${YELLOW}dev${RESET_COLOR}.\n"

echo -e "Release publication ${GREEN}succeeded${RESET_COLOR}."
