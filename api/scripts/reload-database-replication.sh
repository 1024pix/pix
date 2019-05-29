#!/bin/bash

echo "Start dump database and restore in replication database"

pg_dump --clean --if-exists --format c -d $DATABASE_URL --no-owner --no-privileges --exclude-schema 'information_schema' --exclude-schema '^pg_*' --file dump.pgsql

pg_restore --clean --if-exists -d $DATABASE_REPLICATION_URL --no-owner --no-privileges dump.pgsql

rm dump.pgsql

echo "Finished reload database replication"


