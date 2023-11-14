import { expect, domainBuilder, sinon } from '../../../../../test-helper.js';
import { Answer, AnswerStatus } from '../../../../../../lib/domain/models/index.js';
import { AssessmentSimulatorSingleMeasureStrategy } from '../../../../../../src/certification/flash-certification/domain/model/AssessmentSimulatorSingleMeasureStrategy.js';

describe('Unit | Domain | Models | AssessmentSimulatorSingleMeasureStrategy', function () {
  describe('#run', function () {
    context('when no challenge has been answered yet', function () {
      context('when there is no available answer', function () {
        it('should return null', function () {
          // given
          const challenge1 = domainBuilder.buildChallenge({ id: 'rec1' });
          const challenge2 = domainBuilder.buildChallenge({ id: 'rec2' });
          const allChallenges = [challenge1, challenge2];
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
              allAnswers: [],
              challenges: allChallenges,
              initialCapacity,
            })
            .returns([challenge2, challenge1]);

          pickChallenge.withArgs({ possibleChallenges: [challenge2, challenge1] }).returns(challenge2);
          pickAnswerStatus.withArgs({ nextChallenge: challenge2, answerIndex: 0 }).returns(undefined);

          // when
          const strategy = new AssessmentSimulatorSingleMeasureStrategy({
            algorithm,
            challenges: allChallenges,
            pickChallenge,
            pickAnswerStatus,
            initialCapacity,
          });
          const result = strategy.run({ challengesAnswers: [], stepIndex: 0 });

          // then
          expect(result).to.be.null;
        });
      });

      context('when there is an available answer', function () {
        it('should return the result and the challengesAnswers with one element', function () {
          // given
          const stepIndex = 0;
          const challenge1 = domainBuilder.buildChallenge({ id: 'rec1' });
          const challenge2 = domainBuilder.buildChallenge({ id: 'rec2' });
          const allChallenges = [challenge1, challenge2];
          const answerForSimulator = AnswerStatus.OK;
          const answer1 = { challengeId: challenge2.id, result: answerForSimulator };
          const initialCapacity = 0;
          const expectedEstimatedLevel = 0.4;
          const expectedErrorRate = 0.2;
          const expectedReward = 5;
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
            })
            .returns({
              estimatedLevel: initialCapacity,
            })
            .withArgs({
              allAnswers: [sinon.match(answer1)],
              challenges: allChallenges,
              initialCapacity,
            })
            .returns({ estimatedLevel: expectedEstimatedLevel, errorRate: expectedErrorRate });

          algorithm.getPossibleNextChallenges
            .withArgs({
              allAnswers: [],
              challenges: allChallenges,
              initialCapacity,
            })
            .returns([challenge2, challenge1]);

          pickChallenge.withArgs({ possibleChallenges: [challenge2, challenge1] }).returns(challenge2);
          pickAnswerStatus.withArgs({ nextChallenge: challenge2, answerIndex: 0 }).returns(answerForSimulator);

          algorithm.getReward
            .withArgs({
              estimatedLevel: initialCapacity,
              difficulty: challenge1.difficulty,
              discriminant: challenge1.discriminant,
            })
            .returns(expectedReward);

          // when
          const expectedResult = {
            results: [
              {
                challenge: challenge2,
                estimatedLevel: expectedEstimatedLevel,
                errorRate: expectedErrorRate,
                reward: expectedReward,
                answerStatus: answerForSimulator,
              },
            ],
            challengeAnswers: [
              new Answer({
                result: answerForSimulator,
                challengeId: challenge2.id,
              }),
            ],
            nextStepIndex: stepIndex + 1,
          };

          const strategy = new AssessmentSimulatorSingleMeasureStrategy({
            algorithm,
            challenges: allChallenges,
            pickChallenge,
            pickAnswerStatus,
            initialCapacity,
          });
          const result = strategy.run({ challengesAnswers: [], stepIndex });

          // then
          expect(result).to.deep.equal(expectedResult);
        });
      });
    });

    context('when a challenge has already been answered', function () {
      context('when there is no available answer', function () {
        it('should return null', function () {
          // given
          const challenge1 = domainBuilder.buildChallenge({ id: 'rec1' });
          const challenge2 = domainBuilder.buildChallenge({ id: 'rec2' });
          const allChallenges = [challenge1, challenge2];
          const capacityAfterFirstChallenge = 1.2;
          const algorithm = {
            getPossibleNextChallenges: sinon.stub(),
            getEstimatedLevelAndErrorRate: sinon.stub(),
            getReward: sinon.stub(),
          };
          const challengeAnswer = domainBuilder.buildAnswer({ challengeId: challenge1.id });
          const pickChallenge = sinon.stub();
          const pickAnswerStatus = sinon.stub();

          algorithm.getPossibleNextChallenges
            .withArgs({
              allAnswers: [challengeAnswer],
              challenges: allChallenges,
              initialCapacity: capacityAfterFirstChallenge,
            })
            .returns([challenge1, challenge2]);

          pickChallenge.withArgs({ possibleChallenges: [challenge1, challenge2] }).returns(challenge2);

          pickAnswerStatus.withArgs({ nextChallenge: challenge2, answerIndex: 1 }).returns(undefined);

          // when
          const strategy = new AssessmentSimulatorSingleMeasureStrategy({
            algorithm,
            challenges: allChallenges,
            pickChallenge,
            pickAnswerStatus,
            initialCapacity: capacityAfterFirstChallenge,
          });
          const result = strategy.run({ challengesAnswers: [domainBuilder.buildAnswer()], stepIndex: 1 });

          // then
          expect(result).to.be.null;
        });
      });

      context('when there is an available answer', function () {
        it('should return the result and the challengesAnswers with two elements', function () {
          // given
          const stepIndex = 1;
          const challenge1 = domainBuilder.buildChallenge({ id: 'rec1' });
          const challenge2 = domainBuilder.buildChallenge({ id: 'rec2' });
          const allChallenges = [challenge1, challenge2];
          const answerForSimulator = AnswerStatus.OK;
          const answer1 = { challengeId: challenge2.id, result: answerForSimulator };
          const capacityAfterFirstChallenge = 1.2;
          const expectedEstimatedLevel = 0.4;
          const expectedErrorRate = 0.2;
          const expectedReward = 5;
          const algorithm = {
            getPossibleNextChallenges: sinon.stub(),
            getEstimatedLevelAndErrorRate: sinon.stub(),
            getReward: sinon.stub(),
          };
          const challengeAnswer = domainBuilder.buildAnswer({ challengeId: challenge1.id });
          const pickChallenge = sinon.stub();
          const pickAnswerStatus = sinon.stub();

          algorithm.getEstimatedLevelAndErrorRate
            .withArgs({
              allAnswers: [challengeAnswer],
              challenges: allChallenges,
              initialCapacity: capacityAfterFirstChallenge,
            })
            .returns({
              estimatedLevel: capacityAfterFirstChallenge,
            })
            .withArgs({
              allAnswers: [challengeAnswer, sinon.match(answer1)],
              challenges: allChallenges,
              initialCapacity: capacityAfterFirstChallenge,
            })
            .returns({ estimatedLevel: expectedEstimatedLevel, errorRate: expectedErrorRate });

          algorithm.getPossibleNextChallenges
            .withArgs({
              allAnswers: [challengeAnswer],
              challenges: allChallenges,
              initialCapacity: capacityAfterFirstChallenge,
            })
            .returns([challenge1, challenge2]);

          pickChallenge.withArgs({ possibleChallenges: [challenge1, challenge2] }).returns(challenge2);

          pickAnswerStatus.withArgs({ nextChallenge: challenge2, answerIndex: 1 }).returns(answerForSimulator);

          algorithm.getReward
            .withArgs({
              estimatedLevel: capacityAfterFirstChallenge,
              difficulty: challenge1.difficulty,
              discriminant: challenge1.discriminant,
            })
            .returns(expectedReward);

          // when
          const expectedResult = {
            results: [
              {
                challenge: challenge2,
                estimatedLevel: expectedEstimatedLevel,
                errorRate: expectedErrorRate,
                reward: expectedReward,
                answerStatus: answerForSimulator,
              },
            ],
            challengeAnswers: [
              new Answer({
                result: answerForSimulator,
                challengeId: challenge2.id,
              }),
            ],
            nextStepIndex: stepIndex + 1,
          };

          const strategy = new AssessmentSimulatorSingleMeasureStrategy({
            algorithm,
            challenges: allChallenges,
            pickChallenge,
            pickAnswerStatus,
            initialCapacity: capacityAfterFirstChallenge,
          });
          const result = strategy.run({ challengesAnswers: [challengeAnswer], stepIndex });

          // then
          expect(result).to.deep.equal(expectedResult);
        });
      });
    });
  });
});
