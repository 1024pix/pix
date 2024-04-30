import * as targetProfileShareRepository from '../../../../lib/infrastructure/repositories/target-profile-share-repository.js';
import { databaseBuilder, expect, knex } from '../../../test-helper.js';

describe('Integration | Repository | Target-profile-share', function () {
  describe('#batchAddTargetProfilesToOrganization', function () {
    let organizationId;
    let targetProfileIdA;
    let targetProfileIdB;
    let targetProfileIdC;

    beforeEach(function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      targetProfileIdA = databaseBuilder.factory.buildTargetProfile().id;
      targetProfileIdB = databaseBuilder.factory.buildTargetProfile().id;
      targetProfileIdC = databaseBuilder.factory.buildTargetProfile().id;
      return databaseBuilder.commit();
    });

    it('should add rows in the table "table-profile-shares"', async function () {
      // given
      const organizationsTargetProfiles = [
        { organizationId, targetProfileId: targetProfileIdA },
        { organizationId, targetProfileId: targetProfileIdB },
        { organizationId, targetProfileId: targetProfileIdC },
      ];

      // when
      await targetProfileShareRepository.batchAddTargetProfilesToOrganization(organizationsTargetProfiles);

      // then
      const foundTargetProfileShares = await knex('target-profile-shares').select();
      expect(foundTargetProfileShares.length).to.equal(3);
    });
  });
});
