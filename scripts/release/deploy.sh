#!/usr/bin/env bash

set -e
set -o pipefail
source $(dirname "$0")/common.sh

VERSION_NUMBER=${1:?Please specify release to deploy}

function get_release_commit_hash {
    local commit_hash="$(git rev-parse --verify --quiet "${VERSION_NUMBER}")"

    if [ -z "${commit_hash}" ];
    then
        echo -e "${RED}Version ${VERSION_NUMBER} does not exist!${RESET_COLOR}\n" >&2
        exit 1
    fi

    echo "Fetched release commit hash"
}

function update_production_branch {
    local annotated_version="${VERSION_NUMBER}^{}"
    local annotated_tag_hash="$(git rev-parse --quiet "${annotated_version}")"
    git push origin "$annotated_tag_hash":prod

    echo "Pushed changes on branch origin/prod"
}

function finalize_release_on_sentry {
    npx sentry-cli releases -o pix finalize "${VERSION_NUMBER}"
    echo "Finalized release on Sentry"
}

echo -e "Publishing a new release to ${RED}production${RESET_COLOR}.\n"

git fetch
get_release_commit_hash
update_production_branch
finalize_release_on_sentry

echo -e "Release deployment ${GREEN}succeeded${RESET_COLOR}."
