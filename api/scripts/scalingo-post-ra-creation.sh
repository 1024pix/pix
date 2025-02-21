#!/bin/bash
set -ex

install-scalingo-cli

if [[ -z "$MADDO" ]]; then
  npm run postdeploy
  scalingo -a pix-api-maddo-review-pr$PR_NUMBER env-set DATABASE_URL="$SCALINGO_POSTGRESQL_URL"
  scalingo -a pix-api-maddo-review-pr$PR_NUMBER restart || echo
  npm run db:seed

  # Parcoursup datamarts
  npm run postdeploy:datamart
  npm run datamart:seed

else
  npm run postdeploy:maddo
  scalingo -a pix-api-review-pr$PR_NUMBER env-set DATAMART_URL="$SCALINGO_POSTGRESQL_URL"
  scalingo -a pix-api-review-pr$PR_NUMBER restart || echo
fi

