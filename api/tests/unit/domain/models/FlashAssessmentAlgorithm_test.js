import { FlashAssessmentAlgorithm } from '../../../../lib/domain/models/index.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import { AssessmentEndedError } from '../../../../lib/domain/errors.js';
import _ from 'lodash';
import { config } from '../../../../lib/config.js';
import { FlashAssessmentSuccessRateHandler } from '../../../../lib/domain/models/FlashAssessmentSuccessRateHandler.js';

function initializeTestChallenges(hardAnsweredChallengesCount, difficulty, answerStatus) {
  const defaultDiscriminantValue = 0.5;
  const defaultSkill = domainBuilder.buildSkill({
    id: 'recSK456',
    tubeId: 'tube456',
  });
  const hardAnsweredChallenges = _.range(0, hardAnsweredChallengesCount).map((index) =>
    domainBuilder.buildChallenge({
      id: `recAnsweredHard${index}`,
      difficulty,
      discriminant: defaultDiscriminantValue,
    }),
  );

  const hardAnsweredChallengesAnswers = hardAnsweredChallenges.map(({ id }) =>
    domainBuilder.buildAnswer({
      result: answerStatus,
      challengeId: id,
    }),
  );

  const expectedUnansweredChallenge = domainBuilder.buildChallenge({
    id: 'recUnansweredHard',
    difficulty,
    discriminant: defaultDiscriminantValue,
    skill: defaultSkill,
  });

  const mediumUnansweredChallenge = domainBuilder.buildChallenge({
    id: 'recUnansweredMedium',
    difficulty: 0,
    discriminant: defaultDiscriminantValue,
    skill: domainBuilder.buildSkill({
      id: `skill2`,
      tubeId: 'tube2',
    }),
  });

  const challenges = [...hardAnsweredChallenges, expectedUnansweredChallenge, mediumUnansweredChallenge];
  const allAnswers = [...hardAnsweredChallengesAnswers];
  return { expectedUnansweredChallenge, mediumUnansweredChallenge, challenges, allAnswers };
}

describe('Unit | Domain | Models | FlashAssessmentAlgorithm', function () {
  let flashAlgorithmImplementation;

  const baseGetNextChallengeOptions = {
    warmUpLength: undefined,
    forcedCompetences: undefined,
    challengesBetweenSameCompetence: 2,
    minimalSuccessRate: 0,
    limitToOneQuestionPerTube: true,
  };

  beforeEach(function () {
    flashAlgorithmImplementation = {
      getPossibleNextChallenges: sinon.stub(),
      getEstimatedLevelAndErrorRate: sinon.stub(),
    };
  });
  describe('#getPossibleNextChallenges', function () {
    context('when enough challenges have been answered', function () {
      it('should throw an AssessmentEndedError', function () {
        const allAnswers = [domainBuilder.buildAnswer({ id: 1 }), domainBuilder.buildAnswer({ id: 2 })];
        const skill1 = domainBuilder.buildSkill({ id: 1 });
        const skill2 = domainBuilder.buildSkill({ id: 2 });
        const challenges = [
          domainBuilder.buildChallenge({ id: allAnswers[0].challengeId, skill: skill1 }),
          domainBuilder.buildChallenge({ competenceId: 'comp2', skill: skill2 }),
        ];
        const estimatedLevel = 0;
        const algorithm = new FlashAssessmentAlgorithm({
          maximumAssessmentLength: 2,
          flashAlgorithmImplementation,
        });

        expect(() =>
          algorithm.getPossibleNextChallenges({
            allAnswers,
            challenges,
            estimatedLevel,
          }),
        ).to.throw(AssessmentEndedError);
      });
    });

    context('when there are challenges left to answer', function () {
      it('should choose a challenge', function () {
        const alreadyAnsweredChallengesCount = 10;
        const remainingAnswersToGive = 1;
        const initialCapacity = config.v3Certification.defaultCandidateCapacity;
        const computedEstimatedLevel = 2;
        config.features.numberOfChallengesForFlashMethod = 20;
        const algorithm = new FlashAssessmentAlgorithm({
          flashAlgorithmImplementation,
          maximumAssessmentLength: alreadyAnsweredChallengesCount + remainingAnswersToGive,
          minimumEstimatedSuccessRateRanges: [],
        });
        const strongLevel = 6;
        const { challenges, allAnswers } = initializeTestChallenges(alreadyAnsweredChallengesCount, strongLevel);

        flashAlgorithmImplementation.getEstimatedLevelAndErrorRate
          .withArgs({
            allAnswers,
            challenges,
            estimatedLevel: initialCapacity,
          })
          .returns({
            estimatedLevel: computedEstimatedLevel,
          });

        const expectedChallenges = challenges.slice(0, 2);
        flashAlgorithmImplementation.getPossibleNextChallenges
          .withArgs({
            allAnswers,
            challenges,
            estimatedLevel: computedEstimatedLevel,
            options: baseGetNextChallengeOptions,
          })
          .returns({
            hasAssessmentEnded: false,
            possibleChallenges: expectedChallenges,
          });

        expect(algorithm.getPossibleNextChallenges({ allAnswers, challenges })).to.deep.equal(expectedChallenges);
      });
    });
    context('when specifying a minimal success rate', function () {
      context('when a fixed minimal success rate has been set', function () {
        it('should choose a challenge that has the required success rate first', function () {
          // Given
          const easyDifficulty = -3;
          const hardDifficulty = 3;
          const discriminant = 1;
          const initialCapacity = 3;

          const easyChallenge = domainBuilder.buildChallenge({
            id: 'easyChallenge',
            skill: domainBuilder.buildSkill({
              id: 'skillEasy',
            }),
            competenceId: 'compEasy',
            discriminant,
            difficulty: easyDifficulty,
          });

          const hardChallenge = domainBuilder.buildChallenge({
            id: 'hardChallenge',
            skill: domainBuilder.buildSkill({
              id: 'skillHard',
            }),
            competenceId: 'compHard',
            discriminant,
            difficulty: hardDifficulty,
          });

          const challenges = [hardChallenge, easyChallenge];
          const allAnswers = [];

          // when
          const algorithm = new FlashAssessmentAlgorithm({
            flashAlgorithmImplementation,
            minimumEstimatedSuccessRateRanges: [
              FlashAssessmentSuccessRateHandler.createFixed({
                startingChallengeIndex: 0,
                endingChallengeIndex: 1,
                value: 0.8,
              }),
            ],
          });

          flashAlgorithmImplementation.getEstimatedLevelAndErrorRate.returns({
            estimatedLevel: 0,
          });
          flashAlgorithmImplementation.getPossibleNextChallenges
            .withArgs({
              challenges,
              allAnswers,
              estimatedLevel: 0,
              options: {
                ...baseGetNextChallengeOptions,
                minimalSuccessRate: 0.8,
              },
            })
            .returns({
              hasAssessmentEnded: false,
              possibleChallenges: [easyChallenge, hardChallenge],
            });

          const nextChallenges = algorithm.getPossibleNextChallenges({
            allAnswers,
            challenges,
            initialCapacity,
          });

          expect(nextChallenges).to.deep.equal([easyChallenge, hardChallenge]);
        });
      });

      context('when a linear minimal success rate has been set', function () {
        it('should choose a challenge that has the required success rate first', function () {
          // Given
          const easyDifficulty = -3;
          const hardDifficulty = 3;
          const discriminant = 1;
          const initialCapacity = 3;

          const easyChallenge = domainBuilder.buildChallenge({
            id: 'easyChallenge',
            skill: domainBuilder.buildSkill({
              id: 'skillEasy',
            }),
            competenceId: 'compEasy',
            discriminant,
            difficulty: easyDifficulty,
          });

          const hardChallenge = domainBuilder.buildChallenge({
            id: 'hardChallenge',
            skill: domainBuilder.buildSkill({
              id: 'skillHard',
            }),
            competenceId: 'compHard',
            discriminant,
            difficulty: hardDifficulty,
          });

          const challenges = [hardChallenge, easyChallenge, hardChallenge, easyChallenge];
          const allAnswers = [
            domainBuilder.buildAnswer({
              challengeId: hardChallenge.id,
            }),
          ];

          // when
          const algorithm = new FlashAssessmentAlgorithm({
            flashAlgorithmImplementation,
            minimumEstimatedSuccessRateRanges: [
              FlashAssessmentSuccessRateHandler.createLinear({
                startingChallengeIndex: 0,
                endingChallengeIndex: 2,
                startingValue: 0.8,
                endingValue: 0.4,
              }),
            ],
          });

          flashAlgorithmImplementation.getEstimatedLevelAndErrorRate.returns({
            estimatedLevel: 0,
          });
          flashAlgorithmImplementation.getPossibleNextChallenges
            .withArgs({
              challenges,
              allAnswers,
              estimatedLevel: 0,
              options: {
                ...baseGetNextChallengeOptions,
                // Due to JS having troubles with float numbers, we must use a matcher.
                minimalSuccessRate: sinon.match((value) => value.toPrecision(1) === '0.6'),
              },
            })
            .returns({
              hasAssessmentEnded: false,
              possibleChallenges: [easyChallenge, hardChallenge],
            });

          const nextChallenges = algorithm.getPossibleNextChallenges({
            allAnswers,
            challenges,
            initialCapacity,
          });

          expect(nextChallenges).to.deep.equal([easyChallenge, hardChallenge]);
        });
      });
    });
  });
});
