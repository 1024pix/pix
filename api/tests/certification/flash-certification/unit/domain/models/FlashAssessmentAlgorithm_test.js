import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';
import { AssessmentEndedError } from '../../../../../../lib/domain/errors.js';
import { config } from '../../../../../../lib/config.js';
import { FlashAssessmentSuccessRateHandler } from '../../../../../../src/certification/flash-certification/domain/model/FlashAssessmentSuccessRateHandler.js';
import { FlashAssessmentAlgorithm } from '../../../../../../src/certification/flash-certification/domain/model/FlashAssessmentAlgorithm.js';

describe('Unit | Domain | Models | FlashAssessmentAlgorithm | FlashAssessmentAlgorithm', function () {
  let flashAlgorithmImplementation;

  const baseFlashAssessmentAlgorithmConfig = {
    warmUpLength: 0,
    forcedCompetences: [],
    minimumEstimatedSuccessRateRanges: [],
    limitToOneQuestionPerTube: false,
    enablePassageByAllCompetences: false,
  };

  const baseGetNextChallengeOptions = {
    challengesBetweenSameCompetence: 2,
    minimalSuccessRate: 0,
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
          ...baseFlashAssessmentAlgorithmConfig,
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
      context('with limitToOneQuestionPerTube=true', function () {
        it('should limit to one challenge', function () {
          const alreadyAnsweredChallengesCount = 10;
          const remainingAnswersToGive = 1;
          const initialCapacity = config.v3Certification.defaultCandidateCapacity;
          const computedEstimatedLevel = 2;
          config.features.numberOfChallengesForFlashMethod = 20;
          const algorithm = new FlashAssessmentAlgorithm({
            flashAlgorithmImplementation,
            maximumAssessmentLength: alreadyAnsweredChallengesCount + remainingAnswersToGive,
            ...baseFlashAssessmentAlgorithmConfig,
            limitToOneQuestionPerTube: true,
          });

          const skill1Tube1 = domainBuilder.buildSkill({
            tubeId: 'tube1',
          });
          const skill2Tube1 = domainBuilder.buildSkill({
            tubeId: 'tube1',
          });
          const skillTube2 = domainBuilder.buildSkill({
            tubeId: 'tube2',
          });

          const answeredChallengeTube1 = domainBuilder.buildChallenge({
            id: 'answeredChallengeTube1',
            skill: skill1Tube1,
          });

          const unansweredChallengeTube1 = domainBuilder.buildChallenge({
            id: 'unansweredChallengeTube1',
            skill: skill2Tube1,
          });

          const unansweredChallengeTube2 = domainBuilder.buildChallenge({
            id: 'unansweredChallengeTube2',
            skill: skillTube2,
          });

          const allAnswers = [
            domainBuilder.buildAnswer({
              challengeId: answeredChallengeTube1.id,
            }),
          ];

          const challenges = [answeredChallengeTube1, unansweredChallengeTube1, unansweredChallengeTube2];

          flashAlgorithmImplementation.getEstimatedLevelAndErrorRate
            .withArgs(
              _getEstimatedLevelAndErrorRateParams({
                allAnswers,
                challenges,
                estimatedLevel: initialCapacity,
              }),
            )
            .returns({
              estimatedLevel: computedEstimatedLevel,
            });

          const expectedChallenges = [unansweredChallengeTube2];
          flashAlgorithmImplementation.getPossibleNextChallenges
            .withArgs({
              availableChallenges: expectedChallenges,
              estimatedLevel: computedEstimatedLevel,
              options: baseGetNextChallengeOptions,
            })
            .returns(expectedChallenges);

          expect(algorithm.getPossibleNextChallenges({ allAnswers, challenges })).to.deep.equal(expectedChallenges);
        });
      });

      context('with limitToOneQuestionPerTube=false', function () {
        it('should return challenges with non answered skills', function () {
          const alreadyAnsweredChallengesCount = 10;
          const remainingAnswersToGive = 1;
          const initialCapacity = config.v3Certification.defaultCandidateCapacity;
          const computedEstimatedLevel = 2;
          config.features.numberOfChallengesForFlashMethod = 20;
          const algorithm = new FlashAssessmentAlgorithm({
            flashAlgorithmImplementation,
            maximumAssessmentLength: alreadyAnsweredChallengesCount + remainingAnswersToGive,
            ...baseFlashAssessmentAlgorithmConfig,
          });

          const skill1Tube1 = domainBuilder.buildSkill({
            id: 'skill1',
            tubeId: 'tube1',
          });
          const skill2Tube1 = domainBuilder.buildSkill({
            id: 'skill2',
            tubeId: 'tube1',
          });
          const skillTube2 = domainBuilder.buildSkill({
            id: 'skill3',
            tubeId: 'tube2',
          });

          const answeredChallengeTube1 = domainBuilder.buildChallenge({
            id: 'answeredChallengeTube1',
            skill: skill1Tube1,
          });

          const unansweredChallengeTube1 = domainBuilder.buildChallenge({
            id: 'unansweredChallengeTube1',
            skill: skill2Tube1,
          });

          const unansweredChallengeTube2 = domainBuilder.buildChallenge({
            id: 'unansweredChallengeTube2',
            skill: skillTube2,
          });

          const allAnswers = [
            domainBuilder.buildAnswer({
              challengeId: answeredChallengeTube1.id,
            }),
          ];

          const challenges = [answeredChallengeTube1, unansweredChallengeTube1, unansweredChallengeTube2];

          flashAlgorithmImplementation.getEstimatedLevelAndErrorRate
            .withArgs(
              _getEstimatedLevelAndErrorRateParams({
                allAnswers,
                challenges,
                estimatedLevel: initialCapacity,
              }),
            )
            .returns({
              estimatedLevel: computedEstimatedLevel,
            });

          const expectedChallenges = [unansweredChallengeTube1, unansweredChallengeTube2];
          flashAlgorithmImplementation.getPossibleNextChallenges
            .withArgs({
              availableChallenges: expectedChallenges,
              estimatedLevel: computedEstimatedLevel,
              options: baseGetNextChallengeOptions,
            })
            .returns(expectedChallenges);

          expect(algorithm.getPossibleNextChallenges({ allAnswers, challenges })).to.deep.equal(expectedChallenges);
        });
      });
    });

    context('when settings specific answers for computing estimated level', function () {
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

        const answer1 = domainBuilder.buildAnswer({
          challengeId: easyChallenge.id,
        });

        const challenges = [hardChallenge, easyChallenge];
        const allAnswers = [answer1];
        const answersForComputingEstimatedLevel = [];

        // when
        const algorithm = new FlashAssessmentAlgorithm({
          flashAlgorithmImplementation,
          ...baseFlashAssessmentAlgorithmConfig,
        });

        flashAlgorithmImplementation.getEstimatedLevelAndErrorRate
          .withArgs(
            _getEstimatedLevelAndErrorRateParams({
              allAnswers: answersForComputingEstimatedLevel,
              challenges,
              estimatedLevel: initialCapacity,
            }),
          )
          .returns({
            estimatedLevel: 0,
          });

        flashAlgorithmImplementation.getPossibleNextChallenges
          .withArgs({
            availableChallenges: [hardChallenge],
            estimatedLevel: 0,
            options: {
              ...baseGetNextChallengeOptions,
            },
          })
          .returns([hardChallenge]);

        const nextChallenges = algorithm.getPossibleNextChallenges({
          allAnswers,
          challenges,
          initialCapacity,
          answersForComputingEstimatedLevel,
        });

        expect(nextChallenges).to.deep.equal([hardChallenge]);
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
            ...baseFlashAssessmentAlgorithmConfig,
            limitToOneQuestionPerTube: true,
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
              availableChallenges: challenges,
              estimatedLevel: 0,
              options: {
                ...baseGetNextChallengeOptions,
                minimalSuccessRate: 0.8,
              },
            })
            .returns([easyChallenge, hardChallenge]);

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

          const hardChallenge2 = domainBuilder.buildChallenge({
            id: 'hardChallenge2',
            skill: domainBuilder.buildSkill({
              id: 'hardSkill2',
            }),
            competenceId: 'compHard2',
            discriminant,
            difficulty: hardDifficulty,
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

          const challenges = [hardChallenge, easyChallenge, hardChallenge2];
          const allAnswers = [
            domainBuilder.buildAnswer({
              challengeId: hardChallenge.id,
            }),
          ];

          // when
          const algorithm = new FlashAssessmentAlgorithm({
            flashAlgorithmImplementation,
            ...baseFlashAssessmentAlgorithmConfig,
            limitToOneQuestionPerTube: false,
            minimumEstimatedSuccessRateRanges: [
              FlashAssessmentSuccessRateHandler.createLinear({
                startingChallengeIndex: 0,
                endingChallengeIndex: 2,
                startingValue: 0.8,
                endingValue: 0.4,
              }),
            ],
          });

          const expectedChallenges = [easyChallenge, hardChallenge2];
          flashAlgorithmImplementation.getEstimatedLevelAndErrorRate.returns({
            estimatedLevel: 0,
          });
          flashAlgorithmImplementation.getPossibleNextChallenges
            .withArgs({
              availableChallenges: expectedChallenges,
              estimatedLevel: 0,
              options: {
                ...baseGetNextChallengeOptions,
                // Due to JS having troubles with float numbers, we must use a matcher.
                minimalSuccessRate: sinon.match((value) => value.toPrecision(1) === '0.6'),
              },
            })
            .returns(expectedChallenges);

          const nextChallenges = algorithm.getPossibleNextChallenges({
            allAnswers,
            challenges,
            initialCapacity,
          });

          expect(nextChallenges).to.deep.equal(expectedChallenges);
        });
      });
    });
  });
});

const _getEstimatedLevelAndErrorRateParams = (params) => ({
  variationPercent: undefined,
  doubleMeasuresUntil: undefined,
  ...params,
});
