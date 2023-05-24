import { expect, domainBuilder, sinon } from '../../../test-helper.js';
import { AnswerStatus, AssessmentSimulator } from '../../../../lib/domain/models/index.js';
import { AssessmentEndedError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | Models | AssessmentSimulator', function () {
  describe('#run', function () {
    context('with answers as an array', function () {
      context('when no answers are provided', function () {
        it('returns an empty challenges array', function () {
          // given
          const answers = [];
          const algorithm = {
            getPossibleNextChallenges: sinon.stub(),
            getEstimatedLevelAndErrorRate: sinon.stub(),
          };

          algorithm.getEstimatedLevelAndErrorRate.returns({
            estimatedLevel: 0,
            errorRate: 0,
          });

          // when
          const result = new AssessmentSimulator({ answers, algorithm }).run();

          // then
          expect(result).to.be.empty;
        });
      });

      context('when 1 answer is provided', function () {
        it('returns a list of one challenge and a correct estimated level', function () {
          // given
          const answers = ['ok'];
          const expectedEstimatedLevel = 2;
          const expectedErrorRate = 3;
          const expectedReward = 4;
          const allChallenges = [domainBuilder.buildChallenge({ id: 'rec1' })];
          const algorithm = {
            getPossibleNextChallenges: ({ challenges }) => challenges,
            getEstimatedLevelAndErrorRate: () => ({
              estimatedLevel: expectedEstimatedLevel,
              errorRate: expectedErrorRate,
            }),
            getReward: () => expectedReward,
          };
          const pickChallenge = ({ possibleChallenges }) => possibleChallenges[0];

          const expectedResult = [
            {
              challenge: allChallenges[0],
              estimatedLevel: expectedEstimatedLevel,
              errorRate: expectedErrorRate,
              reward: expectedReward,
              answer: answers[0],
            },
          ];

          // when
          const result = new AssessmentSimulator({
            answers,
            algorithm,
            challenges: allChallenges,
            pickChallenge,
          }).run();

          // then
          expect(result).to.deep.equal(expectedResult);
        });
      });

      context('when 2 answers are provided', function () {
        it('return a list of 2 challenges', function () {
          // given
          const answersForSimulator = [AnswerStatus.OK, AnswerStatus.KO];
          const challenge1 = domainBuilder.buildChallenge({ id: 'rec1' });
          const challenge2 = domainBuilder.buildChallenge({ id: 'rec2' });
          const answer1 = { challengeId: challenge2.id, result: answersForSimulator[0] };
          const answer2 = { challengeId: challenge1.id, result: answersForSimulator[1] };
          const allChallenges = [challenge1, challenge2];
          const initialEstimatedLevel = 0;
          const expectedEstimatedLevels = [0.4, 0.1];
          const expectedErrorRates = [0.2, 0.5];
          const expectedRewards = [5, 6];
          const algorithm = {
            getPossibleNextChallenges: sinon.stub(),
            getEstimatedLevelAndErrorRate: sinon.stub(),
            getReward: sinon.stub(),
          };
          const pickChallenge = sinon.stub();

          algorithm.getEstimatedLevelAndErrorRate
            .withArgs({
              allAnswers: [],
            })
            .returns({
              estimatedLevel: initialEstimatedLevel,
            });

          algorithm.getEstimatedLevelAndErrorRate
            .withArgs({
              allAnswers: [sinon.match(answer1)],
              challenges: allChallenges,
            })
            .returns({ estimatedLevel: expectedEstimatedLevels[0], errorRate: expectedErrorRates[0] });

          algorithm.getEstimatedLevelAndErrorRate
            .withArgs({
              allAnswers: [sinon.match(answer1), sinon.match(answer2)],
              challenges: allChallenges,
            })
            .returns({
              estimatedLevel: expectedEstimatedLevels[1],
              errorRate: expectedErrorRates[1],
            });

          algorithm.getPossibleNextChallenges
            .withArgs({
              allAnswers: [],
              challenges: allChallenges,
            })
            .returns([challenge2, challenge1]);
          algorithm.getPossibleNextChallenges
            .withArgs({
              allAnswers: [sinon.match(answer1)],
              challenges: allChallenges,
            })
            .returns([challenge1]);

          pickChallenge.withArgs({ possibleChallenges: [challenge2, challenge1] }).returns(challenge2);
          pickChallenge.withArgs({ possibleChallenges: [challenge1] }).returns(challenge1);

          algorithm.getReward
            .withArgs({
              estimatedLevel: initialEstimatedLevel,
              difficulty: challenge1.difficulty,
              discriminant: challenge1.discriminant,
            })
            .returns(expectedRewards[0]);

          algorithm.getReward
            .withArgs({
              estimatedLevel: expectedEstimatedLevels[0],
              difficulty: challenge2.difficulty,
              discriminant: challenge2.discriminant,
            })
            .returns(expectedRewards[1]);

          // when
          const expectedResult = [
            {
              challenge: challenge2,
              estimatedLevel: expectedEstimatedLevels[0],
              errorRate: expectedErrorRates[0],
              reward: expectedRewards[0],
              answer: answersForSimulator[0],
            },
            {
              challenge: challenge1,
              estimatedLevel: expectedEstimatedLevels[1],
              errorRate: expectedErrorRates[1],
              reward: expectedRewards[1],
              answer: answersForSimulator[1],
            },
          ];

          const result = new AssessmentSimulator({
            answers: answersForSimulator,
            algorithm,
            challenges: allChallenges,
            pickChallenge,
          }).run();

          // then
          expect(result).to.deep.equal(expectedResult);
        });
      });

      context('when 1 answer is provided and 2 challenges are available', function () {
        it('return a list of 1 challenge', function () {
          // given
          const answersForSimulator = [AnswerStatus.OK];
          const challenge1 = domainBuilder.buildChallenge({ id: 'rec1' });
          const challenge2 = domainBuilder.buildChallenge({ id: 'rec2' });
          const answer1 = { challengeId: challenge2.id, result: answersForSimulator[0] };
          const allChallenges = [challenge1, challenge2];
          const initialEstimatedLevel = 0;
          const expectedEstimatedLevels = [0.4, 0.1];
          const expectedErrorRates = [0.2, 0.5];
          const expectedRewards = [5, 6];
          const algorithm = {
            getPossibleNextChallenges: sinon.stub(),
            getEstimatedLevelAndErrorRate: sinon.stub(),
            getReward: sinon.stub(),
          };
          const pickChallenge = sinon.stub();

          algorithm.getEstimatedLevelAndErrorRate
            .withArgs({
              allAnswers: [],
            })
            .returns({
              estimatedLevel: initialEstimatedLevel,
            });

          algorithm.getEstimatedLevelAndErrorRate
            .withArgs({
              allAnswers: [sinon.match(answer1)],
              challenges: allChallenges,
            })
            .returns({ estimatedLevel: expectedEstimatedLevels[0], errorRate: expectedErrorRates[0] });

          algorithm.getPossibleNextChallenges
            .withArgs({
              allAnswers: [],
              challenges: allChallenges,
            })
            .returns([challenge2, challenge1]);
          algorithm.getPossibleNextChallenges
            .withArgs({
              allAnswers: [sinon.match(answer1)],
              challenges: allChallenges,
            })
            .returns([challenge1]);

          pickChallenge.withArgs({ possibleChallenges: [challenge2, challenge1] }).returns(challenge2);
          pickChallenge.withArgs({ possibleChallenges: [challenge1] }).returns(challenge1);

          algorithm.getReward
            .withArgs({
              estimatedLevel: initialEstimatedLevel,
              difficulty: challenge1.difficulty,
              discriminant: challenge1.discriminant,
            })
            .returns(expectedRewards[0]);

          // when
          const expectedResult = [
            {
              challenge: challenge2,
              estimatedLevel: expectedEstimatedLevels[0],
              errorRate: expectedErrorRates[0],
              reward: expectedRewards[0],
              answer: answersForSimulator[0],
            },
          ];

          const result = new AssessmentSimulator({
            answers: answersForSimulator,
            algorithm,
            challenges: allChallenges,
            pickChallenge,
          }).run();

          // then
          expect(result).to.deep.equal(expectedResult);
        });
      });

      context('when 2 answers are provided and 1 challenge is available ', function () {
        it('return a list of 1 challenges', function () {
          // given
          const answersForSimulator = [AnswerStatus.OK, AnswerStatus.KO];
          const challenge1 = domainBuilder.buildChallenge({ id: 'rec1' });
          const answer1 = { challengeId: challenge1.id, result: answersForSimulator[0] };
          const allChallenges = [challenge1];
          const initialEstimatedLevel = 0;
          const expectedEstimatedLevels = [0.4];
          const expectedErrorRates = [0.2];
          const expectedRewards = [5];
          const algorithm = {
            getPossibleNextChallenges: sinon.stub(),
            getEstimatedLevelAndErrorRate: sinon.stub(),
            getReward: sinon.stub(),
          };
          const pickChallenge = sinon.stub();

          algorithm.getEstimatedLevelAndErrorRate
            .withArgs({
              allAnswers: [],
            })
            .returns({
              estimatedLevel: initialEstimatedLevel,
            });

          algorithm.getEstimatedLevelAndErrorRate
            .withArgs({
              allAnswers: [sinon.match(answer1)],
              challenges: allChallenges,
            })
            .returns({ estimatedLevel: expectedEstimatedLevels[0], errorRate: expectedErrorRates[0] });

          algorithm.getPossibleNextChallenges
            .withArgs({
              allAnswers: [],
              challenges: allChallenges,
            })
            .returns([challenge1]);

          algorithm.getPossibleNextChallenges
            .withArgs({
              allAnswers: [sinon.match(answer1)],
              challenges: allChallenges,
            })
            .throws(new AssessmentEndedError());

          pickChallenge.withArgs({ possibleChallenges: [challenge1] }).returns(challenge1);

          algorithm.getReward
            .withArgs({
              estimatedLevel: initialEstimatedLevel,
              difficulty: challenge1.difficulty,
              discriminant: challenge1.discriminant,
            })
            .returns(expectedRewards[0]);

          // when
          const expectedResult = [
            {
              challenge: challenge1,
              estimatedLevel: expectedEstimatedLevels[0],
              errorRate: expectedErrorRates[0],
              reward: expectedRewards[0],
              answer: answersForSimulator[0],
            },
          ];

          const result = new AssessmentSimulator({
            answers: answersForSimulator,
            algorithm,
            challenges: allChallenges,
            pickChallenge,
          }).run();

          // then
          expect(result).to.deep.equal(expectedResult);
        });
      });
    });

    context('with the "pickAnswer" function provided', function () {
      it('should return the list of all the challenges', function () {
        // given
        const answersForSimulator = [AnswerStatus.OK, AnswerStatus.KO];
        const challenge1 = domainBuilder.buildChallenge({ id: 'rec1' });
        const challenge2 = domainBuilder.buildChallenge({ id: 'rec2' });
        const answer1 = { challengeId: challenge2.id, result: answersForSimulator[0] };
        const answer2 = { challengeId: challenge1.id, result: answersForSimulator[1] };
        const allChallenges = [challenge1, challenge2];
        const initialEstimatedLevel = 0;
        const expectedEstimatedLevels = [0.4, 0.1];
        const expectedErrorRates = [0.2, 0.5];
        const expectedRewards = [5, 6];
        const algorithm = {
          getPossibleNextChallenges: sinon.stub(),
          getEstimatedLevelAndErrorRate: sinon.stub(),
          getReward: sinon.stub(),
        };
        const pickChallenge = sinon.stub();
        const pickAnswer = sinon.stub();

        algorithm.getEstimatedLevelAndErrorRate
          .withArgs({
            allAnswers: [],
          })
          .returns({
            estimatedLevel: initialEstimatedLevel,
          });

        algorithm.getEstimatedLevelAndErrorRate
          .withArgs({
            allAnswers: [sinon.match(answer1)],
            challenges: allChallenges,
          })
          .returns({ estimatedLevel: expectedEstimatedLevels[0], errorRate: expectedErrorRates[0] });

        algorithm.getEstimatedLevelAndErrorRate
          .withArgs({
            allAnswers: [sinon.match(answer1), sinon.match(answer2)],
            challenges: allChallenges,
          })
          .returns({
            estimatedLevel: expectedEstimatedLevels[1],
            errorRate: expectedErrorRates[1],
          });

        algorithm.getPossibleNextChallenges
          .withArgs({
            allAnswers: [],
            challenges: allChallenges,
          })
          .returns([challenge2, challenge1]);
        algorithm.getPossibleNextChallenges
          .withArgs({
            allAnswers: [sinon.match(answer1)],
            challenges: allChallenges,
          })
          .returns([challenge1]);

        pickChallenge.withArgs({ possibleChallenges: [challenge2, challenge1] }).returns(challenge2);
        pickChallenge.withArgs({ possibleChallenges: [challenge1] }).returns(challenge1);

        pickAnswer
          .withArgs(challenge2)
          .returns(answersForSimulator[0])
          .withArgs(challenge1)
          .returns(answersForSimulator[1]);

        algorithm.getReward
          .withArgs({
            estimatedLevel: initialEstimatedLevel,
            difficulty: challenge1.difficulty,
            discriminant: challenge1.discriminant,
          })
          .returns(expectedRewards[0]);

        algorithm.getReward
          .withArgs({
            estimatedLevel: expectedEstimatedLevels[0],
            difficulty: challenge2.difficulty,
            discriminant: challenge2.discriminant,
          })
          .returns(expectedRewards[1]);

        // when
        const expectedResult = [
          {
            challenge: challenge2,
            estimatedLevel: expectedEstimatedLevels[0],
            errorRate: expectedErrorRates[0],
            reward: expectedRewards[0],
            answer: answersForSimulator[0],
          },
          {
            challenge: challenge1,
            estimatedLevel: expectedEstimatedLevels[1],
            errorRate: expectedErrorRates[1],
            reward: expectedRewards[1],
            answer: answersForSimulator[1],
          },
        ];

        const result = new AssessmentSimulator({
          algorithm,
          challenges: allChallenges,
          pickChallenge,
          pickAnswer,
        }).run();

        // then
        expect(result).to.deep.equal(expectedResult);
      });
    });
  });
});
