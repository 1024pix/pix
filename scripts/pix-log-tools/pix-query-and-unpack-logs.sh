#!/usr/bin/env bash

set -e

function query-logs() {
    local n=${1:-10000}
    echo "Loading last $n logs..."
    scalingo --app pix-api-production logs -n $n > raw.logs
}

query-logs $@
pix-unpack-logs.sh raw.logs
