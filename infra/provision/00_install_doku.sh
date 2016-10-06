#! /bin/bash
set -eu

wget "https://raw.githubusercontent.com/dokku/dokku/v0.7.2/bootstrap.sh"
hostname pix-app.ovh
DOKKU_TAG=v0.7.2 bash bootstrap.sh

