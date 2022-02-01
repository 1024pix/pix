const { expect, databaseBuilder, mockLearningContent, knex } = require('../../../test-helper');

const campaignManagementRepository = require('../../../../lib/infrastructure/repositories/campaign-management-repository');
const updateCampaignDetailsManagement = require('../../../../lib/domain/usecases/update-campaign-details-management');

describe('Integration | UseCases | update-campaign-details-management', function () {
  let userId;
  let organizationId;
  let targetProfileId;
  let campaign, campaignId;

  beforeEach(async function () {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    userId = databaseBuilder.factory.buildUser().id;
    targetProfileId = databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: organizationId }).id;
    databaseBuilder.factory.buildMembership({ organizationId, userId });
    campaign = databaseBuilder.factory.buildCampaign({ targetProfileId, creatorId: userId, organizationId });
    campaignId = campaign.id;
    await databaseBuilder.commit();

    const learningContent = {
      skills: [{ id: 'recSkill1' }],
    };

    mockLearningContent(learningContent);
  });

  it('should update campaign', async function () {
    const campaignAttributes = {
      name: 'new Name',
      title: 'new title',
      customLandingPageText: 'new landing text',
      customResultPageText: 'new result text',
      customResultPageButtonText: 'new result button text',
      customResultPageButtonUrl: 'http://some.url.com',
    };
    const expectedCampaign = { ...campaign, ...campaignAttributes };

    await updateCampaignDetailsManagement({ campaignId, ...campaignAttributes, campaignManagementRepository });

    const actualCampaign = await knex.select('*').from('campaigns').first();
    expect(actualCampaign).to.deep.equal(expectedCampaign);
  });
});
