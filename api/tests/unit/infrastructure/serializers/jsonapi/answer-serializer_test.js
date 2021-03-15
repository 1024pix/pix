const { expect, domainBuilder } = require('../../../../test-helper');
const Answer = require('../../../../../lib/domain/models/Answer');
const AnswerStatus = require('../../../../../lib/domain/models/AnswerStatus');
const answerStatusJSONAPIAdapter = require('../../../../../lib/infrastructure/adapters/answer-status-json-api-adapter');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/answer-serializer');

describe('Unit | Serializer | JSONAPI | answer-serializer', () => {

  describe('#serialize', () => {

    const answerId = 1232345;
    const assessmentId = 12345;
    const challengeId = 2134356;
    const timeout = 8;
    const result = AnswerStatus.SKIPPED;
    const resultDetails = null;
    const answerValue = '1';

    it('should convert an Answer model object into JSON API data', () => {
      // given
      const answer = domainBuilder.buildAnswer({
        id: answerId,
        result,
        resultDetails,
        timeout,
        value: answerValue,
        assessmentId,
        challengeId,
      });
      const expectedJSON = {
        data: {
          type: 'answers',
          id: answerId.toString(),
          attributes: {
            value: answerValue,
            'result-details': resultDetails,
            timeout: timeout,
            result: answerStatusJSONAPIAdapter.adapt(result),
          },
          relationships: {
            assessment: {
              data: {
                type: 'assessments',
                id: `${assessmentId}`,
              },
            },
            challenge: {
              data: {
                type: 'challenges',
                id: `${challengeId}`,
              },
            },
            correction: {
              links: {
                related: `/api/answers/${answerId}/correction`,
              },
            },
            levelup: {
              data: null,
            },
          },
        },
      };

      // when
      const json = serializer.serialize(answer);

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });

  describe('#deserialize()', () => {

    let jsonAnswer;
    const assessmentId = 'assessmentId', challengeId = 'recChallengeId';

    beforeEach(() => {
      jsonAnswer = {
        data: {
          type: 'answers',
          attributes: {
            value: 'test\u0000',
            result: null,
            'result-details': null,
            timeout: null,
          },
          relationships: {
            assessment: {
              data: {
                type: 'assessments',
                id: assessmentId,
              },
            },
            challenge: {
              data: {
                type: 'challenges',
                id: challengeId,
              },
            },
          },
        },
      };
    });
    it('should convert JSON API data into an Answer model object', () => {
      // when
      const answer = serializer.deserialize(jsonAnswer);

      // then
      expect(answer).to.be.an.instanceOf(Answer);
      expect(answer.value).to.equal('test');
      expect(answer.result).to.deep.equal(AnswerStatus.from(null));
      expect(answer.resultDetails).to.equal(null);
      expect(answer.timeout).to.equal(null);
      expect(answer.assessmentId).to.equal(assessmentId);
      expect(answer.challengeId).to.equal(challengeId);
    });
  });

});
