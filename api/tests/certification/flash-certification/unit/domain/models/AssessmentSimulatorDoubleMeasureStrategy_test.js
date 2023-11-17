import { expect, domainBuilder, sinon } from '../../../../../test-helper.js';
import { AssessmentSimulatorDoubleMeasureStrategy } from '../../../../../../src/certification/flash-certification/domain/model/AssessmentSimulatorDoubleMeasureStrategy.js';
import { Answer, AnswerStatus } from '../../../../../../lib/domain/models/index.js';

describe('Unit | Domain | Models | AssessmentSimulatorDoubleMeasureStrategy', function () {
  describe('#run', function () {
    context('when there is no available answer', function () {
      it('should return null', function () {
        // given
        const challenge1 = domainBuilder.buildChallenge({ id: 'rec1' });
        const challenge2 = domainBuilder.buildChallenge({ id: 'rec2' });
        const allChallenges = [challenge1, challenge2];
        const initialCapacity = 0;
        const doubleMeasuresUntil = 2;
        const algorithm = {
          getPossibleNextChallenges: sinon.stub(),
          getEstimatedLevelAndErrorRate: sinon.stub(),
          getReward: sinon.stub(),
        };
        const pickChallenge = sinon.stub();
        const pickAnswerStatus = sinon.stub();

        algorithm.getEstimatedLevelAndErrorRate
          .withArgs({
            allAnswers: [],
            challenges: allChallenges,
            initialCapacity,
            doubleMeasuresUntil,
          })
          .returns({
            estimatedLevel: initialCapacity,
          });

        algorithm.getPossibleNextChallenges
          .withArgs({
            assessmentAnswers: [],
            challenges: allChallenges,
            initialCapacity,
            answersForComputingEstimatedLevel: [],
          })
          .returns([challenge2, challenge1]);

        pickChallenge.withArgs({ possibleChallenges: [challenge2, challenge1] }).returns(challenge2);
        pickAnswerStatus.withArgs({ nextChallenge: challenge2, answerIndex: 0 }).returns(undefined);

        // when
        const strategy = new AssessmentSimulatorDoubleMeasureStrategy({
          algorithm,
          challenges: allChallenges,
          pickChallenge,
          pickAnswerStatus,
          initialCapacity,
          doubleMeasuresUntil,
        });
        const result = strategy.run({ challengesAnswers: [], stepIndex: 0 });

        // then
        expect(result).to.be.null;
      });
    });

    context('when there are two available answers', function () {
      it('should return the result for both challenges', function () {
        // given
        const stepIndex = 0;
        const challenge1 = domainBuilder.buildChallenge({ id: 'rec1', difficulty: 1, discriminant: 0.5 });
        const challenge2 = domainBuilder.buildChallenge({ id: 'rec2', difficulty: 2, discriminant: 1.5 });
        const challenge1Reward = 2;
        const challenge2Reward = 3;
        const allChallenges = [challenge1, challenge2];
        const answerStatusForSimulator1 = AnswerStatus.OK;
        const answerStatusForSimulator2 = AnswerStatus.OK;
        const newAnswer1 = new Answer({ challengeId: challenge1.id, result: answerStatusForSimulator1 });
        const newAnswer2 = new Answer({ challengeId: challenge2.id, result: answerStatusForSimulator2 });
        const estimatedLevelBeforeAnswering = -0.5;
        const expectedEstimatedLevel = 0.4;
        const initialCapacity = 0;
        const algorithm = {
          getPossibleNextChallenges: sinon.stub(),
          getEstimatedLevelAndErrorRate: sinon.stub(),
          getReward: sinon.stub(),
        };
        const pickChallenge = sinon.stub();
        const pickAnswerStatus = sinon.stub();

        algorithm.getPossibleNextChallenges
          .withArgs({
            assessmentAnswers: [],
            challenges: allChallenges,
            initialCapacity,
            answersForComputingEstimatedLevel: [],
          })
          .returns([challenge2, challenge1])
          .withArgs({
            assessmentAnswers: [newAnswer2],
            challenges: allChallenges,
            initialCapacity,
            answersForComputingEstimatedLevel: [],
          })
          .returns([challenge1]);

        algorithm.getEstimatedLevelAndErrorRate
          .withArgs({
            allAnswers: [],
            challenges: allChallenges,
            initialCapacity,
            doubleMeasuresUntil: 2,
          })
          .returns({
            estimatedLevel: estimatedLevelBeforeAnswering,
          })
          .withArgs({
            allAnswers: [sinon.match(newAnswer2), sinon.match(newAnswer1)],
            challenges: allChallenges,
            initialCapacity,
            doubleMeasuresUntil: 2,
          })
          .returns({
            estimatedLevel: expectedEstimatedLevel,
          });

        algorithm.getReward
          .withArgs({
            estimatedLevel: estimatedLevelBeforeAnswering,
            difficulty: challenge1.difficulty,
            discriminant: challenge1.discriminant,
          })
          .returns(challenge1Reward)
          .withArgs({
            estimatedLevel: estimatedLevelBeforeAnswering,
            difficulty: challenge2.difficulty,
            discriminant: challenge2.discriminant,
          })
          .returns(challenge2Reward);

        pickChallenge
          .withArgs({ possibleChallenges: [challenge2, challenge1] })
          .returns(challenge2)
          .withArgs({ possibleChallenges: [challenge1] })
          .returns(challenge1);

        pickAnswerStatus
          .withArgs({ nextChallenge: challenge2, answerIndex: 0 })
          .returns(answerStatusForSimulator1)
          .withArgs({ nextChallenge: challenge1, answerIndex: 1 })
          .returns(answerStatusForSimulator2);

        // when
        const expectedResult = {
          results: [
            {
              challenge: challenge2,
              estimatedLevel: expectedEstimatedLevel,
              answerStatus: answerStatusForSimulator2.status,
              reward: challenge2Reward,
            },
            {
              challenge: challenge1,
              estimatedLevel: expectedEstimatedLevel,
              answerStatus: answerStatusForSimulator1.status,
              reward: challenge1Reward,
            },
          ],
          challengeAnswers: [
            new Answer({
              result: answerStatusForSimulator1,
              challengeId: challenge2.id,
            }),
            new Answer({
              result: answerStatusForSimulator2,
              challengeId: challenge1.id,
            }),
          ],
          nextStepIndex: stepIndex + 2,
        };

        const strategy = new AssessmentSimulatorDoubleMeasureStrategy({
          algorithm,
          challenges: allChallenges,
          pickChallenge,
          pickAnswerStatus,
          initialCapacity,
          doubleMeasuresUntil: 2,
        });

        const result = strategy.run({ challengesAnswers: [], stepIndex });

        // then
        expect(result).to.deep.equal(expectedResult);
      });
    });
  });
});
