const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { generateUsername } = require('../../../../lib/domain/usecases');

const Student = require('../../../../lib/domain/models/Student');
const {
  CampaignCodeError,
  SchoolingRegistrationNotFound,
  SchoolingRegistrationAlreadyLinkedToUserError,
} = require('../../../../lib/domain/errors');

describe('Unit | UseCase | generate-username', function () {
  const organizationId = 1;
  const organizationLearnerId = 1;

  let campaignRepository;
  let userRepository;
  let schoolingRegistrationRepository;
  let studentRepository;

  let obfuscationService;
  let userReconciliationService;

  let campaignCode;
  let studentInformation;
  let organizationLearner;

  beforeEach(function () {
    campaignCode = 'RESTRICTD';

    organizationLearner = domainBuilder.buildOrganizationLearner({ organizationId, id: organizationLearnerId });
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

  context('When there is no campaign with the given code', function () {
    it('should throw a campaign code error', async function () {
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

  context('When no schoolingRegistration found matching organization and birthdate', function () {
    it('should throw a SchoolingRegistrationNotFound error', async function () {
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

  context('When no schoolingRegistration found matching with firstname and lastname', function () {
    it('should throw a SchoolingRegistrationNotFound error', async function () {
      // given
      schoolingRegistrationRepository.findByOrganizationIdAndBirthdate.resolves([organizationLearner]);
      userReconciliationService.findMatchingCandidateIdForGivenUser
        .withArgs([organizationLearner], studentInformation)
        .resolves();

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

  context('When student is already reconciled in the same organization', function () {
    it('should return a SchoolingRegistrationAlreadyLinkedToUser error', async function () {
      // given
      organizationLearner.userId = studentInformation.id;
      organizationLearner.firstName = studentInformation.firstName;
      organizationLearner.lastName = studentInformation.lastName;
      const exceptedErrorMessage = 'Un compte existe déjà pour l‘élève dans le même établissement.';

      schoolingRegistrationRepository.findByOrganizationIdAndBirthdate.resolves([organizationLearner]);
      userReconciliationService.findMatchingCandidateIdForGivenUser.resolves(organizationLearner.id);
      userRepository.getForObfuscation.resolves();
      obfuscationService.getUserAuthenticationMethodWithObfuscation.resolves({
        authenticatedBy: 'email',
        value: 'e***@example.net',
      });

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

  context('When student is already reconciled in others organizations', function () {
    it('should return a SchoolingRegistrationAlreadyLinkedToUser error', async function () {
      // given
      organizationLearner.firstName = studentInformation.firstName;
      organizationLearner.lastName = studentInformation.lastName;
      const exceptedErrorMessage = 'Un compte existe déjà pour l‘élève dans un autre établissement.';
      schoolingRegistrationRepository.findByOrganizationIdAndBirthdate.resolves([organizationLearner]);
      userReconciliationService.findMatchingCandidateIdForGivenUser.resolves(organizationLearner.id);
      const student = new Student({ account: { userId: studentInformation.id } });
      studentRepository.getReconciledStudentByNationalStudentId.resolves(student);
      userRepository.getForObfuscation.resolves();
      obfuscationService.getUserAuthenticationMethodWithObfuscation.resolves({
        authenticatedBy: 'email',
        value: 'e***@example.net',
      });

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

  context('When schoolingRegistration matched and student is not already reconciled', function () {
    it('should call createUsernameByUser with student information from database', async function () {
      // given
      schoolingRegistrationRepository.findByOrganizationIdAndBirthdate.resolves([organizationLearner]);
      userReconciliationService.findMatchingCandidateIdForGivenUser.resolves(organizationLearner.id);

      studentInformation = {
        firstName: organizationLearner.firstName,
        lastName: organizationLearner.lastName,
        birthdate: organizationLearner.birthdate,
      };

      // when
      await generateUsername({
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
      expect(userReconciliationService.createUsernameByUser).calledWith({ user: studentInformation, userRepository });
    });
  });
});
