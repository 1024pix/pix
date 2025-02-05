#!/bin/bash
set -ex

install-scalingo-cli

if [[ -z "$MADDO" ]]; then
  npm run postdeploy
  scalingo -a pix-api-maddo-review-pr$PR_NUMBER set-env DATABASE_URL="$SCALINGO_POSTGRESQL_URL"
  scalingo -a pix-api-maddo-review-pr$PR_NUMBER restart
  npm run db:seed
else
  npm run postdeploy:maddo
  scalingo -a pix-api-review-pr$PR_NUMBER set-env DATAMART_URL="$SCALINGO_POSTGRESQL_URL"
  scalingo -a pix-api-review-pr$PR_NUMBER restart
fi

