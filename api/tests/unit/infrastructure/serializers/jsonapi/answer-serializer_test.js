const { expect, domainBuilder } = require('../../../../test-helper');
const AnswerStatus = require('../../../../../lib/domain/models/AnswerStatus');
const answerStatusJSONAPIAdapter = require('../../../../../lib/infrastructure/adapters/answer-status-json-api-adapter');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/answer-serializer');

describe('Unit | Serializer | JSONAPI | answer-serializer', () => {

  const jsonAnswer = {
    data: {
      type: 'answers',
      id: 'answer_id',
      attributes: {
        value: 'answer_value',
        'result-details': 'resultDetails_value',
        timeout: 8,
        'elapsed-time': 30,
        result: 'result_value',
      },
      relationships: {
        assessment: {
          data: {
            type: 'assessments',
            id: 'assessment_id',
          },
        },
        challenge: {
          data: {
            type: 'challenges',
            id: 'challenge_id',
          },
        }
      },
    },
  };

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

  describe('#deserializeToBookshelfAnswer()', () => {

    it('should convert JSON API data into an Answer model object', () => {
      // when
      const answer = serializer.deserializeToBookshelfAnswer(jsonAnswer);

      // then
      expect(answer.id).to.equal(jsonAnswer.data.id);
      expect(answer.get('assessmentId')).to.equal(jsonAnswer.data.relationships.assessment.data.id);
      expect(answer.get('challengeId')).to.equal(jsonAnswer.data.relationships.challenge.data.id);
      expect(answer.get('value')).to.equal(jsonAnswer.data.attributes.value);
      expect(answer.get('result')).to.equal(jsonAnswer.data.attributes.result);
      expect(answer.get('resultDetails')).to.equal(jsonAnswer.data.attributes['result-details']);
      expect(answer.get('timeout')).to.equal(jsonAnswer.data.attributes.timeout);
      expect(answer.get('elapsedTime')).to.equal(jsonAnswer.data.attributes['elapsed-time']);
    });
  });
});
