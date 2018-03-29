const { expect } = require('chai');
const sinon = require('sinon');

const { displayPullRequest, filterPullRequest, getHeadOfChangelog } = require('../../../scripts/get-changelog');

describe('Unit | Script | GET Changelog', () => {

  describe('displayPullRequest', () => {
    const expectedLine = '- [#111](http://git/111) [BUGFIX] Résolution du problème de surestimation du niveau (US-389).\n';

    it('should return a line with correct format from correct PR name', () => {
      // given
      const pullRequest = {
        title: '[#111] [BUGFIX] Résolution du problème de surestimation du niveau (US-389).',
        number: 111,
        html_url: 'http://git/111'
      };
      // when
      const result = displayPullRequest(pullRequest);
      // then
      expect(result).to.equal(expectedLine);
    });
    it('should return a line with correct format from PR name with error', () => {
      // given
      const pullRequest = {
        title: '[#111][BUGFIX] Résolution du problème de surestimation du niveau (US-389) ',
        number: 111,
        html_url: 'http://git/111'
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
