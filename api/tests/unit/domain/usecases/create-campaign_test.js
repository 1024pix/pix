const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const createCampaign = require('../../../../lib/domain/usecases/create-campaign');
const campaignCodeGenerator = require('../../../../lib/domain/services/campaigns/campaign-code-generator');
const campaignValidator = require('../../../../lib/domain/validators/campaign-validator');
const { EntityValidationError, UserNotAuthorizedToCreateCampaignError } = require('../../../../lib/domain/errors');
const Campaign = require('../../../../lib/domain/models/Campaign');
const _ = require('lodash');

describe('Unit | UseCase | create-campaign', function () {
  const availableCampaignCode = 'ABCDEF123';
  const targetProfileId = 12;
  const creatorId = 13;
  const organizationId = 14;
  let campaignToCreate;
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const savedCampaign = domainBuilder.buildCampaign({ code: availableCampaignCode });
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const targetProfile = domainBuilder.buildTargetProfile({ id: targetProfileId, isPublic: true });

  let campaignRepository;
  let userRepository;
  let organizationRepository;
  let organizationService;

  beforeEach(function () {
    campaignToCreate = { creatorId, targetProfileId, organizationId };

    sinon.stub(campaignCodeGenerator, 'generate');
    sinon.stub(campaignValidator, 'validate');

    campaignRepository = { create: sinon.stub() };
    userRepository = { getWithMemberships: sinon.stub() };
    organizationRepository = { get: sinon.stub() };
    organizationService = { findAllTargetProfilesAvailableForOrganization: sinon.stub() };
  });

  it('should throw an EntityValidationError if campaign is not valid', async function () {
    // given
    campaignValidator.validate.throws(new EntityValidationError({ invalidAttributes: [] }));

    // when
    const error = await catchErr(createCampaign)({
      campaign: campaignToCreate,
      campaignRepository,
      userRepository,
      organizationRepository,
      organizationService,
    });

    // then
    expect(error).to.be.instanceOf(EntityValidationError);
  });

  it('should throw an error if user do not have an access to the campaign organization', async function () {
    // given
    campaignValidator.validate.returns();

    const otherOrganization = domainBuilder.buildOrganization({ id: 98437 });
    const userWithMembership = _createOrganizationMember(creatorId, otherOrganization);

    userRepository.getWithMemberships.withArgs(creatorId).resolves(userWithMembership);
    organizationService.findAllTargetProfilesAvailableForOrganization
      .withArgs(organizationId)
      .resolves([targetProfile]);

    // when
    const error = await catchErr(createCampaign)({
      campaign: campaignToCreate,
      campaignRepository,
      userRepository,
      organizationRepository,
      organizationService,
    });

    // then
    expect(error).to.be.instanceOf(UserNotAuthorizedToCreateCampaignError);
    expect(error.message).to.equal(
      `User does not have an access to the organization ${campaignToCreate.organizationId}`
    );
  });

  it('should throw an error if organization cannot collect profiles', async function () {
    // given
    campaignValidator.validate.returns();
    const organization = domainBuilder.buildOrganization({ canCollectProfiles: false });
    organizationRepository.get.withArgs(organization.id).resolves(organization);

    const userWithMembership = _createOrganizationMember(creatorId, organization);

    userRepository.getWithMemberships.withArgs(creatorId).resolves(userWithMembership);

    campaignToCreate = {
      name: 'Nom',
      type: Campaign.types.PROFILES_COLLECTION,
      organizationId: organization.id,
      creatorId,
      targetProfileId,
    };

    // when
    const error = await catchErr(createCampaign)({
      campaign: campaignToCreate,
      campaignRepository,
      userRepository,
      organizationRepository,
      organizationService,
    });

    // then
    expect(error).to.be.instanceOf(UserNotAuthorizedToCreateCampaignError);
    expect(error.message).to.equal('Organization can not create campaign with type PROFILES_COLLECTION');
  });

  it('should generate a new code to the campaign', async function () {
    // given
    campaignValidator.validate.returns();

    const organization = domainBuilder.buildOrganization({ id: campaignToCreate.organizationId });
    const organizationMember = _createOrganizationMember(creatorId, organization);
    userRepository.getWithMemberships.withArgs(creatorId).resolves(organizationMember);
    organizationService.findAllTargetProfilesAvailableForOrganization.resolves([targetProfile]);

    campaignCodeGenerator.generate.resolves(availableCampaignCode);
    campaignRepository.create.resolves(savedCampaign);

    // when
    await createCampaign({
      campaign: campaignToCreate,
      campaignRepository,
      userRepository,
      organizationRepository,
      organizationService,
    });

    // then
    expect(campaignRepository.create).to.have.been.calledWithMatch({ code: availableCampaignCode });
  });

  it('should save the campaign with name, type, userId, organizationId and generated code', async function () {
    // given
    campaignValidator.validate.returns();

    const organization = domainBuilder.buildOrganization({ id: campaignToCreate.organizationId });
    const organizationMember = _createOrganizationMember(creatorId, organization);
    userRepository.getWithMemberships.withArgs(creatorId).resolves(organizationMember);
    organizationService.findAllTargetProfilesAvailableForOrganization.resolves([targetProfile]);

    campaignCodeGenerator.generate.resolves(availableCampaignCode);
    campaignRepository.create.resolves(savedCampaign);

    // when
    await createCampaign({
      campaign: campaignToCreate,
      campaignRepository,
      userRepository,
      organizationRepository,
      organizationService,
    });

    // then
    const [campaignToCreateWithCode] = campaignRepository.create.firstCall.args;

    expect(campaignToCreateWithCode).to.deep.include({
      ..._.pick(campaignToCreate, ['name', 'userId', 'type', 'organizationId']),
      code: availableCampaignCode,
    });
  });

  it('should return the newly created campaign', async function () {
    // given
    campaignValidator.validate.returns();

    const organization = domainBuilder.buildOrganization({ id: campaignToCreate.organizationId });
    const organizationMember = _createOrganizationMember(creatorId, organization);
    userRepository.getWithMemberships.withArgs(creatorId).resolves(organizationMember);
    organizationService.findAllTargetProfilesAvailableForOrganization.resolves([targetProfile]);

    campaignCodeGenerator.generate.resolves(availableCampaignCode);
    campaignRepository.create.resolves(savedCampaign);

    // when
    const campaign = await createCampaign({
      campaign: campaignToCreate,
      campaignRepository,
      userRepository,
      organizationRepository,
      organizationService,
    });

    // then
    expect(campaign).to.deep.equal(savedCampaign);
  });
});

function _createOrganizationMember(userId, organization) {
  const organizationMember = domainBuilder.buildUser({ id: userId, memberships: [] });

  const membership = domainBuilder.buildMembership({ organization: organization });
  organizationMember.memberships.push(membership);

  return organizationMember;
}
