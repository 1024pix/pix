const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const SchoolingRegistration = require('../../../../lib/domain/models/SchoolingRegistration');
const { CampaignCodeError, UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const schoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/schooling-registration-repository');

describe('Unit | UseCase | find-association-between-user-and-schooling-registration', () => {

  let schoolingRegistrationReceivedStub;
  let getCampaignStub;
  let schoolingRegistration;
  let organizationId;
  let userId;
  let campaignCode;

  beforeEach(() => {
    userId = domainBuilder.buildUser().id;
    organizationId = domainBuilder.buildOrganization().id;
    campaignCode = domainBuilder.buildCampaign({ organizationId }).code;
    schoolingRegistration = domainBuilder.buildSchoolingRegistration({ organizationId, userId });
    getCampaignStub = sinon.stub(campaignRepository, 'getByCode').throws('unexpected call');
    schoolingRegistrationReceivedStub = sinon.stub(schoolingRegistrationRepository, 'findOneByUserIdAndOrganizationId').throws('unexpected call');
  });

  describe('There is a schoolingRegistration linked to the given userId', () => {

    it('should call findOneByUserIdAndOrganizationId', async () => {
      // given
      getCampaignStub.withArgs(campaignCode).resolves({ organizationId });
      schoolingRegistrationReceivedStub.resolves({});

      // when
      await usecases.findAssociationBetweenUserAndSchoolingRegistration({ authenticatedUserId: userId, requestedUserId: userId, campaignCode });

      // then
      expect(schoolingRegistrationReceivedStub).to.have.been.calledOnce;
    });

    it('should return the schoolingRegistration', async () => {
      // given
      getCampaignStub.withArgs(campaignCode).resolves({ organizationId });
      schoolingRegistrationReceivedStub.withArgs({ userId, organizationId }).resolves(schoolingRegistration);

      // when
      const result = await usecases.findAssociationBetweenUserAndSchoolingRegistration({ authenticatedUserId: userId, requestedUserId: userId, campaignCode });

      // then
      expect(result).to.be.deep.equal(schoolingRegistration);
      expect(result).to.be.instanceof(SchoolingRegistration);
    });
  });

  describe('There is no schoolingRegistration linked to the given userId', () => {

    it('should return the repositories returns', async () => {
      // given
      getCampaignStub.withArgs(campaignCode).resolves({ organizationId });
      schoolingRegistrationReceivedStub.withArgs({ userId, organizationId }).resolves(null);

      // when
      const result = await usecases.findAssociationBetweenUserAndSchoolingRegistration({ authenticatedUserId: userId, requestedUserId: userId, campaignCode });

      // then
      expect(result).to.equal(null);
    });
  });

  describe('The authenticated user is not the same as requested user', () => {

    it('should return the repositories error', async () => {
      // given
      getCampaignStub.withArgs(campaignCode).resolves({ organizationId });
      schoolingRegistrationReceivedStub.withArgs({ userId, organizationId }).resolves(null);

      // when
      const result = await catchErr(usecases.findAssociationBetweenUserAndSchoolingRegistration)({ authenticatedUserId: '999', requestedUserId: userId, campaignCode });

      // then
      expect(result).to.be.instanceof(UserNotAuthorizedToAccessEntity);
    });
  });

  describe('There is no campaign with the given code', () => {

    it('should throw a campaign code error', async () => {
      // given
      getCampaignStub.withArgs(campaignCode).resolves(null);

      // when
      const result = await catchErr(usecases.findAssociationBetweenUserAndSchoolingRegistration)({ authenticatedUserId: userId, requestedUserId: userId, campaignCode });

      // then
      expect(result).to.be.instanceof(CampaignCodeError);
    });
  });
});
