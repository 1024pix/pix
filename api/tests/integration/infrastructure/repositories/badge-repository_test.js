const { expect, databaseBuilder, knex } = require('../../../test-helper');
const badgeRepository = require('../../../../lib/infrastructure/repositories/badge-repository');

describe('Integration | Repository | Badge', () => {

  describe('#findOneByTargetProfileId', () => {

    let targetProfile;
    let anotherTargetProfile;

    beforeEach(async () => {
      targetProfile = databaseBuilder.factory.buildTargetProfile();
      anotherTargetProfile = databaseBuilder.factory.buildTargetProfile();

      databaseBuilder.factory.buildBadge({
        id: '1',
        altMessage: 'You won the Toto badge!',
        imageUrl: '/img/toto.svg',
        message: 'Congrats, you won the Toto badge!',
        targetProfileId: targetProfile.id,
      });
      await databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('badges').delete();
    });

    it('should return the badge linked to the given target profile', async () => {
      // given
      const targetProfileId = targetProfile.id;

      // when
      const badge = await badgeRepository.findOneByTargetProfileId(targetProfileId);

      // then
      expect(badge).to.deep.equal({
        id: 1,
        altMessage: 'You won the Toto badge!',
        imageUrl: '/img/toto.svg',
        message: 'Congrats, you won the Toto badge!',
        targetProfileId: targetProfile.id,
      });
    });

    it('should return an empty array when the given target profile has no badges', async () => {
      // given
      const targetProfileId = anotherTargetProfile.id;

      // when
      const badge = await badgeRepository.findOneByTargetProfileId(targetProfileId);

      // then
      expect(badge).to.equal(null);
    });
  });
});
