import { expect, domainBuilder, sinon } from '../../../../../test-helper.js';
import { Answer, AnswerStatus, AssessmentSimulator } from '../../../../../../lib/domain/models/index.js';

describe('Unit | Domain | Models | AssessmentSimulator', function () {
  describe('#run', function () {
    it('should return the list of all the challenges', function () {
      // given
      const firstChallenge = domainBuilder.buildChallenge({ id: 'rec1' });
      const secondChallenge = domainBuilder.buildChallenge({ id: 'rec2' });
      const answersForSimulator = [AnswerStatus.OK, AnswerStatus.KO];
      const expectedEstimatedLevels = [0.4, 0.2];
      const expectedErrorRates = [0.2, 0.1];
      const expectedRewards = [5, 3];
      const strategy = {
        run: sinon.stub(),
      };

      const firstRunAnswer = new Answer({
        result: answersForSimulator[0],
        challengeId: firstChallenge.id,
      });
      const secondRunAnswer = new Answer({
        result: answersForSimulator[1],
        challengeId: secondChallenge.id,
      });

      strategy.run
        .withArgs({
          challengesAnswers: [],
          stepIndex: 0,
        })
        .returns({
          results: [
            {
              challenge: firstChallenge,
              estimatedLevel: expectedEstimatedLevels[0],
              errorRate: expectedErrorRates[0],
              reward: expectedRewards[0],
              answerStatus: answersForSimulator[0],
            },
          ],
          challengeAnswers: [firstRunAnswer],
        })
        .withArgs({
          challengesAnswers: [firstRunAnswer],
          stepIndex: 1,
        })
        .returns({
          results: [
            {
              challenge: secondChallenge,
              estimatedLevel: expectedEstimatedLevels[1],
              errorRate: expectedErrorRates[1],
              reward: expectedRewards[1],
              answerStatus: answersForSimulator[1],
            },
          ],
          challengeAnswers: [secondRunAnswer],
        });

      // when
      const expectedResult = [
        {
          challenge: firstChallenge,
          estimatedLevel: expectedEstimatedLevels[0],
          errorRate: expectedErrorRates[0],
          reward: expectedRewards[0],
          answerStatus: answersForSimulator[0],
        },
        {
          challenge: secondChallenge,
          estimatedLevel: expectedEstimatedLevels[1],
          errorRate: expectedErrorRates[1],
          reward: expectedRewards[1],
          answerStatus: answersForSimulator[1],
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
