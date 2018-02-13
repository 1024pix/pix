const { describe, it, expect } = require('../../../test-helper');

const service = require('../../../../lib/domain/services/challenge-service');
const Answer = require('../../../../lib/infrastructure/data/answer');

function _buildAnswer(result) {
  const answer = new Answer({ id: 'answer_id' });
  answer.attributes = { result: result };
  return answer;
}

describe('Unit | Service | ChallengeService', function() {

  describe('#getRevalidationStatistics', () => {

    [
      { case: 'ok', oppositeCase: 'ko' },
      { case: 'ko', oppositeCase: 'ok' },
      { case: 'partially', oppositeCase: 'ko' },
      { case: 'timedout', oppositeCase: 'ko' },
      { case: 'aband', oppositeCase: 'ko' },
      { case: 'unimplemented', oppositeCase: 'ko' },
    ]
      .forEach((testCase) => {

        it('should be able to return stats about added ' + testCase.case + ' solution', function() {
          const old_answer = [ _buildAnswer(testCase.oppositeCase) ];
          const new_answer = [ _buildAnswer(testCase.case) ];
          const under_test = service.getRevalidationStatistics(old_answer, new_answer);
          expect(under_test[testCase.case]).to.equal(1);
          const diffProperty = testCase.case + 'Diff';
          expect(under_test[diffProperty]).to.equal(1);
        });

        it('should be able to return stats about removed ' + testCase.case + ' solution', function() {
          const old_answer = [ _buildAnswer(testCase.case) ];
          const new_answer = [ _buildAnswer(testCase.oppositeCase) ];
          const under_test = service.getRevalidationStatistics(old_answer, new_answer);
          expect(under_test[testCase.case]).to.equal(0);
          const diffProperty = testCase.case + 'Diff';
          expect(under_test[diffProperty]).to.equal(-1);
        });

        it('should be able to return stats that add all ' + testCase.case + ' solutions', function() {
          const old_answer = [ _buildAnswer(testCase.case), _buildAnswer(testCase.case) ];
          const new_answer = [ _buildAnswer(testCase.case), _buildAnswer(testCase.case) ];
          const under_test = service.getRevalidationStatistics(old_answer, new_answer);
          expect(under_test[testCase.case]).to.equal(2);
          const diffProperty = testCase.case + 'Diff';
          expect(under_test[diffProperty]).to.equal(0);
        });
      });

  });

});
