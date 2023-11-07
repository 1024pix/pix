import { expect, domainBuilder, sinon } from '../../../../../test-helper.js';
import { AnswerStatus, AssessmentSimulator } from '../../../../../../lib/domain/models/index.js';

describe('Unit | Domain | Models | AssessmentSimulator', function () {
  describe('#run', function () {
    it('should return the list of all the challenges', function () {
      // given
      const challenge = domainBuilder.buildChallenge({ id: 'rec2' });
      const answerForSimulator = AnswerStatus.OK;
      const expectedEstimatedLevel = 0.4;
      const expectedErrorRate = 0.2;
      const expectedReward = 5;
      const strategy = {
        run: sinon.stub(),
      };

      strategy.run
        .withArgs({
          challengesAnswers: [],
          stepIndex: 0,
        })
        .returns({
          result: {
            challenge: challenge,
            estimatedLevel: expectedEstimatedLevel,
            errorRate: expectedErrorRate,
            reward: expectedReward,
            answerStatus: answerForSimulator,
          },
          challengesAnswers: [
            domainBuilder.buildAnswer({
              result: answerForSimulator,
              challengeId: challenge.id,
            }),
          ],
        });

      // when
      const expectedResult = [
        {
          challenge,
          estimatedLevel: expectedEstimatedLevel,
          errorRate: expectedErrorRate,
          reward: expectedReward,
          answerStatus: answerForSimulator,
        },
      ];

      const result = new AssessmentSimulator({
        strategy,
      }).run();

      // then
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
