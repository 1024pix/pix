#!/usr/bin/env bash

set -e

echo -e "container\ttime\tduration\tstatus\tmethod\tpath\treferer"
grep --color=auto 'status=499\|status=5' router.logs | \
    awk '{gsub("container=|method=|path=|duration=|status=|referer=", "") ; print $10 "\t" $2 "\t" $14 "\t" $13 "\t" $6 "\t" $7 "\t" $16}'
