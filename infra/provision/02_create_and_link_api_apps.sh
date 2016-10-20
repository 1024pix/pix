#! /bin/bash
set -eu

dokku apps:create api-production
dokku postgres:link pg-production api-production

dokku apps:create api-staging
dokku postgres:link pg-staging api-staging
