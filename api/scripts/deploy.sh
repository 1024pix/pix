#! /bin/bash
set -e

BUILD_ENV=$1
GIT_BRANCH=$2

case $BUILD_ENV in
  "integration")
    if [ -n "$GIT_BRANCH" ]
    then
      git remote add dokku dokku@pix-app.ovh:${GIT_BRANCH}
      cd ..
      git filter-branch --prune-empty --subdirectory-filter api HEAD
      git push --force dokku HEAD:master 
    fi
  ;;
  "staging")
    git remote add scalingo git@scalingo.com:pix-api-staging.git
    git push --force scalingo dev:master
  ;;
  "production")
    git remote add scalingo git@scalingo.com:pix-api-production.git
    git push scalingo master:master
  ;;
esac
