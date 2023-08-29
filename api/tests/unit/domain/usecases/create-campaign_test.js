import { expect, sinon } from '../../../test-helper.js';
import { createCampaign } from '../../../../lib/domain/usecases/create-campaign.js';
import { CampaignTypes } from '../../../../lib/domain/models/CampaignTypes.js';
import { CampaignCreator } from '../../../../lib/domain/models/CampaignCreator.js';

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
    const savedCampaign = Symbol('a saved campaign');
    const campaignToCreate = Symbol('campaign to create');
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

    const campaignCreator = new CampaignCreator({
      availableTargetProfileIds: [targetProfileId],
      organizationFeatures: {},
    });
    campaignCreator.createCampaign = sinon
      .stub()
      .withArgs({ ...campaignData, code })
      .returns(campaignToCreate);

    campaignCodeGeneratorStub.generate.resolves(code);
    campaignCreatorRepository.get.withArgs({ userId: creatorId, organizationId, ownerId }).resolves(campaignCreator);
    campaignRepository.save.withArgs(campaignToCreate).resolves(savedCampaign);

    // when
    const campaign = await createCampaign({
      campaign: campaignData,
      campaignRepository,
      campaignCreatorRepository,
      campaignCodeGenerator: campaignCodeGeneratorStub,
    });

    // then
    expect(campaignCreator.createCampaign).to.have.been.calledWith({ ...campaignData, code });
    expect(campaignRepository.save).to.have.been.calledWith(campaignToCreate);
    expect(campaign).to.deep.equal(savedCampaign);
  });
});
