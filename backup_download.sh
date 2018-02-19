#!/bin/sh

version=$(scalingo -v)
if [ $? -ne 0 ]; then
  echo "You must install scalingo CLI: http://cli.scalingo.com"
  exit 1
fi

TODAY=$(date '+%Y-%m-%d_%H%M')
TAR_OUTPUT_FILE="api-pix_${TODAY}.tar.gz"
DATABASE_URL=$(scalingo --app api-pix env | grep "POSTGRESQL_URL=" | sed "s/^.*POSTGRESQL_URL=//")
DATABASE_PASSWORD=$(echo $DATABASE_URL | sed "s/^.*:\([0-9a-zA-Z]*\)@.*$/\1/")
DATABASE_USERNAME=$(echo $DATABASE_URL | sed "s/^.*\/\/\([^:]*\):.*$/\1/")
DATABASE_NAME=$DATABASE_USERNAME

echo "Downloading the dump…"
PGPASSWORD=$DATABASE_PASSWORD pg_dump --format c --host 127.0.0.1 --port 10000 --username $DATABASE_USERNAME --no-owner --no-privileges --dbname $DATABASE_NAME --file $TAR_OUTPUT_FILE 

echo "Done!"
