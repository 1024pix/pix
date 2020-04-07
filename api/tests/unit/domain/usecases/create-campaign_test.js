const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const createCampaign = require('../../../../lib/domain/usecases/create-campaign');
const campaignCodeGenerator = require('../../../../lib/domain/services/campaigns/campaign-code-generator');
const campaignValidator = require('../../../../lib/domain/validators/campaign-validator');
const { EntityValidationError, UserNotAuthorizedToCreateCampaignError } = require('../../../../lib/domain/errors');
const _ = require('lodash');

describe('Unit | UseCase | create-campaign', () => {

  const availableCampaignCode = 'ABCDEF123';
  const targetProfileId = 12;
  let campaignToCreate;
  const savedCampaign = domainBuilder.buildCampaign({ code: availableCampaignCode });
  const targetProfile = domainBuilder.buildTargetProfile({ id: targetProfileId, isPublic: true });
  const campaignRepository = { save: () => undefined };
  const userRepository = { getWithMemberships: () => undefined };
  const organizationRepository = { get: () => undefined };
  const organizationService = { findAllTargetProfilesAvailableForOrganization: () => undefined };

  function _stubGetUserWithOrganizationsAccesses(organizationIdUserHasAccessTo) {
    const userWithMembership = domainBuilder.buildUser();
    userWithMembership.memberships[0].organization.id = organizationIdUserHasAccessTo;
    userRepository.getWithMemberships.resolves(userWithMembership);
    organizationService.findAllTargetProfilesAvailableForOrganization.resolves([targetProfile]);
  }

  beforeEach(() => {
    campaignToCreate = domainBuilder.buildCampaign.ofTypeAssessment({ id: '', code: '', targetProfileId  });
    sinon.stub(campaignCodeGenerator, 'generate');
    sinon.stub(campaignRepository, 'save');
    sinon.stub(campaignValidator, 'validate');
    sinon.stub(userRepository, 'getWithMemberships');
    sinon.stub(organizationRepository, 'get');
    sinon.stub(organizationService, 'findAllTargetProfilesAvailableForOrganization');
  });

  it('should throw an EntityValidationError if campaign is not valid', async () => {
    // given
    campaignValidator.validate.throws(new EntityValidationError({ invalidAttributes: [] }));

    // when
    const error = await catchErr(createCampaign)({ campaign: campaignToCreate, campaignRepository, userRepository, organizationRepository, organizationService });

    // then
    expect(error).to.be.instanceOf(EntityValidationError);
  });

  it('should throw an error if user do not have an access to the campaign organization', async () => {
    // given
    const organizationIdDifferentFromCampaign = 98437;
    campaignValidator.validate.returns();
    _stubGetUserWithOrganizationsAccesses(organizationIdDifferentFromCampaign);

    // when
    const error = await catchErr(createCampaign)({ campaign: campaignToCreate, campaignRepository, userRepository, organizationRepository, organizationService });

    // then
    expect(error).to.be.instanceOf(UserNotAuthorizedToCreateCampaignError);
    expect(error.message).to.equal(`User does not have an access to the organization ${campaignToCreate.organizationId}`);
  });

  it('should throw an error if organization cannot collect profiles', async () => {
    // given
    const organization = domainBuilder.buildOrganization({ canCollectProfiles: false });
    organizationRepository.get.withArgs(organization.id).resolves(organization);
    _stubGetUserWithOrganizationsAccesses(organization.id);
    campaignValidator.validate.returns();

    campaignToCreate = domainBuilder.buildCampaign.ofTypeProfilesCollection({ id: '', code: '', organizationId: organization.id });

    // when
    const error = await catchErr(createCampaign)({ campaign: campaignToCreate, campaignRepository, userRepository, organizationRepository, organizationService });

    // then
    expect(error).to.be.instanceOf(UserNotAuthorizedToCreateCampaignError);
    expect(error.message).to.equal('Organization can not create campaign with type PROFILES_COLLECTION');
  });

  it('should generate a new code to the campaign', async () => {
    // given
    campaignValidator.validate.returns();
    _stubGetUserWithOrganizationsAccesses(campaignToCreate.organizationId);
    campaignCodeGenerator.generate.resolves(availableCampaignCode);
    campaignRepository.save.resolves(savedCampaign);

    // when
    await createCampaign({ campaign: campaignToCreate, campaignRepository, userRepository, organizationRepository, organizationService });

    // then
    expect(campaignCodeGenerator.generate).to.have.been.called;
  });

  it('should save the campaign with name, type, userId, organizationId and generated code', async () => {
    // given
    campaignValidator.validate.returns();
    _stubGetUserWithOrganizationsAccesses(campaignToCreate.organizationId);
    campaignCodeGenerator.generate.resolves(availableCampaignCode);
    campaignRepository.save.resolves(savedCampaign);

    // when
    await createCampaign({ campaign: campaignToCreate, campaignRepository, userRepository, organizationRepository, organizationService });

    // then
    const [campaignToCreateWithCode] = campaignRepository.save.firstCall.args;

    expect(campaignToCreateWithCode).to.deep.include({
      ..._.pick(campaignToCreate, ['name', 'userId', 'type', 'organizationId']),
      code: availableCampaignCode
    });
  });

  it('should return the newly created campaign', async () => {
    // given
    campaignValidator.validate.returns();
    _stubGetUserWithOrganizationsAccesses(campaignToCreate.organizationId);
    campaignCodeGenerator.generate.resolves(availableCampaignCode);
    campaignRepository.save.resolves(savedCampaign);

    // when
    const campaign = await createCampaign({ campaign: campaignToCreate, campaignRepository, userRepository, organizationRepository, organizationService });

    // then
    expect(campaign).to.deep.equal(savedCampaign);
  });

});
