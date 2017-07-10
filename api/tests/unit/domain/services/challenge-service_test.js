const { describe, it, expect } = require('../../../test-helper');

const service = require('../../../../lib/domain/services/challenge-service');
const Answer = require('../../../../lib/domain/models/data/answer');

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

  describe('#getKnowledgeData', () => {

    it('should extract knowledge data from a challenge list', () => {
      // given
      const challenges = [
        { id: 'tata', knowledgeTags: [ '@acquisA_1', '@acquisB_5', '@acquisC_3' ] },
        { id: 'titi', knowledgeTags: [ '@acquisA_3' ] },
        { id: 'toto' }
      ];

      // when
      const result = service.getKnowledgeData(challenges);

      // then
      const expected = {
        challengesById: {
          'tata': { id: 'tata', knowledgeTags: [ '@acquisA_1', '@acquisB_5', '@acquisC_3' ] },
          'titi': { id: 'titi', knowledgeTags: [ '@acquisA_3' ] }
        },
        knowledgeTagSet: {
          '@acquisA_1': true,
          '@acquisB_5': true,
          '@acquisC_3': true,
          '@acquisA_3': true
        },
        nbKnowledgeTagsByLevel: {
          1: 1,
          2: 0,
          3: 2,
          4: 0,
          5: 1,
          6: 0,
          7: 0,
          8: 0
        }
      };

      expect(result).to.deep.equal(expected);
    });

  });

});
