const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const createCampaign = require('../../../../lib/domain/usecases/create-campaign');
const campaignCodeGenerator = require('../../../../lib/domain/services/campaigns/campaign-code-generator');
const { EntityValidationError, UserNotAuthorizedToCreateCampaignError } = require('../../../../lib/domain/errors');
const Campaign = require('../../../../lib/domain/models/Campaign');
const CampaignForCreation = require('../../../../lib/domain/models/CampaignForCreation');

describe('Unit | UseCase | create-campaign', function () {
  let campaignRepository;
  let userRepository;
  let organizationRepository;
  let organizationService;

  beforeEach(function () {
    campaignRepository = { create: sinon.stub() };
    userRepository = { getWithMemberships: sinon.stub() };
    organizationRepository = { get: sinon.stub() };
    organizationService = { findAllTargetProfilesAvailableForOrganization: sinon.stub() };
    sinon.stub(campaignCodeGenerator, 'generate');
  });

  context('When the campaign is not valid', function () {
    it('should throw an EntityValidationError', async function () {
      // given
      const invalidCampaign = {};

      // when
      const error = await catchErr(createCampaign)({
        campaign: invalidCampaign,
        campaignRepository,
        userRepository,
        organizationRepository,
        organizationService,
      });

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
    });
  });

  context('When user do not have an access to the campaign organization', function () {
    it('should throw an error', async function () {
      // given
      const code = 'ABCDEF123';
      const creatorId = 13;
      const campaignData = {
        name: 'campagne utilisateur',
        type: Campaign.types.PROFILES_COLLECTION,
        creatorId,
        organizationId: 12,
      };

      const user = domainBuilder.buildUser({ id: creatorId });
      userRepository.getWithMemberships.withArgs(creatorId).resolves(user);

      campaignCodeGenerator.generate.resolves(code);
      campaignRepository.create.resolves();
      // when
      const error = await catchErr(createCampaign)({
        campaign: campaignData,
        campaignRepository,
        userRepository,
        organizationRepository,
        organizationService,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToCreateCampaignError);
      expect(error.message).to.equal(
        `User does not have an access to the organization ${campaignData.organizationId}`
      );
    });
  });

  context('When this is a profiles collection campaign and the organization cannot collect profiles', function () {
    it('should throw an error', async function () {
      // given
      const code = 'ABCDEF123';
      const creatorId = 13;
      const organizationId = 12;
      const campaignData = {
        name: 'campagne utilisateur',
        type: Campaign.types.PROFILES_COLLECTION,
        creatorId,
        organizationId,
      };
      const organization = domainBuilder.buildOrganization({ id: organizationId, canCollectProfiles: false });
      organizationRepository.get.withArgs(organization.id).resolves(organization);

      const organizationMember = _createOrganizationMember(creatorId, organization);
      userRepository.getWithMemberships.withArgs(creatorId).resolves(organizationMember);

      // when
      const error = await catchErr(createCampaign)({
        campaign: campaignData,
        campaignRepository,
        userRepository,
        organizationRepository,
        organizationService,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToCreateCampaignError);
      expect(error.message).to.equal('Organization can not create campaign with type PROFILES_COLLECTION');
    });
  });

  context('When the target profile cannot be used by the organization', function () {
    it('should save an assessment campaign', async function () {
      // given
      const code = 'ABCDEF123';
      const targetProfileId = 12;
      const creatorId = 13;
      const organizationId = 14;
      const campaignData = {
        name: 'campagne utilisateur',
        type: Campaign.types.ASSESSMENT,
        creatorId,
        targetProfileId,
        organizationId,
      };

      const organization = domainBuilder.buildOrganization({ id: organizationId });
      const organizationMember = _createOrganizationMember(creatorId, organization);
      userRepository.getWithMemberships.withArgs(creatorId).resolves(organizationMember);
      organizationService.findAllTargetProfilesAvailableForOrganization.resolves([]);

      campaignCodeGenerator.generate.resolves(code);
      campaignRepository.create.resolves();

      // when
      const error = await catchErr(createCampaign)({
        campaign: campaignData,
        campaignRepository,
        userRepository,
        organizationRepository,
        organizationService,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToCreateCampaignError);
      expect(error.message).to.equal(`Organization does not have an access to the profile ${campaignData.targetProfileId}`);
    });
  });

  context('When the campaign is valid', function () {
    it('should save an assessment campaign', async function () {
      // given
      const code = 'ABCDEF123';
      const targetProfileId = 12;
      const creatorId = 13;
      const organizationId = 14;
      const campaignData = {
        name: 'campagne utilisateur',
        type: Campaign.types.ASSESSMENT,
        creatorId,
        targetProfileId,
        organizationId,
      };
      const campaignForCreation = new CampaignForCreation({ ...campaignData, code})


      const organization = domainBuilder.buildOrganization({ id: organizationId });
      const organizationMember = _createOrganizationMember(creatorId, organization);
      userRepository.getWithMemberships.withArgs(creatorId).resolves(organizationMember);
      const targetProfile = domainBuilder.buildTargetProfile({ id: targetProfileId, isPublic: true });
      organizationService.findAllTargetProfilesAvailableForOrganization.resolves([targetProfile]);

      campaignCodeGenerator.generate.resolves(code);
      campaignRepository.create.resolves();

      // when
      await createCampaign({
        campaign: campaignData,
        campaignRepository,
        userRepository,
        organizationRepository,
        organizationService,
      });

      // then
      expect(campaignRepository.create).to.have.been.calledWith(campaignForCreation);
    });

    it('should save a profile collection campaign', async function () {
      // given
      const code = 'ABCDEF123';
      const creatorId = 13;
      const organizationId = 14;
      const campaignData = {
        name: 'campagne utilisateur',
        type: Campaign.types.PROFILES_COLLECTION,
        creatorId,
        organizationId,
      };

      const campaignForCreation = new CampaignForCreation({ ...campaignData, code})
      const organization = domainBuilder.buildOrganization({ id: organizationId, canCollectProfiles: true });
      const organizationMember = _createOrganizationMember(creatorId, organization);
      userRepository.getWithMemberships.withArgs(creatorId).resolves(organizationMember);
      organizationRepository.get.resolves(organization);

      campaignCodeGenerator.generate.resolves(code);
      campaignRepository.create.resolves();

      // when
      await createCampaign({
        campaign: campaignData,
        campaignRepository,
        userRepository,
        organizationRepository,
        organizationService,
      });

      // then
      expect(campaignRepository.create).to.have.been.calledWith(campaignForCreation);
    });

    it('should generate a new code to the campaign', async function () {
      // given
      const code = 'ABCDEF123';
      const creatorId = 13;
      const organizationId = 14;
      const targetProfileId = 11;

      const campaignData = {
        name: 'campagne utilisateur',
        type: Campaign.types.ASSESSMENT,
        creatorId,
        targetProfileId,
        organizationId,
      };

      const organization = domainBuilder.buildOrganization({ id: campaignData.organizationId });
      const organizationMember = _createOrganizationMember(creatorId, organization);
      userRepository.getWithMemberships.withArgs(creatorId).resolves(organizationMember);

      const targetProfile = domainBuilder.buildTargetProfile({ id: targetProfileId });
      organizationService.findAllTargetProfilesAvailableForOrganization.resolves([targetProfile]);

      campaignCodeGenerator.generate.resolves(code);
      campaignRepository.create.resolves();

      // when
      await createCampaign({
        campaign: campaignData,
        campaignRepository,
        userRepository,
        organizationRepository,
        organizationService,
      });

      // then
      expect(campaignRepository.create).to.have.been.deep.calledWithMatch({ code });
    });

    it('should return the newly created campaign', async function () {
      // given
      const code = 'ABCDEF123';
      const targetProfileId = 12;
      const creatorId = 13;
      const organizationId = 14;
      const campaignData = {
        name: 'campagne utilisateur',
        type: Campaign.types.ASSESSMENT,
        creatorId,
        targetProfileId,
        organizationId,
      };

      const organization = domainBuilder.buildOrganization({ id: campaignData.organizationId });
      const organizationMember = _createOrganizationMember(creatorId, organization);
      userRepository.getWithMemberships.withArgs(creatorId).resolves(organizationMember);
      const targetProfile = domainBuilder.buildTargetProfile({ id: targetProfileId, isPublic: true });
      organizationService.findAllTargetProfilesAvailableForOrganization.resolves([targetProfile]);

      campaignCodeGenerator.generate.resolves(code);
      const savedCampaign = Symbol('a saved campaign');

      campaignRepository.create.resolves(savedCampaign);

      // when
      const campaign = await createCampaign({
        campaign: campaignData,
        campaignRepository,
        userRepository,
        organizationRepository,
        organizationService,
      });

      // then
      expect(campaign).to.deep.equal(savedCampaign);
    });
  });
});

function _createOrganizationMember(userId, organization) {
  const organizationMember = domainBuilder.buildUser({ id: userId, memberships: [] });

  const membership = domainBuilder.buildMembership({ organization: organization });
  organizationMember.memberships.push(membership);

  return organizationMember;
}
