import { expect, databaseBuilder } from '../../../test-helper.js';
import * as checkAuthorizationToAccessCampaign from '../../../../lib/application/usecases/checkAuthorizationToAccessCampaign.js';

describe('Integration | API | checkAuthorizationToAccessCampaign', function () {
  describe('when the user belongs to organization', function () {
    it('returns true', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({ userId: user.id, organizationId: organization.id });
      const campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      await databaseBuilder.commit();

      // when
      const hasAccess = await checkAuthorizationToAccessCampaign.execute({ campaignId: campaign.id, userId: user.id });

      // then
      expect(hasAccess).to.be.true;
    });
  });

  describe('when the user does not belong to organization', function () {
    it('throws', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const user = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      await databaseBuilder.commit();

      // when
      const hasAccess = await checkAuthorizationToAccessCampaign.execute({ campaignId: campaign.id, userId: user.id });

      // then
      expect(hasAccess).to.be.false;
    });
  });
});
