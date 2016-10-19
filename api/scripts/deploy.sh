#! /bin/bash

APP=$1
GIT_CURRENT_BRANCH=`git rev-parse --abbrev-ref HEAD | tr -d "\n"`

[ -z $APP ] && {
    APP=$GIT_CURRENT_BRANCH
}

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
