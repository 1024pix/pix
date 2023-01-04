const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { generateUsername } = require('../../../../lib/domain/usecases');

const Student = require('../../../../lib/domain/models/Student');
const {
  CampaignCodeError,
  OrganizationLearnerNotFound,
  OrganizationLearnerAlreadyLinkedToUserError,
} = require('../../../../lib/domain/errors');

describe('Unit | UseCase | generate-username', function () {
  const organizationId = 1;
  const organizationLearnerId = 1;

  let campaignRepository;
  let userRepository;
  let organizationLearnerRepository;
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
    organizationLearnerRepository = {
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
        organizationLearnerRepository,
        userReconciliationService,
        obfuscationService,
        userRepository,
        studentRepository,
      });

      // then
      expect(result).to.be.instanceof(CampaignCodeError);
    });
  });

  context('When no organizationLearner found matching organization and birthdate', function () {
    it('should throw a OrganizationLearnerNotFound error', async function () {
      // given
      organizationLearnerRepository.findByOrganizationIdAndBirthdate.resolves([]);

      // when
      const result = await catchErr(generateUsername)({
        studentInformation,
        campaignCode,
        campaignRepository,
        organizationLearnerRepository,
        userReconciliationService,
        obfuscationService,
        userRepository,
        studentRepository,
      });

      // then
      expect(result).to.be.instanceof(OrganizationLearnerNotFound);
      expect(result.message).to.equal('There were no organizationLearners matching with organization and birthdate');
    });
  });

  context('When no organizationLearner found matching with firstname and lastname', function () {
    it('should throw a OrganizationLearnerNotFound error', async function () {
      // given
      organizationLearnerRepository.findByOrganizationIdAndBirthdate.resolves([organizationLearner]);
      userReconciliationService.findMatchingCandidateIdForGivenUser
        .withArgs([organizationLearner], studentInformation)
        .resolves();

      // when
      const result = await catchErr(generateUsername)({
        studentInformation,
        campaignCode,
        campaignRepository,
        organizationLearnerRepository,
        userReconciliationService,
        obfuscationService,
        userRepository,
        studentRepository,
      });

      // then
      expect(result).to.be.instanceof(OrganizationLearnerNotFound);
      expect(result.message).to.equal('There were no organizationLearners matching with names');
    });
  });

  context('When student is already reconciled in the same organization', function () {
    context('When connected with email', function () {
      it('should return a OrganizationLearnerAlreadyLinkedToUser error with a specific code', async function () {
        // given
        organizationLearner.userId = studentInformation.id;
        organizationLearner.firstName = studentInformation.firstName;
        organizationLearner.lastName = studentInformation.lastName;
        organizationLearnerRepository.findByOrganizationIdAndBirthdate.resolves([organizationLearner]);
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
          organizationLearnerRepository,
          userReconciliationService,
          obfuscationService,
          userRepository,
          studentRepository,
        });

        // then
        expect(result).to.be.instanceof(OrganizationLearnerAlreadyLinkedToUserError);
        expect(result.message).to.equal('Un compte existe déjà pour l‘élève dans le même établissement.');
        expect(result.code).to.equal('ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION');
        expect(result.meta).to.deep.equal({ shortCode: 'S51', value: 'e***@example.net' });
      });
    });

    context('When connected with username', function () {
      it('should return a OrganizationLearnerAlreadyLinkedToUser error with a specific code', async function () {
        // given
        organizationLearner.userId = studentInformation.id;
        organizationLearner.firstName = studentInformation.firstName;
        organizationLearner.lastName = studentInformation.lastName;
        organizationLearnerRepository.findByOrganizationIdAndBirthdate.resolves([organizationLearner]);
        userReconciliationService.findMatchingCandidateIdForGivenUser.resolves(organizationLearner.id);
        userRepository.getForObfuscation.resolves();
        obfuscationService.getUserAuthenticationMethodWithObfuscation.resolves({
          authenticatedBy: 'username',
          value: 'j***.h***2',
        });

        // when
        const result = await catchErr(generateUsername)({
          studentInformation,
          campaignCode,
          campaignRepository,
          organizationLearnerRepository,
          userReconciliationService,
          obfuscationService,
          userRepository,
          studentRepository,
        });

        // then
        expect(result).to.be.instanceof(OrganizationLearnerAlreadyLinkedToUserError);
        expect(result.message).to.equal('Un compte existe déjà pour l‘élève dans le même établissement.');
        expect(result.code).to.equal('ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION');
        expect(result.meta).to.deep.equal({ shortCode: 'S52', value: 'j***.h***2' });
      });
    });

    context('When connected with samlId', function () {
      it('should return a OrganizationLearnerAlreadyLinkedToUser error with a specific code', async function () {
        // given
        organizationLearner.userId = studentInformation.id;
        organizationLearner.firstName = studentInformation.firstName;
        organizationLearner.lastName = studentInformation.lastName;
        organizationLearnerRepository.findByOrganizationIdAndBirthdate.resolves([organizationLearner]);
        userReconciliationService.findMatchingCandidateIdForGivenUser.resolves(organizationLearner.id);
        userRepository.getForObfuscation.resolves();
        obfuscationService.getUserAuthenticationMethodWithObfuscation.resolves({
          authenticatedBy: 'samlId',
          value: null,
        });

        // when
        const result = await catchErr(generateUsername)({
          studentInformation,
          campaignCode,
          campaignRepository,
          organizationLearnerRepository,
          userReconciliationService,
          obfuscationService,
          userRepository,
          studentRepository,
        });

        // then
        expect(result).to.be.instanceof(OrganizationLearnerAlreadyLinkedToUserError);
        expect(result.message).to.equal('Un compte existe déjà pour l‘élève dans le même établissement.');
        expect(result.code).to.equal('ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION');
        expect(result.meta).to.deep.equal({ shortCode: 'S53', value: null });
      });
    });
  });

  context('When student is already reconciled in others organizations', function () {
    context('When connected with email', function () {
      it('should return a OrganizationLearnerAlreadyLinkedToUser error with specific error', async function () {
        // given
        organizationLearner.firstName = studentInformation.firstName;
        organizationLearner.lastName = studentInformation.lastName;
        organizationLearnerRepository.findByOrganizationIdAndBirthdate.resolves([organizationLearner]);
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
          organizationLearnerRepository,
          userReconciliationService,
          obfuscationService,
          userRepository,
          studentRepository,
        });

        // then
        expect(result).to.be.instanceof(OrganizationLearnerAlreadyLinkedToUserError);
        expect(result.message).to.equal('Un compte existe déjà pour l‘élève dans un autre établissement.');
        expect(result.code).to.equal('ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION');
        expect(result.meta).to.deep.equal({ shortCode: 'S61', value: 'e***@example.net' });
      });
    });

    context('When connected with username', function () {
      it('should return a OrganizationLearnerAlreadyLinkedToUser error with specific error', async function () {
        // given
        organizationLearner.firstName = studentInformation.firstName;
        organizationLearner.lastName = studentInformation.lastName;
        organizationLearnerRepository.findByOrganizationIdAndBirthdate.resolves([organizationLearner]);
        userReconciliationService.findMatchingCandidateIdForGivenUser.resolves(organizationLearner.id);
        const student = new Student({ account: { userId: studentInformation.id } });
        studentRepository.getReconciledStudentByNationalStudentId.resolves(student);
        userRepository.getForObfuscation.resolves();
        obfuscationService.getUserAuthenticationMethodWithObfuscation.resolves({
          authenticatedBy: 'username',
          value: 'j***.h***2',
        });

        // when
        const result = await catchErr(generateUsername)({
          studentInformation,
          campaignCode,
          campaignRepository,
          organizationLearnerRepository,
          userReconciliationService,
          obfuscationService,
          userRepository,
          studentRepository,
        });

        // then
        expect(result).to.be.instanceof(OrganizationLearnerAlreadyLinkedToUserError);
        expect(result.message).to.equal('Un compte existe déjà pour l‘élève dans un autre établissement.');
        expect(result.code).to.equal('ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION');
        expect(result.meta).to.deep.equal({ shortCode: 'S62', value: 'j***.h***2' });
      });
    });

    context('When connected with samlId', function () {
      it('should return a OrganizationLearnerAlreadyLinkedToUser error with specific error', async function () {
        // given
        organizationLearner.firstName = studentInformation.firstName;
        organizationLearner.lastName = studentInformation.lastName;
        organizationLearnerRepository.findByOrganizationIdAndBirthdate.resolves([organizationLearner]);
        userReconciliationService.findMatchingCandidateIdForGivenUser.resolves(organizationLearner.id);
        const student = new Student({ account: { userId: studentInformation.id } });
        studentRepository.getReconciledStudentByNationalStudentId.resolves(student);
        userRepository.getForObfuscation.resolves();
        obfuscationService.getUserAuthenticationMethodWithObfuscation.resolves({
          authenticatedBy: 'samlId',
          value: null,
        });

        // when
        const result = await catchErr(generateUsername)({
          studentInformation,
          campaignCode,
          campaignRepository,
          organizationLearnerRepository,
          userReconciliationService,
          obfuscationService,
          userRepository,
          studentRepository,
        });

        // then
        expect(result).to.be.instanceof(OrganizationLearnerAlreadyLinkedToUserError);
        expect(result.message).to.equal('Un compte existe déjà pour l‘élève dans un autre établissement.');
        expect(result.code).to.equal('ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION');
        expect(result.meta).to.deep.equal({ shortCode: 'S63', value: null });
      });
    });
  });

  context('When organizationLearner matched and student is not already reconciled', function () {
    it('should call createUsernameByUser with student information from database', async function () {
      // given
      organizationLearnerRepository.findByOrganizationIdAndBirthdate.resolves([organizationLearner]);
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
        organizationLearnerRepository,
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
