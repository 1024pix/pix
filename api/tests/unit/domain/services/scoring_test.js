const { describe, it, expect } = require('../../../test-helper');

const pathToSource = '../../../..';

const scoring = require(pathToSource + '/lib/domain/services/scoring-service');
const Answer = require(pathToSource + '/lib/domain/models/data/answer');
const Challenge = require(pathToSource + '/lib/domain/models/referential/challenge');

function _buildChallenge(knowledgeTags) {
  const challenge = new Challenge({ id: 'challenge_id' });
  challenge.knowledgeTags = knowledgeTags;
  return challenge;
}

function _buildAnswer(challengeId, result) {
  const answer = new Answer({ id: 'answer_id' });
  answer.set('challengeId', challengeId);
  answer.set('result', result);
  return answer;
}

describe('Unit | Domain | Service | scoring', function() {

  describe('#nextNode', function() {

    [
      { title: 'direction is increasing', node: 'web4', dir: 1, answer: 'web5' },
      { title: 'direction is decreasing', node: 'rechInfo3', dir: -1, answer: 'rechInfo2' },
    ].forEach(testCase => {

      it(`should return ${testCase.answer} when ${testCase.title} and node is ${testCase.node}`, function() {
        const result = scoring.nextNode(testCase.node, testCase.dir);
        expect(result).to.equal(testCase.answer);
      });
    });

  });

  describe('#propagateKnowledge', function() {

    [
      {
        title: 'direction is increasing', allKnowledge: { 'web3': 1, 'web4': 1, 'web5': 1, 'web6': 1 },
        startNode: 'web4', dir: 1, answer: ['web4', 'web5', 'web6']
      },
      {
        title: 'direction is increasing',
        allKnowledge: { 'web1': 1, 'web2': 1, 'web3': 1, 'web4': 1, 'web5': 1, 'web6': 1, 'web7': 1, 'web8': 1 },
        startNode: 'web1',
        dir: 1,
        answer: ['web1', 'web2', 'web3', 'web4', 'web5', 'web6', 'web7', 'web8']
      },
      {
        title: 'direction is decreasing', allKnowledge: { 'web3': 1, 'web4': 1, 'web5': 1, 'web6': 1 },
        startNode: 'web4', dir: -1, answer: ['web3', 'web4']
      },
      {
        title: 'direction is increasing with hole', allKnowledge: { 'web1': 1, 'web2': 1, 'web4': 1 },
        startNode: 'web2', dir: 1, answer: ['web2', 'web4']
      },
      {
        title: 'direction is decreasing with hole', allKnowledge: { 'web1': 1, 'web2': 1, 'web4': 1 },
        startNode: 'web4', dir: -1, answer: ['web1', 'web2', 'web4']
      },
    ].forEach(testCase => {

      it(`should return ${testCase.answer} when ${testCase.title} from ${testCase.startNode} within tube ${Object.keys(testCase.allKnowledge).join(',')}`, function() {
        // When
        const result = scoring.propagateKnowledge(testCase.allKnowledge, testCase.startNode, testCase.dir);

        // Then
        expect(result.sort()).to.deep.equal(testCase.answer.sort());
      });
    });

  });

  describe('#getPerformanceStats', () => {

    const knowledgeData = {
      challengesById: {
        'challenge_web_1': _buildChallenge(['@web1']),
        'challenge_web_2': _buildChallenge(['@web2']),
        'challenge_url_1': _buildChallenge(['@url1'])
      },
      knowledgeTagSet: { '@web1': true, '@web2': true, '@url1': true },
      nbKnowledgeTagsByLevel: { 1: 2, 2: 1, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 }
    };

    it('checks sanity', () => {
      expect(scoring.getPerformanceStats).to.exist;
    });

    it('should return the list of acquired knowledge and not acquired ones', () => {
      // When
      const result = scoring.getPerformanceStats();

      // Then
      expect(result.acquiredKnowledgeTags).to.be.an('array');
      expect(result.notAcquiredKnowledgeTags).to.be.an('array');
    });

    describe('the field acquiredKnowledgeTags', () => {
      it('should add knowledge tags when level 1 is acquired', () => {
        // Given
        const correctAnswerWeb1 = _buildAnswer('challenge_web_1', 'ok');

        // When
        const result = scoring.getPerformanceStats([correctAnswerWeb1], knowledgeData);

        // Then
        expect(result.acquiredKnowledgeTags).to.deep.equal(['@web1']);
      });

      it('should not add knowledge tags when level is only partially acquired', () => {
        // Given
        const correctAnswerWeb1 = _buildAnswer('challenge_web_1', 'partial');

        // When
        const result = scoring.getPerformanceStats([correctAnswerWeb1], knowledgeData);

        // Then
        expect(result.acquiredKnowledgeTags).to.deep.equal([]);
      });

      it('should not add knowledge tags when level is not acquired', () => {
        // Given
        const correctAnswerWeb1 = _buildAnswer('challenge_web_1', 'ko');

        // When
        const result = scoring.getPerformanceStats([correctAnswerWeb1], knowledgeData);

        // Then
        expect(result.acquiredKnowledgeTags).to.deep.equal([]);
      });

      it('should validate knowledge 1 and 2 when level 2 is acquired', () => {
        // Given
        const correctAnswerWeb2 = _buildAnswer('challenge_web_2', 'ok');

        // When
        const result = scoring.getPerformanceStats([correctAnswerWeb2], knowledgeData);

        // Then
        expect(result.acquiredKnowledgeTags).to.deep.equal(['@web2', '@web1']);
      });
    });

    describe('the field notAcquiredKnowledgeTags', () => {
      it('should have knowledge tags when an answer is KO', () => {
        // Given
        const incorrectAnswerUrl1 = _buildAnswer('challenge_url_1', 'ko');

        // When
        const result = scoring.getPerformanceStats([incorrectAnswerUrl1], knowledgeData);

        // Then
        expect(result.notAcquiredKnowledgeTags).to.deep.equal(['@url1']);
      });

      it('should contains every related knowledge tags', () => {
        // Given
        const partialAnswerWeb1 = _buildAnswer('challenge_web_1', 'partial');

        // When
        const result = scoring.getPerformanceStats([partialAnswerWeb1], knowledgeData);

        // Then
        expect(result.notAcquiredKnowledgeTags).to.deep.equal(['@web1', '@web2']);
      });

      // TODO Dans ce cas, le tableau contient un état instable (J'ai appris ET je n'ai pas appris)
      it('should contain every related knowledge tags', () => {
        // Given
        const wrongAnswerWeb1 = _buildAnswer('challenge_web_1', 'ko');
        const correctAnswerWeb2 = _buildAnswer('challenge_web_2', 'ok');

        // When
        const result = scoring.getPerformanceStats([wrongAnswerWeb1, correctAnswerWeb2], knowledgeData);

        // Then
        expect(result.acquiredKnowledgeTags).to.deep.equal(['@web1', '@web2']);
        expect(result.notAcquiredKnowledgeTags).to.deep.equal([]);
      });

      it('should have every knowledge tags when level is not acquired', () => {
        // Given
        const correctAnswerWeb1 = _buildAnswer('challenge_web_1', 'ko');

        // When
        const result = scoring.getPerformanceStats([correctAnswerWeb1], knowledgeData);

        // Then
        expect(result.notAcquiredKnowledgeTags).to.deep.equal(['@web1', '@web2']);
      });

      // TODO Ici, c'est étrange qu'un ne retrouve pas web_1 quelque part
      it('should mark a level partially acquired as NOT acquired when it is partial', () => {
        // Given
        const partialAnswerWeb2 = _buildAnswer('challenge_web_2', 'partial');

        // When
        const result = scoring.getPerformanceStats([partialAnswerWeb2], knowledgeData);

        // Then
        expect(result.acquiredKnowledgeTags).to.deep.equal([]);
        expect(result.notAcquiredKnowledgeTags).to.deep.equal(['@web2']);
      });
    });

    describe('the field performanceHistory', () => {
      it('should be given as a result', () => {
        // When
        const result = scoring.getPerformanceStats();

        // Then
        expect(result.performanceHistory).to.be.an('array');
      });

      it('should add a performance input when the answer is correct', () => {
        // Given
        const correctAnswerUrl1 = _buildAnswer('challenge_url_1', 'ok');

        // When
        const result = scoring.getPerformanceStats([correctAnswerUrl1], knowledgeData);

        // Then
        expect(result.performanceHistory).to.deep.equal([{ difficulty: 1, outcome: 1 }]);
      });

      it('should add a performance input when the answer is correct and save the difficulty', () => {
        // Given
        const correctAnswerWeb2 = _buildAnswer('challenge_web_2', 'ok');

        // When
        const result = scoring.getPerformanceStats([correctAnswerWeb2], knowledgeData);

        // Then
        expect(result.performanceHistory).to.deep.equal([{ difficulty: 2, outcome: 1 }]);
      });

      it('should not record an outcome from an answer which is partially correct', () => {
        // Given
        const partialAnswerUrl1 = _buildAnswer('challenge_url_1', 'partial');

        // When
        const result = scoring.getPerformanceStats([partialAnswerUrl1], knowledgeData);

        // Then
        expect(result.performanceHistory).to.deep.equal([{ difficulty: 1, outcome: 0 }]);
      });

      it('should not record an outcome from an answer which is wrong', () => {
        // Given
        const wrongAnswerUrl1 = _buildAnswer('challenge_url_1', 'ko');

        // When
        const result = scoring.getPerformanceStats([wrongAnswerUrl1], knowledgeData);

        // Then
        expect(result.performanceHistory).to.deep.equal([{ difficulty: 1, outcome: 0 }]);
      });

    });

    describe('the nbAcquiredKnowledgeTagsByLevel', () => {
      it('should be an array and have a default value', () => {
        // When
        const result = scoring.getPerformanceStats();

        // Then
        expect(result.nbAcquiredKnowledgeTagsByLevel).to.be.an('object');
        expect(result.nbAcquiredKnowledgeTagsByLevel).to.deep.equal({
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0
        });
      });

      it('should be filled by acquired knowledge levels', () => {
        // Given
        const correctAnswerWeb2 = _buildAnswer('challenge_web_2', 'ok');
        const correctAnswerUrl1 = _buildAnswer('challenge_url_1', 'ok');

        // When
        const result = scoring.getPerformanceStats([correctAnswerWeb2, correctAnswerUrl1], knowledgeData);

        // Then
        expect(result.nbAcquiredKnowledgeTagsByLevel).to.deep.equal({
          1: 2, 2: 1, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0
        });
      });
    });
  });

  describe('#computeDiagnosis', () => {
    it('should exists', () => {
      expect(scoring.computeDiagnosis).to.exist;
    });

    describe('the field pixScore', () => {
      const knowledgeData = {
        challengesById: {
          'challenge_web_1': _buildChallenge(['@web1']),
          'challenge_web_2': _buildChallenge(['@web2']),
          'challenge_url_1': _buildChallenge(['@url1']),
          'challenge_social_1': _buildChallenge(['@soc1']),
        },
        knowledgeTagSet: { '@web1': true, '@web2': true, '@url1': true },
        nbKnowledgeTagsByLevel: { 1: 2, 2: 1, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 }
      };

      const testCases = [
        {
          performanceStats: {
            nbAcquiredKnowledgeTagsByLevel: {
              '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0
            }
          },
          expectedEstimatedLevel: 0,
          expectedPixScore: 0
        },
        {
          performanceStats: {
            nbAcquiredKnowledgeTagsByLevel: {
              '1': 1, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0
            }
          },
          expectedEstimatedLevel: 0,
          expectedPixScore: 4
        },
        {
          performanceStats: {
            nbAcquiredKnowledgeTagsByLevel: {
              '1': 2, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0
            }
          },
          expectedEstimatedLevel: 1,
          expectedPixScore: 8
        },
        {
          performanceStats: {
            nbAcquiredKnowledgeTagsByLevel: {
              '1': 0, '2': 1, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0
            }
          },
          expectedEstimatedLevel: 0,
          expectedPixScore: 8
        },
        {
          performanceStats: {
            nbAcquiredKnowledgeTagsByLevel: {
              '1': 2, '2': 1, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0
            }
          },
          expectedEstimatedLevel: 2,
          expectedPixScore: 16
        }
      ];

      describe('the field pixscore', () => {
        testCases.forEach((testCase, index) => {
          it(`on case #${index}, it should equal ${testCase.expectedPixScore}`, () => {
            // When
            const result = scoring.computeDiagnosis(testCase.performanceStats, knowledgeData);

            // Then
            expect(result.pixScore).to.equal(testCase.expectedPixScore);
          });
        });
      });

      describe('the field estimatedLevel ', () => {
        testCases.forEach((testCase, index) => {
          it(`on case #${index}, it should equal ${testCase.expectedEstimatedLevel}`, () => {
            // When
            const result = scoring.computeDiagnosis(testCase.performanceStats, knowledgeData);

            // Then
            expect(result.estimatedLevel).to.equal(testCase.expectedEstimatedLevel);
          });
        });

      });
    });
  });
});
