#!/bin/bash -e

rm -rf ./tmp/pix.tar ./tmp/herokuenv ./tmp/herokuenvfile

# To avoid a slow copy over the Docker mount, we tar the sources
tar -cf tmp/pix.tar $(git ls-files)

APPLICATION_NAME=${APPLICATION_NAME:-mon-pix}

mkdir -p tmp/herokuenv
(
  cd tmp/herokuenv

  case "$APPLICATION_NAME" in
    mon-pix)
      echo mon-pix > APPLICATION_NAME
      echo pix-app-local > APP
      echo production > NODE_ENV
      echo disabled > MAINTENANCE
      echo production > BUILD_ENVIRONMENT
      echo false > NPM_CONFIG_PRODUCTION
      echo mon-pix > BUILDPACK_SUBDIR
      ;;
    orga)
      echo orga > APPLICATION_NAME
      echo pix-orga-local > APP
      echo production > NODE_ENV
      echo disabled > MAINTENANCE
      echo production > BUILD_ENVIRONMENT
      echo false > NPM_CONFIG_PRODUCTION
      echo orga > BUILDPACK_SUBDIR
      ;;
    certif)
      echo certif > APPLICATION_NAME
      echo pix-certif-local > APP
      echo production > NODE_ENV
      echo disabled > MAINTENANCE
      echo production > BUILD_ENVIRONMENT
      echo false > NPM_CONFIG_PRODUCTION
      echo certif > BUILDPACK_SUBDIR
      ;;
    api)
      echo api > APPLICATION_NAME
      echo pix-api-local > APP
      # Running in development env because production requires a postgres server
      echo development > NODE_ENV
      echo api > BUILDPACK_SUBDIR
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
