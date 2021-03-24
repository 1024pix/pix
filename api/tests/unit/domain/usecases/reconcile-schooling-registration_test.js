const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const SchoolingRegistration = require('../../../../lib/domain/models/SchoolingRegistration');

const { CampaignCodeError, NotFoundError, SchoolingRegistrationAlreadyLinkedToUserError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | reconcile-schooling-registration', function() {

  let campaignCode;

  let campaignRepository;
  let schoolingRegistrationRepository;
  let userReconciliationService;

  let schoolingRegistration;
  let user;
  const organizationId = 1;
  const schoolingRegistrationId = 1;

  beforeEach(function() {
    campaignCode = 'ABCD12';
    schoolingRegistration = domainBuilder.buildSchoolingRegistration({ organizationId, id: schoolingRegistrationId });
    user = {
      id: 1,
      firstName: 'Joe',
      lastName: 'Poe',
      birthdate: '02/02/1992',
    };

    campaignRepository = {
      getByCode: sinon.stub(),
    };
    schoolingRegistrationRepository = {
      reconcileUserToSchoolingRegistration: sinon.stub(),
      findOneByUserIdAndOrganizationId: sinon.stub(),
    };
    userReconciliationService = {
      findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser: sinon.stub(),
      checkIfStudentHasAnAlreadyReconciledAccount: sinon.stub(),
    };
  });

  context('When there is no campaign with the given code', function() {

    it('should throw a campaign code error', async function() {
      // given
      campaignRepository.getByCode.withArgs(campaignCode).resolves(null);

      // when
      const result = await catchErr(usecases.reconcileSchoolingRegistration)({
        reconciliationInfo: user,
        campaignCode,
        campaignRepository,
      });

      // then
      expect(result).to.be.instanceof(CampaignCodeError);
    });
  });

  context('When no schoolingRegistration found', function() {

    it('should throw a Not Found error', async function() {
      // given
      campaignRepository.getByCode.withArgs(campaignCode).resolves(domainBuilder.buildCampaign({ organization: { id: organizationId } }));
      userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser.throws(new NotFoundError('Error message'));

      // when
      const result = await catchErr(usecases.reconcileSchoolingRegistration)({
        reconciliationInfo: user,
        campaignCode,
        campaignRepository,
        userReconciliationService,
      });

      // then
      expect(result).to.be.instanceof(NotFoundError);
      expect(result.message).to.equal('Error message');
    });
  });

  context('When student has already a reconciled account', function() {

    it('should return a SchoolingRegistrationAlreadyLinkedToUser error', async function() {
      // given
      campaignRepository.getByCode.withArgs(campaignCode).resolves(domainBuilder.buildCampaign({ organization: { id: organizationId } }));
      userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser.resolves(schoolingRegistration);
      userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount.throws(new SchoolingRegistrationAlreadyLinkedToUserError());

      // when
      const result = await catchErr(usecases.reconcileSchoolingRegistration)({
        reconciliationInfo: user,
        campaignCode,
        campaignRepository,
        userReconciliationService,
      });

      // then
      expect(result).to.be.instanceof(SchoolingRegistrationAlreadyLinkedToUserError);
    });
  });

  context('When another student is already reconciled in the same organization and with the same user', function() {

    it('should return a SchoolingRegistrationAlreadyLinkedToUser error', async function() {
      // given
      schoolingRegistration.userId = user.id;
      schoolingRegistration.firstName = user.firstName;
      schoolingRegistration.lastName = user.lastName;

      const alreadyReconciledSchoolingRegistrationWithAnotherStudent = domainBuilder.buildSchoolingRegistration({ organizationId, userId: user.id });

      const exceptedErrorMessage = 'Un autre étudiant est déjà réconcilié dans la même organisation et avec le même compte utilisateur';
      campaignRepository.getByCode.withArgs(campaignCode).resolves(domainBuilder.buildCampaign({ organization: { id: organizationId } }));
      userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser.resolves(schoolingRegistration);
      userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount.resolves();
      schoolingRegistrationRepository.findOneByUserIdAndOrganizationId.withArgs({
        userId: user.id,
        organizationId,
      }).resolves(alreadyReconciledSchoolingRegistrationWithAnotherStudent);

      // when
      const result = await catchErr(usecases.reconcileSchoolingRegistration)({
        reconciliationInfo: user,
        campaignCode,
        campaignRepository,
        userReconciliationService,
        schoolingRegistrationRepository,
      });

      // then
      expect(result).to.be.instanceof(SchoolingRegistrationAlreadyLinkedToUserError);
      expect(result.message).to.equal(exceptedErrorMessage);
    });

  });

  context('When one schoolingRegistration matched on names', function() {

    it('should associate user with schoolingRegistration', async function() {
      // given
      const withReconciliation = true;
      schoolingRegistration.userId = user.id;
      schoolingRegistration.firstName = user.firstName;
      schoolingRegistration.lastName = user.lastName;
      campaignRepository.getByCode.withArgs(campaignCode).resolves(domainBuilder.buildCampaign({ organization: { id: organizationId } }));
      userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser.resolves(schoolingRegistration);
      userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount.resolves();
      schoolingRegistrationRepository.reconcileUserToSchoolingRegistration.withArgs({
        userId: user.id,
        schoolingRegistrationId,
      }).resolves(schoolingRegistration);

      // when
      const result = await usecases.reconcileSchoolingRegistration({
        reconciliationInfo: user,
        withReconciliation,
        campaignCode,
        campaignRepository,
        userReconciliationService,
        schoolingRegistrationRepository,
      });

      // then
      expect(result).to.be.instanceOf(SchoolingRegistration);
      expect(result.userId).to.be.equal(user.id);
    });
  });

  context('When withReconciliation is false', function() {

    it('should not associate user with schoolingRegistration', async function() {
      // given
      const withReconciliation = false;
      schoolingRegistration.userId = user.id;
      schoolingRegistration.firstName = user.firstName;
      schoolingRegistration.lastName = user.lastName;
      campaignRepository.getByCode.withArgs(campaignCode).resolves(domainBuilder.buildCampaign({ organization: { id: organizationId } }));
      userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser.resolves(schoolingRegistration);
      userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount.resolves();

      // when
      const result = await usecases.reconcileSchoolingRegistration({
        reconciliationInfo: user,
        withReconciliation,
        campaignCode,
        campaignRepository,
        userReconciliationService,
        schoolingRegistrationRepository,
      });

      // then
      expect(result).to.be.undefined;
      expect(schoolingRegistrationRepository.reconcileUserToSchoolingRegistration).to.not.have.been.called;
    });
  });
});
