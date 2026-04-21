import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | check-user-has-access-to-campaign-participation', function () {
  describe('when userId should access to a campaign participation', function () {
    it('should return true', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId: campaign.organizationId, userId });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id });
      await databaseBuilder.commit();

      // when
      const hasAccess = await usecases.checkUserHasAccessToCampaignParticipation({
        userId,
        campaignParticipationId: campaignParticipation.id,
      });

      // then
      expect(hasAccess).true;
    });
  });

  describe('when userId has no membership on campaign of campaign participation', function () {
    it('should return false', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id });
      await databaseBuilder.commit();

      // when
      const hasAccess = await usecases.checkUserHasAccessToCampaignParticipation({
        userId,
        campaignParticipationId: campaignParticipation.id,
      });

      // then
      expect(hasAccess).false;
    });
  });

  describe('when campaign participation not exists', function () {
    it('should return false', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;

      // when
      const hasAccess = await usecases.checkUserHasAccessToCampaignParticipation({
        userId,
        campaignParticipationId: 123,
      });

      // then
      expect(hasAccess).false;
    });
  });
});
