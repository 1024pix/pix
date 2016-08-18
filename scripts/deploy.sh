#! /bin/bash

BUILD_ENV=$1
BUILD_OUTPUT=$2

# default env: production
[ -z $BUILD_ENV ] && {
    BUILD_ENV=production
}

# if no dist/ is given, use the branch name
[ -z $BUILD_OUTPUT ] && {
    BUILD_OUTPUT=`git rev-parse --abbrev-ref HEAD`
}

tput init
echo -n '** '
tput setaf 3
echo -n "Deploying "
tput setaf 6 ; tput bold
git rev-parse --abbrev-ref HEAD | tr -d "\n"
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

git stash

(ember build --environment $BUILD_ENV --output-path $tmpdir \
    && git checkout gh-pages                                \
    && rm -rf ./$BUILD_OUTPUT                               \
    && mv $tmpdir ./$BUILD_OUTPUT                           \
    && git add -A ./$BUILD_OUTPUT/                          \
    && git commit -m 'release a new version'                \
    && git push origin gh-pages                             \
    && git checkout -
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

git stash pop
