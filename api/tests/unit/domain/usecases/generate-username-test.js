const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { generateUsername } = require('../../../../lib/domain/usecases');

const Student = require('../../../../lib/domain/models/Student');
const { CampaignCodeError, SchoolingRegistrationNotFound, SchoolingRegistrationAlreadyLinkedToUserError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | generate-username', () => {

  const organizationId = 1;
  const schoolingRegistrationId = 1;

  let campaignRepository;
  let userRepository;
  let schoolingRegistrationRepository;
  let studentRepository;

  let obfuscationService;
  let userReconciliationService;

  let campaignCode;
  let studentInformation;
  let schoolingRegistration;

  beforeEach(() => {
    campaignCode = 'RESTRICTD';

    schoolingRegistration = domainBuilder.buildSchoolingRegistration({ organizationId, id: schoolingRegistrationId });
    studentInformation = {
      id: 1,
      firstName: 'Joe',
      lastName: 'Poe',
      birthdate: '1992-02-02',
    };

    campaignRepository = {
      getByCode: sinon.stub(),
    };
    userRepository = {
      getForObfuscation: sinon.stub(),
    };
    schoolingRegistrationRepository = {
      findByOrganizationIdAndBirthdate: sinon.stub(),
    };
    studentRepository = {
      getReconciledStudentByNationalStudentId: sinon.stub(),
    };
    obfuscationService = {
      getUserAuthenticationMethodWithObfuscation: sinon.stub(),
    };
    userReconciliationService = {
      findMatchingCandidateIdForGivenUser: sinon.stub(),
      createUsernameByUser: sinon.stub(),
    };

    campaignRepository.getByCode
      .withArgs(campaignCode)
      .resolves(domainBuilder.buildCampaign({ organization: { id: organizationId } }));

  });

  context('When there is no campaign with the given code', () => {

    it('should throw a campaign code error', async () => {
      // given
      campaignRepository.getByCode.withArgs(campaignCode).resolves(null);

      // when
      const result = await catchErr(generateUsername)({
        studentInformation,
        campaignCode,
        campaignRepository,
        schoolingRegistrationRepository,
        userReconciliationService,
        obfuscationService,
        userRepository,
        studentRepository,
      });

      // then
      expect(result).to.be.instanceof(CampaignCodeError);
    });
  });

  context('When no schoolingRegistration found matching organization and birthdate', () => {

    it('should throw a SchoolingRegistrationNotFound error', async () => {
      // given
      schoolingRegistrationRepository.findByOrganizationIdAndBirthdate.resolves([]);

      // when
      const result = await catchErr(generateUsername)({
        studentInformation,
        campaignCode,
        campaignRepository,
        schoolingRegistrationRepository,
        userReconciliationService,
        obfuscationService,
        userRepository,
        studentRepository,
      });

      // then
      expect(result).to.be.instanceof(SchoolingRegistrationNotFound);
      expect(result.message).to.equal('There were no schoolingRegistrations matching with organization and birthdate');
    });
  });

  context('When no schoolingRegistration found matching with firstname and lastname', () => {

    it('should throw a SchoolingRegistrationNotFound error', async () => {
      // given
      schoolingRegistrationRepository.findByOrganizationIdAndBirthdate.resolves([schoolingRegistration]);
      userReconciliationService.findMatchingCandidateIdForGivenUser.withArgs([schoolingRegistration], studentInformation).resolves();

      // when
      const result = await catchErr(generateUsername)({
        studentInformation,
        campaignCode,
        campaignRepository,
        schoolingRegistrationRepository,
        userReconciliationService,
        obfuscationService,
        userRepository,
        studentRepository,
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
      const exceptedErrorMessage = 'Un compte existe déjà pour l‘élève dans le même établissement.';

      schoolingRegistrationRepository.findByOrganizationIdAndBirthdate.resolves([schoolingRegistration]);
      userReconciliationService.findMatchingCandidateIdForGivenUser.resolves(schoolingRegistration.id);
      userRepository.getForObfuscation.resolves();
      obfuscationService.getUserAuthenticationMethodWithObfuscation.resolves({ authenticatedBy: 'email', value: 'e***@example.net' });

      // when
      const result = await catchErr(generateUsername)({
        studentInformation,
        campaignCode,
        campaignRepository,
        schoolingRegistrationRepository,
        userReconciliationService,
        obfuscationService,
        userRepository,
        studentRepository,
      });

      // then
      expect(result).to.be.instanceof(SchoolingRegistrationAlreadyLinkedToUserError);
      expect(result.message).to.equal(exceptedErrorMessage);
    });
  });

  context('When student is already reconciled in others organizations', () => {

    it('should return a SchoolingRegistrationAlreadyLinkedToUser error', async () => {
      // given
      schoolingRegistration.firstName = studentInformation.firstName;
      schoolingRegistration.lastName = studentInformation.lastName;
      const exceptedErrorMessage = 'Un compte existe déjà pour l‘élève dans un autre établissement.';
      schoolingRegistrationRepository.findByOrganizationIdAndBirthdate.resolves([schoolingRegistration]);
      userReconciliationService.findMatchingCandidateIdForGivenUser.resolves(schoolingRegistration.id);
      const student = new Student({ account: { userId: studentInformation.id } });
      studentRepository.getReconciledStudentByNationalStudentId.resolves(student);
      userRepository.getForObfuscation.resolves();
      obfuscationService.getUserAuthenticationMethodWithObfuscation.resolves({ authenticatedBy: 'email', value: 'e***@example.net' });

      // when
      const result = await catchErr(generateUsername)({
        studentInformation,
        campaignCode,
        campaignRepository,
        schoolingRegistrationRepository,
        userReconciliationService,
        obfuscationService,
        userRepository,
        studentRepository,
      });

      // then
      expect(result).to.be.instanceof(SchoolingRegistrationAlreadyLinkedToUserError);
      expect(result.message).to.equal(exceptedErrorMessage);
    });
  });

  context('When schoolingRegistration matched and student is not already reconciled', () => {

    it('should return username', async () => {
      // given
      const username = studentInformation.firstName + '.' + studentInformation.lastName + '0112';
      schoolingRegistrationRepository.findByOrganizationIdAndBirthdate.resolves([schoolingRegistration]);
      userReconciliationService.findMatchingCandidateIdForGivenUser.resolves(schoolingRegistration.id);
      userReconciliationService.createUsernameByUser.resolves(username);

      // when
      const result = await generateUsername({
        studentInformation,
        campaignCode,
        campaignRepository,
        schoolingRegistrationRepository,
        userReconciliationService,
        obfuscationService,
        userRepository,
        studentRepository,
      });

      // then
      expect(result).to.be.equal(username);
    });
  });
});
