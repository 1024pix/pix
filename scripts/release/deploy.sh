#!/usr/bin/env bash

set -o pipefail
source $(dirname "$0")/common.sh

VERSION_NUMBER=${1:?Please specify release to deploy}

function get_release_commit_hash {
    COMMIT_HASH="$(git rev-parse --verify --quiet "${VERSION_NUMBER}")"

    if [ -z "${COMMIT_HASH}" ];
    then
        echo -e "${RED}Version ${VERSION_NUMBER} does not exist!${RESET_COLOR}\n" >&2
        exit 1
    fi

    echo "Fetched release commit hash"
}

function update_production_branch {
    git push origin "$COMMIT_HASH":prod

    echo "Pushed changes on branch origin/prod"
}

function finalize_release_on_sentry {
    npx sentry-cli releases -o pix finalize "v${VERSION_NUMBER}"
    echo "Finalized release on Sentry"
}

echo -e "Publishing a new release to ${RED}production${RESET_COLOR}.\n"

git fetch
get_release_commit_hash
update_production_branch
finalize_release_on_sentry

echo -e "Release deployment ${GREEN}succeeded${RESET_COLOR}."
