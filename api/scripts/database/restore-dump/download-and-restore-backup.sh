#!/bin/bash


########################### UTILITIES #########################

exit_on_command_failure(){
  set -e
}

exit_on_broken_pipe(){
  set -o pipefail
}

change_directory(){
SCRIPT_DIRECTORY=${BASH_SOURCE%/*}
cd "$SCRIPT_DIRECTORY"

}

fake_activity(){
  echo 'Faking activity to prevent timeout'
  while true; do echo ["$(date +"%H:%M:%S")"] "alive"; sleep "$AVOID_TIMEOUT_INTERVAL"; done &
}

use_gmt_date_format(){
  export TZ=Etc/GMT
  echo "All date are now GMT+00"
}


########################### SETTINGS #########################
TEN_MINUTES=600
AVOID_TIMEOUT_INTERVAL=$TEN_MINUTES
DEFAULT_DATABASE_CLIENT_VERSION=13

# shellcheck disable=SC2034
LOG_FOR_HUMANS=true

if [ -z "${DUMP_FILE_PATH}" ]; then
    echo "DUMP_FILE_PATH should be set, exiting.."
    exit 1
fi

if [ -z "${DUMP_DATABASE_CLIENT_VERSION}" ]; then
    DUMP_DATABASE_CLIENT_VERSION=$DEFAULT_DATABASE_CLIENT_VERSION
    echo "DUMP_DATABASE_CLIENT_VERSION is not set, assuming $DUMP_DATABASE_CLIENT_VERSION"
fi

if [ -z "${DATABASE_URL}" ]; then
    echo "DATABASE_URL should be set, exiting.."
    exit 1
fi

# Install DB client if not yet installed
if ! command -v psql --version &> /dev/null
then
    echo 'Installing pgsql client...'
    dbclient-fetcher pgsql "$DUMP_DATABASE_CLIENT_VERSION"
fi

exit_on_command_failure
exit_on_broken_pipe
change_directory
use_gmt_date_format
fake_activity

########################### ACTUAL PROGRAM #########################
node ./download-backup.js

echo ["$(date +"%H:%M:%S")"] 'Emptying database...'
psql "$DATABASE_URL" -c "DROP OWNED BY current_user;"
echo ["$(date +"%H:%M:%S")"] 'Database emptied'

echo ["$(date +"%H:%M:%S")"] 'Importing dump...'
tar --to-stdout -xzvf "$DUMP_FILE_PATH" | pg_restore --verbose --no-owner --dbname="$DATABASE_URL"
echo ["$(date +"%H:%M:%S")"] 'Dump imported'

exit 0
