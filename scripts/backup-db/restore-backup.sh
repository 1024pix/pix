#!/bin/sh

APP='pix-api'

if ! scalingo -v
then
  echo "You must install scalingo CLI: http://cli.scalingo.com"
  exit 1
fi

TAR_INPUT_FILE=$1
if [ -z "$TAR_INPUT_FILE" ]; then
  echo "Usage: $0 <TAR_INPUT_FILE>"
  exit 2
fi

TODAY=$(date '+%Y-%m-%d_%H%M')
DATABASE_URL=$(scalingo --app ${APP} env | grep  --perl-regexp --only-matching "(?<=POSTGRESQL_URL=).+$")
DATABASE_PASSWORD=$(echo $DATABASE_URL | grep --perl-regexp --only-matching '[0-9A-z]+(?=@)')
DATABASE_USERNAME=$(echo $DATABASE_URL | grep --perl-regexp --only-matching '(?<=//)[0-9A-z_]+(?=:)')
DATABASE_NAME=$DATABASE_USERNAME

echo "Downloading the dump…"
PGPASSWORD=$DATABASE_PASSWORD pg_restore --clean --if-exists --verbose --host 127.0.0.1 --port 10000 --username $DATABASE_USERNAME --no-owner --no-privileges --schema=public --dbname $DATABASE_NAME $TAR_INPUT_FILE

echo "Done!"
