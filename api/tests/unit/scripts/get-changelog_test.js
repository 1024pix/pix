const { expect } = require('chai');
const sinon = require('sinon');

const { displayPullRequest, filterPullRequest, getHeadOfChangelog, orderPr } = require('../../../scripts/get-changelog');

describe('Unit | Script | GET Changelog', () => {

  describe('displayPullRequest', () => {
    const expectedLine = '- [#111](http://git/111) [BUGFIX] Résolution du problème de surestimation du niveau (US-389).\n';

    it('should return a line with correct format from correct PR name', () => {
      // given
      const pullRequest = {
        title: '[BUGFIX] Résolution du problème de surestimation du niveau (US-389).',
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
          title: '[BUGFIX] TEST (US-11).',
          milestone: {
            number: milestone
          }
        },
        {
          title: '[BUGFIX] TRUC (US-22).',
          milestone: {
            number: 2
          }
        },
      ];
      const pullRequestsInMilestone = [
        {
          title: '[BUGFIX] TEST (US-11).',
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
      sinon.useFakeTimers();
      const headChangelog = '## v1.0.0 (01/01/1970) \n\n';
      const pullRequestsInMilestone = {
        title: '[BUGFIX] TEST (US-11).',
        milestone: {
          number: 1,
          title: '1.0.0'
        }
      };
      // when
      const result = getHeadOfChangelog(pullRequestsInMilestone);
      // then
      expect(result).to.equal(headChangelog);
    });
  });

  describe('orderPr', () => {
    it('should order PR by type', () => {
      // given
      const pullRequests = [
        { title: '[BUGFIX] TEST' },
        { title: '[QUICK WIN] TEST' },
        { title: 'TEST' },
        { title: '[FEATURE] TEST' },
        { title: '[TECH] TEST' },
      ];
      // when
      const result = orderPr(pullRequests);
      // then
      expect(result[0].title).to.equal('[FEATURE] TEST');
      expect(result[1].title).to.equal('[QUICK WIN] TEST');
      expect(result[2].title).to.equal('[BUGFIX] TEST');
      expect(result[3].title).to.equal('[TECH] TEST');
      expect(result[4].title).to.equal('TEST');
    });
  });

});
