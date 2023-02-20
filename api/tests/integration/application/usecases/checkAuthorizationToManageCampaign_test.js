import { expect, databaseBuilder } from '../../../test-helper';
import checkAuthorizationToManageCampaign from '../../../../lib/application/usecases/checkAuthorizationToManageCampaign';

describe('Integration | API | checkAuthorizationToManageCampaign', function () {
  describe('when the user is member in organization and owner of the campaign', function () {
    it('returns true', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({ userId: user.id, organizationId: organization.id });
      const campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id, ownerId: user.id });
      await databaseBuilder.commit();

      // when
      const hasAccess = await checkAuthorizationToManageCampaign.execute({ campaignId: campaign.id, userId: user.id });

      // then
      expect(hasAccess).to.be.true;
    });
  });
});
