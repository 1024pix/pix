#!/bin/bash

PIX_CLI_VERSION="1.3.0"

COMMAND=$1

if [ "$COMMAND" == "" ]; then
  COMMAND="help"
fi

# pix help
# ex: pix help
if [ "$COMMAND" == "help" ]; then
  echo "Usage: pix <command> [command_specific_options]"
  echo ""
  echo "Commands:"
  echo ""
  echo "  help                                              # Display PIX-CLI usage"
  echo "  db:backup <environment>                           # Export a dump of the postgres service database"
  echo "  db:restore <environment> <file>                   # Restore a database by importing a PostgreSQL dump file"
  echo "  db:logs <environment>                             # Print the most recent log(s) for the database of the given environment"
  echo "  app:logs <environment>                            # Show the last log(s) of the given environment"
  echo "  ssh-keys:add <name> </path/to/key>                # Add a new public key by pipe or path (alias for Dokku command 'ssh-keys:add')"
  echo "  ssh-keys:list                                     # List of all authorized dokku public ssh keys (alias for Dokku command 'ssh-keys:list')"
  echo "  ssh-keys:remove <name>                            # Remove SSH public key by name (alias for Dokku command ssh-keys:remove'')"
  echo "  placement_tests:list                              # List all the placement tests scenarios files (.csv) available"
  echo "  placement_tests:load <scenarios_file> <app_name>  # Load into database the given scenarios file into the given Dokku application"
  echo "  version                                           # Display current version of PIX-CLI"
  echo ""
  exit 0
fi

# pix db:backup <environment>
# ex: pix db:backup production
if [ "$COMMAND" == "db:backup" ]; then
  if [ $# -ne 2 ]; then
    echo "Bad number of arguments. See usage for command $COMMAND."
    exit 1
  fi

  ENVIRONMENT=$2
  if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ]; then
    echo "Bad environment supplied. Expected environment 'production' or 'staging'."
    exit 1
  fi

  BACKUPS_DB_FOLDER=~/backups/db
  DATE=`date +%Y%m%d`
  DUMP_FOLDER=$BACKUPS_DB_FOLDER/$DATE
  DUMP_FILE=$DUMP_FOLDER/$ENVIRONMENT.dump

  mkdir $DUMP_FOLDER
  dokku postgres:export pg-$ENVIRONMENT > $DUMP_FILE

  echo "A dump file for $ENVIRONMENT database was created at $DUMP_FILE."
  exit 0
fi

# pix db:restore
# ex: pix db:restore production ~/backups/db/20170114/production.dump
if [ "$COMMAND" == "db:restore" ]; then
  if [ $# -ne 3 ]; then
    echo "Bad number of arguments. See usage for command $COMMAND."
    exit 1
  fi

  ENVIRONMENT=$2
  DUMP_FILE=$3

  if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ]; then
    echo "Bad environment supplied. Expected environment 'production' or 'staging'."
    exit 1
  fi

  if [ ! -f $DUMP_FILE ]; then
    echo "File $DUMP_FILE does not exist."
    exit 1
  fi

  dokku postgres:import pg-$ENVIRONMENT < $DUMP_FILE

  echo "The $ENVIRONMENT database was restored."
  exit 0
fi

# pix db:logs <environment>
# ex: pix db:logs production
if [ "$COMMAND" == "db:logs" ]; then
  if [ $# -ne 2 ]; then
    echo "Bad number of arguments. See usage for command $COMMAND."
    exit 1
  fi

  ENVIRONMENT=$2
  if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ]; then
    echo "Bad environment supplied. Expected environment 'production' or 'staging'."
    exit 1
  fi

  dokku postgres:logs pg-$ENVIRONMENT

  exit 0
fi

# pix app:logs <environment>
# ex: pix app:logs production
if [ "$COMMAND" == "app:logs" ]; then
  if [ $# -ne 2 ]; then
    echo "Bad number of arguments. See usage for command $COMMAND."
    exit 1
  fi

  ENVIRONMENT=$2
  if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ]; then
    echo "Bad environment supplied. Expected environment 'production' or 'staging'."
    exit 1
  fi

  dokku logs api-$ENVIRONMENT

  exit 0
fi

# pix ssh-keys:add <name> </path/to/key>
# ex: pix ssh-keys:add jbu.pub ~/ssh_keys/jbu.pub
if [ "$COMMAND" == "ssh-keys:add" ]; then
  if [ $# -ne 3 ]; then
    echo "Bad number of arguments. See usage for command $COMMAND."
    exit 1
  fi

  NAME=$2
  PUB_KEY_FILE=$3

  cat ${PUB_KEY_FILE} >> ~/.ssh/authorized_keys
  sudo dokku ssh-keys:add ${NAME} ${PUB_KEY_FILE}

  echo "SSH key added for name $NAME."
  exit 0
fi

# pix ssh-keys:list
# ex: pix ssh-keys:list
if [ "$COMMAND" == "ssh-keys:list" ]; then
  if [ $# -ne 1 ]; then
    echo "Bad number of arguments. See usage for command $COMMAND."
    exit 1
  fi

  sudo dokku ssh-keys:list

  exit 0
fi

# pix ssh-keys:remove <name>
# ex: pix ssh-keys:remove jbu.pub
if [ "$COMMAND" == "ssh-keys:remove" ]; then
  if [ $# -ne 2 ]; then
    echo "Bad number of arguments. See usage for command $COMMAND."
    exit 1
  fi

  NAME=$2

  sudo dokku ssh-keys:remove $NAME

  echo "SSH key $NAME was removed."
  exit 0
fi

# pix version
# ex: pix version
if [ "$COMMAND" == "version" ]; then
  if [ $# -ne 1 ]; then
    echo "Bad number of arguments. See usage for command $COMMAND."
    exit 1
  fi

  echo ${PIX_CLI_VERSION}
  exit 0
fi

# pix placement_tests:list
# ex: pix placement_tests:list
if [ "$COMMAND" == "placement_tests:list" ]; then
  if [ $# -ne 1 ]; then
    echo "Bad number of arguments. See usage for command $COMMAND."
    exit 1
  fi

  ls ~/placement_tests

  exit 0
fi

# pix placement_tests:load <scenarios_file> <app_name>
# ex: pix placement_tests:load scenarios11.csv 213-connect-to-account
if [ "$COMMAND" == "placement_tests:load" ]; then
  if [ $# -ne 3 ]; then
    echo "Bad number of arguments. See usage for command $COMMAND."
    exit 1
  fi

  SCENARIOS_FILE=$2
  if [ ! -e ~/placement_tests/$SCENARIOS_FILE ]; then
    echo "File ~/placement_tests/$SCENARIOS_FILE does not exists."
    echo "Available adaptive tests scenarios files are:"
    echo ""
    ls ~/placement_tests
    echo ""
    exit 1
  fi

  APP_NAME=$3
  dokku apps:list | grep $APP_NAME > /dev/null
  if [ $? -ne 0 ]; then
    echo "Application $APP_NAME does not exist."
    echo "Available applications are:"
    echo ""
    dokku apps:list
    echo ""
    exit 1
  fi

  echo "Check if volume /var/lib/dokku/data/storage/placement_tests is already mounted on application $APP_NAME"
  dokku run infra-improve-adaptive-tests-integration ls /placement_tests > /dev/null
  if [ $? -ne 0 ]; then
    echo "Mount path does not exist."
    echo "Create mount point for volume /var/lib/dokku/data/storage/placement_tests on /placement_tests."
    dokku storage:mount $APP_NAME /var/lib/dokku/data/storage/placement_tests:/placement_tests
    echo "Restart the application in order to take into account the new mount point."
    dokku ps:restart $APP_NAME
  else
    echo "Mount path already set :-)"
  fi

  echo "Load all the given adaptive test scenarios into the application internal database."
  dokku run $APP_NAME python ./scripts/add_adaptive_tests.py /placement_tests/$SCENARIOS_FILE
  echo "Scenarios successfully loaded."

  exit 0
fi

echo "Command $COMMAND does not exist. Use command help to see PIX-CLI usage."
exit 1
