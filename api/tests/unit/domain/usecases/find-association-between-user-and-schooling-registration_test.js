const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const SchoolingRegistration = require('../../../../lib/domain/models/SchoolingRegistration');
const {
  CampaignCodeError,
  UserNotAuthorizedToAccessEntityError,
  SchoolingRegistrationDisabledError,
} = require('../../../../lib/domain/errors');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const schoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/schooling-registration-repository');

describe('Unit | UseCase | find-association-between-user-and-schooling-registration', function () {
  let schoolingRegistrationReceivedStub;
  let getCampaignStub;
  let organizationLearner;
  let organization;
  let userId;
  let campaign;

  beforeEach(function () {
    userId = domainBuilder.buildUser().id;
    organization = domainBuilder.buildOrganization();
    campaign = domainBuilder.buildCampaign({ organization });
    organizationLearner = domainBuilder.buildOrganizationLearner({ organization, userId });
    getCampaignStub = sinon.stub(campaignRepository, 'getByCode').throws('unexpected call');
    schoolingRegistrationReceivedStub = sinon
      .stub(schoolingRegistrationRepository, 'findOneByUserIdAndOrganizationId')
      .throws('unexpected call');
  });

  describe('There is a schoolingRegistration linked to the given userId', function () {
    it('should call findOneByUserIdAndOrganizationId', async function () {
      // given
      getCampaignStub.withArgs(campaign.code).resolves(campaign);
      schoolingRegistrationReceivedStub.resolves({});

      // when
      await usecases.findAssociationBetweenUserAndSchoolingRegistration({
        authenticatedUserId: userId,
        requestedUserId: userId,
        campaignCode: campaign.code,
      });

      // then
      expect(schoolingRegistrationReceivedStub).to.have.been.calledOnce;
    });

    it('should return the schoolingRegistration', async function () {
      // given
      getCampaignStub.withArgs(campaign.code).resolves(campaign);
      schoolingRegistrationReceivedStub
        .withArgs({ userId, organizationId: organization.id })
        .resolves(organizationLearner);

      // when
      const result = await usecases.findAssociationBetweenUserAndSchoolingRegistration({
        authenticatedUserId: userId,
        requestedUserId: userId,
        campaignCode: campaign.code,
      });

      // then
      expect(result).to.be.deep.equal(organizationLearner);
      expect(result).to.be.instanceof(SchoolingRegistration);
    });
  });

  describe('There is no schoolingRegistration linked to the given userId', function () {
    it('should return null', async function () {
      // given
      getCampaignStub.withArgs(campaign.code).resolves(campaign);
      schoolingRegistrationReceivedStub.withArgs({ userId, organizationId: organization.id }).resolves(null);

      // when
      const result = await usecases.findAssociationBetweenUserAndSchoolingRegistration({
        authenticatedUserId: userId,
        requestedUserId: userId,
        campaignCode: campaign.code,
      });

      // then
      expect(result).to.equal(null);
    });
  });

  describe('There is a disabled schoolingRegistration linked to the given userId', function () {
    it('should throw an error', async function () {
      // given
      const disabledOrganizationLearner = domainBuilder.buildOrganizationLearner({
        organization,
        userId,
        isDisabled: true,
      });
      getCampaignStub.withArgs(campaign.code).resolves(campaign);
      schoolingRegistrationReceivedStub
        .withArgs({ userId, organizationId: organization.id })
        .resolves(disabledOrganizationLearner);

      // when
      const result = await catchErr(usecases.findAssociationBetweenUserAndSchoolingRegistration)({
        authenticatedUserId: userId,
        requestedUserId: userId,
        campaignCode: campaign.code,
      });

      // then
      expect(result).to.be.instanceof(SchoolingRegistrationDisabledError);
    });
  });

  describe('The authenticated user is not the same as requested user', function () {
    it('should return the repositories error', async function () {
      // given
      getCampaignStub.withArgs(campaign.code).resolves(campaign);
      schoolingRegistrationReceivedStub.withArgs({ userId, organizationId: organization.id }).resolves(null);

      // when
      const result = await catchErr(usecases.findAssociationBetweenUserAndSchoolingRegistration)({
        authenticatedUserId: '999',
        requestedUserId: userId,
        campaignCode: campaign.code,
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
      const result = await catchErr(usecases.findAssociationBetweenUserAndSchoolingRegistration)({
        authenticatedUserId: userId,
        requestedUserId: userId,
        campaignCode: campaign.code,
      });

      // then
      expect(result).to.be.instanceof(CampaignCodeError);
    });
  });
});
