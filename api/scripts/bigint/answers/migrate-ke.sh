#!/bin/bash

########################### UTILITIES #########################

exit_on_undefined_variable(){
  set -u
}

exit_on_command_failure(){
  set -e
}

continue_on_broken_pipe(){
  set +o pipefail
}

display_command_before_execution(){
  set -x
}

user_install() {
  set -e
  local pkg=$1
  apt-get -qq download "$pkg"
  # shellcheck disable=SC2154
  dpkg --extract "$pkg_"*.deb /tmp/"$pkg"
  mkdir -p /app/bin
  mv /tmp/"$pkg"/usr/bin/* /app/bin
  set +e
}

fake_activity(){
  echo 'Faking activity to prevent timeout'
  while true; do echo ["$(date +"%H:%M:%S")"] "alive"; sleep "$AVOID_TIMEOUT_INTERVAL"; done &
}

########################### SETTINGS #########################

# temporary file and paths
SORT_DIRECTORY=/tmp/sort-tmp
DUMP_FILE_PATH=/tmp/dump.tar.gz
CONTROL_FILE_PATH=/tmp/ke.ctl


# shellcheck disable=SC2034
export LOG_FOR_HUMANS=true

DEFAULT_DATABASE_CLIENT_VERSION=13

TEN_MINUTES=600
AVOID_TIMEOUT_INTERVAL=$TEN_MINUTES

if [ -z "${DATABASE_URL}" ]; then
    echo "DATABASE_URL should be set, exiting.."
    exit 1
fi

if [ -z "${DUMP_DATABASE_CLIENT_VERSION}" ]; then
    DUMP_DATABASE_CLIENT_VERSION=$DEFAULT_DATABASE_CLIENT_VERSION
    echo "DUMP_DATABASE_CLIENT_VERSION is not set, assuming $DUMP_DATABASE_CLIENT_VERSION"
fi



# If you get this message
# sort: --batch-size argument '1024' too large
# sort: maximum --batch-size argument with current rlimit is 1021

# You should know sort's batch size is bounded by actually open FD, himself bounded by (open FD limit - actual FD open)
# To get open FD limit in order to set batch_size to a reasonable value, use ulimit -n
# local:       1 024
# scalingo 1 048 576
default_batch_size=1024

max_open_fd=$(ulimit -n)

if (( default_batch_size >= max_open_fd )); then
  batch_size=$((default_batch_size-10))
else
  batch_size=$default_batch_size
fi

default_parallel_count=8
core_count=$(nproc --all)

if (( core_count < default_parallel_count )); then
  parallel_count=$core_count
else
  parallel_count=$default_parallel_count
fi

header_size=24
footer_size=7
user_id_key=9,9

TEN_MINUTES=600
AVOID_TIMEOUT_INTERVAL=$TEN_MINUTES

# Install DB client if not yet installed
if ! command -v psql --version &> /dev/null
then
    dbclient-fetcher psql "$DUMP_DATABASE_CLIENT_VERSION"
fi

exit_on_command_failure
exit_on_undefined_variable
# set -x does not correctly handle pipes display and can mess up pipes also
# display_command_before_execution
# head and tail cause wanted broken pipe, and we use them in every script
# so do no exit on broken pipe
continue_on_broken_pipe

fake_activity
########################### ACTUAL MIGRATION #########################

import_sorted_ke(){

  echo 'Downloading backup'
  cd ./scripts/database/restore-dump
  node download-backup.js
  cd ../../bigint/answers

  echo 'Locating KE rows in dump..'

  tar -x --to-stdout -f "$DUMP_FILE_PATH"  2>/dev/null | pg_restore --list | grep "TABLE DATA public knowledge-elements" | head -1 > $CONTROL_FILE_PATH

  echo 'KE rows located'

  echo 'Importing KE rows from dump...'
  echo "- an intermediate sort is performed on userId (using sort options --batch_size=$batch_size and --parallel=$parallel_count)"
  echo "- answerId will be casted from INTEGER to BIGINT when loaded in the table"

  mkdir -p $SORT_DIRECTORY

  tar -x --to-stdout -f "$DUMP_FILE_PATH"  2>/dev/null \
    | pg_restore --use-list=$CONTROL_FILE_PATH --file - \
    | tail -n +$header_size | head -n -$footer_size \
    | LC_ALL=C GZIP=--fast sort --key=$user_id_key --temporary-directory=$SORT_DIRECTORY --compress-program='gzip' --batch-size=$batch_size --parallel=$parallel_count --buffer-size=1G \
    | cat ./header.sql - ./footer.sql \
    | psql -f - "$DATABASE_URL"

  echo 'KE rows have been successfully loaded into knowledge-elements_bigint table'
}


import_unsorted_ke(){

  echo 'Downloading backup'
  cd ./scripts/database/restore-dump
  node download-backup.js
  cd ../../bigint/answers

  echo 'Locating KE rows in dump..'

  tar -x --to-stdout -f "$DUMP_FILE_PATH"  2>/dev/null | pg_restore --list | grep "TABLE DATA public knowledge-elements" | head -1 > ke.ctl

  echo 'KE rows located'

  echo 'Importing KE rows from dump...'
  echo "- answerId will be casted from INTEGER to BIGINT when loaded in the table"

  tar -x --to-stdout -f "$DUMP_FILE_PATH"  2>/dev/null \
    | pg_restore --use-list=ke.ctl --file - \
    | tail -n +$header_size | head -n -$footer_size \
    | cat ./header.sql - ./footer.sql \
    | psql -f - "$DATABASE_URL"

  echo 'KE rows have been successfully loaded into knowledge-elements_bigint table'
}

main(){
  import_unsorted_ke
}

main
