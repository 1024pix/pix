#!/bin/bash
set -ex

source 'scripts/database/contants.sh'

npm run db:reset

pg_dump -U postgres -h localhost -p 5432 pix --no-privileges --no-owner --create --exclude-schema=learningcontent,pgboss -Fc > $BINARY_SNAPSHOT

pg_dump -U postgres -h localhost -p 5432 pix --no-privileges --schema-only --no-owner --create --schema=learningcontent -Fc > $LEARNINGCONTENT_BINARY_SNAPSHOT

pg_dump -U postgres -h localhost -p 5432 pix --no-privileges --schema-only --no-owner --create --schema=pgboss -Fc > $PGBOSS_BINARY_SNAPSHOT
