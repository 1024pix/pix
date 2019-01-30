#!/usr/bin/env bash

set -e

function long-queries() {
    local min_response_time=${1:-5000}
    echo -e "instance\ttime\tresponseTime\tstatusCode\tmethod\tpath\treferer"
    jq -r --argjson min_response_time $min_response_time \
        'select(.responseTime > $min_response_time) | [(.instance | gsub("http://pix-api-production-|:.*"; "")), (.timestamp/1000 | strflocaltime("%T")),.responseTime/1000, .statusCode, .method, .path, .source.referer] | @tsv' \
        json.logs
}

long-queries $@
