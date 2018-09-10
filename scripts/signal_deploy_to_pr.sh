#!/bin/bash

[ -z $GITHUB_USER ] && {
	echo 'FATAL: $GITHUB_USER is absent'
	exit 1
}

[ -z $GITHUB_USER_TOKEN ] && {
	echo 'FATAL: $GITHUB_USER_TOKEN is absent'
	exit 1
}
[ -z $CIRCLE_BRANCH ] && {
	echo 'FATAL: $CIRCLE_BRANCH is absent'
	exit 1
}
[ -z $CI_PULL_REQUEST ] && {
	echo 'INFO: $CI_PULL_REQUEST is absent. I will not post a message to github. Bye !'
	exit 0
}

PR_NUMBER=`echo $CI_PULL_REQUEST | grep -Po '(?<=pix/pull/)(\d+)'`
RA_APP_URL="https://pix-app-integration-pr$PR_NUMBER.scalingo.io"
RA_ORGA_URL="https://pix-orga-integration-pr$PR_NUMBER.scalingo.io"
RA_API_URL="https://pix-api-integration-pr$PR_NUMBER.scalingo.io"

curl -u $GITHUB_USER:$GITHUB_USER_TOKEN --verbose \
	-X POST "https://api.github.com/repos/1024pix/pix/issues/${PR_NUMBER}/comments" \
	--data "{\"body\":\"I'm deploying this PR to these urls:\n\n- App: $RA_APP_URL\n- Orga: $RA_ORGA_URL\n- API: $RA_API_URL\n\n Please check it out\"}"
