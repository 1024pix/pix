#!/usr/bin/env bash

set -e
set -o pipefail
source $(dirname $0)/common.sh

NEW_VERSION_TYPE=$1
OLD_PACKAGE_VERSION=$(get_package_version)

function ensure_no_uncommited_changes_are_present {
    if [ -n "$(git status --porcelain)" ];
    then
        echo -e "${RED}You have uncommitted changes!${RESET_COLOR} Please commit or stash your changes first.\n"
        git status
        exit 1
    fi
}

function ensure_new_version_is_either_minor_or_patch {
    if [ "$NEW_VERSION_TYPE" != "patch" -a "$NEW_VERSION_TYPE" != "minor" ];
    then
      echo -e "${RED}Wrong argument!${RESET_COLOR} Only ${GREEN}patch${RESET_COLOR} or ${GREEN}minor${RESET_COLOR} is allowed.\n"
      exit 1
    fi
}

function update_version {
    ROOT_PATH=`pwd`
    cd $ROOT_PATH/api/ && npm version $NEW_VERSION_TYPE --git-tag-version=false >> /dev/null
    cd $ROOT_PATH/mon-pix/ && npm version $NEW_VERSION_TYPE --git-tag-version=false >> /dev/null
    cd $ROOT_PATH/orga/ && npm version $NEW_VERSION_TYPE --git-tag-version=false >> /dev/null
    cd $ROOT_PATH && npm version $NEW_VERSION_TYPE --git-tag-version=false >> /dev/null
}

function reinstall_dependencies {
    npm run clean && npm install
}

function create_a_release_commit {
    NEW_PACKAGE_VERSION=$(get_package_version)
    git add package*.json api/package*json live/package*.json --update
    git commit --message "[RELEASE] A ${NEW_VERSION_TYPE} is being released from ${OLD_PACKAGE_VERSION} to ${NEW_PACKAGE_VERSION}."
}

echo -e "Preparing a new release for ${RED}production${RESET_COLOR}.\n"

ensure_no_uncommited_changes_are_present
ensure_new_version_is_either_minor_or_patch
checkout_dev
fetch_and_rebase
update_version
reinstall_dependencies
create_a_release_commit

echo -e "From now edit the ${CYAN}CHANGELOG.md${RESET_COLOR} file and then execute ${CYAN}release:perform${RESET_COLOR} NPM task.\n"
echo -e "Release preparation ${GREEN}succeeded${RESET_COLOR}."
