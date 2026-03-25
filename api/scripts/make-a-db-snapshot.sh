#!/bin/bash
set -ex

npm run db:reset

pg_dump -U postgres -h localhost -p 5432 pix --no-privileges --no-owner --create --exclude-schema=learningcontent -Fc > schema.dump
pg_dump -U postgres -h localhost -p 5432 pix --no-privileges --no-owner --create --exclude-schema=learningcontent > schema.sql

pg_dump -U postgres -h localhost -p 5432 pix --no-privileges --schema-only --no-owner --create --schema=learningcontent -Fc > learningcontent-schema.dump
pg_dump -U postgres -h localhost -p 5432 pix --no-privileges --schema-only --no-owner --create --schema=learningcontent > learningcontent-schema.sql
