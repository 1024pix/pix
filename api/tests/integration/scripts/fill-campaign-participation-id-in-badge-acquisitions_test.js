const { expect, databaseBuilder } = require('../../test-helper');

const {
  fillCampaignParticipationIdInBadgeAcquisitions,
  getCampaignParticipationFromBadgeAcquisition,
} = require('../../../scripts/fill-campaign-participation-id-in-badge-acquisitions');

describe.only('Integration | Scripts | fillCampaignParticipationIdInBadgeAcquisitions', () => {

  describe('#fillCampaignParticipationIdInBadgeAcquisitions', () => {

    it('should return badge-acquisitions without campaignParticipationId', async () => {
      // given
      const user = databaseBuilder.factory.buildUser();
      const badge = databaseBuilder.factory.buildBadge();
      databaseBuilder.factory.buildBadgeAcquisition({
        userId: user.id,
        badgeId: badge.id,
        campaignParticipationId: null,
      });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation();
      databaseBuilder.factory.buildBadgeAcquisition({
        userId: user.id,
        badgeId: badge.id,
        campaignParticipationId: campaignParticipation.id,
      });
      await databaseBuilder.commit();

      // when
      const result = await fillCampaignParticipationIdInBadgeAcquisitions();

      // then
      expect(result).to.have.lengthOf(1);
      expect(result[0].campaignParticipationId).to.equal(null);
    });

    it('should return possible campaignParticipations for one badge', async () => {
      // given
      const user = databaseBuilder.factory.buildUser();
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const badge = databaseBuilder.factory.buildBadge({ targetProfileId: targetProfile.id });
      const badgeAcquisitionWithoutCampaignId = databaseBuilder.factory.buildBadgeAcquisition({
        userId: user.id,
        badgeId: badge.id,
        campaignParticipationId: null,
      });
      const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId: user.id,
      });
      await databaseBuilder.commit();

      // when
      const result = await getCampaignParticipationFromBadgeAcquisition(badgeAcquisitionWithoutCampaignId);

      // then
      expect(result).to.deep.equal([{ id: campaignParticipation.id }]);
    });
  });
});
