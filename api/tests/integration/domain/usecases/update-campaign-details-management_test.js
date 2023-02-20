import { expect, databaseBuilder, mockLearningContent, knex, catchErr } from '../../../test-helper';
import campaignManagementRepository from '../../../../lib/infrastructure/repositories/campaign-management-repository';
import updateCampaignDetailsManagement from '../../../../lib/domain/usecases/update-campaign-details-management';
import CampaignParticipationStatuses from '../../../../lib/domain/models/CampaignParticipationStatuses';
import { EntityValidationError } from '../../../../lib/domain/errors';

const { SHARED } = CampaignParticipationStatuses;

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
    campaign = databaseBuilder.factory.buildCampaign({
      targetProfileId,
      creatorId: userId,
      organizationId,
      multipleSendings: false,
    });
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
      multipleSendings: true,
    };
    const expectedCampaign = { ...campaign, ...campaignAttributes };

    await updateCampaignDetailsManagement({ campaignId, ...campaignAttributes, campaignManagementRepository });

    const actualCampaign = await knex.select('*').from('campaigns').first();
    expect(actualCampaign).to.deep.equal(expectedCampaign);
  });

  it('should not update multipleSendings attribute when campaign has participations', async function () {
    //given
    const campaignId = databaseBuilder.factory.buildCampaign({
      multipleSendings: false,
    }).id;

    databaseBuilder.factory.buildCampaignParticipation({
      campaignId,
      status: SHARED,
    });

    await databaseBuilder.commit();

    //when
    const campaignAttributes = {
      name: 'new Name',
      title: 'new title',
      customLandingPageText: 'new landing text',
      customResultPageText: 'new result text',
      customResultPageButtonText: 'new result button text',
      customResultPageButtonUrl: 'http://some.url.com',
      multipleSendings: true,
    };

    const error = await catchErr(updateCampaignDetailsManagement)({
      campaignId,
      ...campaignAttributes,
      campaignManagementRepository,
    });

    //then
    const { multipleSendings: actualMultipleSendings } = await knex
      .select('multipleSendings')
      .from('campaigns')
      .where({ id: campaignId })
      .first();

    expect(error).to.be.an.instanceOf(EntityValidationError);
    expect(actualMultipleSendings).to.be.false;
  });

  it('should update other attribut when campaign has participations', async function () {
    //given
    const campaignId = databaseBuilder.factory.buildCampaign({
      name: 'mapetitelicorne',
      multipleSendings: false,
    }).id;

    databaseBuilder.factory.buildCampaignParticipation({
      campaignId,
      status: SHARED,
    });

    await databaseBuilder.commit();

    //when
    const campaignAttributes = {
      name: 'Daddy cool',
      title: 'new title',
      customLandingPageText: 'new landing text',
      customResultPageText: 'new result text',
      customResultPageButtonText: 'new result button text',
      customResultPageButtonUrl: 'http://some.url.com',
      multipleSendings: false,
    };

    await updateCampaignDetailsManagement({ campaignId, ...campaignAttributes, campaignManagementRepository });

    //then
    const { name: actualName } = await knex.select('name').from('campaigns').where({ id: campaignId }).first();

    expect(actualName).to.equal('Daddy cool');
  });

  it('should update multipleSendings attribute when campaign has no participations', async function () {
    //given
    const campaignAttributes = {
      name: 'new Name',
      title: 'new title',
      customLandingPageText: 'new landing text',
      customResultPageText: 'new result text',
      customResultPageButtonText: 'new result button text',
      customResultPageButtonUrl: 'http://some.url.com',
      multipleSendings: true,
    };
    const expectedCampaign = { ...campaign, ...campaignAttributes };

    //when
    await updateCampaignDetailsManagement({ campaignId, ...campaignAttributes, campaignManagementRepository });

    //then
    const { multipleSendings: actualMultipleSendings } = await knex
      .select('multipleSendings')
      .from('campaigns')
      .first();
    expect(actualMultipleSendings).to.equal(expectedCampaign.multipleSendings);
  });
});
