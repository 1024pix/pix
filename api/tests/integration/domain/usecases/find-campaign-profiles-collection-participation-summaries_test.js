const { expect, mockLearningContent, databaseBuilder } = require('../../../test-helper');
const useCases = require('../../../../lib/domain/usecases/index.js');

describe('Integration | UseCase | find-campaign-profiles-collection-participation-summaries', function () {
  let organizationId;
  let campaignId;
  let userId;

  beforeEach(async function () {
    const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

    organizationId = databaseBuilder.factory.buildOrganization().id;
    userId = databaseBuilder.factory.buildUser().id;
    campaignId = databaseBuilder.factory.buildCampaign({ organizationId, targetProfileId }).id;

    databaseBuilder.factory.buildMembership({ organizationId, userId });

    mockLearningContent({ skills: [], tubes: [], competences: [], areas: [] });

    await databaseBuilder.commit();
  });

  context('when there are filters', function () {
    beforeEach(async function () {
      const participation1 = { participantExternalId: 'Yubaba', campaignId, status: 'SHARED' };
      const participant1 = { firstName: 'Chihiro', lastName: 'Ogino' };
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(participant1, participation1);

      const participation2 = { participantExternalId: 'Meï', campaignId, status: 'SHARED' };
      const participant2 = { firstName: 'Tonari', lastName: 'No Totoro' };
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(participant2, participation2);

      await databaseBuilder.commit();
    });
    it('returns the list filtered by the search', async function () {
      const { data } = await useCases.findCampaignProfilesCollectionParticipationSummaries({
        userId,
        campaignId,
        filters: { search: 'Tonari N' },
      });
      expect(data.length).to.equal(1);
    });
  });
});
