import { pickChallengeService } from '../../../../../src/evaluation/domain/services/pick-challenge-service.js';
import { LOCALE } from '../../../../../src/shared/domain/constants.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

const { ENGLISH_SPOKEN, FRENCH_FRANCE, FRENCH_SPOKEN } = LOCALE;

import _ from 'lodash';

describe('Unit | Service | PickChallengeService', function () {
  describe('#pickChallenge', function () {
    let englishSpokenChallenge,
      frenchSpokenChallenge,
      otherFrenchSpokenChallenge,
      frenchChallenge,
      validatedChallenge,
      archivedChallenge;

    const randomSeed = 'some-random-seed';

    beforeEach(function () {
      englishSpokenChallenge = domainBuilder.buildChallenge({ locales: [ENGLISH_SPOKEN] });
      frenchSpokenChallenge = domainBuilder.buildChallenge({ locales: [FRENCH_SPOKEN] });
      otherFrenchSpokenChallenge = domainBuilder.buildChallenge({ locales: [FRENCH_SPOKEN] });
      frenchChallenge = domainBuilder.buildChallenge({ locales: [FRENCH_FRANCE] });
      validatedChallenge = domainBuilder.buildChallenge({ status: 'validé' });
      archivedChallenge = domainBuilder.buildChallenge({ status: 'archivé' });
    });

    context('when challenge in selected locale exists', function () {
      it('should return challenge in selected locale', function () {
        // given
        const skills = [{ challenges: [frenchChallenge, frenchSpokenChallenge, englishSpokenChallenge] }];

        // when
        const challenge = pickChallengeService.pickChallenge({
          skills,
          randomSeed,
          locale: ENGLISH_SPOKEN,
        });

        // then
        expect(challenge).to.equal(englishSpokenChallenge);
      });

      it('should always return the same challenge in selected locale', function () {
        // given
        const skills = [{ challenges: [frenchChallenge, frenchSpokenChallenge, otherFrenchSpokenChallenge] }];

        // when
        const challenges = _.times(5, () =>
          pickChallengeService.pickChallenge({
            skills,
            randomSeed,
            locale: FRENCH_SPOKEN,
          }),
        );

        // then
        expect(challenges).to.contains(frenchSpokenChallenge);
        expect(challenges).to.not.contains(otherFrenchSpokenChallenge);
        expect(challenges).to.not.contains(frenchChallenge);
      });
    });

    context('when there is no skills', function () {
      it('should return null', function () {
        // given
        const skills = [];

        // when
        const challenge = pickChallengeService.pickChallenge({
          skills,
          randomSeed,
          locale: FRENCH_SPOKEN,
        });

        // then
        expect(challenge).to.be.null;
      });
    });

    context('when skills have validated and archived challenges', function () {
      it('should return validated challenge', function () {
        // given
        const skills = [{ challenges: [archivedChallenge, validatedChallenge] }];

        // when
        const challenge = pickChallengeService.pickChallenge({
          skills,
          randomSeed,
          locale: FRENCH_SPOKEN,
        });

        // then
        expect(challenge).to.equal(validatedChallenge);
      });
    });

    context('when skills only have archived challenges', function () {
      it('should return archived challenge', function () {
        // given
        const skills = [{ challenges: [archivedChallenge] }];

        // when
        const challenge = pickChallengeService.pickChallenge({
          skills,
          randomSeed,
          locale: FRENCH_SPOKEN,
        });

        // then
        expect(challenge).to.equal(archivedChallenge);
      });
    });

    context('when picking a lot of challenges', function () {
      it('should return all challenges propose', function () {
        // given
        const challengeOneForSkillOne = domainBuilder.buildChallenge();
        const challengeTwoForSkillOne = domainBuilder.buildChallenge();
        const challengeOneForSkillTwo = domainBuilder.buildChallenge();
        const challengeTwoForSkillTwo = domainBuilder.buildChallenge();
        const skillOne = { challenges: [challengeOneForSkillOne, challengeTwoForSkillOne] };
        const skillTwo = { challenges: [challengeOneForSkillTwo, challengeTwoForSkillTwo] };
        const skills = [skillOne, skillTwo];

        const challenges = _.times(50, (time) =>
          pickChallengeService.pickChallenge({
            skills,
            randomSeed: time,
            locale: FRENCH_SPOKEN,
          }),
        );

        // then
        expect(challenges).to.contains(challengeOneForSkillOne);
        expect(challenges).to.contains(challengeTwoForSkillOne);
        expect(challenges).to.contains(challengeOneForSkillTwo);
        expect(challenges).to.contains(challengeTwoForSkillTwo);
      });
    });
  });

  describe('#chooseNextChallenge', function () {
    context('when given a 100% chance to pick the most discriminating challenge', function () {
      it('should return the most discriminating challenge', function () {
        // given
        const mostDiscriminatingChallenge = domainBuilder.buildChallenge({ discriminant: 5, difficulty: 1 });
        const otherChallenge = domainBuilder.buildChallenge({ discriminant: 2.5, difficulty: 1 });
        const lessDiscriminatingChallenge = domainBuilder.buildChallenge({ discriminant: 1, difficulty: 1 });
        const probabilityToPickMostDiscriminatingChallenge = 100;

        // When provided to the below tested function, and thanks to Fisher–Snedecor distribution used by the algorithm to select upcoming questions,
        // possible challenges are already ordered (in descending order) by the amount of necessary "information" (in which the discriminant plays an important role)
        // to evaluate the candidate.
        const possibleChallenges = [mostDiscriminatingChallenge, otherChallenge, lessDiscriminatingChallenge];

        // when
        const chosenChallenge = pickChallengeService.chooseNextChallenge(probabilityToPickMostDiscriminatingChallenge)({
          possibleChallenges,
        });

        // then
        expect(chosenChallenge).to.deep.equal(mostDiscriminatingChallenge);
      });
    });
  });
});
