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


