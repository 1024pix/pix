const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { generateUsername } = require('../../../../lib/domain/usecases');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');
const obfuscationService = require('../../../../lib/domain/services/obfuscation-service');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const schoolingRegistrationRepository = require ('../../../../lib/infrastructure/repositories/schooling-registration-repository');
const studentRepository = require ('../../../../lib/infrastructure/repositories/student-repository');
const userRepository = require ('../../../../lib/infrastructure/repositories/user-repository');

const Student = require('../../../../lib/domain/models/Student');
const { CampaignCodeError, SchoolingRegistrationNotFound, SchoolingRegistrationAlreadyLinkedToUserError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | generate-username', () => {

  const organizationId = 1;

  let campaignCode;
  let createUsernameByUser;
  let findByOrganizationIdAndBirthdateStub;
  let findMatchingCandidateIdForGivenUserStub;
  let getCampaignStub;
  let getReconciledStudentByNationalStudentdStub;
  let getForObfuscationStub;
  let getUserAuthenticationMethodWithObfuscationStub;
  let studentInformation;
  let schoolingRegistration;

  const schoolingRegistrationId = 1;

  beforeEach(() => {
    campaignCode = 'RESTRICTD';

    schoolingRegistration = domainBuilder.buildSchoolingRegistration({ organizationId, id: schoolingRegistrationId });
    studentInformation = {
      id: 1,
      firstName: 'Joe',
      lastName: 'Poe',
      birthdate: '1992-02-02',
    };

    getCampaignStub = sinon.stub(campaignRepository, 'getByCode')
      .withArgs(campaignCode)
      .resolves({ organizationId });
    getForObfuscationStub = sinon.stub(userRepository, 'getForObfuscation');
    findByOrganizationIdAndBirthdateStub = sinon.stub(schoolingRegistrationRepository, 'findByOrganizationIdAndBirthdate');
    getReconciledStudentByNationalStudentdStub = sinon.stub(studentRepository, 'getReconciledStudentByNationalStudentId');
    getUserAuthenticationMethodWithObfuscationStub = sinon.stub(obfuscationService,'getUserAuthenticationMethodWithObfuscation');
    findMatchingCandidateIdForGivenUserStub = sinon.stub(userReconciliationService,'findMatchingCandidateIdForGivenUser');
    createUsernameByUser = sinon.stub(userReconciliationService,'createUsernameByUser');
  });

  context('When there is no campaign with the given code', () => {

    it('should throw a campaign code error', async () => {
      // given
      getCampaignStub.withArgs(campaignCode).resolves(null);

      // when
      const result = await catchErr(generateUsername)({
        studentInformation,
        campaignCode,
      });

      // then
      expect(result).to.be.instanceof(CampaignCodeError);
    });
  });

  context('When no schoolingRegistration found matching organization and birthdate', () => {

    it('should throw a SchoolingRegistrationNotFound error', async () => {
      // given
      findByOrganizationIdAndBirthdateStub.resolves([]);

      // when
      const result = await catchErr(generateUsername)({
        studentInformation,
        campaignCode,
      });

      // then
      expect(result).to.be.instanceof(SchoolingRegistrationNotFound);
      expect(result.message).to.equal('There were no schoolingRegistrations matching with organization and birthdate');
    });
  });

  context('When no schoolingRegistration found matching with firstname and lastname', () => {

    it('should throw a SchoolingRegistrationNotFound error', async () => {
      // given
      findByOrganizationIdAndBirthdateStub.resolves([schoolingRegistration]);
      findMatchingCandidateIdForGivenUserStub.withArgs([schoolingRegistration], studentInformation).resolves();

      // when
      const result = await catchErr(generateUsername)({
        studentInformation,
        campaignCode,
      });

      // then
      expect(result).to.be.instanceof(SchoolingRegistrationNotFound);
      expect(result.message).to.equal('There were no schoolingRegistrations matching with names');
    });
  });

  context('When student is already reconciled in the same organization', () => {

    it('should return a SchoolingRegistrationAlreadyLinkedToUser error', async () => {
      // given
      schoolingRegistration.userId = studentInformation.id;
      schoolingRegistration.firstName = studentInformation.firstName;
      schoolingRegistration.lastName = studentInformation.lastName;
      const exceptedErrorMEssage = 'Un compte existe déjà pour l‘élève dans le même établissement.';

      findByOrganizationIdAndBirthdateStub.resolves([schoolingRegistration]);
      findMatchingCandidateIdForGivenUserStub.resolves(schoolingRegistration.id);
      getForObfuscationStub.resolves();
      getUserAuthenticationMethodWithObfuscationStub.resolves({  authenticatedBy: 'email', value: 'e***@example.net' });

      // when
      const result = await catchErr(generateUsername)({
        studentInformation,
        campaignCode,
      });

      // then
      expect(result).to.be.instanceof(SchoolingRegistrationAlreadyLinkedToUserError);
      expect(result.message).to.equal(exceptedErrorMEssage);
    });
  });

  context('When student is already reconciled in others organizations', () => {

    it('should return a SchoolingRegistrationAlreadyLinkedToUser error', async () => {
      // given
      schoolingRegistration.firstName = studentInformation.firstName;
      schoolingRegistration.lastName = studentInformation.lastName;
      const exceptedErrorMEssage = 'Un compte existe déjà pour l‘élève dans un autre établissement.';
      findByOrganizationIdAndBirthdateStub.resolves([schoolingRegistration]);
      findMatchingCandidateIdForGivenUserStub.resolves(schoolingRegistration.id);
      const student = new Student({ account: { userId: studentInformation.id } });
      getReconciledStudentByNationalStudentdStub.resolves(student);
      getForObfuscationStub.resolves();
      getUserAuthenticationMethodWithObfuscationStub.resolves({  authenticatedBy: 'email', value: 'e***@example.net' });

      // when
      const result = await catchErr(generateUsername)({
        studentInformation,
        campaignCode,
      });

      // then
      expect(result).to.be.instanceof(SchoolingRegistrationAlreadyLinkedToUserError);
      expect(result.message).to.equal(exceptedErrorMEssage);
    });
  });

  context('When schoolingRegistration matched and student is not already reconciled', () => {

    it('should return username', async () => {
      // given
      const username = studentInformation.firstName + '.' + studentInformation.lastName + '0112';
      findByOrganizationIdAndBirthdateStub.resolves([schoolingRegistration]);
      findMatchingCandidateIdForGivenUserStub.resolves(schoolingRegistration.id);
      createUsernameByUser.resolves(username);

      // when
      const result = await generateUsername({
        studentInformation,
        campaignCode,
      });

      // then
      expect(result).to.be.equal(username);
    });
  });

});
