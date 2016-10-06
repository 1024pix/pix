#! /bin/bash
set -eu

dokku plugin:install https://github.com/dokku/dokku-postgres.git postgres || true

# ensure /mnt/pg-{prod,development} are both mounted
[ -d /mnt/pg-prod -a -d /mnt/pg-development ] || {
	echo "FATAL: please mount external volumes on /mnt/pg-* for full installation" >&2
	exit 1
}

function create_postgres_service() {
        name=$1

        dokku postgres:create $name
        dokku postgres:stop $name
        mv /var/lib/dokku/services/postgres/$name/* /mnt/$name/
        rmdir /var/lib/dokku/services/postgres/$name
        ln -s /mnt/$name /var/lib/dokku/services/postgres/$name
        dokku postgres:start $name
}

create_postgres_service pg-prod
create_postgres_service pg-development

