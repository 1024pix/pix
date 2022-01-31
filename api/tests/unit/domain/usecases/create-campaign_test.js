const { expect, sinon } = require('../../../test-helper');
const createCampaign = require('../../../../lib/domain/usecases/create-campaign');
const campaignCodeGenerator = require('../../../../lib/domain/services/campaigns/campaign-code-generator');
const Campaign = require('../../../../lib/domain/models/Campaign');
const CampaignCreator = require('../../../../lib/domain/models/CampaignCreator');
const CampaignForCreation = require('../../../../lib/domain/models/CampaignForCreation');

describe('Unit | UseCase | create-campaign', function () {
  let campaignRepository;
  let campaignCreatorRepository;

  beforeEach(function () {
    campaignRepository = { save: sinon.stub() };
    campaignCreatorRepository = { get: sinon.stub() };
    sinon.stub(campaignCodeGenerator, 'generate');
  });

  it('should save the campaign', async function () {
    // given
    const code = 'ABCDEF123';
    const targetProfileId = 12;
    const creatorId = 13;
    const ownerId = 13;
    const organizationId = 14;
    const campaignData = {
      name: 'campagne utilisateur',
      type: Campaign.types.ASSESSMENT,
      creatorId,
      ownerId,
      targetProfileId,
      organizationId,
    };
    const campaignForCreation = new CampaignForCreation({ ...campaignData, code });

    const campaignCreator = new CampaignCreator([targetProfileId], false);
    campaignCreatorRepository.get.withArgs({ userId: creatorId, organizationId, ownerId }).resolves(campaignCreator);

    campaignCodeGenerator.generate.resolves(code);
    campaignRepository.save.resolves();

    // when
    await createCampaign({
      campaign: campaignData,
      campaignRepository,
      campaignCreatorRepository,
    });

    // then
    expect(campaignRepository.save).to.have.been.calledWith(campaignForCreation);
  });

  it('should return the newly created campaign', async function () {
    // given
    const code = 'ABCDEF123';
    const targetProfileId = 12;
    const creatorId = 13;
    const ownerId = 13;
    const organizationId = 14;
    const campaignData = {
      name: 'campagne utilisateur',
      type: Campaign.types.ASSESSMENT,
      creatorId,
      ownerId,
      targetProfileId,
      organizationId,
    };
    const campaignCreator = new CampaignCreator([targetProfileId], false);
    campaignCreatorRepository.get.withArgs({ userId: creatorId, organizationId, ownerId }).resolves(campaignCreator);

    campaignCodeGenerator.generate.resolves(code);
    const savedCampaign = Symbol('a saved campaign');

    campaignRepository.save.resolves(savedCampaign);

    // when
    const campaign = await createCampaign({
      campaign: campaignData,
      campaignRepository,
      campaignCreatorRepository,
    });

    // then
    expect(campaign).to.deep.equal(savedCampaign);
  });
});
