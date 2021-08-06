const {
  expect,
  sinon,
  domainBuilder,
  catchErr,
} = require('../../../test-helper');
const { retrieveSchoolingRegistration } = require('../../../../lib/domain/services/sco-account-recovery-service');
const {
  MultipleSchoolingRegistrationsWithDifferentNationalStudentIdError,
  UserNotFoundError,
  UserHasAlreadyLeftSCO,
} = require('../../../../lib/domain/errors');

describe('Unit | Service | sco-account-recovery-service', () => {

  describe('#retrieveSchoolingRegistration', () => {

    let schoolingRegistrationRepository;
    let userRepository;
    let userReconciliationService;
    let accountRecoveryDemandRepository;

    beforeEach(() => {
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

    context('when user is not found when matching with INE and birthDate', () => {
      it('should throw an user not found error', async () => {
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

    context('when user is not reconciled to any organization', () => {

      it('should throw an user not found error', async () => {
        // given
        const studentInformation = {
          ineIna: '123456789AA',
          firstName: 'Nanou',
          lastName: 'Monchose',
          birthdate: '2004-05-07',
        };

        const schoolingRegistration = domainBuilder.buildSchoolingRegistration({
          userId: undefined,
          birthdate: studentInformation.birthdate,
          nationalStudentId: studentInformation.ineIna,
        });

        schoolingRegistrationRepository.getLatestSchoolingRegistration
          .withArgs({ nationalStudentId: studentInformation.ineIna, birthdate: studentInformation.birthdate })
          .resolves(schoolingRegistration);

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

    context('when user is reconciled to several organizations', () => {

      context('when all schooling registrations have the same INE', () => {

        it('should return the last reconciled user account information', async () => {
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
          const firstSchoolingRegistration = domainBuilder.buildSchoolingRegistration({
            id: 2,
            userId: expectedUser.id,
            organization: firstOrganization,
            updatedAt: new Date('2000-01-01T15:00:00Z'),
            ...studentInformation,
            nationalStudentId: studentInformation.inaIna,
          });
          const lastSchoolingRegistration = domainBuilder.buildSchoolingRegistration({
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
            .resolves([firstSchoolingRegistration, lastSchoolingRegistration]);

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

      context('when at least one schooling registrations has a different INE', () => {

        it('should throw an error', async () => {
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

          const firstSchoolingRegistration = domainBuilder.buildSchoolingRegistration({
            id: 6,
            userId: user.id,
            ...studentInformation,
            nationalStudentId: studentInformation.ineIna,
          });
          const secondSchoolingRegistration = domainBuilder.buildSchoolingRegistration({
            id: 9,
            userId: user.id,
            nationalStudentId: '111111111AA',
            firstName: 'Nanou',
            lastName: 'Monchose',
            birthdate: '2004-05-07',
          });
          const accountRecoveryDemand = domainBuilder.buildAccountRecoveryDemand({
            userId: user.id,
            schoolingRegistrationId: secondSchoolingRegistration.id,
          });

          schoolingRegistrationRepository.getLatestSchoolingRegistration
            .withArgs({ birthdate: studentInformation.birthdate, nationalStudentId: studentInformation.ineIna })
            .resolves(firstSchoolingRegistration);

          userReconciliationService.findMatchingCandidateIdForGivenUser
            .withArgs([firstSchoolingRegistration], {
              firstName: studentInformation.firstName,
              lastName: studentInformation.lastName,
            })
            .resolves(firstSchoolingRegistration.id);

          schoolingRegistrationRepository.findByUserId
            .withArgs({ userId: user.id })
            .resolves([firstSchoolingRegistration, secondSchoolingRegistration]);

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

    context('when user is reconciled to a single organization', () => {

      it('should return user account information', async () => {
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
        const schoolingRegistration = domainBuilder.buildSchoolingRegistration({
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
          schoolingRegistrationId: schoolingRegistration.id,
        });

        schoolingRegistrationRepository.getLatestSchoolingRegistration
          .withArgs({ birthdate: studentInformation.birthdate, nationalStudentId: studentInformation.ineIna })
          .resolves(schoolingRegistration);

        userReconciliationService.findMatchingCandidateIdForGivenUser
          .withArgs([schoolingRegistration], {
            firstName: studentInformation.firstName,
            lastName: studentInformation.lastName,
          })
          .resolves(schoolingRegistration.id);

        schoolingRegistrationRepository.findByUserId
          .withArgs({ userId: expectedUser.id })
          .resolves([schoolingRegistration]);

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

    context('when firstName or lastName does not match schooling registration', () => {

      it('should throw an user not found error', async () => {
        // given
        const studentInformation = {
          ineIna: '123456789AA',
          firstName: 'Nanou',
          lastName: 'Monchose',
          birthdate: '2004-05-07',
        };

        const schoolingRegistration = domainBuilder.buildSchoolingRegistration({
          userId: 1,
          firstName: 'John',
          lastName: studentInformation.lastName,
          birthdate: studentInformation.birthdate,
          nationalStudentId: studentInformation.ineIna,
        });

        schoolingRegistrationRepository.getLatestSchoolingRegistration
          .withArgs({ birthdate: studentInformation.birthdate, nationalStudentId: studentInformation.ineIna })
          .resolves(schoolingRegistration);

        userReconciliationService.findMatchingCandidateIdForGivenUser
          .withArgs([schoolingRegistration], {
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

    context('when user had already left SCO', () => {

      it('should throw an error', async () => {
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
        const schoolingRegistration = domainBuilder.buildSchoolingRegistration({
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
          schoolingRegistrationId: schoolingRegistration.id,
        });
        const accountRecoveryDemandUsed = domainBuilder.buildAccountRecoveryDemand({
          userId: expectedUser.id,
          schoolingRegistrationId: schoolingRegistration.id,
          used: true,
        });

        schoolingRegistrationRepository.getLatestSchoolingRegistration
          .withArgs({ birthdate: studentInformation.birthdate, nationalStudentId: studentInformation.ineIna })
          .resolves(schoolingRegistration);

        userReconciliationService.findMatchingCandidateIdForGivenUser
          .withArgs([schoolingRegistration], {
            firstName: studentInformation.firstName,
            lastName: studentInformation.lastName,
          })
          .resolves(schoolingRegistration.id);

        schoolingRegistrationRepository.findByUserId
          .withArgs({ userId: expectedUser.id })
          .resolves([schoolingRegistration]);
        userRepository.get.withArgs(expectedUser.id).resolves(expectedUser);

        accountRecoveryDemandRepository.findByUserId.withArgs(expectedUser.id).resolves([accountRecoveryDemandNotUsed, accountRecoveryDemandUsed]);

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
});
