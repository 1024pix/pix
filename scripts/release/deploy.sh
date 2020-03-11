#!/usr/bin/env bash

set -o pipefail
source $(dirname $0)/common.sh

VERSION_NUMBER=$1

function ensure_version_exists {
    COMMIT_HASH="$(git rev-parse --verify --quiet ${VERSION_NUMBER})"

    if [ -z "${COMMIT_HASH}" ];
    then
        echo -e "${RED}Version ${VERSION_NUMBER} does not exists !${RESET_COLOR}.\n"
        exit 1
    fi
}

git fetch --all
ensure_version_exists

git push origin COMMIT_HASH:prod
