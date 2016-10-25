#! /bin/bash

BUILD_ENV=$1
APP="undefined"

GIT_CURRENT_BRANCH=`git rev-parse --abbrev-ref HEAD | tr -d "\n"`

# default env: production
[ -z $BUILD_ENV ] && {
  BUILD_ENV="production"
}

case $BUILD_ENV in
  "integration")
    # if no <BUILD_OUTPUT> argument is given, use the branch name
    APP=$GIT_CURRENT_BRANCH
  ;;
  "staging")
    APP="api-staging"
  ;;
  "production")
    APP="api-production"
  ;;
esac

tmpdir=`mktemp -d`
cd ..
git clone . $tmpdir
pushd $tmpdir
git filter-branch --prune-empty --subdirectory-filter api HEAD

# Do we have the remote locally ?
`git remote | grep $APP` || {
    # nope, add it
    git remote add $APP dokku@pix-app.ovh:${APP}
} && true

git push $APP HEAD:master --force

popd
rm -rf $tmpdir
