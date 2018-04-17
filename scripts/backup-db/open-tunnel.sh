#!/bin/sh

APP='pix-api'

if ! scalingo -v
then
  echo "You must install scalingo CLI: http://cli.scalingo.com"
  exit 1
fi

echo "Opening the tunnel…"
scalingo --app ${APP} db-tunnel -p 10000 SCALINGO_POSTGRESQL_URL
