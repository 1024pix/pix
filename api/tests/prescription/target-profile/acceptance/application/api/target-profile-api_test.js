import * as targetProfileApi from '../../../../../../src/prescription/target-profile/application/api/target-profile-api.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Acceptance | Application | target-profile-api', function () {
  describe('#getByOrganizationId', function () {
    it('should not fail', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: organizationId });

      await databaseBuilder.commit();

      const result = await targetProfileApi.getByOrganizationId(organizationId);
      expect(result).to.be.ok;
    });
  });

  describe('#getByIdForAdmin', function () {
    it('should not fail', async function () {
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

      await databaseBuilder.commit();

      const result = await targetProfileApi.getByIdForAdmin(targetProfileId);
      expect(result).to.be.ok;
    });
  });

  describe('#findSkillsByTargetProfileIds', function () {
    it('should not fail', async function () {
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

      await databaseBuilder.commit();

      const result = await targetProfileApi.findSkillsByTargetProfileIds([targetProfileId]);
      expect(result).to.be.ok;
    });
  });
});
