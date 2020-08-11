const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const SchoolingRegistration = require('../../../../lib/domain/models/SchoolingRegistration');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const schoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/schooling-registration-repository');

const { CampaignCodeError, NotFoundError, SchoolingRegistrationAlreadyLinkedToUserError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | reconcile-user-to-schooling-registration-data', () => {

  let reconcileUserToSchoolingRegistrationStub;
  let campaignCode;
  let checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizationsStub;
  let findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUserStub;
  let getOrganizationStub;

  let getCampaignStub;
  let schoolingRegistration;
  let user;
  const organizationId = 1;
  const schoolingRegistrationId = 1;

  beforeEach(() => {
    campaignCode = 'ABCD12';
    schoolingRegistration = domainBuilder.buildSchoolingRegistration({ organizationId, id: schoolingRegistrationId });
    user = {
      id: 1,
      firstName: 'Joe',
      lastName: 'Poe',
      birthdate: '02/02/1992',
    };

    getCampaignStub = sinon.stub(campaignRepository, 'getByCode')
      .withArgs(campaignCode)
      .resolves({ organizationId });

    reconcileUserToSchoolingRegistrationStub = sinon.stub(schoolingRegistrationRepository, 'reconcileUserToSchoolingRegistration');
    findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUserStub = sinon.stub(userReconciliationService,'findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser');
    checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizationsStub = sinon.stub(userReconciliationService,'checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizations');
    getOrganizationStub = sinon.stub(organizationRepository,'get');
  });

  context('When there is no campaign with the given code', () => {

    it('should throw a campaign code error', async () => {
      // given
      getCampaignStub.withArgs(campaignCode).resolves(null);

      // when
      const result = await catchErr(usecases.reconcileUserToSchoolingRegistrationData)({
        reconciliationInfo: user,
        campaignCode
      });

      // then
      expect(result).to.be.instanceof(CampaignCodeError);
    });
  });

  context('When no schoolingRegistration found', () => {

    it('should throw a Not Found error', async () => {
      // given
      findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUserStub.throws(new NotFoundError('Error message'));

      // when
      const result = await catchErr(usecases.reconcileUserToSchoolingRegistrationData)({
        reconciliationInfo: user,
        campaignCode,
      });

      // then
      expect(result).to.be.instanceof(NotFoundError);
      expect(result.message).to.equal('Error message');
    });
  });

  context('When organization is SCO', () => {
    beforeEach(() => {
      getOrganizationStub.resolves({ type: 'SCO' });
    });

    context('When student is already reconciled in others organizations', () => {

      it('should return a SchoolingRegistrationAlreadyLinkedToUser error', async () => {
        // given
        schoolingRegistration.userId = user.id;
        schoolingRegistration.firstName = user.firstName;
        schoolingRegistration.lastName = user.lastName;
        const exceptedErrorMEssage = 'Un compte existe déjà pour l\'élève dans un autre établissement.';
        findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUserStub.resolves(schoolingRegistration);
        checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizationsStub.throws(new SchoolingRegistrationAlreadyLinkedToUserError(exceptedErrorMEssage));
        reconcileUserToSchoolingRegistrationStub.withArgs({ userId: user.id, schoolingRegistrationId }).resolves(schoolingRegistration);

        // when
        const result = await catchErr(usecases.reconcileUserToSchoolingRegistrationData)({
          reconciliationInfo: user,
          campaignCode,
        });

        // then
        expect(result).to.be.instanceof(SchoolingRegistrationAlreadyLinkedToUserError);
        expect(result.message).to.equal(exceptedErrorMEssage);
      });
    });
  });

  context('When one schoolingRegistration matched on names', () => {

    it('should associate user with schoolingRegistration', async () => {
      // given
      schoolingRegistration.userId = user.id;
      schoolingRegistration.firstName = user.firstName;
      schoolingRegistration.lastName = user.lastName;
      findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUserStub.resolves(schoolingRegistration);
      checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizationsStub.resolves();
      reconcileUserToSchoolingRegistrationStub.withArgs({ userId: user.id, schoolingRegistrationId }).resolves(schoolingRegistration);
      getOrganizationStub.resolves({ type: 'SUP' });

      // when
      const result = await usecases.reconcileUserToSchoolingRegistrationData({
        reconciliationInfo: user,
        campaignCode,
      });

      // then
      expect(result).to.be.instanceOf(SchoolingRegistration);
      expect(result.userId).to.be.equal(user.id);
    });
  });
});
