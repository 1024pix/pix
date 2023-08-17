import { CampaignCreator } from '../../../../lib/domain/models/CampaignCreator.js';
import { CampaignForCreation } from '../../../../lib/domain/models/CampaignForCreation.js';
import { CampaignTypes } from '../../../../lib/domain/models/CampaignTypes.js';
import { createCampaign } from '../../../../lib/domain/usecases/create-campaign.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | create-campaign', function () {
  let campaignRepository;
  let campaignCreatorRepository;
  let campaignCodeGeneratorStub;

  beforeEach(function () {
    campaignRepository = { save: sinon.stub() };
    campaignCreatorRepository = { get: sinon.stub() };
    campaignCodeGeneratorStub = {
      generate: sinon.stub(),
    };
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
      type: CampaignTypes.ASSESSMENT,
      creatorId,
      ownerId,
      targetProfileId,
      organizationId,
    };
    const campaignForCreation = new CampaignForCreation({ ...campaignData, code });

    const campaignCreator = new CampaignCreator([targetProfileId]);
    campaignCreatorRepository.get.withArgs({ userId: creatorId, organizationId, ownerId }).resolves(campaignCreator);

    campaignCodeGeneratorStub.generate.resolves(code);
    campaignRepository.save.resolves();

    // when
    await createCampaign({
      campaign: campaignData,
      campaignRepository,
      campaignCreatorRepository,
      campaignCodeGenerator: campaignCodeGeneratorStub,
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
      type: CampaignTypes.ASSESSMENT,
      creatorId,
      ownerId,
      targetProfileId,
      organizationId,
    };
    const campaignCreator = new CampaignCreator([targetProfileId]);
    campaignCreatorRepository.get.withArgs({ userId: creatorId, organizationId, ownerId }).resolves(campaignCreator);

    campaignCodeGeneratorStub.generate.resolves(code);
    const savedCampaign = Symbol('a saved campaign');

    campaignRepository.save.resolves(savedCampaign);

    // when
    const campaign = await createCampaign({
      campaign: campaignData,
      campaignRepository,
      campaignCreatorRepository,
      campaignCodeGenerator: campaignCodeGeneratorStub,
    });

    // then
    expect(campaign).to.deep.equal(savedCampaign);
  });
});
