const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const SchoolingRegistration = require('../../../../lib/domain/models/SchoolingRegistration');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const schoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/schooling-registration-repository');
const { CampaignCodeError, UserCouldNotBeReconciledError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | reconcile-user-to-organization', () => {

  let reconcileUserByNationalStudentIdAndOrganizationIdStub;
  let campaignCode;
  let findByUserIdStub;
  let getCampaignStub;
  let schoolingRegistration;
  let userId;
  const organizationId = 1;
  const schoolingRegistrationId = 1;
  const nationalStudentId = '123456789AZ';

  beforeEach(() => {
    campaignCode = 'ABCD12';
    userId = domainBuilder.buildUser().id;
    schoolingRegistration = domainBuilder.buildSchoolingRegistration({ organizationId, id: schoolingRegistrationId, nationalStudentId });

    getCampaignStub = sinon.stub(campaignRepository, 'getByCode')
      .withArgs(campaignCode)
      .resolves({ organizationId });

    reconcileUserByNationalStudentIdAndOrganizationIdStub = sinon.stub(schoolingRegistrationRepository, 'reconcileUserByNationalStudentIdAndOrganizationId');
    findByUserIdStub = sinon.stub(schoolingRegistrationRepository, 'findByUserId');
  });

  context('When there is no campaign with the given code', () => {

    it('should throw a campaign code error', async () => {
      // given
      getCampaignStub.withArgs(campaignCode).resolves(null);

      // when
      const result = await catchErr(usecases.reconcileUserToOrganization)({
        userId,
        campaignCode,
      });

      // then
      expect(result).to.be.instanceof(CampaignCodeError);
    });
  });

  context('When no schoolingRegistration is found by userId', () => {

    it('should throw a UserCouldNotBeReconcile error', async () => {
      // given
      findByUserIdStub.resolves([]);

      // when
      const result = await catchErr(usecases.reconcileUserToOrganization)({
        userId,
        campaignCode,
      });

      // then
      expect(result).to.be.instanceof(UserCouldNotBeReconciledError);
      expect(result.message).to.equal('Cet utilisateur n\'a pas pu être rattaché à une organisation.');
    });
  });

  context('When no schoolingRegistration is found by organizationId', () => {

    it('should throw a UserCouldNotBeReconcile error', async () => {
      // given
      findByUserIdStub.resolves([schoolingRegistration]);
      reconcileUserByNationalStudentIdAndOrganizationIdStub.throws(new UserCouldNotBeReconciledError());

      // when
      const result = await catchErr(usecases.reconcileUserToOrganization)({
        userId,
        campaignCode,
      });

      // then
      expect(result).to.be.instanceof(UserCouldNotBeReconciledError);
      expect(result.message).to.equal('Cet utilisateur n\'a pas pu être rattaché à une organisation.');
    });
  });

  context('When no schoolingRegistration is found by nationalStudentId', () => {

    it('should throw a UserCouldNotBeReconcile error', async () => {
      // given
      findByUserIdStub.resolves([schoolingRegistration]);
      reconcileUserByNationalStudentIdAndOrganizationIdStub.throws(new UserCouldNotBeReconciledError());

      // when
      const result = await catchErr(usecases.reconcileUserToOrganization)({
        userId,
        campaignCode,
      });

      // then
      expect(result).to.be.instanceof(UserCouldNotBeReconciledError);
      expect(result.message).to.equal('Cet utilisateur n\'a pas pu être rattaché à une organisation.');
    });
  });

  context('When schoolingRegistration is found', () => {

    it('should use nationalStudentId of more recent schoolingRegistration', async () => {
      // given
      const schoolingRegistrationInOtherOrganization = domainBuilder.buildSchoolingRegistration({ userId, updatedAt: '2020-07-10' });
      const mostRecentSchoolinRegistrationInOtherOrganization = domainBuilder.buildSchoolingRegistration({ userId, nationalStudentId, updatedAt: '2020-07-20' });
      findByUserIdStub.resolves([schoolingRegistrationInOtherOrganization, mostRecentSchoolinRegistrationInOtherOrganization]);
      reconcileUserByNationalStudentIdAndOrganizationIdStub.withArgs({
        userId,
        nationalStudentId,
        organizationId,
      }).resolves(schoolingRegistration);

      // when
      const result = await usecases.reconcileUserToOrganization({
        userId,
        campaignCode,
      });

      // then
      expect(result).to.be.instanceOf(SchoolingRegistration);
      expect(result).to.be.equal(schoolingRegistration);
    });
  });
});
