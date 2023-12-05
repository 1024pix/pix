import { domainBuilder, expect } from '../../../../test-helper.js';
import { AnswerStatus } from '../../../../../src/shared/domain/models/AnswerStatus.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/activity-answer-serializer.js';
import { ActivityAnswer } from '../../../../../src/school/domain/models/ActivityAnswer.js';

describe('Unit | Serializer | JSONAPI | activity-answer-serializer', function () {
  describe('#serialize', function () {
    it('should convert an Answer model object into JSON API data', function () {
      const answerId = 1232345;
      const activityId = 6789;
      const challengeId = 2134356;
      const result = AnswerStatus.SKIPPED;
      const resultDetails = null;
      const answerValue = '1';

      // given
      const answer = domainBuilder.buildActivityAnswer({
        id: answerId,
        challengeId,
        activityId,
        value: answerValue,
        result,
        resultDetails,
      });
      const expectedJSON = {
        data: {
          type: 'activity-answers',
          id: answerId.toString(),
          attributes: {
            value: answerValue,
            'result-details': resultDetails,
            result: 'aband',
          },
          relationships: {
            challenge: {
              data: {
                type: 'challenges',
                id: `${challengeId}`,
              },
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
    it('should convert JSON API data into an Answer model object without result', function () {
      const expectedAssessmentId = 'assessmentId';
      const challengeId = 'recChallengeId';

      // when
      const { activityAnswer, assessmentId } = serializer.deserialize({
        data: {
          type: 'activity-answers',
          attributes: {
            value: 'test\u0000\u0000',
            result: null,
            'result-details': null,
          },
          relationships: {
            challenge: {
              data: {
                type: 'challenges',
                id: challengeId,
              },
            },
          },
        },
        meta: {
          assessmentId: `${expectedAssessmentId}`,
        },
      });

      // then
      expect(activityAnswer).to.be.an.instanceOf(ActivityAnswer);
      expect(activityAnswer.value).to.equal('test');
      expect(activityAnswer.result).to.deep.equal(AnswerStatus.from(null));
      expect(activityAnswer.resultDetails).to.equal(null);
      expect(activityAnswer.challengeId).to.equal(challengeId);
      expect(assessmentId).to.equal(expectedAssessmentId);
    });
  });
});
