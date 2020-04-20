#!/bin/bash -e

rm -rf ./tmp/pix.tar ./tmp/herokuenv ./tmp/herokuenvfile

# To avoid a slow copy over the Docker mount, we tar the sources
mkdir -p tmp
git ls-files -z | xargs -0 tar -cf tmp/pix.tar

APPLICATION_NAME=${APPLICATION_NAME:-mon-pix}

mkdir -p tmp/herokuenv
(
  cd tmp/herokuenv

  # Avoid warnings due to Scalingo's node-buildpack injecting their certs
  # (which our image does not have)
  echo /dev/null > NODE_EXTRA_CA_CERTS

  case "$APPLICATION_NAME" in
    mon-pix)
      echo pix-app-local > APP
      echo production > NODE_ENV
      echo disabled > MAINTENANCE
      echo production > BUILD_ENVIRONMENT
      echo false > NPM_CONFIG_PRODUCTION
      echo mon-pix > BUILDPACK_SUBDIR
      ;;
    orga)
      echo pix-orga-local > APP
      echo production > NODE_ENV
      echo disabled > MAINTENANCE
      echo production > BUILD_ENVIRONMENT
      echo false > NPM_CONFIG_PRODUCTION
      echo orga > BUILDPACK_SUBDIR
      ;;
    certif)
      echo pix-certif-local > APP
      echo production > NODE_ENV
      echo disabled > MAINTENANCE
      echo production > BUILD_ENVIRONMENT
      echo false > NPM_CONFIG_PRODUCTION
      echo certif > BUILDPACK_SUBDIR
      ;;
    admin)
      echo pix-admin-local > APP
      echo production > NODE_ENV
      echo disabled > MAINTENANCE
      echo production > BUILD_ENVIRONMENT
      echo false > NPM_CONFIG_PRODUCTION
      echo admin > BUILDPACK_SUBDIR
      ;;
    api)
      echo pix-api-local > APP
      # Running in development env because production requires a postgres server
      echo development > NODE_ENV
      echo api > BUILDPACK_SUBDIR
      ;;
    front)
      echo pix-front-local > APP
      echo production > NODE_ENV
      echo disabled > MAINTENANCE
      echo production > BUILD_ENVIRONMENT
      echo false > NPM_CONFIG_PRODUCTION
      ;;
  esac
)

docker rm -fv herokuish 2>/dev/null || true

time docker run --name herokuish -ti \
  -e "BUILDPACK_URL=https://github.com/1024pix/subdir-buildpack" \
  -e IMPORT_PATH=/not/a/directory \
  -v herokuish-cache-${APPLICATION_NAME}:/tmp/cache \
  -v $PWD/tmp/pix.tar:/tmp/pix.tar:ro \
  -v $PWD/tmp/herokuenv:/tmp/env \
  gliderlabs/herokuish:v0.4.4 \
  sh -c 'tar -C /app -xf /tmp/pix.tar && /bin/herokuish test'
