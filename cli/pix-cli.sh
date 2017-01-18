#!/bin/bash

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
  echo "  help                                          # Display PIX-CLI usage"
  echo "  db:backup <environment>                       # Export a dump of the postgres service database"
  echo "  db:restore <environment> <file>               # Restore a database by importing a PostgreSQL dump file"
  echo "  logs:app <environment>                        # Show the last log(s) of the given environment"
  echo "  logs:db <environment>                         # Print the most recent log(s) for the database of the given environment"
  echo "  ssh-keys:add <name> </path/to/key>            # Add a new public key by pipe or path (alias for Dokku command 'ssh-keys:add')"
  echo "  ssh-keys:list                                 # List of all authorized dokku public ssh keys (alias for Dokku command 'ssh-keys:list')"
  echo "  ssh-keys:remove <name>                        # Remove SSH public key by name (alias for Dokku command ssh-keys:remove'')"
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

  BACKUPS_DB_FOLDER="~/backups/db"
  DATE=`date +%Y%m%d`
  DUMP_FILE="$BACKUPS_DB_FOLDER/$DATE/$ENVIRONMENT.dump"

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

  dokku postgres:import pg-$ENVIRONMENT $DUMP_FILE

  echo "The $ENVIRONMENT database was restored."
  exit 0
fi

# pix logs:app <environment>
# ex: pix logs:app production
if [ "$COMMAND" == "logs:app" ]; then
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

# pix logs:db <environment>
# ex: pix logs:db production
if [ "$COMMAND" == "logs:db" ]; then
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

# pix ssh-keys:add <name> </path/to/key>
# ex: pix ssh-keys:add jbu.pub ~/ssh_keys/jbu.pub
if [ "$COMMAND" == "ssh-keys:add" ]; then
  if [ $# -ne 3 ]; then
    echo "Bad number of arguments. See usage for command $COMMAND."
    exit 1
  fi

  NAME=$2
  PUB_KEY_FILE=$3

  dokku ssh-keys:add $NAME $PUB_KEY_FILE

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

  dokku ssh-keys:list

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

  dokku ssh-keys:remove $NAME

  echo "SSH key $NAME was removed."
  exit 0
fi

echo "Command $COMMAND does not exist. Use command help to see PIX-CLI usage."
exit 1
