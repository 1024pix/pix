#!/usr/bin/env bash

set -e
set -o pipefail
source $(dirname $0)/common.sh

PACKAGE_VERSION=$(get_package_version)

function persist_changelog_changes {
    git add CHANGELOG.md
    git commit --amend --no-edit
}

echo -e "Beginning release performing for version ${GREEN}${PACKAGE_VERSION}${RESET_COLOR}.\n"

checkout_dev
persist_changelog_changes

echo -e "If the CHANGELOG.md file is ok, then execute ${CYAN}release:publish${RESET_COLOR} NPM task. If you need to update the CHANGELOG.md file, then edit it and run ${CYAN}release:perform${RESET_COLOR} NPM task again.\n"
echo -e "Release performing ${GREEN}succeeded${RESET_COLOR}."
