const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const {
  retrieveSchoolingRegistration,
  retrieveAndValidateAccountRecoveryDemand,
} = require('../../../../lib/domain/services/sco-account-recovery-service');
const {
  AccountRecoveryDemandExpired,
  AlreadyRegisteredEmailError,
  MultipleSchoolingRegistrationsWithDifferentNationalStudentIdError,
  UserNotFoundError,
  UserHasAlreadyLeftSCO,
} = require('../../../../lib/domain/errors');

describe('Unit | Service | sco-account-recovery-service', function () {
  describe('#retrieveSchoolingRegistration', function () {
    let schoolingRegistrationRepository;
    let userRepository;
    let userReconciliationService;
    let accountRecoveryDemandRepository;

    beforeEach(function () {
      schoolingRegistrationRepository = {
        getLatestSchoolingRegistration: sinon.stub(),
        findByUserId: sinon.stub(),
      };
      userRepository = {
        get: sinon.stub(),
      };
      userReconciliationService = {
        findMatchingCandidateIdForGivenUser: sinon.stub(),
      };
      accountRecoveryDemandRepository = {
        findByUserId: sinon.stub(),
      };
    });

    context('when user is not found when matching with INE and birthDate', function () {
      it('should throw an user not found error', async function () {
        // given
        const studentInformation = {
          ineIna: '123456789AA',
          firstName: 'Nanou',
          lastName: 'Monchose',
          birthdate: '2004-05-07',
        };

        schoolingRegistrationRepository.getLatestSchoolingRegistration
          .withArgs({ nationalStudentId: studentInformation.ineIna, birthdate: studentInformation.birthdate })
          .resolves();

        // when
        const error = await catchErr(retrieveSchoolingRegistration)({
          studentInformation,
          schoolingRegistrationRepository,
          userRepository,
          userReconciliationService,
        });

        // then
        expect(error).to.be.instanceOf(UserNotFoundError);
      });
    });

    context('when user is not reconciled to any organization', function () {
      it('should throw an user not found error', async function () {
        // given
        const studentInformation = {
          ineIna: '123456789AA',
          firstName: 'Nanou',
          lastName: 'Monchose',
          birthdate: '2004-05-07',
        };

        const organizationLearner = domainBuilder.buildOrganizationLearner({
          userId: undefined,
          birthdate: studentInformation.birthdate,
          nationalStudentId: studentInformation.ineIna,
        });

        schoolingRegistrationRepository.getLatestSchoolingRegistration
          .withArgs({ nationalStudentId: studentInformation.ineIna, birthdate: studentInformation.birthdate })
          .resolves(organizationLearner);

        // when
        const error = await catchErr(retrieveSchoolingRegistration)({
          studentInformation,
          schoolingRegistrationRepository,
          userRepository,
          userReconciliationService,
        });

        // then
        expect(error).to.be.instanceOf(UserNotFoundError);
      });
    });

    context('when user is reconciled to several organizations', function () {
      context('when all schooling registrations have the same INE', function () {
        it('should return the last reconciled user account information', async function () {
          // given
          const studentInformation = {
            ineIna: '123456789AA',
            firstName: 'Nanou',
            lastName: 'Monchose',
            birthdate: '2004-05-07',
          };
          const expectedUser = domainBuilder.buildUser({
            id: 9,
            firstName: studentInformation.firstName,
            lastName: studentInformation.lastName,
            birthdate: studentInformation.birthdate,
            username: 'nanou.monchose0705',
            email: 'nanou.monchose@example.net',
          });
          const firstOrganization = domainBuilder.buildOrganization({ id: 8, name: 'Collège Beauxbâtons' });
          const secondOrganization = domainBuilder.buildOrganization({ id: 7, name: 'Lycée Poudlard' });
          const firstOrganizationLearner = domainBuilder.buildOrganizationLearner({
            id: 2,
            userId: expectedUser.id,
            organization: firstOrganization,
            updatedAt: new Date('2000-01-01T15:00:00Z'),
            ...studentInformation,
            nationalStudentId: studentInformation.inaIna,
          });
          const lastSchoolingRegistration = domainBuilder.buildOrganizationLearner({
            id: 3,
            userId: expectedUser.id,
            organization: secondOrganization,
            updatedAt: new Date('2005-01-01T15:00:00Z'),
            ...studentInformation,
            nationalStudentId: studentInformation.inaIna,
          });
          const accountRecoveryDemand = domainBuilder.buildAccountRecoveryDemand({
            userId: expectedUser.id,
            schoolingRegistrationId: lastSchoolingRegistration.id,
          });

          schoolingRegistrationRepository.getLatestSchoolingRegistration
            .withArgs({ birthdate: studentInformation.birthdate, nationalStudentId: studentInformation.ineIna })
            .resolves(lastSchoolingRegistration);

          userReconciliationService.findMatchingCandidateIdForGivenUser
            .withArgs([lastSchoolingRegistration], {
              firstName: studentInformation.firstName,
              lastName: studentInformation.lastName,
            })
            .resolves(lastSchoolingRegistration.id);

          schoolingRegistrationRepository.findByUserId
            .withArgs({ userId: expectedUser.id })
            .resolves([firstOrganizationLearner, lastSchoolingRegistration]);

          accountRecoveryDemandRepository.findByUserId.withArgs(expectedUser.id).resolves([accountRecoveryDemand]);

          userRepository.get.withArgs(expectedUser.id).resolves(expectedUser);

          // when
          const result = await retrieveSchoolingRegistration({
            accountRecoveryDemandRepository,
            studentInformation,
            schoolingRegistrationRepository,
            userRepository,
            userReconciliationService,
          });

          // then
          const expectedResult = {
            firstName: 'Nanou',
            lastName: 'Monchose',
            username: 'nanou.monchose0705',
            email: 'nanou.monchose@example.net',
            id: 3,
            userId: 9,
            organizationId: 7,
          };
          expect(result).to.deep.equal(expectedResult);
        });
      });

      context('when at least one schooling registrations has a different INE', function () {
        it('should throw an error', async function () {
          // given
          const studentInformation = {
            ineIna: '123456789AA',
            firstName: 'Nanou',
            lastName: 'Monchose',
            birthdate: '2004-05-07',
          };
          const user = domainBuilder.buildUser({
            id: 9,
            firstName: studentInformation.firstName,
            lastName: studentInformation.lastName,
            birthdate: studentInformation.birthdate,
            username: 'nanou.monchose0705',
            email: 'nanou.monchose@example.net',
          });

          const firstOrganizationLearner = domainBuilder.buildOrganizationLearner({
            id: 6,
            userId: user.id,
            ...studentInformation,
            nationalStudentId: studentInformation.ineIna,
          });
          const secondOrganizationLearner = domainBuilder.buildOrganizationLearner({
            id: 9,
            userId: user.id,
            nationalStudentId: '111111111AA',
            firstName: 'Nanou',
            lastName: 'Monchose',
            birthdate: '2004-05-07',
          });
          const accountRecoveryDemand = domainBuilder.buildAccountRecoveryDemand({
            userId: user.id,
            schoolingRegistrationId: secondOrganizationLearner.id,
          });

          schoolingRegistrationRepository.getLatestSchoolingRegistration
            .withArgs({ birthdate: studentInformation.birthdate, nationalStudentId: studentInformation.ineIna })
            .resolves(firstOrganizationLearner);

          userReconciliationService.findMatchingCandidateIdForGivenUser
            .withArgs([firstOrganizationLearner], {
              firstName: studentInformation.firstName,
              lastName: studentInformation.lastName,
            })
            .resolves(firstOrganizationLearner.id);

          schoolingRegistrationRepository.findByUserId
            .withArgs({ userId: user.id })
            .resolves([firstOrganizationLearner, secondOrganizationLearner]);

          accountRecoveryDemandRepository.findByUserId.withArgs(user.id).resolves([accountRecoveryDemand]);

          // when
          const result = await catchErr(retrieveSchoolingRegistration)({
            accountRecoveryDemandRepository,
            studentInformation,
            schoolingRegistrationRepository,
            userRepository,
            userReconciliationService,
          });

          // then
          expect(result).to.be.instanceof(MultipleSchoolingRegistrationsWithDifferentNationalStudentIdError);
        });
      });
    });

    context('when user is reconciled to a single organization', function () {
      it('should return user account information', async function () {
        // given
        const studentInformation = {
          ineIna: '123456789AA',
          firstName: 'Nanou',
          lastName: 'Monchose',
          birthdate: '2004-05-07',
        };
        const expectedUser = domainBuilder.buildUser({
          id: 9,
          firstName: 'Manuela',
          lastName: studentInformation.lastName,
          birthdate: studentInformation.birthdate,
          username: 'nanou.monchose0705',
          email: 'nanou.monchose@example.net',
        });
        const organization = domainBuilder.buildOrganization({ id: 8, name: 'Collège Beauxbâtons' });
        const organizationLearner = domainBuilder.buildOrganizationLearner({
          id: 2,
          userId: expectedUser.id,
          organization: organization,
          updatedAt: new Date('2000-01-01T15:00:00Z'),
          ...studentInformation,
          firstName: expectedUser.firstName,
          nationalStudentId: studentInformation.ineIna,
        });
        const accountRecoveryDemand = domainBuilder.buildAccountRecoveryDemand({
          userId: expectedUser.id,
          schoolingRegistrationId: organizationLearner.id,
        });

        schoolingRegistrationRepository.getLatestSchoolingRegistration
          .withArgs({ birthdate: studentInformation.birthdate, nationalStudentId: studentInformation.ineIna })
          .resolves(organizationLearner);

        userReconciliationService.findMatchingCandidateIdForGivenUser
          .withArgs([organizationLearner], {
            firstName: studentInformation.firstName,
            lastName: studentInformation.lastName,
          })
          .resolves(organizationLearner.id);

        schoolingRegistrationRepository.findByUserId
          .withArgs({ userId: expectedUser.id })
          .resolves([organizationLearner]);

        accountRecoveryDemandRepository.findByUserId.withArgs(expectedUser.id).resolves([accountRecoveryDemand]);

        userRepository.get.withArgs(expectedUser.id).resolves(expectedUser);

        // when
        const result = await retrieveSchoolingRegistration({
          accountRecoveryDemandRepository,
          studentInformation,
          schoolingRegistrationRepository,
          userRepository,
          userReconciliationService,
        });

        // then
        const expectedResult = {
          firstName: 'Manuela',
          lastName: 'Monchose',
          username: 'nanou.monchose0705',
          email: 'nanou.monchose@example.net',
          id: 2,
          userId: 9,
          organizationId: 8,
        };
        expect(result).to.deep.equal(expectedResult);
      });
    });

    context('when firstName or lastName does not match schooling registration', function () {
      it('should throw an user not found error', async function () {
        // given
        const studentInformation = {
          ineIna: '123456789AA',
          firstName: 'Nanou',
          lastName: 'Monchose',
          birthdate: '2004-05-07',
        };

        const organizationLearner = domainBuilder.buildOrganizationLearner({
          userId: 1,
          firstName: 'John',
          lastName: studentInformation.lastName,
          birthdate: studentInformation.birthdate,
          nationalStudentId: studentInformation.ineIna,
        });

        schoolingRegistrationRepository.getLatestSchoolingRegistration
          .withArgs({ birthdate: studentInformation.birthdate, nationalStudentId: studentInformation.ineIna })
          .resolves(organizationLearner);

        userReconciliationService.findMatchingCandidateIdForGivenUser
          .withArgs([organizationLearner], {
            firstName: studentInformation.firstName,
            lastName: studentInformation.lastName,
          })
          .resolves(undefined);

        // when
        const error = await catchErr(retrieveSchoolingRegistration)({
          studentInformation,
          schoolingRegistrationRepository,
          userRepository,
          userReconciliationService,
        });

        // then
        expect(error).an.instanceOf(UserNotFoundError);
      });
    });

    context('when user had already left SCO', function () {
      it('should throw an error', async function () {
        // given
        const studentInformation = {
          ineIna: '123456789AA',
          firstName: 'Nanou',
          lastName: 'Monchose',
          birthdate: '2004-05-07',
        };
        const expectedUser = domainBuilder.buildUser({
          id: 9,
          firstName: 'Manuela',
          lastName: studentInformation.lastName,
          birthdate: studentInformation.birthdate,
          username: 'nanou.monchose0705',
          email: 'nanou.monchose@example.net',
        });
        const organization = domainBuilder.buildOrganization({ id: 8, name: 'Collège Beauxbâtons' });
        const organizationLearner = domainBuilder.buildOrganizationLearner({
          id: 2,
          userId: expectedUser.id,
          organization: organization,
          updatedAt: new Date('2000-01-01T15:00:00Z'),
          ...studentInformation,
          firstName: expectedUser.firstName,
          nationalStudentId: studentInformation.ineIna,
        });
        const accountRecoveryDemandNotUsed = domainBuilder.buildAccountRecoveryDemand({
          userId: expectedUser.id,
          schoolingRegistrationId: organizationLearner.id,
        });
        const accountRecoveryDemandUsed = domainBuilder.buildAccountRecoveryDemand({
          userId: expectedUser.id,
          schoolingRegistrationId: organizationLearner.id,
          used: true,
        });

        schoolingRegistrationRepository.getLatestSchoolingRegistration
          .withArgs({ birthdate: studentInformation.birthdate, nationalStudentId: studentInformation.ineIna })
          .resolves(organizationLearner);

        userReconciliationService.findMatchingCandidateIdForGivenUser
          .withArgs([organizationLearner], {
            firstName: studentInformation.firstName,
            lastName: studentInformation.lastName,
          })
          .resolves(organizationLearner.id);

        schoolingRegistrationRepository.findByUserId
          .withArgs({ userId: expectedUser.id })
          .resolves([organizationLearner]);
        userRepository.get.withArgs(expectedUser.id).resolves(expectedUser);

        accountRecoveryDemandRepository.findByUserId
          .withArgs(expectedUser.id)
          .resolves([accountRecoveryDemandNotUsed, accountRecoveryDemandUsed]);

        userRepository.get.resolves({
          username: expectedUser.username,
          email: expectedUser.email,
        });

        // when
        const error = await catchErr(retrieveSchoolingRegistration)({
          accountRecoveryDemandRepository,
          studentInformation,
          schoolingRegistrationRepository,
          userRepository,
          userReconciliationService,
        });

        // then
        expect(error).to.be.an.instanceOf(UserHasAlreadyLeftSCO);
        expect(error.message).to.be.equal('User has already left SCO.');
      });
    });
  });

  describe('#retrieveAndValidateAccountRecoveryDemand', function () {
    let userRepository;
    let accountRecoveryDemandRepository;

    beforeEach(function () {
      userRepository = {
        checkIfEmailIsAvailable: sinon.stub(),
      };
      accountRecoveryDemandRepository = {
        findByUserId: sinon.stub(),
        findByTemporaryKey: sinon.stub(),
      };
    });

    it('should return account recovery detail', async function () {
      // given
      const createdAt = new Date();
      const newEmail = 'philippe@example.net';
      const userId = '1234';
      const schoolingRegistrationId = '12';
      const accountRecoveryId = '34';
      const expectedResult = {
        id: accountRecoveryId,
        userId,
        newEmail,
        schoolingRegistrationId,
      };

      accountRecoveryDemandRepository.findByTemporaryKey.resolves({ ...expectedResult, createdAt });
      userRepository.checkIfEmailIsAvailable.withArgs(newEmail).resolves();
      accountRecoveryDemandRepository.findByUserId.withArgs(userId).resolves([{ used: false }]);

      // when
      const result = await retrieveAndValidateAccountRecoveryDemand({
        userRepository,
        accountRecoveryDemandRepository,
      });

      // then
      expect(result).to.be.deep.equal(expectedResult);
    });

    it('should throw error AlreadyRegisteredEmailError when it is not available', async function () {
      // given
      const newEmail = 'philippe@example.net';

      accountRecoveryDemandRepository.findByTemporaryKey.resolves({ newEmail });
      userRepository.checkIfEmailIsAvailable.withArgs(newEmail).rejects(new AlreadyRegisteredEmailError());

      // when
      const error = await catchErr(retrieveAndValidateAccountRecoveryDemand)({
        userRepository,
        accountRecoveryDemandRepository,
      });

      // then
      expect(error).to.be.instanceOf(AlreadyRegisteredEmailError);
      expect(error.message).to.be.equal('Cette adresse e-mail est déjà utilisée.');
      expect(error.code).to.be.equal('ACCOUNT_WITH_EMAIL_ALREADY_EXISTS');
    });

    it('should throw error UserHasAlreadyLeftSCO when user already left SCO', async function () {
      // given
      const userId = '1234';

      accountRecoveryDemandRepository.findByTemporaryKey.resolves({ userId });
      userRepository.checkIfEmailIsAvailable.resolves();
      accountRecoveryDemandRepository.findByUserId.withArgs(userId).resolves([{ used: true }]);

      // when
      const error = await catchErr(retrieveAndValidateAccountRecoveryDemand)({
        userRepository,
        accountRecoveryDemandRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserHasAlreadyLeftSCO);
      expect(error.message).to.be.equal('User has already left SCO.');
    });

    it('should throw error AccountRecoveryDemandExpired when demand has expired', async function () {
      // given
      const userId = '1234';
      const createdAt = new Date();
      const createdTenDaysAgo = 10;
      createdAt.setDate(createdAt.getDate() - createdTenDaysAgo);

      accountRecoveryDemandRepository.findByTemporaryKey.resolves({ userId, createdAt });
      userRepository.checkIfEmailIsAvailable.resolves();
      accountRecoveryDemandRepository.findByUserId.withArgs(userId).resolves([{ used: false }]);

      // when
      const error = await catchErr(retrieveAndValidateAccountRecoveryDemand)({
        userRepository,
        accountRecoveryDemandRepository,
      });

      // then
      expect(error).to.be.instanceOf(AccountRecoveryDemandExpired);
      expect(error.message).to.be.equal('This account recovery demand has expired.');
    });
  });
});
