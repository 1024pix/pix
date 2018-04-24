#!/usr/bin/env bash

set -e
set -o pipefail
source $(dirname $0)/common.sh

PACKAGE_VERSION=$(get_package_version)

function push_commit_to_remote_dev {
    git push origin dev
}

function checkout_master {
    git checkout master >> /dev/null 2>&1
}

function create_a_merge_commit_of_dev_into_master_and_tag_it {
    git merge dev --no-edit
    git tag --annotate "v${PACKAGE_VERSION}" --message "v${PACKAGE_VERSION}"
}

function push_commit_and_tag_to_remote_master {
    git push origin master
    git push origin "v${PACKAGE_VERSION}"
}

echo -e "Beginning release pulication for version ${GREEN}${PACKAGE_VERSION}${RESET_COLOR}.\n"

push_commit_to_remote_dev
checkout_master
fetch_and_rebase
create_a_merge_commit_of_dev_into_master_and_tag_it
push_commit_and_tag_to_remote_master
checkout_dev

echo -e "Release publication ${GREEN}succeeded${RESET_COLOR}."
echo -e "You can check the deployment progression at : https://circleci.com/gh/1024pix/workflows/pix/tree/master"
