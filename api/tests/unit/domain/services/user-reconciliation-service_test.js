const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');
const {
  NotFoundError, SchoolingRegistrationAlreadyLinkedToUserError, AlreadyRegisteredUsernameError,
} = require('../../../../lib/domain/errors');

describe('Unit | Service | user-reconciliation-service', () => {

  let schoolingRegistrations;

  beforeEach(() => {
    schoolingRegistrations = [
      domainBuilder.buildSchoolingRegistration({
        firstName: 'firstName',
        middleName: 'middleName',
        thirdName: 'thirdName',
        lastName: 'lastName',
        preferredLastName: 'preferredLastName',
      }),
      domainBuilder.buildSchoolingRegistration({
        firstName: 'secondRegistration_firstName',
        middleName: 'secondRegistration_middleName',
        thirdName: 'secondRegistration_thirdName',
        lastName: 'secondRegistration_lastName',
        preferredLastName: 'secondRegistration_preferredLastName',
      }),
    ];
  });

  describe('#findMatchingCandidateIdForGivenUser', () => {

    const user = {
      firstName: 'Joe',
      lastName: 'Poe',
    };

    context('When schoolingRegistration list is empty', () => {
      it('should return null', async () => {
        // when
        const result = await userReconciliationService.findMatchingCandidateIdForGivenUser([], user);

        // then
        expect(result).to.equal(null);
      });
    });

    context('When schoolingRegistration list is not empty', () => {

      context('When no schoolingRegistration matched on names', () => {

        it('should return null if name is completely different', async () => {
          // given
          user.firstName = 'Sam';

          schoolingRegistrations[0].firstName = 'Joe';
          schoolingRegistrations[0].lastName = user.lastName;

          // when
          const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

          // then
          expect(result).to.equal(null);
        });

        it('should return null if name is not close enough', async () => {
          // given
          user.firstName = 'Frédérique';

          schoolingRegistrations[0].firstName = 'Frédéric';
          schoolingRegistrations[0].lastName = user.lastName;

          // when
          const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

          // then
          expect(result).to.equal(null);
        });

      });

      context('When one schoolingRegistration matched on names', () => {

        context('When schoolingRegistration found based on his...', () => {

          it('...firstName', async () => {
            // given
            schoolingRegistrations[0].firstName = user.firstName;
            schoolingRegistrations[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });

          it('...middleName', async () => {
            // given
            schoolingRegistrations[0].middleName = user.firstName;
            schoolingRegistrations[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });

          it('...thirdName', async () => {
            // given
            schoolingRegistrations[0].thirdName = user.firstName;
            schoolingRegistrations[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });

          it('...lastName', async () => {
            // given
            schoolingRegistrations[0].firstName = user.firstName;
            schoolingRegistrations[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });

          it('...preferredLastName', async () => {
            // given
            schoolingRegistrations[0].firstName = user.firstName;
            schoolingRegistrations[0].preferredLastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });

          it('...firstName with empty middleName', async () => {
            // given
            schoolingRegistrations[0].firstName = user.firstName;
            schoolingRegistrations[0].middleName = null;
            schoolingRegistrations[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });

          it('...preferredLastName with empty lastName', async () => {
            // given
            schoolingRegistrations[0].firstName = user.firstName;
            schoolingRegistrations[0].preferredLastName = user.lastName;
            schoolingRegistrations[0].lastName = null;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });

          it('...lastName with empty preferredLastName', async () => {
            // given
            schoolingRegistrations[0].firstName = user.firstName;
            schoolingRegistrations[0].preferredLastName = null;
            schoolingRegistrations[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });
        });

        context('When schoolingRegistration found even if there is...', () => {

          it('...an accent', async () => {
            // given
            user.firstName = 'Joé';

            schoolingRegistrations[0].firstName = 'Joe';
            schoolingRegistrations[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });

          it('...a white space', async () => {
            // given
            user.firstName = 'Jo e';

            schoolingRegistrations[0].firstName = 'Joe';
            schoolingRegistrations[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });

          it('...a special character', async () => {
            // given
            user.firstName = 'Jo~e';

            schoolingRegistrations[0].firstName = 'Joe';
            schoolingRegistrations[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });

          it('...a mistake', async () => {
            // given
            user.firstName = 'Joey';

            schoolingRegistrations[0].firstName = 'Joe';
            schoolingRegistrations[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });
        });

        context('When multiple matches', () => {

          it('should prefer firstName over middleName', async () => {
            // given
            schoolingRegistrations[0].middleName = user.firstName;
            schoolingRegistrations[0].lastName = user.lastName;

            schoolingRegistrations[1].firstName = user.firstName;
            schoolingRegistrations[1].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[1].id);
          });

          it('should prefer middleName over thirdName', async () => {
            // given
            schoolingRegistrations[0].thirdName = user.firstName;
            schoolingRegistrations[0].lastName = user.lastName;

            schoolingRegistrations[1].middleName = user.firstName;
            schoolingRegistrations[1].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[1].id);
          });

          it('should prefer nobody with same lastName and preferredLastName', async () => {
            // given
            schoolingRegistrations[0].firstName = user.firstName;
            schoolingRegistrations[0].lastName = user.lastName;

            schoolingRegistrations[1].firstName = user.firstName;
            schoolingRegistrations[1].preferredLastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(null);
          });
        });

        context('When two schoolingRegistrations are close', () => {
          const twin1 = { firstName: 'allan', lastName: 'Poe' };
          const twin2 = { firstName: 'alian', lastName: 'Poe' };

          it('should prefer the firstName that match perfectly', async () => {
            // given
            schoolingRegistrations[0].firstName = twin1.firstName;
            schoolingRegistrations[0].lastName = twin1.lastName;
            schoolingRegistrations[1].firstName = twin2.firstName;
            schoolingRegistrations[1].lastName = twin2.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, twin1);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });
        });
      });
    });
  });

  describe('#findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser', () => {

    let user;
    let organizationId;
    let schoolingRegistrationRepositoryStub;

    beforeEach(() => {
      organizationId = domainBuilder.buildOrganization().id;
      schoolingRegistrationRepositoryStub = {
        findByOrganizationIdAndBirthdate: sinon.stub(),
      };
    });

    context('When schooling registrations are found for organization and birthdate', () => {

      beforeEach(() => {
        schoolingRegistrationRepositoryStub.findByOrganizationIdAndBirthdate.resolves(schoolingRegistrations);
      });

      context('When no schooling registrations matched on names', () => {

        it('should throw NotFoundError', async () => {
          // given
          user = {
            firstName: 'fakeFirstName',
            lastName: 'fakeLastName',
          };

          // when
          const result = await catchErr(userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser)({ organizationId, reconciliationInfo: user, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

          // then
          expect(result).to.be.instanceOf(NotFoundError);
          expect(result.message).to.equal('There were no schoolingRegistrations matching with names');
        });

      });

      context('When one schooling registration matched on names', () => {

        beforeEach(() => {
          user = {
            firstName: schoolingRegistrations[0].firstName,
            lastName: schoolingRegistrations[0].lastName,
          };
        });

        it('should return matched SchoolingRegistration', async () => {
          // when
          const result = await userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser({ organizationId, reconciliationInfo: user, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

          // then
          expect(result).to.equal(schoolingRegistrations[0]);
        });
      });
    });

    context('When no schooling registrations found', () => {

      beforeEach(() => {
        schoolingRegistrationRepositoryStub.findByOrganizationIdAndBirthdate.resolves([]);
      });

      it('should throw NotFoundError', async () => {
        // given
        user = {
          firstName: 'fakeFirstName',
          lastName: 'fakeLastName',
        };

        // when
        const result = await catchErr(userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser)({ organizationId, reconciliationInfo: user, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        expect(result).to.be.instanceOf(NotFoundError, 'There were no schoolingRegistrations matching');
      });
    });
  });

  describe('#findMatchingHigherSchoolingRegistrationIdForGivenOrganizationIdAndUser', () => {

    let user;
    let organizationId;
    let higherSchoolingRegistrationRepositoryStub;

    beforeEach(() => {
      organizationId = domainBuilder.buildOrganization().id;
      higherSchoolingRegistrationRepositoryStub = {
        findOneRegisteredByOrganizationIdAndUserData: sinon.stub(),
      };
    });

    context('When schooling registrations are found for organization and birthdate', () => {

      beforeEach(() => {
        higherSchoolingRegistrationRepositoryStub.findOneRegisteredByOrganizationIdAndUserData.resolves(schoolingRegistrations[0]);
      });

      context('When no schooling registrations matched on names', () => {

        it('should throw an error', async () => {
          // given
          user = {
            firstName: 'fakeFirstName',
            lastName: 'fakeLastName',
          };

          // when
          const error = await catchErr(userReconciliationService.findMatchingHigherSchoolingRegistrationIdForGivenOrganizationIdAndUser)({ organizationId, reconciliationInfo: user, higherSchoolingRegistrationRepository: higherSchoolingRegistrationRepositoryStub });

          // then
          expect(error).to.be.instanceOf(NotFoundError);
        });
      });

      context('When one schooling registration matched on names', () => {

        beforeEach(() => {
          user = {
            firstName: schoolingRegistrations[0].firstName,
            lastName: schoolingRegistrations[0].lastName,
          };
        });

        context('When schoolingRegistration is already linked', () => {
          beforeEach(() => {
            schoolingRegistrations[0].userId = '123';
          });

          it('should throw an error', async () => {
            // given
            higherSchoolingRegistrationRepositoryStub.findOneRegisteredByOrganizationIdAndUserData.resolves(schoolingRegistrations[0]);

            // when
            const result = await catchErr(userReconciliationService.findMatchingHigherSchoolingRegistrationIdForGivenOrganizationIdAndUser)({ organizationId, reconciliationInfo: user, higherSchoolingRegistrationRepository: higherSchoolingRegistrationRepositoryStub });

            // then
            expect(result).to.be.instanceOf(SchoolingRegistrationAlreadyLinkedToUserError);
          });
        });

        context('When schoolingRegistration is not already linked', () => {

          it('should return matched SchoolingRegistration', async () => {
            // when
            const result = await userReconciliationService.findMatchingHigherSchoolingRegistrationIdForGivenOrganizationIdAndUser({ organizationId, reconciliationInfo: user, higherSchoolingRegistrationRepository: higherSchoolingRegistrationRepositoryStub });

            // then
            expect(result).to.equal(schoolingRegistrations[0]);
          });
        });
      });
    });

    context('When no schooling registrations found', () => {

      beforeEach(() => {
        higherSchoolingRegistrationRepositoryStub.findOneRegisteredByOrganizationIdAndUserData.resolves(null);
      });

      it('should throw an error', async () => {
        // given
        user = {
          firstName: 'fakeFirstName',
          lastName: 'fakeLastName',
        };

        // when
        const error = await catchErr(userReconciliationService.findMatchingHigherSchoolingRegistrationIdForGivenOrganizationIdAndUser)({ organizationId, reconciliationInfo: user, higherSchoolingRegistrationRepository: higherSchoolingRegistrationRepositoryStub });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#generateUsernameUntilAvailable', () => {

    let userRepository;

    beforeEach(() => {
      userRepository = {
        isUsernameAvailable: sinon.stub(),
      };
    });

    it('should generate a username with original inputs', async () => {
      // given
      const firstPart = 'firstname.lastname';
      const secondPart = '0101';

      userRepository.isUsernameAvailable.resolves();
      const expectedUsername = firstPart + secondPart;

      // when
      const result = await userReconciliationService.generateUsernameUntilAvailable({ firstPart, secondPart, userRepository });

      // then
      expect(result).to.equal(expectedUsername);
    });

    it('should generate an other username when exist with original inputs', async () => {
      // given
      const firstPart = 'firstname.lastname';
      const secondPart = '0101';

      userRepository.isUsernameAvailable
        .onFirstCall().rejects(new AlreadyRegisteredUsernameError())
        .onSecondCall().resolves();

      const originalUsername = firstPart + secondPart;

      // when
      const result = await userReconciliationService.generateUsernameUntilAvailable({ firstPart, secondPart, userRepository });

      // then
      expect(result).to.not.equal(originalUsername);
    });

  });

  describe('#createUsernameByUserAndStudentId', () => {

    const user = {
      firstName: 'fakeFirst-Name',
      lastName: 'fake LastName',
      birthdate: '2008-03-01',
    };
    const originaldUsername = 'fakefirstname.fakelastname0103';

    let userRepository;

    beforeEach(() => {
      userRepository = {
        isUsernameAvailable: sinon.stub(),
      };
    });

    it('should generate a username with original user properties', async () => {
      // given
      userRepository.isUsernameAvailable.resolves();

      // when
      const result = await userReconciliationService.createUsernameByUser({ user, userRepository });

      // then
      expect(result).to.equal(originaldUsername);
    });

    it('should generate a other username when exist whith original inputs', async () => {
      // given
      userRepository.isUsernameAvailable
        .onFirstCall().rejects(new AlreadyRegisteredUsernameError())
        .onSecondCall().resolves();

      // when
      const result = await userReconciliationService.createUsernameByUser({ user, userRepository });

      // then
      expect(result).to.not.equal(originaldUsername);
    });
  });

  describe('#checkIfStudentHasAnAlreadyReconciledAccount', () => {

    let userRepositoryStub;
    let obfuscationServiceStub;
    let studentRepositoryStub;

    beforeEach(() => {
      userRepositoryStub = { getForObfuscation: sinon.stub() };
      obfuscationServiceStub = { getUserAuthenticationMethodWithObfuscation: sinon.stub() };
      studentRepositoryStub = { getReconciledStudentByNationalStudentId: sinon.stub() };
    });

    context('When student is already reconciled in the same organization', () => {

      context('When the reconciled account has an email', () => {

        it('should return a SchoolingRegistrationAlreadyLinkedToUserError with ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION code', async () => {
          // given
          const schoolingRegistration = domainBuilder.buildSchoolingRegistration();
          const user = domainBuilder.buildUser({ email: 'test@example.net' });
          schoolingRegistration.userId = user.id;

          userRepositoryStub.getForObfuscation.withArgs(user.id).resolves(user);
          obfuscationServiceStub.getUserAuthenticationMethodWithObfuscation.withArgs(user).returns({
            authenticatedBy: 'email',
            value: 't***@example.net',
          });

          // when
          const error = await catchErr(userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount)(schoolingRegistration, userRepositoryStub, obfuscationServiceStub, studentRepositoryStub);

          expect(error).to.be.instanceof(SchoolingRegistrationAlreadyLinkedToUserError);
          expect(error.message).to.equal('Un compte existe déjà pour l‘élève dans le même établissement.');
          expect(error.code).to.equal('ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION');
          expect(error.meta.shortCode).to.equal('R31');
          expect(error.meta.value).to.equal('t***@example.net');
          expect(error.meta.userId).to.equal(user.id);
        });
      });

      context('When the reconciled account as a username', () => {

        it('should return a SchoolingRegistrationAlreadyLinkedToUserError with ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION code', async () => {
          // given
          const schoolingRegistration = domainBuilder.buildSchoolingRegistration();
          const user = domainBuilder.buildUser({ username: 'john.doe0101' });
          schoolingRegistration.userId = user.id;

          userRepositoryStub.getForObfuscation.withArgs(user.id).resolves(user);
          obfuscationServiceStub.getUserAuthenticationMethodWithObfuscation.withArgs(user).returns({
            authenticatedBy: 'username',
            value: 'j***.d***0101',
          });

          // when
          const error = await catchErr(userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount)(schoolingRegistration, userRepositoryStub, obfuscationServiceStub, studentRepositoryStub);

          expect(error).to.be.instanceof(SchoolingRegistrationAlreadyLinkedToUserError);
          expect(userRepositoryStub.getForObfuscation).to.have.been.calledWith(user.id);
          expect(error.message).to.equal('Un compte existe déjà pour l‘élève dans le même établissement.');
          expect(error.code).to.equal('ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION');
          expect(error.meta.shortCode).to.equal('R32');
          expect(error.meta.value).to.equal('j***.d***0101');
          expect(error.meta.userId).to.equal(user.id);
        });
      });

      context('When the reconciled account as a samlId', () => {

        it('should return a SchoolingRegistrationAlreadyLinkedToUserError with ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION code', async () => {
          // given
          const schoolingRegistration = domainBuilder.buildSchoolingRegistration();
          const user = domainBuilder.buildUser({ samlId: 'samlId' });
          schoolingRegistration.userId = user.id;

          userRepositoryStub.getForObfuscation.withArgs(user.id).resolves(user);
          obfuscationServiceStub.getUserAuthenticationMethodWithObfuscation.withArgs(user).returns({
            authenticatedBy: 'samlId',
            value: null,
          });

          // when
          const error = await catchErr(userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount)(schoolingRegistration, userRepositoryStub, obfuscationServiceStub, studentRepositoryStub);

          expect(error).to.be.instanceof(SchoolingRegistrationAlreadyLinkedToUserError);
          expect(userRepositoryStub.getForObfuscation).to.have.been.calledWith(user.id);
          expect(error.message).to.equal('Un compte existe déjà pour l‘élève dans le même établissement.');
          expect(error.code).to.equal('ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION');
          expect(error.meta.shortCode).to.equal('R33');
          expect(error.meta.value).to.equal(null);
          expect(error.meta.userId).to.equal(user.id);
        });
      });
    });

    context('When student is already reconciled in an other organization', () => {

      context('When the reconciled account as an email', () => {

        it('should return a SchoolingRegistrationAlreadyLinkedToUserError with ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION code', async () => {
          // given
          const nationalStudentId = 'nationalStudentId';
          const schoolingRegistration = domainBuilder.buildSchoolingRegistration({ nationalStudentId });
          const user = domainBuilder.buildUser({ email: 'test@example.net' });

          studentRepositoryStub.getReconciledStudentByNationalStudentId.withArgs(nationalStudentId).resolves({ account: { userId: user.id } });
          userRepositoryStub.getForObfuscation.withArgs(user.id).resolves(user);
          obfuscationServiceStub.getUserAuthenticationMethodWithObfuscation.withArgs(user).returns({
            authenticatedBy: 'email',
            value: 't***@example.net',
          });

          // when
          const error = await catchErr(userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount)(schoolingRegistration, userRepositoryStub, obfuscationServiceStub, studentRepositoryStub);

          expect(error).to.be.instanceof(SchoolingRegistrationAlreadyLinkedToUserError);
          expect(error.message).to.equal('Un compte existe déjà pour l‘élève dans un autre établissement.');
          expect(error.code).to.equal('ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION');
          expect(error.meta.shortCode).to.equal('R11');
          expect(error.meta.value).to.equal('t***@example.net');
          expect(error.meta.userId).to.equal(user.id);
        });
      });

      context('When the reconciled account as a username', () => {

        it('should return a SchoolingRegistrationAlreadyLinkedToUserError with ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION code', async () => {
          // given
          const nationalStudentId = 'nationalStudentId';
          const schoolingRegistration = domainBuilder.buildSchoolingRegistration({ nationalStudentId });
          const user = domainBuilder.buildUser({ username: 'john.doe0101' });

          studentRepositoryStub.getReconciledStudentByNationalStudentId.withArgs(nationalStudentId).resolves({ account: { userId: user.id } });
          userRepositoryStub.getForObfuscation.withArgs(user.id).resolves(user);
          obfuscationServiceStub.getUserAuthenticationMethodWithObfuscation.withArgs(user).returns({
            authenticatedBy: 'username',
            value: 'j***.d***0101',
          });

          // when
          const error = await catchErr(userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount)(schoolingRegistration, userRepositoryStub, obfuscationServiceStub, studentRepositoryStub);

          expect(error).to.be.instanceof(SchoolingRegistrationAlreadyLinkedToUserError);
          expect(userRepositoryStub.getForObfuscation).to.have.been.calledWith(user.id);
          expect(error.message).to.equal('Un compte existe déjà pour l‘élève dans un autre établissement.');
          expect(error.code).to.equal('ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION');
          expect(error.meta.shortCode).to.equal('R12');
          expect(error.meta.value).to.equal('j***.d***0101');
          expect(error.meta.userId).to.equal(user.id);
        });
      });

      context('When the reconciled account as a samlId', () => {

        it('should return a SchoolingRegistrationAlreadyLinkedToUserError with ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION code', async () => {
          // given
          const nationalStudentId = 'nationalStudentId';
          const schoolingRegistration = domainBuilder.buildSchoolingRegistration({ nationalStudentId });
          const user = domainBuilder.buildUser({ samlId: 'samlId' });

          studentRepositoryStub.getReconciledStudentByNationalStudentId.withArgs(nationalStudentId).resolves({ account: { userId: user.id } });
          userRepositoryStub.getForObfuscation.withArgs(user.id).resolves(user);
          obfuscationServiceStub.getUserAuthenticationMethodWithObfuscation.withArgs(user).returns({
            authenticatedBy: 'samlId',
            value: null,
          });

          // when
          const error = await catchErr(userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount)(schoolingRegistration, userRepositoryStub, obfuscationServiceStub, studentRepositoryStub);

          expect(error).to.be.instanceof(SchoolingRegistrationAlreadyLinkedToUserError);
          expect(userRepositoryStub.getForObfuscation).to.have.been.calledWith(user.id);
          expect(error.message).to.equal('Un compte existe déjà pour l‘élève dans un autre établissement.');
          expect(error.code).to.equal('ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION');
          expect(error.meta.shortCode).to.equal('R13');
          expect(error.meta.value).to.equal(null);
          expect(error.meta.userId).to.equal(user.id);
        });
      });
    });
  });
});
