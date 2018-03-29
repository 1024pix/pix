#! /usr/bin/env node
const request = require('request-promise-native');
const moment = require('moment');

function buildRequestObject() {
  return {
    baseUrl: 'https://api.github.com/repos/betagouv/pix',
    url: '/pulls?state=closed&sort=updated&direction=desc',
    headers: {
      'User-Agent': 'jbuget'
    },
    json: true
  };
}

function displayPullRequest(pr) {
  const closeNumber = pr.title.indexOf(']');
  let title = pr.title.substring(closeNumber + 1);
  title = (title.charAt(0) === ' ') ? title.substring(1) : title;
  title = (title.charAt(title.length - 1) === ' ') ? title.substring(0, title.length - 1) : title;
  title = (title.charAt(title.length - 1) === '.') ? title : title + '.';

  return `- [#${pr.number}](${pr.html_url}) ${title}\n`;
}

function filterPullRequest(pullrequests, milestone) {
  return pullrequests.filter(pr => {
    if (pr.milestone) return pr.milestone.number === milestone;
  });
}

function getHeadOfChangelog(pullrequest) {
  const version = pullrequest.milestone.title;
  const date = ' (' + moment().format('DD/MM/YYYY') + ')';
  return '## ' + version + date + ' \n\n';
}

function main() {
  const milestone = Number(process.argv[2]);

  request(buildRequestObject())
    .then((pullRequests) => {
      const pullRequestsInMilestone = filterPullRequest(pullRequests, milestone);

      const headOfChangeLog = getHeadOfChangelog(pullRequestsInMilestone[0]);

      let changeLogForMilestone = '';
      pullRequestsInMilestone.forEach(pr => changeLogForMilestone += displayPullRequest(pr));

      console.log(headOfChangeLog + changeLogForMilestone);
    });
}

/*=================== tests =============================*/

if (process.env.NODE_ENV !== 'test') {
  main();
} else {
  module.exports = {
    displayPullRequest,
    filterPullRequest,
    getHeadOfChangelog
  };
}
