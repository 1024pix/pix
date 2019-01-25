#! /usr/bin/env node
const request = require('request-promise-native');
const moment = require('moment');
const _ = require('lodash');

function buildRequestObject() {
  return {
    baseUrl: 'https://api.github.com/repos/1024pix/pix',
    url: '/pulls?state=closed&sort=updated&direction=desc',
    headers: {
      'User-Agent': 'jbuget'
    },
    json: true
  };
}

function displayPullRequest(pr) {
  return `- [#${pr.number}](${pr.html_url}) ${pr.title}\n`;
}

function orderPr(listPR) {
  const typeOrder = ['FEATURE', 'QUICK WIN', 'BUGFIX', 'TECH'];
  return _.sortBy(listPR, (pr) => {
    const typeOfPR = pr.title.substring(1, pr.title.indexOf(']'));
    const typeIndex = _.indexOf(typeOrder,typeOfPR);
    return typeIndex < 0 ? Number.MAX_VALUE : typeIndex;
  });

}

function filterPullRequest(pullrequests, milestone) {
  return pullrequests.filter(pr => {
    if (pr.milestone) return pr.milestone.number === milestone;
  });
}

function getHeadOfChangelog(pullrequest) {
  const version = pullrequest.milestone.title;
  const date = ' (' + moment().format('DD/MM/YYYY') + ')';
  return '## v' + version + date + ' \n\n';
}

function main() {
  const milestone = Number(process.argv[2]);

  request(buildRequestObject())
    .then((pullRequests) => {
      const pullRequestsInMilestone = filterPullRequest(pullRequests, milestone);

      const headOfChangeLog = getHeadOfChangelog(pullRequestsInMilestone[0]);

      let changeLogForMilestone = '';
      const orderedPR = orderPr(pullRequestsInMilestone);
      orderedPR.forEach(pr => changeLogForMilestone += displayPullRequest(pr));

      console.log(headOfChangeLog + changeLogForMilestone);

    })
    .catch(console.log);
}

/*=================== tests =============================*/

if (require.main === module) {
  main();
} else {
  module.exports = {
    displayPullRequest,
    filterPullRequest,
    orderPr,
    getHeadOfChangelog
  };
}
