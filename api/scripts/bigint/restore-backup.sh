#!/bin/bash

set -xeuo pipefail

dbclient-fetcher pgsql 12 

url=$(curl $BACKUP_URL -H "authorization: Basic ${BASIC_AUTH}" | 
  grep -Eo 'https://[^"]*')

curl -o dump.tar.gz $url

echo 'Dump downloaded'

while true; do date; sleep 60; done &
tar --to-stdout -xzvf dump.tar.gz | pg_restore --verbose --no-owner --dbname=$DATABASE_URL
