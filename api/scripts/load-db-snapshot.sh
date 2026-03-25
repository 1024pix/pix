#!/bin/bash
set -ex

if [[ -z "$DATABASE_URL" ]]; then
  pg_restore -U postgres -h localhost -p 5432 --create --dbname=postgres --no-owner schema.dump
else
  pg_restore --no-owner --dbname=$DATABASE_URL schema.dump
fi
