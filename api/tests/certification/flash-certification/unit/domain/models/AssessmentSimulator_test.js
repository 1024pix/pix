import { expect, domainBuilder, sinon } from '../../../../../test-helper.js';
import { AnswerStatus, AssessmentSimulator } from '../../../../../../lib/domain/models/index.js';

describe('Unit | Domain | Models | AssessmentSimulator', function () {
  describe('#run', function () {
    context('with the "pickAnswerStatus" function provided', function () {
      context('when there are always answers available', function () {
        it('should return the list of all the challenges', function () {
          // given
          const answersForSimulator = [AnswerStatus.OK, AnswerStatus.KO];
          const challenge1 = domainBuilder.buildChallenge({ id: 'rec1' });
          const challenge2 = domainBuilder.buildChallenge({ id: 'rec2' });
          const answer1 = { challengeId: challenge2.id, result: answersForSimulator[0] };
          const answer2 = { challengeId: challenge1.id, result: answersForSimulator[1] };
          const allChallenges = [challenge1, challenge2];
          const initialCapacity = 0;
          const expectedEstimatedLevels = [0.4, 0.1];
          const expectedErrorRates = [0.2, 0.5];
          const expectedRewards = [5, 6];
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
            .returns({ estimatedLevel: expectedEstimatedLevels[0], errorRate: expectedErrorRates[0] })
            .withArgs({
              allAnswers: [sinon.match(answer1), sinon.match(answer2)],
              challenges: allChallenges,
              initialCapacity,
            })
            .returns({
              estimatedLevel: expectedEstimatedLevels[1],
              errorRate: expectedErrorRates[1],
            });

          algorithm.getPossibleNextChallenges
            .withArgs({
              allAnswers: [],
              challenges: allChallenges,
              initialCapacity,
            })
            .returns([challenge2, challenge1])
            .withArgs({
              allAnswers: [sinon.match(answer1)],
              challenges: allChallenges,
              initialCapacity,
            })
            .returns([challenge1]);

          pickChallenge
            .withArgs({ possibleChallenges: [challenge2, challenge1] })
            .returns(challenge2)
            .withArgs({ possibleChallenges: [challenge1] })
            .returns(challenge1);

          pickAnswerStatus
            .withArgs({ nextChallenge: challenge2, answerIndex: 0 })
            .returns(answersForSimulator[0])
            .withArgs({ nextChallenge: challenge1, answerIndex: 1 })
            .returns(answersForSimulator[1]);

          algorithm.getReward
            .withArgs({
              estimatedLevel: initialCapacity,
              difficulty: challenge1.difficulty,
              discriminant: challenge1.discriminant,
            })
            .returns(expectedRewards[0])
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
              answerStatus: answersForSimulator[0],
            },
            {
              challenge: challenge1,
              estimatedLevel: expectedEstimatedLevels[1],
              errorRate: expectedErrorRates[1],
              reward: expectedRewards[1],
              answerStatus: answersForSimulator[1],
            },
          ];

          const result = new AssessmentSimulator({
            algorithm,
            challenges: allChallenges,
            pickChallenge,
            pickAnswerStatus,
            initialCapacity,
          }).run();

          // then
          expect(result).to.deep.equal(expectedResult);
        });
      });

      context('when there not enough answers available', function () {
        it('should return the list of all the taken challenges', function () {
          // given
          const answersForSimulator = [AnswerStatus.OK, AnswerStatus.KO];
          const challenge1 = domainBuilder.buildChallenge({ id: 'rec1' });
          const challenge2 = domainBuilder.buildChallenge({ id: 'rec2' });
          const answer = { challengeId: challenge2.id, result: answersForSimulator[0] };
          const allChallenges = [challenge1, challenge2];
          const initialCapacity = 0;
          const expectedEstimatedLevels = [0.4, 0.1];
          const expectedErrorRates = [0.2, 0.5];
          const expectedRewards = [5, 6];
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
              allAnswers: [sinon.match(answer)],
              challenges: allChallenges,
              initialCapacity,
            })
            .returns({ estimatedLevel: expectedEstimatedLevels[0], errorRate: expectedErrorRates[0] });

          algorithm.getPossibleNextChallenges
            .withArgs({
              allAnswers: [],
              challenges: allChallenges,
              initialCapacity,
            })
            .returns([challenge2, challenge1])
            .withArgs({
              allAnswers: [sinon.match(answer)],
              challenges: allChallenges,
              initialCapacity,
            })
            .returns([challenge1]);

          pickChallenge
            .withArgs({ possibleChallenges: [challenge2, challenge1] })
            .returns(challenge2)
            .withArgs({ possibleChallenges: [challenge1] })
            .returns(challenge1);

          pickAnswerStatus.withArgs({ nextChallenge: challenge2, answerIndex: 0 }).returns(answersForSimulator[0]);

          algorithm.getReward
            .withArgs({
              estimatedLevel: initialCapacity,
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
              answerStatus: answersForSimulator[0],
            },
          ];

          const result = new AssessmentSimulator({
            algorithm,
            challenges: allChallenges,
            pickChallenge,
            pickAnswerStatus,
            initialCapacity,
          }).run();

          // then
          expect(result).to.deep.equal(expectedResult);
        });
      });
    });

    context('when an initial capacity is provided', function () {
      it('should return the list of all the challenges', function () {
        // given
        const answersForSimulator = [AnswerStatus.OK, AnswerStatus.KO];
        const challenge1 = domainBuilder.buildChallenge({ id: 'rec1' });
        const challenge2 = domainBuilder.buildChallenge({ id: 'rec2' });
        const answer1 = { challengeId: challenge2.id, result: answersForSimulator[0] };
        const answer2 = { challengeId: challenge1.id, result: answersForSimulator[1] };
        const allChallenges = [challenge1, challenge2];
        const expectedEstimatedLevels = [0.4, 0.1];
        const expectedErrorRates = [0.2, 0.5];
        const expectedRewards = [5, 6];
        const initialCapacity = 2;
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
          .returns({ estimatedLevel: initialCapacity })
          .withArgs({
            allAnswers: [sinon.match(answer1)],
            challenges: allChallenges,
            initialCapacity,
          })
          .returns({ estimatedLevel: expectedEstimatedLevels[0], errorRate: expectedErrorRates[0] })
          .withArgs({
            allAnswers: [sinon.match(answer1), sinon.match(answer2)],
            challenges: allChallenges,
            initialCapacity,
          })
          .returns({
            estimatedLevel: expectedEstimatedLevels[1],
            errorRate: expectedErrorRates[1],
          });

        algorithm.getPossibleNextChallenges
          .withArgs({
            allAnswers: [],
            challenges: allChallenges,
            initialCapacity,
          })
          .returns([challenge2, challenge1])
          .withArgs({
            allAnswers: [sinon.match(answer1)],
            challenges: allChallenges,
            initialCapacity,
          })
          .returns([challenge1]);

        pickChallenge
          .withArgs({ possibleChallenges: [challenge2, challenge1] })
          .returns(challenge2)
          .withArgs({ possibleChallenges: [challenge1] })
          .returns(challenge1);

        pickAnswerStatus
          .withArgs({ nextChallenge: challenge2, answerIndex: 0 })
          .returns(answersForSimulator[0])
          .withArgs({ nextChallenge: challenge1, answerIndex: 1 })
          .returns(answersForSimulator[1]);

        algorithm.getReward
          .withArgs({
            estimatedLevel: initialCapacity,
            difficulty: challenge1.difficulty,
            discriminant: challenge1.discriminant,
          })
          .returns(expectedRewards[0])
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
            answerStatus: answersForSimulator[0],
          },
          {
            challenge: challenge1,
            estimatedLevel: expectedEstimatedLevels[1],
            errorRate: expectedErrorRates[1],
            reward: expectedRewards[1],
            answerStatus: answersForSimulator[1],
          },
        ];

        const result = new AssessmentSimulator({
          algorithm,
          challenges: allChallenges,
          pickChallenge,
          pickAnswerStatus,
          initialCapacity,
        }).run();

        // then
        expect(result).to.deep.equal(expectedResult);
      });
    });
  });
});
