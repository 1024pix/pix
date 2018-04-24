#!/usr/bin/env bash

# Set colors
RESET_COLOR="\033[0m"
BOLD="\033[1m"
OFFBOLD="\033[21m"

# Colors (bold)
RED="\033[1;31m"
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
BLUE="\033[1;34m"
CYAN="\033[1;36m"

# Common functions
function get_package_version {
    node -p -e "require('./package.json').version"
}

function checkout_dev {
    git checkout dev >> /dev/null 2>&1
}

function fetch_and_rebase {
    git fetch --tags
    git pull --rebase
}
