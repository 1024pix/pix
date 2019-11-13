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

function publish_release_on_sentry {
    npx sentry-cli releases new -p pix-admin -p pix-api -p pix-app -p pix-orga -p pix-certif "v${PACKAGE_VERSION}"
    npx sentry-cli releases set-commits --auto "v${PACKAGE_VERSION}"
    npx sentry-cli releases finalize "v${PACKAGE_VERSION}"
}

function update_preview_and_maths {
    for environment in preview maths
    do
        echo -e "Updating ${GREEN}${environment}${RESET_COLOR} environment.\n"
        git checkout ${environment}
        git pull --rebase
        git rebase master
        git push origin ${environment}
        echo -e "${YELLOW}${environment}${RESET_COLOR} environment is updated to ${YELLOW}master${RESET_COLOR}.\n"
    done
}

echo -e "Beginning release publication for version ${GREEN}${PACKAGE_VERSION}${RESET_COLOR}.\n"

push_commit_to_remote_dev
checkout_master
fetch_and_rebase
create_a_merge_commit_of_dev_into_master_and_tag_it
push_commit_and_tag_to_remote_master
publish_release_on_sentry
update_preview_and_maths
checkout_dev

echo -e "Release publication ${GREEN}succeeded${RESET_COLOR}."
echo -e "You can check the build progress at : https://circleci.com/gh/1024pix/workflows/pix/tree/master"
echo -e "You can check the deployment progress at : https://my.scalingo.com/"
