#!/usr/bin/env bash

set -e

function ops() {
    echo -e "host\ttimestamp\ttime\trss\theapTotal\theapUsed\texternal"
    jq -r 'select(.event=="ops") | [(.host | gsub("pix-api-production-"; "")), .timestamp, (.timestamp/1000 | strflocaltime("%T")), .proc.mem.rss, .proc.mem.heapTotal, .proc.mem.heapUsed, .proc.mem.external] | @tsv' \
        json.logs
}

ops
