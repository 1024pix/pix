#!/bin/sh

APP='pix-api'

if ! scalingo -v
then
  echo "You must install scalingo CLI: http://cli.scalingo.com"
  exit 1
fi

DATABASE_URL=$(scalingo --app ${APP} env | grep  --perl-regexp --only-matching "(?<=POSTGRESQL_URL=).+$")

echo "Opening the tunnel…"
scalingo --app ${APP} db-tunnel -p 10000 ${DATABASE_URL}
