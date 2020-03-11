#!/usr/bin/env bash

set -o pipefail
source $(dirname "$0")/common.sh

VERSION_NUMBER=${1:?Please specify release to deploy}

function ensure_version_exists {
    COMMIT_HASH="$(git rev-parse --verify --quiet "${VERSION_NUMBER}")"

    if [ -z "${COMMIT_HASH}" ];
    then
        echo -e "${RED}Version ${VERSION_NUMBER} does not exist!${RESET_COLOR}\n" >&2
        exit 1
    fi

    echo "$COMMIT_HASH"
}

function update_production_branch {
    git push origin "$COMMIT_HASH":prod
}

function finalize_release_on_sentry {
    npx sentry-cli releases -o pix finalize "v${VERSION_NUMBER}"
}

git fetch
ensure_version_exists
update_production_branch
finalize_release_on_sentry
