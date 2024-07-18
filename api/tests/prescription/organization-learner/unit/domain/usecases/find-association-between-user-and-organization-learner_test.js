import { CampaignCodeError, OrganizationLearnerDisabledError } from '../../../../../../lib/domain/errors.js';
import { OrganizationLearner } from '../../../../../../lib/domain/models/OrganizationLearner.js';
import { findAssociationBetweenUserAndOrganizationLearner } from '../../../../../../src/prescription/organization-learner/domain/usecases/find-association-between-user-and-organization-learner.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | find-association-between-user-and-organization-learner', function () {
  let organizationLearnerReceivedStub;
  let getCampaignStub;
  let organizationLearner;
  let organization;
  let userId;
  let campaign;
  let campaignRepository;
  let registrationOrganizationLearnerRepository;

  beforeEach(function () {
    userId = domainBuilder.buildUser().id;
    organization = domainBuilder.buildOrganization();
    campaign = domainBuilder.buildCampaign({ organization });
    organizationLearner = domainBuilder.buildOrganizationLearner({ organization, userId });
    campaignRepository = { getByCode: sinon.stub() };
    getCampaignStub = campaignRepository.getByCode.throws('unexpected call');
    registrationOrganizationLearnerRepository = { findOneByUserIdAndOrganizationId: sinon.stub() };
    organizationLearnerReceivedStub =
      registrationOrganizationLearnerRepository.findOneByUserIdAndOrganizationId.throws('unexpected call');
  });

  describe('There is an organizationLearner linked to the given userId', function () {
    it('should call findOneByUserIdAndOrganizationId', async function () {
      // given
      getCampaignStub.withArgs(campaign.code).resolves(campaign);
      organizationLearnerReceivedStub.resolves({});

      // when
      await findAssociationBetweenUserAndOrganizationLearner({
        authenticatedUserId: userId,
        requestedUserId: userId,
        campaignCode: campaign.code,
        campaignRepository,
        registrationOrganizationLearnerRepository,
      });

      // then
      expect(organizationLearnerReceivedStub).to.have.been.calledOnce;
    });

    it('should return the OrganizationLearner', async function () {
      // given
      getCampaignStub.withArgs(campaign.code).resolves(campaign);
      organizationLearnerReceivedStub
        .withArgs({ userId, organizationId: organization.id })
        .resolves(organizationLearner);

      // when
      const result = await findAssociationBetweenUserAndOrganizationLearner({
        authenticatedUserId: userId,
        requestedUserId: userId,
        campaignCode: campaign.code,
        campaignRepository,
        registrationOrganizationLearnerRepository,
      });

      // then
      expect(result).to.be.deep.equal(organizationLearner);
      expect(result).to.be.instanceof(OrganizationLearner);
    });
  });

  describe('There is no organizationLearner linked to the given userId', function () {
    it('should return null', async function () {
      // given
      getCampaignStub.withArgs(campaign.code).resolves(campaign);
      organizationLearnerReceivedStub.withArgs({ userId, organizationId: organization.id }).resolves(null);

      // when
      const result = await findAssociationBetweenUserAndOrganizationLearner({
        authenticatedUserId: userId,
        requestedUserId: userId,
        campaignCode: campaign.code,
        campaignRepository,
        registrationOrganizationLearnerRepository,
      });

      // then
      expect(result).to.equal(null);
    });
  });

  describe('There is no organizationLearner linked to the organization owning the campaign', function () {
    it('should return null', async function () {
      // given
      const otherCampaign = domainBuilder.buildCampaign();
      getCampaignStub.withArgs(campaign.code).resolves(otherCampaign);
      organizationLearnerReceivedStub.withArgs({ userId, organizationId: otherCampaign.organizationId }).resolves(null);

      // when
      const result = await findAssociationBetweenUserAndOrganizationLearner({
        authenticatedUserId: userId,
        requestedUserId: userId,
        campaignCode: campaign.code,
        campaignRepository,
        registrationOrganizationLearnerRepository,
      });

      // then
      expect(result).to.equal(null);
    });
  });

  describe('There is a disabled organizationLearner linked to the given userId', function () {
    it('should throw an error', async function () {
      // given
      const disabledOrganizationLearner = domainBuilder.buildOrganizationLearner({
        organization,
        userId,
        isDisabled: true,
      });
      getCampaignStub.withArgs(campaign.code).resolves(campaign);
      organizationLearnerReceivedStub
        .withArgs({ userId, organizationId: organization.id })
        .resolves(disabledOrganizationLearner);

      // when
      const result = await catchErr(findAssociationBetweenUserAndOrganizationLearner)({
        authenticatedUserId: userId,
        requestedUserId: userId,
        campaignCode: campaign.code,
        campaignRepository,
        registrationOrganizationLearnerRepository,
      });

      // then
      expect(result).to.be.instanceof(OrganizationLearnerDisabledError);
    });
  });

  describe('The authenticated user is not the same as requested user', function () {
    it('should return the repositories error', async function () {
      // given
      getCampaignStub.withArgs(campaign.code).resolves(campaign);
      organizationLearnerReceivedStub.withArgs({ userId, organizationId: organization.id }).resolves(null);

      // when
      const result = await catchErr(findAssociationBetweenUserAndOrganizationLearner)({
        authenticatedUserId: '999',
        requestedUserId: userId,
        campaignCode: campaign.code,
        campaignRepository,
        registrationOrganizationLearnerRepository,
      });

      // then
      expect(result).to.be.instanceof(UserNotAuthorizedToAccessEntityError);
    });
  });

  describe('There is no campaign with the given code', function () {
    it('should throw a campaign code error', async function () {
      // given
      getCampaignStub.withArgs(campaign.code).resolves(null);

      // when
      const result = await catchErr(findAssociationBetweenUserAndOrganizationLearner)({
        authenticatedUserId: userId,
        requestedUserId: userId,
        campaignCode: campaign.code,
        campaignRepository,
        registrationOrganizationLearnerRepository,
      });

      // then
      expect(result).to.be.instanceof(CampaignCodeError);
    });
  });
});
