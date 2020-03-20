const { expect, domainBuilder } = require('../../../test-helper');
const pickChallengeService = require('../../../../lib/domain/services/pick-challenge-service');
const { FRENCH_FRANCE, FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;
const _ = require('lodash');

describe('Unit | Service | PickChallengeService', () => {

  describe('#pickChallenge', () => {
    const frenchSpokenChallenge = domainBuilder.buildChallenge({ locale: FRENCH_SPOKEN });
    const otherFrenchSpokenChallenge = domainBuilder.buildChallenge({ locale: FRENCH_SPOKEN });
    const frenchChallenge = domainBuilder.buildChallenge({ locale: FRENCH_FRANCE });
    const randomSeed = 'some-random-seed';

    context('when challenge in selected locale exists', () => {

      it('should return challenge in selected locale', async () => {
        // given
        const skills = [{ challenges: [frenchChallenge, frenchSpokenChallenge] }];

        // when
        const challenge = await pickChallengeService.pickChallenge({
          skills,
          randomSeed,
          locale: FRENCH_SPOKEN
        });

        // then
        expect(challenge).to.equal(frenchSpokenChallenge);
      });

      it('should always return the same challenge in selected locale', async () => {
        // given
        const skills = [{ challenges: [frenchChallenge, frenchSpokenChallenge, otherFrenchSpokenChallenge] }];

        // when
        const pickChallengePromises = _.times(5, () => pickChallengeService.pickChallenge({
          skills,
          randomSeed,
          locale: FRENCH_SPOKEN
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
          locale: FRENCH_SPOKEN
        });

        // then
        expect(challenge).to.equal(frenchChallenge);
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
          locale: FRENCH_SPOKEN
        });

        // then
        expect(challenge).to.be.null;
      });

    });

  });
})
;
