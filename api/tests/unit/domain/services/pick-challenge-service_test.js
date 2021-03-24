const { expect, domainBuilder } = require('../../../test-helper');
const pickChallengeService = require('../../../../lib/domain/services/pick-challenge-service');
const { ENGLISH_SPOKEN, FRENCH_FRANCE, FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;
const _ = require('lodash');

describe('Unit | Service | PickChallengeService', function() {

  describe('#pickChallenge', function() {
    const englishSpokenChallenge = domainBuilder.buildChallenge({ locales: [ENGLISH_SPOKEN] });
    const frenchSpokenChallenge = domainBuilder.buildChallenge({ locales: [FRENCH_SPOKEN] });
    const otherFrenchSpokenChallenge = domainBuilder.buildChallenge({ locales: [FRENCH_SPOKEN] });
    const frenchChallenge = domainBuilder.buildChallenge({ locales: [FRENCH_FRANCE] });
    const validatedChallenge = domainBuilder.buildChallenge({ status: 'validé' });
    const archivedChallenge = domainBuilder.buildChallenge({ status: 'archivé' });

    const randomSeed = 'some-random-seed';

    context('when challenge in selected locale exists', function() {

      it('should return challenge in selected locale', function() {
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

      it('should always return the same challenge in selected locale', function() {
        // given
        const skills = [{ challenges: [frenchChallenge, frenchSpokenChallenge, otherFrenchSpokenChallenge] }];

        // when
        const challenges = _.times(5, () => pickChallengeService.pickChallenge({
          skills,
          randomSeed,
          locale: FRENCH_SPOKEN,
        }));

        // then
        expect(challenges).to.contains(frenchSpokenChallenge);
        expect(challenges).to.not.contains(otherFrenchSpokenChallenge);
        expect(challenges).to.not.contains(frenchChallenge);
      });

    });

    context('when there is no skills', function() {

      it('should return null', function() {
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

    context('when skills have validated and archived challenges', function() {
      it('should return validated challenge', function() {
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

    context('when skills only have archived challenges', function() {
      it('should return archived challenge', function() {
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

    context('when picking a lot of challenges', function() {
      it('should return all challenges propose', function() {
        // given
        const challengeOneForSkillOne = domainBuilder.buildChallenge();
        const challengeTwoForSkillOne = domainBuilder.buildChallenge();
        const challengeOneForSkillTwo = domainBuilder.buildChallenge();
        const challengeTwoForSkillTwo = domainBuilder.buildChallenge();
        const skillOne = { challenges: [challengeOneForSkillOne, challengeTwoForSkillOne] };
        const skillTwo = { challenges: [challengeOneForSkillTwo, challengeTwoForSkillTwo] };
        const skills = [skillOne, skillTwo];

        const challenges = _.times(50, (time) => pickChallengeService.pickChallenge({
          skills,
          randomSeed: time,
          locale: FRENCH_SPOKEN,
        }));

        // then
        expect(challenges).to.contains(challengeOneForSkillOne);
        expect(challenges).to.contains(challengeTwoForSkillOne);
        expect(challenges).to.contains(challengeOneForSkillTwo);
        expect(challenges).to.contains(challengeTwoForSkillTwo);
      });
    });
  });
})
;
