import { expect, sinon } from '../../../../../test-helper.js';
import { createCampaign } from '../../../../../../src/prescription/campaign/domain/usecases/create-campaign.js';
import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';
import { CampaignCreator } from '../../../../../../src/prescription/campaign/domain/models/CampaignCreator.js';

describe('Unit | UseCase | create-campaign', function () {
  let campaignAdministrationRepository;
  let campaignCreatorRepository;
  let codeGeneratorStub;

  beforeEach(function () {
    campaignAdministrationRepository = { save: sinon.stub() };
    campaignCreatorRepository = { get: sinon.stub() };
    codeGeneratorStub = {
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

    codeGeneratorStub.generate.resolves(code);
    campaignCreatorRepository.get.withArgs({ userId: creatorId, organizationId, ownerId }).resolves(campaignCreator);
    campaignAdministrationRepository.save.withArgs(campaignToCreate).resolves(savedCampaign);

    // when
    const campaign = await createCampaign({
      campaign: campaignData,
      campaignAdministrationRepository,
      campaignCreatorRepository,
      codeGenerator: codeGeneratorStub,
    });

    // then
    expect(campaignCreator.createCampaign).to.have.been.calledWithExactly({ ...campaignData, code });
    expect(campaignAdministrationRepository.save).to.have.been.calledWithExactly(campaignToCreate);
    expect(campaign).to.deep.equal(savedCampaign);
  });
});
