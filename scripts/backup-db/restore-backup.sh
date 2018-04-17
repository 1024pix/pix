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
DATABASE_URL=$(scalingo --app ${APP} env | grep  "POSTGRESQL_URL=" | cut -d = -f 2,3 | sed 's/@.*\//@localhost:10000\//')

echo "Downloading the dump…"
pg_restore --clean --if-exists --verbose --host 127.0.0.1 --port 10000 --no-owner --no-privileges --schema=public --dbname $DATABASE_URL $TAR_INPUT_FILE

echo "Done!"
