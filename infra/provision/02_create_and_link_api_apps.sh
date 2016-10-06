#! /bin/bash
set -eu

dokku apps:create api-prod
dokku postgres:link pg-prod api-prod

dokku apps:create api-staging
dokku postgres:link pg-staging api-staging
