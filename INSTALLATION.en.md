# Installation

## Prerequisites

You must first have the following software correctly installed:

- [Git](https://git-scm.com/) (2.6.4)
- [Node.js](https://nodejs.org/) (version in use available in the [.nvmrc](https://github.com/1024pix/pix/blob/dev/.nvmrc) files) — it is recommended to use a version manager such as [nvm](https://github.com/nvm-sh/nvm)
- [Docker](https://docs.docker.com/get-started/) (20.10)

> ⚠️ The versions listed are those used and recommended by the development team. The application may work with different versions.

Also make sure no process is listening on the following ports:

- 5432 (PostgreSQL), or override the `PIX_DATABASE_PORT` variable;
- 6379 (redis), or override the `PIX_CACHE_PORT` variable.

## Instructions

### Fetch the source code

Clone the source code locally:

```bash
git clone git@github.com:1024pix/pix.git && cd pix
```

⚠️ This takes about 10 minutes on a standard connection.
To fetch only the latest version, which takes about a minute, run instead:

```bash
git clone --filter tree:0  git@github.com:1024pix/pix.git && cd pix
```

### Configure the development environment on Windows (if applicable)

Set the shell to use for running shell scripts in `.npmrc`.

Open a command prompt (`cmd.exe`) then:

- 64-bit installation:

```bash
npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"
```

- 32-bit installation:

```bash
npm config set script-shell "C:\\Program Files (x86)\\git\\bin\\bash.exe"
```

Finally, to avoid line-ending issues on Windows:

```bash
git config --local core.autocrlf input
git rm -r --cached .
git reset --hard
```

### Configure the development environment

The installation script performs the following tasks:

- create the database and cache (Docker containers)
- install libraries shared across all projects

It takes less than 5 minutes.
Run it with `npm run configure`.

Verify the script completed successfully: the message "🎉 Congratulations! Your environment has been set up." should be displayed. If it is not, contact the development teams by opening [an issue](https://github.com/1024pix/pix/issues).

### IDE

#### VSCode

For VSCode users, configuration files are available in the `.vscode` folder.
To use them:
`cp .vscode/sample.launch.json .vscode/launch.json`
`cp .vscode/sample.settings.json .vscode/settings.json`

Recommended extensions can be found in the extensions tab by entering the filter `@recommended`.

### Start the applications

To start all applications, run `npm run dev`.

⚠️ This takes between 10 and 15 minutes and memory consumption is high during this operation.

If this is an issue, start applications selectively:

- Admin: `npm run dev:admin`
- Api: `npm run dev:api`
- App: `npm run dev:mon-pix`
- Certif: `npm run dev:certif`
- Orga: `npm run dev:orga`
- Pix1d: `npm run dev:pix1d`

### Access the applications

- [Pix Admin](http://localhost:4202) - port 4202 with account `superadmin@example.net` / `pix123`
- [Pix API](http://localhost:3000/api) - port 3000
- [Pix App](http://localhost:4200) - port 4200 with account `certif-success@example.net` / `pix123`
- [Pix Orga](http://localhost:4201) - port 4201 with account `sup.admin@example.net` / `pix123`
- [Pix Certif](http://localhost:4203) - port 4203 with account `certifsup@example.net` / `pix123`

The default password is `pix123`.
Other accounts are available in the [seeds](api/db/seeds/data).

### Additional configuration

#### Accessing data sources

Connect to the database:

- manual test: `docker exec -it pix-api-postgres psql -U postgres pix`;
- automated test: `docker exec -it pix-api-postgres psql -U postgres pix_test`.

Connect to the cache: `docker exec -it pix-api-redis redis-cli`

#### Configuration

Pix uses the [Dotenv](https://github.com/motdotla/dotenv) library to manage environment variables locally.

The `scripts/configure.sh` script generates a standard [.env](api/.env) file.

You can adapt it to your needs:

- enable detailed logging with pretty-print:

```dotenv
LOG_ENABLED=true
LOG_LEVEL=debug
LOG_FOR_HUMANS=true
```

- connect to a different learning content repository than the default (test):

```dotenv
LCMS_API_KEY=<SOME_KEY>
LCMS_API_URL=<SOME_URL>
```

#### Configure local domains

It is possible to access Pix applications with `*.dev.pix.<tld>` domains instead of `localhost:port`:

- Mon Pix
  - http://app.dev.pix.fr/
  - http://app.dev.pix.org/
- Orga
  - http://orga.dev.pix.fr/
  - http://orga.dev.pix.org/
- Admin
  - http://admin.dev.pix.fr/
- Certif
  - http://certif.dev.pix.fr/

To configure local domains, run the script:

```bash
sudo npm run domains:install
```

Start the Docker container:

```bash
npm run domains:start
```

Stop the container:

```bash
npm run domains:stop
```

#### Loading OIDC SSO providers when seeding

Loading OIDC SSO providers during seeding is done from the `OIDC_PROVIDERS` environment variable if it is defined. When defined, it must contain JSON. Writing this JSON is quite tedious as there are many properties to provide and newlines cannot currently be used in the `.env` file (even though it would theoretically be possible with here-document notation). An example file `OIDC_PROVIDERS.example.json` is therefore provided with a simplified workflow described below.

1. Copy and adapt the `OIDC_PROVIDERS.example.json` file to your needs:

   ```shell
   cp OIDC_PROVIDERS.example.json OIDC_PROVIDERS.json
   ```

2. Set the `OIDC_PROVIDERS` environment variable with the contents of the `OIDC_PROVIDERS.json` file:

   ```shell
   export OIDC_PROVIDERS=$(cat OIDC_PROVIDERS.json)
   ```

3. Run the seed loading with debug output to verify that OIDC SSO providers are loaded correctly:

   ```shell
   export DEBUG="pix:oidc-providers:*"
   npm run db:reset
   ```

#### Testing email sending

##### With a web interface

It is possible to test email sending with [Mailpit](https://mailpit.axllent.org/), a tool that simulates an SMTP server and provides a web interface to view sent emails.

To do this, add two environment variables to `.env`:

```shell
MAILING_ENABLED=true
MAILING_PROVIDER=mailpit
```

Mailpit is included in the docker-compose.yml images and will therefore be started automatically.

The Mailpit web interface is accessible at http://localhost:8025.

##### In a terminal

You can also trace (debug) email API calls in detail by setting an environment variable:

```shell
export DEBUG="pix:mailer:email"
```

This environment variable can also be set in the [.env](api/.env) file.
