#! /bin/bash
#
# This file is used to DESTROY a database, then create a new one, then re-run the migrations
#
# Usage: ./administrative_tasks/reboot_database.sh <db_name> <app_name>
#

DATABASE_NAME=$1
APP_NAME=$2

[ -z "$DATABASE_NAME" -o -z "$APP_NAME" ] && {
    echo "Usage: ./reboot_database.sh <db_name> <app_name>"
    exit 1
}

DOKKU_DIR=/var/lib/dokku/services/postgres/$DATABASE_NAME
MOUNT_POINT=/mnt/$DATABASE_NAME

[ -d "$DOKKU_DIR" ] || {
    echo "The database doesn't exists"
    exit 2
}

[ -d "$MOUNT_POINT" ] || {
    echo "This script has been written for databases mounted in external volumes"
    exit 3
}

YELLOW="\e[33m"
CYAN="\e[36m"
RESET="\e[0m"
GREEN="\e[32m"

echo -e "$YELLOW[[1/7]]$CYAN STOPPING APP $APP_NAME $RESET"
dokku ps:stop $APP_NAME

echo -e "$YELLOW[[2/7]]$CYAN UNLINK DATABASE $DATABASE_NAME $RESET"
dokku postgres:unlink $DATABASE_NAME $APP_NAME

echo -e "$YELLOW[[3/7]]$CYAN DESTROYING DATABASE $DATABASE_NAME AND CLEANING FILES $RESET"
dokku postgres:destroy $DATABASE_NAME --force
rm -rf $MOUNT_POINT/*
unlink $DOKKU_DIR

echo -e "$YELLOW[[4/7]]$CYAN CREATING NEW DATABASE $RESET"
dokku postgres:create $DATABASE_NAME
echo -e "$YELLOW[[5/7]]$CYAN SWAPPING SYSTEM FILES WITH EXTERNAL VOLUME FILES $RESET"
dokku postgres:stop $DATABASE_NAME
mv $DOKKU_DIR/* $MOUNT_POINT/
rmdir $DOKKU_DIR
ln -s $MOUNT_POINT $DOKKU_DIR
echo -e "$YELLOW[[6/7]]$CYAN RESTARTING DATABASE $RESET"
dokku postgres:start $DATABASE_NAME
echo -e "$YELLOW[[7/7]]$CYAN LINKING DATABASE $RESET"
dokku postgres:link $DATABASE_NAME $APP_NAME

echo -e "$GREEN FINISHED ! $RESET"
