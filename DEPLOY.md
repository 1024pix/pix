# Scalingo

These directives are intended to be used with the [existing NodeJs buildpack](./api/.buildpacks).

## Pre-requisites

You'll need:

- a Scalingo account;
- a Scalingo CLI.

## Create applications

### API

Create a Scalingo application.

Add a Postgresql and a Redis addon.

Specify the application folder used for deployment: `PROJECT_DIR=api`.

Deploy a first version, which will initialize the database.

### Front-ends

Enable build:  `NPM_CONFIG_PRODUCTION=false`
Specify the application folder used for deployment: `PROJECT_DIR=mon-pix`
Build production-like asset:  `BUILD_ENVIRONMENT=production`
Setup API proxy: `API_HOST=https://<APPLICATION-NAME>.<REGION>.scalingo.io`

### Check connectivity

Create an account on pix-app.

## Bootstrap

### Get administrator privileges

To be able to create campaigns, you'll need to create an organization.
These can only be created in pix-admin.
To get access to pix-admin, grant the relevant privileges to an existing user through SQL:

```shell
scalingo --region <REGION> --app <APPLICATION-NAME> pgsql-console
```

``` postgres-sql
SELECT u.id FROM users u WHERE u.email = '<EMAIL>';

INSERT INTO
"pix-admin-roles" ("userId", "role")
VALUES
(<USER_ID>, 'SUPER_ADMIN');
```

### Plug LCMS preview

Using an admin account previously created on Pix as values, add these environment variables in LCMS :

```dotenv
# No trailing slash !
PIX_API_BASEURL=https://<APPLICATION-NAME>.<REGION>.scalingo.io
PIX_API_USER_EMAIL=<ACCOUNT-EMAIL>
PIX_API_USER_PASSWORD=<ACCOUNT-PASSWORD>
```

# Github

## Auto-merge

Add in the repository action secrets:

- a secret named `PIX_SERVICE_ACTIONS_TOKEN`
- containing a valid GitHub token
- for a user with repository write access in the repository action secrets

## Configuration file change

Add in the repository action secrets:

- a secret named `SLACK_BOT_TOKEN`
- containing a valid Slack token

Add in the repository action secrets:

- a secret named `INTEGRATION_ENV_URL`
- containing a link to the scalingo application
