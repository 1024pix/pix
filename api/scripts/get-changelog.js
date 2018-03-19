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
  let title = pr.title.substring(closeNumber+1);
  title = (title.charAt(0) === ' ') ? title.substring(1) : title;
  title = (title.charAt(title.length-1) === ' ') ? title.substring(0, title.length - 1) : title;
  title = (title.charAt(title.length-1) === '.') ? title : title+'.';

  return `- [#${pr.number}](${pr.html_url}) ${title}\n`;
}

function filterPullRequest(pullrequests, milestone) {
  return pullrequests.filter(pr => {
    if(pr.milestone) return pr.milestone.number === milestone;
  });
}

function getHeadOfChangelog(pullrequest) {
  const version = pullrequest.milestone.title;
  const date =' ('+moment().format('DD/MM/YYYY')+')';
  return '## ' + version + date+' \n\n';
}

function main() {
  const milestone = Number(process.argv[2]);

  request(buildRequestObject())
    .then((pullRequests)=> {
      const pullRequestsInMilestone = filterPullRequest(pullRequests, milestone);

      const headOfChangeLog =  getHeadOfChangelog(pullRequestsInMilestone[0]);

      let changeLogForMilestone= '';
      pullRequestsInMilestone.forEach(pr => changeLogForMilestone += displayPullRequest(pr));

      console.log(headOfChangeLog + changeLogForMilestone);
    });
}

/*=================== tests =============================*/

if (process.env.NODE_ENV !== 'test') {
  main();
} else {

  const { expect } = require('chai');
  const sinon = require('sinon');
  describe('GET CHANGELOG', () => {

    describe('displayPullRequest', () => {
      const expectedLine = '- [#111](http://git/111) [BUGFIX] Résolution du problème de surestimation du niveau (US-389).\n'

      it('should return a line with correct format from correct PR name', () => {
        // given
        const pullRequest = {
          title : '[#111] [BUGFIX] Résolution du problème de surestimation du niveau (US-389).',
          number: 111,
          html_url : 'http://git/111'
        };
        // when
        const result = displayPullRequest(pullRequest);
        // then
        expect(result).to.equal(expectedLine);
      });
      it('should return a line with correct format from PR name with error', () => {
        // given
        const pullRequest = {
          title : '[#111][BUGFIX] Résolution du problème de surestimation du niveau (US-389) ',
          number: 111,
          html_url : 'http://git/111'
        };
        // when
        const result = displayPullRequest(pullRequest);
        // then
        expect(result).to.equal(expectedLine);
      });
    });

    describe('filterPullRequest', () => {
      it('should return only PR with the correct milestone', () => {
        // given
        const milestone = 1;
        const pullRequests = [
          {
            title: '[#111] [BUGFIX] TEST (US-11).',
            milestone: {
              number: milestone
            }
          },
          {
            title: '[#222] [BUGFIX] TRUC (US-22).',
            milestone: {
              number: 2
            }
          },
        ];
        const pullRequestsInMilestone = [
          {
            title: '[#111] [BUGFIX] TEST (US-11).',
            milestone: {
              number: milestone
            }
          }];
        // when
        const result = filterPullRequest(pullRequests, milestone);
        // then
        expect(result).to.deep.equal(pullRequestsInMilestone);
      });
    });

    describe('getHeadOfChangelog', () => {
      it('should return the head of changelog in correct value', () => {
        // given
        const clock = sinon.useFakeTimers();
        const headChangelog = '## v1.0.0 (01/01/1970) \n\n';
        const pullRequestsInMilestone = {
          title: '[#111] [BUGFIX] TEST (US-11).',
          milestone: {
            number: 1,
            title: 'v1.0.0'
          }
        };
        // when
        const result = getHeadOfChangelog(pullRequestsInMilestone);
        // then
        expect(result).to.equal(headChangelog);
        clock.restore();
      });
    });

  });

}
