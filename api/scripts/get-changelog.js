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

function filterListPrByType(listPR, type) {
  const filteredPR = _.filter(listPR, (pr) => {
    const typeOfPR = pr.title.substring(1, pr.title.indexOf(']'));
    return typeOfPR === type;
  });
  return filteredPR;
}

function filterListPrWithoutType(listPR, listType) {
  const filteredPR = _.filter(listPR, (pr) => {
    const typeOfPR = pr.title.substring(1, pr.title.indexOf(']'));
    return _.indexOf(listType,typeOfPR) < 0;
  });
  return filteredPR;

}

function orderPr(listPR) {
  const typeOrdered = ['FEATURE', 'QUICK WIN', 'BUGFIX', 'TECH'];
  const featurePR = filterListPrByType(listPR, typeOrdered[0]);
  const quickWinPR = filterListPrByType(listPR, typeOrdered[1]);
  const bugfixPR = filterListPrByType(listPR, typeOrdered[2]);
  const techPR = filterListPrByType(listPR, typeOrdered[3]);
  const otherPR = filterListPrWithoutType(listPR, typeOrdered);
  return _.concat(featurePR, quickWinPR, bugfixPR, techPR, otherPR);

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

if (process.env.NODE_ENV !== 'test') {
  main();
} else {
  module.exports = {
    displayPullRequest,
    filterPullRequest,
    getHeadOfChangelog
  };
}
