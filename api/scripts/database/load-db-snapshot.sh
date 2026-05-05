#!/bin/bash
set -ex

source 'scripts/database/contants.sh'

if [[ -z "$DATABASE_URL" ]]; then
  pg_restore -U postgres -h localhost -p 5432 --create --dbname=postgres --no-owner $BINARY_SNAPSHOT
else
  pg_restore --no-owner --dbname=$DATABASE_URL $BINARY_SNAPSHOT
fi
