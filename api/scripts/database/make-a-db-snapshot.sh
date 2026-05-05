#!/bin/bash
set -ex

source 'scripts/database/contants.sh'

npm run db:reset

pg_dump -U postgres -h localhost -p 5432 pix --no-privileges --no-owner --create --exclude-schema=learningcontent -Fc > $BINARY_SNAPSHOT
pg_dump -U postgres -h localhost -p 5432 pix --no-privileges --no-owner --create --exclude-schema=learningcontent > $SQL_SNAPSHOT

pg_dump -U postgres -h localhost -p 5432 pix --no-privileges --schema-only --no-owner --create --schema=learningcontent -Fc > $LEARNINGCONTENT_BINARY_SNAPSHOT
pg_dump -U postgres -h localhost -p 5432 pix --no-privileges --schema-only --no-owner --create --schema=learningcontent > $LEARNINGCONTENT_SQL_SNAPSHOT
