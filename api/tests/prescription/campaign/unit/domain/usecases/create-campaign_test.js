import { catchErr, expect, sinon } from '../../../../../test-helper.js';
import { createCampaign } from '../../../../../../src/prescription/campaign/domain/usecases/create-campaign.js';
import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';
import { CampaignCreator } from '../../../../../../src/prescription/campaign/domain/models/CampaignCreator.js';
import { UserNotAuthorizedToCreateCampaignError } from '../../../../../../lib/domain/errors.js';

describe('Unit | UseCase | create-campaign', function () {
  let campaignAdministrationRepository;
  let campaignCreatorRepository;
  let userRepository;
  let codeGeneratorStub;

  beforeEach(function () {
    campaignAdministrationRepository = { save: sinon.stub() };
    campaignCreatorRepository = { get: sinon.stub() };
    userRepository = { getWithMemberships: sinon.stub() };
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
    campaignCreatorRepository.get.withArgs(organizationId).resolves(campaignCreator);
    campaignAdministrationRepository.save.withArgs(campaignToCreate).resolves(savedCampaign);
    userRepository.getWithMemberships.withArgs(creatorId).resolves({ hasAccessToOrganization: () => true });
    userRepository.getWithMemberships.withArgs(ownerId).resolves({ hasAccessToOrganization: () => true });

    // when
    const campaign = await createCampaign({
      campaign: campaignData,
      userRepository,
      campaignAdministrationRepository,
      campaignCreatorRepository,
      codeGenerator: codeGeneratorStub,
    });

    // then
    expect(campaignCreator.createCampaign).to.have.been.calledWithExactly({ ...campaignData, code });
    expect(campaignAdministrationRepository.save).to.have.been.calledWithExactly(campaignToCreate);
    expect(campaign).to.deep.equal(savedCampaign);
  });

  it('should throw an error if creator is not from organization', async function () {
    // given
    const creatorId = 13;
    const ownerId = 13;
    const organizationId = 14;
    const campaignData = {
      creatorId,
      ownerId,
      organizationId,
    };

    userRepository.getWithMemberships.withArgs(creatorId).resolves({ hasAccessToOrganization: () => false });

    // when
    const error = await catchErr(createCampaign)({
      campaign: campaignData,
      userRepository,
    });

    // then
    expect(error).to.be.instanceOf(UserNotAuthorizedToCreateCampaignError);
  });

  it('should throw an error if owner is not from organization', async function () {
    // given
    const creatorId = 13;
    const ownerId = 13;
    const organizationId = 14;
    const campaignData = {
      creatorId,
      ownerId,
      organizationId,
    };

    userRepository.getWithMemberships.withArgs(creatorId).resolves({ hasAccessToOrganization: () => true });
    userRepository.getWithMemberships.withArgs(creatorId).resolves({ hasAccessToOrganization: () => false });

    // when
    const error = await catchErr(createCampaign)({
      campaign: campaignData,
      userRepository,
    });

    // then
    expect(error).to.be.instanceOf(UserNotAuthorizedToCreateCampaignError);
  });
});
