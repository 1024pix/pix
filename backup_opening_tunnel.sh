#!/bin/sh

version=$(scalingo -v)
if [ $? -ne 0 ]; then
  echo "You must install scalingo CLI: http://cli.scalingo.com"
  exit 1
fi

DATABASE_URL=$(scalingo --app api-pix env | grep "POSTGRESQL_URL=" | sed "s/^.*POSTGRESQL_URL=//")

echo "Opening the tunnel…"
scalingo --app api-pix db-tunnel -p 10000 $DATABASE_URL
