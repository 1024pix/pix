const { expect, databaseBuilder } = require('../../../test-helper');
const Campaign = require('../../../../lib/domain/models/Campaign');
const CampaignParticipationOverview = require('../../../../lib/domain/read-models/CampaignParticipationOverview');
const campaignParticipationOverviewRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-overview-repository');

describe('Integration | Repository | Campaign Participation Overview', () => {

  describe('#findByUserId', () => {

    let userId;

    beforeEach(async() => {
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    context('with one campaign participation', () => {

      beforeEach(async () => {
        const organizationId = databaseBuilder.factory.buildOrganization({ name: 'My organization' }).id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId, title: 'My campaign', createdAt: new Date('2000-01-01T10:00:00Z'), archivedAt: null }).id;

        const expectedCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ userId, createdAt: new Date('2000-07-01T10:00:00Z'), campaignId }).id;

        databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId: expectedCampaignParticipationId });
        databaseBuilder.factory.buildAssessment({ userId, campaignParticipationId: expectedCampaignParticipationId });

        await databaseBuilder.commit();
      });

      it('should retrieve the campaign participations of the user', async () => {
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserId(userId);
        const [campaignParticipationOverview1] = campaignParticipationOverviews;

        expect(campaignParticipationOverview1).to.be.instanceOf(CampaignParticipationOverview);
        expect(campaignParticipationOverview1.createdAt).to.deep.equal(new Date('2000-07-01T10:00:00Z'));
        expect(campaignParticipationOverview1.assessmentState).to.equal('completed');
        expect(campaignParticipationOverview1.campaignTitle).to.equal('My campaign');
        expect(campaignParticipationOverview1.organizationName).to.equal('My organization');
        expect(campaignParticipationOverviews).to.have.lengthOf(1);
      });
    });

    context('with one campaign participation of type `PROFILES_COLLECTION`', () => {
      beforeEach(async () => {
        const organizationId = databaseBuilder.factory.buildOrganization({ name: 'My organization' }).id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          title: 'My campaign',
          createdAt: new Date('2000-01-01T10:00:00Z'),
          archivedAt: null,
          type: Campaign.types.PROFILES_COLLECTION,
        }).id;

        databaseBuilder.factory.buildCampaignParticipation({ userId, createdAt: new Date('2000-07-01T10:00:00Z'), campaignId }).id;

        await databaseBuilder.commit();
      });

      it('should retrieve no campaign participation of the user', async () => {
        const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserId(userId);

        expect(campaignParticipationOverviews).to.have.lengthOf(0);
      });
    });

  });

});
