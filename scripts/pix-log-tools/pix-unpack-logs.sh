#!/usr/bin/env bash

set -e

function unpack-logs() {
    local log_file=${1?Error: log_file missing.}

    echo Sorting logs...
    sort $log_file > sorted.logs

    echo -e "\nExtracting json logs..."
    grep -v '\[router\]' sorted.logs | cut -d' ' -f6- | grep '^{' > json.logs
    echo == First json log ==
    head -1 json.logs | jq -c '.'

    echo -e "\nExtracting router logs..."
    grep '\[router\]' sorted.logs > router.logs
    echo == First router log ==
    head -1 router.logs
    echo == Last router log ==
    tail -1 router.logs

    echo -e "\nExtracting error logs..."
    grep -v '\[router\]' sorted.logs  | egrep -v '^(\S+\s+){5}\{' > error.logs
    echo == First error log ==
    head -1 error.logs

    echo Done.

}

unpack-logs $@
