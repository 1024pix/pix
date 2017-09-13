#! /bin/bash

BUILD_ENV=$1
BUILD_OUTPUT="undefined"
GIT_CURRENT_HASH=`git rev-parse HEAD | tr -d "\n"`
GIT_CURRENT_BRANCH=`git rev-parse --abbrev-ref HEAD | tr -d "\n"`
EMBER_DIST="dist"

# default env: production
[ -z $BUILD_ENV ] && {
  BUILD_ENV="production"
}

case $BUILD_ENV in
  "integration")
    # if no <BUILD_OUTPUT> argument is given, use the branch name
    BUILD_OUTPUT=$GIT_CURRENT_BRANCH
  ;;
  "staging")
    BUILD_OUTPUT="staging"
  ;;
  "production")
    BUILD_OUTPUT="production"
  ;;
esac

tput init
echo -n '** '
tput setaf 3
echo -n "Deploying "
tput setaf 6 ; tput bold
echo -n $GIT_CURRENT_BRANCH
tput sgr0 ; tput setaf 3
echo -n " to dir "
tput setaf 6 ; tput bold
echo -n $BUILD_OUTPUT
tput sgr0 ; tput setaf 3
echo -n " with env "
tput setaf 6 ; tput bold
echo -n $BUILD_ENV
tput sgr0
echo

# use a temporary directory for the build
tmpdir=`mktemp -d`
echo -n "Created temporary directory ${tmpdir}"

# loookup changes
pending_changes=`git status --porcelain`
[ -z "${pending_changes}" ] || {
    tput setaf 1
    echo 'You CANT deploy if you have untracked file or uncommited changes. Sorry.'
    echo '** FAILED !'
    tput sgr0

    exit 1
}

GIT_HASH=`git rev-parse HEAD`

({ if [ ! -d $EMBER_DIST ]; then ember build --environment $BUILD_ENV; fi } \
    && cp -R $EMBER_DIST $tmpdir                                            \
    && git checkout gh-pages                                                \
    && git pull origin gh-pages                                             \
    && { if [ -d ./$BUILD_OUTPUT ]; then rm -rf ./$BUILD_OUTPUT; fi }       \
    && mv $tmpdir/$EMBER_DIST ./$BUILD_OUTPUT                                           \
    && git add -A ./$BUILD_OUTPUT                                           \
    && git commit -m "Release of $BUILD_OUTPUT with env $BUILD_ENV (via commit hash: $GIT_CURRENT_HASH)" \
    && git push origin gh-pages                                             \
) && {
    echo -n '** '
    tput setaf 2
    echo "Success ! Deployed on http://${BUILD_OUTPUT}.pix.beta.gouv.fr =)"
    tput sgr0
} || {
    echo -n '** '
    tput setaf 1
    echo "FAILED !"
    tput sgr0
}

git checkout -

