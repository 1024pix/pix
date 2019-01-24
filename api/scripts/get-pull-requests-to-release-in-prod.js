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

function getTheLastCommitOnMaster() {
  return {
    baseUrl: 'https://api.github.com/repos/1024pix/pix',
    url: '/commits/master',
    headers: {
      'User-Agent': 'jbuget'
    },
    json: true
  };
}

function getTheCommitDate(RawDataCommit) {
  return RawDataCommit.commit.committer.date;
}

function displayPullRequest(pr) {
  return `- [#${pr.number}](${pr.html_url}) ${pr.title}\n`;
}

function orderPr(listPR) {
  const typeOrder = ['FEATURE', 'QUICK WIN', 'BUGFIX', 'TECH'];
  return _.sortBy(listPR, (pr) => {
    const typeOfPR = pr.title.substring(1, pr.title.indexOf(']'));
    const typeIndex = _.indexOf(typeOrder, typeOfPR);
    return typeIndex < 0 ? Number.MAX_VALUE : typeIndex;
  });
}

function filterPullRequest(pullrequests, dateOfLastMEP) {
  return pullrequests.filter(PR => PR.merged_at > dateOfLastMEP);
}

function getHeadOfChangelog(tagVersion) {
  const date = ' (' + moment().format('DD/MM/YYYY') + ')';
  return '## v' + tagVersion + date + ' \n\n';
}

function main() {
  const tagVersion = process.argv[2];
  let dateOfLastMEP;
  let addToChangeLog = '';

  request(getTheLastCommitOnMaster())
    .then((lastCommit) => {
      dateOfLastMEP = getTheCommitDate(lastCommit);
      return request(buildRequestObject())
    })
    .then((pullRequests) => {

      addToChangeLog += getHeadOfChangelog(tagVersion);
      const pullRequestsSinceLastMEP = filterPullRequest(pullRequests, dateOfLastMEP);

      const orderedPR = orderPr(pullRequestsSinceLastMEP);
      orderedPR.forEach(pr => addToChangeLog += displayPullRequest(pr));

      console.log('Pull Requests which will be add to the CHANGELOG.md : \n');
      console.log(addToChangeLog);

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
    orderPr,
    getHeadOfChangelog,
    getTheCommitDate,
  };
}
