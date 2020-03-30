const { expect, databaseBuilder, knex } = require('../../../test-helper');
const _ = require('lodash');
const targetProfileShareRepository = require('../../../../lib/infrastructure/repositories/target-profile-share-repository');

describe('Integration | Repository | Target-profile-share', () => {

  describe('#addTargetProfilesToOrganization', () => {

    let organizationId;
    let targetProfileIdA;
    let targetProfileIdB;
    let targetProfileIdC;

    afterEach(() => {
      return knex('target-profile-shares').delete();
    });

    beforeEach(() => {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      targetProfileIdA = databaseBuilder.factory.buildTargetProfile().id;
      targetProfileIdB = databaseBuilder.factory.buildTargetProfile().id;
      targetProfileIdC = databaseBuilder.factory.buildTargetProfile().id;
      return databaseBuilder.commit();
    });

    it('should save all the target profile shares for the organization', async function() {
      // given
      const targetProfileIdList = [targetProfileIdA, targetProfileIdB, targetProfileIdC];

      // when
      await targetProfileShareRepository.addTargetProfilesToOrganization({ organizationId, targetProfileIdList });

      // then
      const targetProfileShares = await knex('target-profile-shares').where({ organizationId });
      expect(targetProfileShares).to.have.lengthOf(3);
      expect(_.map(targetProfileShares, 'targetProfileId')).to.have.members([targetProfileIdA, targetProfileIdB, targetProfileIdC]);
    });

    it('should not erase old target profil share', async function() {
      // given
      databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId: targetProfileIdA });
      await databaseBuilder.commit();
      const targetProfileIdList = [targetProfileIdB, targetProfileIdC];

      // when
      await targetProfileShareRepository.addTargetProfilesToOrganization({ organizationId, targetProfileIdList });

      // then
      const targetProfileShares = await knex('target-profile-shares').where({ organizationId });
      expect(targetProfileShares).to.have.lengthOf(3);
      expect(_.map(targetProfileShares, 'targetProfileId')).to.have.members([targetProfileIdA, targetProfileIdB, targetProfileIdC]);
    });
  });
});
