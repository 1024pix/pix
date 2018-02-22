#! /bin/bash
if [ $NODE_ENV = "development" ]
then
  echo "Run DB:SEED"
  npm run db:seed
fi
