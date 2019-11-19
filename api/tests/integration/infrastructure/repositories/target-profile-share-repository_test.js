const { expect, databaseBuilder, knex } = require('../../../test-helper');
const _ = require('lodash');
const targetProfileShareRepository = require('../../../../lib/infrastructure/repositories/target-profile-share-repository');

describe('Integration | Repository | Target-profile-sahre', () => {

  describe('#addToOrganization', () => {

    let organization;
    let targetProfileA;
    let targetProfileB;
    let targetProfileC;

    afterEach(() => {
      return knex('target-profile-shares').delete();
    });

    beforeEach(() => {
      organization = databaseBuilder.factory.buildOrganization();
      targetProfileA = databaseBuilder.factory.buildTargetProfile();
      targetProfileB = databaseBuilder.factory.buildTargetProfile();
      targetProfileC = databaseBuilder.factory.buildTargetProfile();
      return databaseBuilder.commit();
    });

    it('should save all the target profile shares for the organization', async function() {
      // given
      const targetProfileIdList = [targetProfileA.id, targetProfileB.id, targetProfileC.id];

      // when
      await targetProfileShareRepository.addToOrganization({ organizationId: organization.id, targetProfileIdList });

      // then
      const targetProfileShares = await knex('target-profile-shares').where({ organizationId: organization.id });
      expect(targetProfileShares).to.have.lengthOf(3);
      expect(_.map(targetProfileShares, 'targetProfileId')).to.have.members([targetProfileA.id, targetProfileB.id, targetProfileC.id]);
    });
  });
});
