#!/bin/bash -e

[ -z $GITHUB_USER ] && {
	echo 'FATAL: $GITHUB_USER is absent'
	exit 1
}

[ -z $GITHUB_USER_TOKEN ] && {
	echo 'FATAL: $GITHUB_USER_TOKEN is absent'
	exit 1
}

[ -z $APP ] && {
	echo 'INFO: $APP is absent. I will not post a message to github. Bye !'
	exit 0
}

PR_NUMBER=$(echo $APP | grep -Po '(?<=integration-pr)\d+')
RA_APP_URL="https://app-pr$PR_NUMBER.review.pix.fr"
RA_ORGA_URL="https://orga-pr$PR_NUMBER.review.pix.fr"
RA_CERTIF_URL="https://certif-pr$PR_NUMBER.review.pix.fr"
RA_ADMIN_URL="https://admin-pr$PR_NUMBER.review.pix.fr"
RA_API_URL="https://pix-api-integration-pr$PR_NUMBER.scalingo.io"

MESSAGE_PREFIX="I'm deploying this PR to these urls:"

existing_comments=$(curl -Ssf -u $GITHUB_USER:$GITHUB_USER_TOKEN \
	"https://api.github.com/repos/1024pix/pix/issues/${PR_NUMBER}/comments")

if [[ $existing_comments == *"${MESSAGE_PREFIX}"* ]]; then
	echo 'INFO: found a matching comment on the PR, not posting another one.'
else
	curl -Ssf -u $GITHUB_USER:$GITHUB_USER_TOKEN \
		-X POST "https://api.github.com/repos/1024pix/pix/issues/${PR_NUMBER}/comments" \
		--data "{\"body\":\"$MESSAGE_PREFIX\n\n- App: $RA_APP_URL\n- Orga: $RA_ORGA_URL\n- Certif: $RA_CERTIF_URL\n- Admin: $RA_ADMIN_URL\n- API: $RA_API_URL\n\n Please check it out\"}"
fi
