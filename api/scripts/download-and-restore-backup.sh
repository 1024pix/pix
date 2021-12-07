#!/bin/bash
# BASIC_AUTH is a 88-character string token, ending with =
# It can be retrieved using Scalingo web-app, in DB addon detail page (eg. archive)
# It is located in XHR header Authorization : Basic <TOKEN>

# BACKUP_URL is an URL targeting a tar.gz dump,  with following pattern
# https://db-api-<REGION>.scalingo.com/api/databases/<ID>/backups/<ID>/archive
# It can be retrieved using Scalingo web-app, in DB archive page (copy link)

set -xeuo pipefail

dbclient-fetcher pgsql 12

url=$(curl $BACKUP_URL -H "authorization: Basic ${BASIC_AUTH}" | grep -Eo 'https://[^"]*')

curl -o dump.tar.gz $url

echo 'Dump downloaded'

echo 'Emptying database...'
psql $DATABASE_URL -c "drop owned by current_user;"
echo 'Importing dump...'

while true; do date; sleep 60; done &
tar --to-stdout -xzvf dump.tar.gz | pg_restore --verbose --no-owner --dbname=$DATABASE_URL
