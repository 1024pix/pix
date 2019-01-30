#!/usr/bin/env bash

set -e

function errors() {
    local min_error_code=${1:-499}
    echo -e "instance\ttime\tduration\tcode\tmethod\tpath\treferer"
    jq -r --argjson min_error_code $min_error_code \
        'select(.statusCode>=$min_error_code) | [(.instance | gsub("http://pix-api-production-|:.*"; "")), (.timestamp/1000 | strflocaltime("%T")), .responseTime/1000, .statusCode, .method, .path, .source.referer]|@tsv' json.logs
}

errors $@
