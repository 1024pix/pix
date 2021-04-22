const { expect, databaseBuilder } = require('../../test-helper');

const {
  fillCampaignParticipationIdInBadgeAcquisitions,
} = require('../../../scripts/fill-campaign-participation-id-in-badge-acquisitions');

describe('Integration | Scripts | fillCampaignParticipationIdInBadgeAcquisitions', () => {

  describe('#fillCampaignParticipationIdInBadgeAcquisitions', () => {

    it('should return badge-acquisitions without campaignParticipationId', async () => {
      // given
      const user = databaseBuilder.factory.buildUser();
      const badge = databaseBuilder.factory.buildBadge();
      const badgeAcquisitionWithoutCampaignId = databaseBuilder.factory.buildBadgeAcquisition({
        userId: user.id,
        badgeId: badge.id,
        campaignParticipationId: null
      });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation();
      const badgeAcquisitionWithCampaignId = databaseBuilder.factory.buildBadgeAcquisition({
        userId: user.id,
        badgeId: badge.id,
        campaignParticipationId: campaignParticipation.id
      });
      await databaseBuilder.commit();

      // when
      const result = await fillCampaignParticipationIdInBadgeAcquisitions();

      // then
      expect(result).to.have.lengthOf(1);
      expect(result[0].campaignParticipationId).to.equal(null);
    });
  });
});
