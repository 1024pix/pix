import { Answer, AnswerStatus } from '../../../../../../lib/domain/models/index.js';
import { AssessmentSimulatorSingleMeasureStrategy } from '../../../../../../src/certification/flash-certification/domain/models/AssessmentSimulatorSingleMeasureStrategy.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

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
            getCapacityAndErrorRate: sinon.stub(),
            getReward: sinon.stub(),
          };
          const pickChallenge = {
            chooseNextChallenge: sinon.stub(),
          };
          const pickChallengeReturnedFunction = sinon.stub();
          const challengePickProbability = 0.51;
          const pickAnswerStatus = sinon.stub();

          algorithm.getPossibleNextChallenges
            .withArgs({
              assessmentAnswers: [],
              challenges: allChallenges,
              initialCapacity,
            })
            .returns([challenge2, challenge1]);

          pickChallenge.chooseNextChallenge.withArgs(challengePickProbability).returns(pickChallengeReturnedFunction);
          pickChallengeReturnedFunction.withArgs({ possibleChallenges: [challenge2, challenge1] }).returns(challenge2);
          pickAnswerStatus.withArgs({ nextChallenge: challenge2, answerIndex: 0 }).returns(undefined);

          // when
          const strategy = new AssessmentSimulatorSingleMeasureStrategy({
            algorithm,
            challenges: allChallenges,
            pickChallenge,
            challengePickProbability,
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
          const expectedCapacity = 0.4;
          const expectedErrorRate = 0.2;
          const expectedReward = 5;
          const algorithm = {
            getPossibleNextChallenges: sinon.stub(),
            getCapacityAndErrorRate: sinon.stub(),
            getReward: sinon.stub(),
          };
          const pickChallenge = {
            chooseNextChallenge: sinon.stub(),
          };
          const pickChallengeReturnedFunction = sinon.stub();
          const challengePickProbability = 0.51;
          const pickAnswerStatus = sinon.stub();

          algorithm.getCapacityAndErrorRate
            .withArgs({
              allAnswers: [],
              challenges: allChallenges,
              initialCapacity,
            })
            .returns({
              capacity: initialCapacity,
            })
            .withArgs({
              allAnswers: [sinon.match(answer1)],
              challenges: allChallenges,
              initialCapacity,
            })
            .returns({ capacity: expectedCapacity, errorRate: expectedErrorRate });

          algorithm.getPossibleNextChallenges
            .withArgs({
              assessmentAnswers: [],
              challenges: allChallenges,
              initialCapacity,
            })
            .returns([challenge2, challenge1]);

          pickChallenge.chooseNextChallenge.withArgs(challengePickProbability).returns(pickChallengeReturnedFunction);
          pickChallengeReturnedFunction.withArgs({ possibleChallenges: [challenge2, challenge1] }).returns(challenge2);
          pickAnswerStatus.withArgs({ nextChallenge: challenge2, answerIndex: 0 }).returns(answerForSimulator);

          algorithm.getReward
            .withArgs({
              capacity: initialCapacity,
              difficulty: challenge1.difficulty,
              discriminant: challenge1.discriminant,
            })
            .returns(expectedReward);

          // when
          const expectedResult = {
            results: [
              {
                challenge: challenge2,
                capacity: expectedCapacity,
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
            challengePickProbability,
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
            getCapacityAndErrorRate: sinon.stub(),
            getReward: sinon.stub(),
          };
          const challengeAnswer = domainBuilder.buildAnswer({ challengeId: challenge1.id });
          const pickChallenge = {
            chooseNextChallenge: sinon.stub(),
          };
          const pickChallengeReturnedFunction = sinon.stub();
          const challengePickProbability = 0.51;
          const pickAnswerStatus = sinon.stub();

          algorithm.getPossibleNextChallenges
            .withArgs({
              assessmentAnswers: [challengeAnswer],
              challenges: allChallenges,
              initialCapacity: capacityAfterFirstChallenge,
            })
            .returns([challenge1, challenge2]);

          pickChallenge.chooseNextChallenge.withArgs(challengePickProbability).returns(pickChallengeReturnedFunction);
          pickChallengeReturnedFunction.withArgs({ possibleChallenges: [challenge1, challenge2] }).returns(challenge2);

          pickAnswerStatus.withArgs({ nextChallenge: challenge2, answerIndex: 1 }).returns(undefined);

          // when
          const strategy = new AssessmentSimulatorSingleMeasureStrategy({
            algorithm,
            challenges: allChallenges,
            pickChallenge,
            challengePickProbability,
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
          const expectedCapacity = 0.4;
          const expectedErrorRate = 0.2;
          const expectedReward = 5;
          const algorithm = {
            getPossibleNextChallenges: sinon.stub(),
            getCapacityAndErrorRate: sinon.stub(),
            getReward: sinon.stub(),
          };
          const challengeAnswer = domainBuilder.buildAnswer({ challengeId: challenge1.id });
          const pickChallenge = {
            chooseNextChallenge: sinon.stub(),
          };
          const pickChallengeReturnedFunction = sinon.stub();
          const challengePickProbability = 0.51;
          const pickAnswerStatus = sinon.stub();

          algorithm.getCapacityAndErrorRate
            .withArgs({
              allAnswers: [challengeAnswer],
              challenges: allChallenges,
              initialCapacity: capacityAfterFirstChallenge,
            })
            .returns({
              capacity: capacityAfterFirstChallenge,
            })
            .withArgs({
              allAnswers: [challengeAnswer, sinon.match(answer1)],
              challenges: allChallenges,
              initialCapacity: capacityAfterFirstChallenge,
            })
            .returns({ capacity: expectedCapacity, errorRate: expectedErrorRate });

          algorithm.getPossibleNextChallenges
            .withArgs({
              assessmentAnswers: [challengeAnswer],
              challenges: allChallenges,
              initialCapacity: capacityAfterFirstChallenge,
            })
            .returns([challenge1, challenge2]);

          pickChallenge.chooseNextChallenge.withArgs(challengePickProbability).returns(pickChallengeReturnedFunction);
          pickChallengeReturnedFunction.withArgs({ possibleChallenges: [challenge1, challenge2] }).returns(challenge2);

          pickAnswerStatus.withArgs({ nextChallenge: challenge2, answerIndex: 1 }).returns(answerForSimulator);

          algorithm.getReward
            .withArgs({
              capacity: capacityAfterFirstChallenge,
              difficulty: challenge1.difficulty,
              discriminant: challenge1.discriminant,
            })
            .returns(expectedReward);

          // when
          const expectedResult = {
            results: [
              {
                challenge: challenge2,
                capacity: expectedCapacity,
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
            challengePickProbability,
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
