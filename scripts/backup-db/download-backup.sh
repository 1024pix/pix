#!/bin/sh
set -u
set -e

APP='pix-api'

if ! scalingo -v
then
  echo "You must install scalingo CLI: http://cli.scalingo.com"
  exit 1
fi

TODAY=$(date '+%Y-%m-%d_%H%M')
TAR_OUTPUT_FILE="${APP}_${TODAY}.tar.gz"
DATABASE_URL=$(scalingo --app ${APP} env | grep  --perl-regexp --only-matching "(?<=POSTGRESQL_URL=).+$")
DATABASE_PASSWORD=$(echo $DATABASE_URL | grep --perl-regexp --only-matching '[0-9A-z]+(?=@)')
DATABASE_USERNAME=$(echo $DATABASE_URL | grep --perl-regexp --only-matching '(?<=//)[0-9A-z_]+(?=:)')
DATABASE_NAME=$DATABASE_USERNAME

echo "Downloading the dump…"
PGPASSWORD=$DATABASE_PASSWORD pg_dump --format c --host 127.0.0.1 --port 10000 --username $DATABASE_USERNAME --no-owner --no-privileges --dbname $DATABASE_NAME --file $TAR_OUTPUT_FILE

echo "Done!"
