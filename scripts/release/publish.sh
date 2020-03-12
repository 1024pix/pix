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
    echo "Git changes status OK"
}

function ensure_new_version_is_either_minor_or_patch_or_major {
    if [ "$NEW_VERSION_TYPE" != "patch" -a "$NEW_VERSION_TYPE" != "minor" -a "$NEW_VERSION_TYPE" != "major" ];
    then
      echo -e "${RED}Wrong argument!${RESET_COLOR} Only ${GREEN}patch${RESET_COLOR}, ${GREEN}minor${RESET_COLOR} or ${GREEN}major${RESET_COLOR} is allowed.\n"
      exit 1
    fi

    echo "Version type OK"
}

function update_version {
    (cd api/ && npm version $NEW_VERSION_TYPE --git-tag-version=false >> /dev/null)
    (cd mon-pix/ && npm version $NEW_VERSION_TYPE --git-tag-version=false >> /dev/null)
    (cd orga/ && npm version $NEW_VERSION_TYPE --git-tag-version=false >> /dev/null)
    (cd certif/ && npm version $NEW_VERSION_TYPE --git-tag-version=false >> /dev/null)
    (cd admin/ && npm version $NEW_VERSION_TYPE --git-tag-version=false >> /dev/null)
    npm version $NEW_VERSION_TYPE --git-tag-version=false >> /dev/null
    NEW_PACKAGE_VERSION=$(get_package_version)

    echo "Bumped versions in package files"
}

# Update when adding a new app
function create_a_release_commit {
    git add CHANGELOG.md package*.json api/package*json mon-pix/package*.json orga/package*.json certif/package*.json admin/package*.json --update
    git commit --message "[RELEASE] A ${NEW_VERSION_TYPE} is being released from ${OLD_PACKAGE_VERSION} to ${NEW_PACKAGE_VERSION}."

    echo "Created the release commit"
}

function complete_change_log {
  node scripts/release/get-pull-requests-to-release-in-prod.js $NEW_PACKAGE_VERSION

  echo "Updated CHANGELOG.md"
}

function push_commit_to_remote_dev {
    git push origin dev

    echo "Pushed release commit on branch origin/dev"
}

function checkout_master {
    git checkout master >> /dev/null 2>&1

    echo "Checked out branch master"
}

function create_a_merge_commit_of_dev_into_master_and_tag_it {
    git merge dev --no-edit
    git tag --annotate "v${NEW_PACKAGE_VERSION}" --message "v${NEW_PACKAGE_VERSION}"

    echo "Merged changes from dev into master and created annotated tag"
}

function push_commit_and_tag_to_remote_master {
    git push origin master
    git push origin "v${NEW_PACKAGE_VERSION}"

    echo "Pushed changes on branch origin/master with tag"
}

function publish_release_on_sentry {
    npx sentry-cli releases -o pix new -p pix-api "v${NEW_PACKAGE_VERSION}"
    npx sentry-cli releases -o pix set-commits --commit "1024pix/pix@v${NEW_PACKAGE_VERSION}" "v${NEW_PACKAGE_VERSION}"

    echo "Published release on Sentry"
}

echo -e "Preparing a new release for ${RED}production${RESET_COLOR}.\n"

echo "== Validate context =="
ensure_no_uncommited_changes_are_present
ensure_new_version_is_either_minor_or_patch_or_major
echo "== Package release =="
checkout_dev
fetch_and_rebase
update_version
complete_change_log
create_a_release_commit
push_commit_to_remote_dev
echo "== Publish release =="
checkout_master
fetch_and_rebase
create_a_merge_commit_of_dev_into_master_and_tag_it
push_commit_and_tag_to_remote_master
publish_release_on_sentry
echo "== Go back to dev to avoid unvolontary changes =="
checkout_dev

echo -e "Release publication ${GREEN}succeeded${RESET_COLOR}."
