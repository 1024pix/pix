const { expect, domainBuilder } = require('../../../../test-helper');
const AnswerStatus = require('../../../../../lib/domain/models/AnswerStatus');
const answerStatusJSONAPIAdapter = require('../../../../../lib/infrastructure/adapters/answer-status-json-api-adapter');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/answer-serializer');

describe('Unit | Serializer | JSONAPI | answer-serializer', () => {

  describe('#serialize', () => {

    const answerId = 1232345;
    const assessmentId = 12345;
    const challengeId = 2134356;
    const elapsedTime = 30;
    const timeout = 8;
    const result = AnswerStatus.SKIPPED;
    const resultDetails = null;
    const answerValue = '1';

    it('should convert an Answer model object into JSON API data', () => {
      // given
      const answer = domainBuilder.buildAnswer({
        id: answerId,
        elapsedTime,
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
            'elapsed-time': elapsedTime,
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
              }
            },
            levelup: {
              data: null
            }
          },
        },
      };

      // when
      const json = serializer.serialize(answer);

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
