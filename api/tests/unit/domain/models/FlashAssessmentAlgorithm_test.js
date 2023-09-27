import { AnswerStatus, FlashAssessmentAlgorithm } from '../../../../lib/domain/models/index.js';
import { domainBuilder, expect } from '../../../test-helper.js';
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
      let algorithm;
      const alreadyAnsweredChallengesCount = 10;
      const remainingAnswersToGive = 1;

      beforeEach(function () {
        config.features.numberOfChallengesForFlashMethod = 20;
        algorithm = new FlashAssessmentAlgorithm({
          warmUpLength: 0,
          maximumAssessmentLength: alreadyAnsweredChallengesCount + remainingAnswersToGive,
        });
      });
      context('when user has a strong level', function () {
        it('should choose a hard challenge', function () {
          const strongLevel = 6;
          const { expectedUnansweredChallenge, mediumUnansweredChallenge, challenges, allAnswers } =
            initializeTestChallenges(alreadyAnsweredChallengesCount, strongLevel);

          expect(algorithm.getPossibleNextChallenges({ allAnswers, challenges })).to.deep.equal([
            expectedUnansweredChallenge,
            mediumUnansweredChallenge,
          ]);
        });
      });

      context('when user has a weak level', function () {
        it('should choose a weak challenge', function () {
          const weakLevel = -6;
          const { expectedUnansweredChallenge, mediumUnansweredChallenge, challenges, allAnswers } =
            initializeTestChallenges(alreadyAnsweredChallengesCount, weakLevel, AnswerStatus.KO);

          expect(algorithm.getPossibleNextChallenges({ allAnswers, challenges })).to.deep.equal([
            expectedUnansweredChallenge,
            mediumUnansweredChallenge,
          ]);
        });
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
          const answers = [];

          // when
          const algorithm = new FlashAssessmentAlgorithm({
            minimumEstimatedSuccessRateRanges: [
              FlashAssessmentSuccessRateHandler.createFixed({
                startingChallengeIndex: 0,
                endingChallengeIndex: 1,
                value: 0.8,
              }),
            ],
          });
          const nextChallenges = algorithm.getPossibleNextChallenges({
            allAnswers: answers,
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

          const challengeWithRightSuccessRateDifficulty = 2.2;
          const challengeWithRightSuccessRateDiscriminant = 1;

          const discriminant = 1;
          const initialCapacity = 2;

          const easyChallenge = domainBuilder.buildChallenge({
            id: 'easyChallenge',
            skill: domainBuilder.buildSkill({
              id: 'skillEasy',
              tubeId: 'tube4',
            }),
            competenceId: 'compEasy',
            discriminant,
            difficulty: easyDifficulty,
          });

          // A challenge with an estimated success rate over 0.6, which is
          // the lower limit of our linear configuration
          const challengeWithRightSuccessRate = domainBuilder.buildChallenge({
            id: 'challengeWithRightSuccessRate',
            skill: domainBuilder.buildSkill({
              id: 'skillMedium',
              tubeId: 'tube3',
            }),
            competenceId: 'compMedium',
            discriminant: challengeWithRightSuccessRateDiscriminant,
            difficulty: challengeWithRightSuccessRateDifficulty,
          });

          const takenChallenge = domainBuilder.buildChallenge({
            id: 'hardChallenge2',
            skill: domainBuilder.buildSkill({
              id: 'skillHard2',
              tubeId: 'tube2',
            }),
            competenceId: 'compHard2',
            discriminant,
            difficulty: hardDifficulty,
          });

          const hardChallenge = domainBuilder.buildChallenge({
            id: 'hardChallenge',
            skill: domainBuilder.buildSkill({
              id: 'skillHard',
              tubeId: 'tube1',
            }),
            competenceId: 'compHard',
            discriminant,
            difficulty: hardDifficulty,
          });

          const challenges = [hardChallenge, challengeWithRightSuccessRate, takenChallenge, easyChallenge];
          const answers = [
            domainBuilder.buildAnswer({
              challengeId: takenChallenge.id,
            }),
          ];

          // when
          const algorithm = new FlashAssessmentAlgorithm({
            minimumEstimatedSuccessRateRanges: [
              FlashAssessmentSuccessRateHandler.createLinear({
                startingChallengeIndex: 0,
                endingChallengeIndex: 2,
                startingValue: 0.8,
                endingValue: 0.4,
              }),
            ],
          });

          //when
          const nextChallenges = algorithm.getPossibleNextChallenges({
            allAnswers: answers,
            challenges,
            initialCapacity,
          });

          // then
          const expectedChallenges = [challengeWithRightSuccessRate, easyChallenge, hardChallenge];
          const expectedChallengeIds = expectedChallenges.map(({ id }) => id);
          const challengeIds = nextChallenges.map(({ id }) => id);
          expect(challengeIds).to.deep.equal(expectedChallengeIds);
          expect(nextChallenges).to.deep.equal(expectedChallenges);
        });
      });
    });
  });
});
