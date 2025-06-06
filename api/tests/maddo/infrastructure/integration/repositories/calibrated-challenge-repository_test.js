import { databaseBuilder, domainBuilder, expect } from '../../../../test-helper.js';

describe('Maddo | Infrastructure | Repositories | Integration | calibrated-challenge', function () {
  describe('#getAllByScope', function () {
    it('lists challenges from given scope', async function () {
      // given

      // TODO add scope filter
      const firstChallenge = databaseBuilder.factory.buildCalibratedChallenge();
      const secondChallenge = databaseBuilder.factory.buildCalibratedChallenge();

      await databaseBuilder.commit();

      const expectedCalibratedChallenges = [
        domainBuilder.factory.buildCalibratedChallenge(firstChallenge),
        domainBuilder.factory.buildCalibratedChallenge(secondChallenge),
      ];

      // when
      const calibratedChallenges = await getAllByScope({ scope: 'droit' });

      // then
      expect(calibratedChallenges).to.deep.equal(expectedCalibratedChallenges);
    });
  });
});
