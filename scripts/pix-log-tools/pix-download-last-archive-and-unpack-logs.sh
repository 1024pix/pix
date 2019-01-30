#!/usr/bin/env bash

set -e

function download-last-archive() {
    echo "Loading last archive..."
    scalingo --app pix-api-production la | \
        grep Url: | \
        head -1 | \
        awk '{print "-JO",$2}' | \
        xargs curl -o - | gunzip > raw.logs
}

download-last-archive
pix-unpack-logs.sh raw.logs
