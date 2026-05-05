#!/bin/bash
set -ex

install-scalingo-cli

if [[ -z "$MADDO" ]]; then
  # api deployment
  npm run postdeploy
  npm run db:seed
else
  # api-maddo deployment
  npm run postdeploy:maddo
  npm run datamart:migrate
  npm run datamart:seed
  API_DATABASE_URL=$(scalingo -a pix-api-review-pr$PR_NUMBER env-get SCALINGO_POSTGRESQL_URL)
  scalingo -a pix-api-maddo-review-pr$PR_NUMBER env-set DATABASE_URL="$API_DATABASE_URL"
  scalingo -a pix-api-review-pr$PR_NUMBER env-set DATAMART_DATABASE_URL="$SCALINGO_POSTGRESQL_URL"
  # le premier déploiement de l'api n'a pas forcément déjà eu lieu
  scalingo -a pix-api-review-pr$PR_NUMBER restart || echo
fi
