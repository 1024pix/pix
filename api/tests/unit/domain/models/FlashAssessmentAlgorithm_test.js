import { AnswerStatus, FlashAssessmentAlgorithm } from '../../../../lib/domain/models/index.js';
import { domainBuilder, expect } from '../../../test-helper.js';
import { AssessmentEndedError } from '../../../../lib/domain/errors.js';
import _ from 'lodash';
import { config } from '../../../../lib/config.js';

function initializeTestChallenges(hardAnsweredChallengesCount, difficulty, answerStatus) {
  const defaultDiscriminantValue = 0.5;
  const defaultSkill = domainBuilder.buildSkill({
    id: 'recSK456',
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
    skill: defaultSkill,
  });

  const challenges = [...hardAnsweredChallenges, expectedUnansweredChallenge, mediumUnansweredChallenge];
  const allAnswers = [...hardAnsweredChallengesAnswers];
  return { expectedUnansweredChallenge, mediumUnansweredChallenge, challenges, allAnswers };
}

describe('FlashAssessmentAlgorithm', function () {
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
        it('should choose a hard challenge', function () {
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
  });
});
