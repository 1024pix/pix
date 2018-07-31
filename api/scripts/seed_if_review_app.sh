#! /bin/bash
if [ $APP != 'pix-api-production' ] && [ $APP != 'pix-api-integration' ]
then
  echo "Run DB:SEED"
  npm run db:seed
fi
