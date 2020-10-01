const { expect, domainBuilder } = require('../../../test-helper');
const pickChallengeService = require('../../../../lib/domain/services/pick-challenge-service');
const { ENGLISH_SPOKEN, FRENCH_FRANCE, FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;
const _ = require('lodash');

describe('Unit | Service | PickChallengeService', () => {

  describe('#pickChallenge', () => {
    const englishSpokenChallenge = domainBuilder.buildChallenge({ locales: [ENGLISH_SPOKEN] });
    const frenchSpokenChallenge = domainBuilder.buildChallenge({ locales: [FRENCH_SPOKEN] });
    const otherFrenchSpokenChallenge = domainBuilder.buildChallenge({ locales: [FRENCH_SPOKEN] });
    const frenchChallenge = domainBuilder.buildChallenge({ locales: [FRENCH_FRANCE] });
    const validatedChallenge = domainBuilder.buildChallenge({ status: 'validé' });
    const archivedChallenge = domainBuilder.buildChallenge({ status: 'archivé' });

    const randomSeed = 'some-random-seed';

    context('when challenge in selected locale exists', () => {

      it('should return challenge in selected locale', async () => {
        // given
        const skills = [{ challenges: [frenchChallenge, frenchSpokenChallenge, englishSpokenChallenge] }];

        // when
        const challenge = await pickChallengeService.pickChallenge({
          skills,
          randomSeed,
          locale: ENGLISH_SPOKEN,
        });

        // then
        expect(challenge).to.equal(englishSpokenChallenge);
      });

      it('should always return the same challenge in selected locale', async () => {
        // given
        const skills = [{ challenges: [frenchChallenge, frenchSpokenChallenge, otherFrenchSpokenChallenge] }];

        // when
        const pickChallengePromises = _.times(5, () => pickChallengeService.pickChallenge({
          skills,
          randomSeed,
          locale: FRENCH_SPOKEN,
        }));
        const challenges = await Promise.all(pickChallengePromises);

        // then
        expect(challenges).to.contains(frenchSpokenChallenge);
        expect(challenges).to.not.contains(otherFrenchSpokenChallenge);
        expect(challenges).to.not.contains(frenchChallenge);
      });

    });

    context('when challenge in selected locale does not exists', () => {

      it('should return challenge in other locale', async () => {
        // given
        const skills = [{ challenges: [frenchChallenge] }];

        // when
        const challenge = await pickChallengeService.pickChallenge({
          skills,
          randomSeed,
          locale: FRENCH_SPOKEN,
        });

        // then
        expect(challenge).to.equal(frenchChallenge);
      });
      context('when no challenge in selected non-french locale', () => {
        it('should return FR challenge', async () => {
          // given
          const skills = [{ challenges: [frenchChallenge, frenchSpokenChallenge] }];

          // when
          const challenge = await pickChallengeService.pickChallenge({
            skills,
            randomSeed,
            locale: ENGLISH_SPOKEN,
          });

          // then
          expect(challenge).to.equal(frenchSpokenChallenge);
        });

        context('and no FR challenge', () => {
          it('should return FR-FR challenge', async () => {
            // given
            const skills = [{ challenges: [frenchChallenge] }];

            // when
            const challenge = await pickChallengeService.pickChallenge({
              skills,
              randomSeed,
              locale: ENGLISH_SPOKEN,
            });

            // then
            expect(challenge).to.equal(frenchChallenge);
          });
        });
      });

    });

    context('when there is no skills', () => {

      it('should return null', async () => {
        // given
        const skills = [];

        // when
        const challenge = await pickChallengeService.pickChallenge({
          skills,
          randomSeed,
          locale: FRENCH_SPOKEN,
        });

        // then
        expect(challenge).to.be.null;
      });

    });

    context('when skills have validated and archived challenges', () => {
      it('should return validated challenge', async () => {
        // given
        const skills = [{ challenges: [archivedChallenge, validatedChallenge] }];

        // when
        const challenge = await pickChallengeService.pickChallenge({
          skills,
          randomSeed,
          locale: FRENCH_FRANCE,
        });

        // then
        expect(challenge).to.equal(validatedChallenge);
      });
    });

    context('when skills only have archived challenges', () => {
      it('should return archived challenge', async () => {
        // given
        const skills = [{ challenges: [archivedChallenge] }];

        // when
        const challenge = await pickChallengeService.pickChallenge({
          skills,
          randomSeed,
          locale: FRENCH_FRANCE,
        });

        // then
        expect(challenge).to.equal(archivedChallenge);
      });
    });

  });
})
;
