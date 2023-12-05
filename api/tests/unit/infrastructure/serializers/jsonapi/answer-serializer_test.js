import { expect, domainBuilder } from '../../../../test-helper.js';
import { Answer } from '../../../../../src/evaluation/domain/models/Answer.js';
import { AnswerStatus } from '../../../../../src/shared/domain/models/AnswerStatus.js';
import { AnswerStatusJsonApiAdapter as answerStatusJSONAPIAdapter } from '../../../../../lib/infrastructure/adapters/answer-status-json-api-adapter.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/answer-serializer.js';

describe('Unit | Serializer | JSONAPI | answer-serializer', function () {
  describe('#serialize', function () {
    const answerId = 1232345;
    const assessmentId = 12345;
    const challengeId = 2134356;
    const timeout = 8;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const result = AnswerStatus.SKIPPED;
    const resultDetails = null;
    const answerValue = '1';

    it('should convert an Answer model object into JSON API data', function () {
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

  describe('#deserialize()', function () {
    let jsonAnswer;
    const assessmentId = 'assessmentId',
      challengeId = 'recChallengeId';

    beforeEach(function () {
      jsonAnswer = {
        data: {
          type: 'answers',
          attributes: {
            value: 'test\u0000\u0000',
            result: null,
            'result-details': null,
            timeout: null,
            'focused-out': true,
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
    it('should convert JSON API data into an Answer model object', function () {
      // when
      const answer = serializer.deserialize(jsonAnswer);

      // then
      expect(answer).to.be.an.instanceOf(Answer);
      expect(answer.value).to.equal('test');
      expect(answer.result).to.deep.equal(AnswerStatus.from(null));
      expect(answer.resultDetails).to.equal(null);
      expect(answer.timeout).to.equal(null);
      expect(answer.isFocusedOut).to.equal(true);
      expect(answer.assessmentId).to.equal(assessmentId);
      expect(answer.challengeId).to.equal(challengeId);
    });
  });
});
