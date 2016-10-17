PIX Infrastructure
==================

Where: Ovh Cloud, an EG-7-SSD
How: Dokku, with ssh keys (@mackwic ssh keys are set on CircleCI side)

See the Dokku doc: http://dokku.viewdocs.io/dokku/getting-started/installation/

Workflow
--------

Dokku handle a git reposotory, use it to create a docker image of the app, and run it via a heroku
buildpack.

All actions are done via SSH. See the Dokku documentation (or `dokku help`) for available commands.

The name of the remote repository is the name of the remote application, e.g. for the remote
`dokku@pix-app.ovh:some-remote`, when One push a commit, the builded application will be available
via `some-remote.pix-app.ovh`. All remote are accepted, please create as much apps as you need.

Basic commands
--------------

(you need to be SSHed on ubuntu@pix-app.ovh first, or use the dokku client provided in the `bin/`
directory)

- `dokku help`
- `dokku postgres:help`
- `dokku postgres:info <db>`
- `dokku apps:info <app>`
- run an ephemeral command: `dokku run <app> <cmd>`
- connect to my db: `dokku postgres:connect <db>`
- ps stands for “process scaling”: `dokku ps:restart <app>`

Doc dokku: http://dokku.viewdocs.io/dokku~v0.4.14/configuration-management/#
Doc dokku:postgres https://github.com/dokku/dokku-postgres#commands

Troubleshooting
---------------

#### I am not OK with my migrations and and I want to reboot the DB

The infra Makefile has rules for it: `make -C infra reset-database-development` or `make -C infra reset-database-production`
are your friends.

They will stop the applications, remove the database, create a new one, and then re-up the
application.

#### Dokku has git conflicts and CircleCI can't push

*What happens*: someone probably rewrote the history. As CircleCI push all the commits, any rewrite
on the PR will create conflicts on the remote.

*How to solve*: like a normal git conflict: a merge with the remote or a `git push --force`.

- First: identify the remote which has conflicts. It could be `api-prod`, `api-development`, or a
    remote specific to a branch.
- Then, add the remote to your local repository: `git remote add $MY_UNIQUE_REMOTE_NAME dokku@pix-app.ovh:$REMOTE_IN_CONFLICT`
- Set your repo to the correct state: `git checkout $BRANCH_IN_CONFLICT && git pull origin $BRANCH_IN_CONFLICT`
- Pull the conflicting changes: `git pull $REMOTE_IN_CONFLICT master`
- Resolve the conflits, commit. `git push $REMOTE_IN_CONFLICT $BRANCH_IN_CONFLICT:master`
- Done. Deployment should be OK. Use `npm run deploy:branch` (or `prod` or `development`) for
    further deployments.


