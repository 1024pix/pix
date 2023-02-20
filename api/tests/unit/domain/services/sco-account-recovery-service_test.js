import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper';
import {
  retrieveOrganizationLearner,
  retrieveAndValidateAccountRecoveryDemand,
} from '../../../../lib/domain/services/sco-account-recovery-service';

import {
  AccountRecoveryDemandExpired,
  AlreadyRegisteredEmailError,
  MultipleOrganizationLearnersWithDifferentNationalStudentIdError,
  UserNotFoundError,
  UserHasAlreadyLeftSCO,
} from '../../../../lib/domain/errors';

import { features } from '../../../../lib/config';
import dayjs from 'dayjs';

describe('Unit | Service | sco-account-recovery-service', function () {
  describe('#retrieveOrganizationLearner', function () {
    let organizationLearnerRepository;
    let userRepository;
    let userReconciliationService;
    let accountRecoveryDemandRepository;

    beforeEach(function () {
      organizationLearnerRepository = {
        getLatestOrganizationLearner: sinon.stub(),
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
      it('should throw a user not found error', async function () {
        // given
        const studentInformation = {
          ineIna: '123456789AA',
          firstName: 'Nanou',
          lastName: 'Monchose',
          birthdate: '2004-05-07',
        };

        organizationLearnerRepository.getLatestOrganizationLearner
          .withArgs({ nationalStudentId: studentInformation.ineIna, birthdate: studentInformation.birthdate })
          .resolves();

        // when
        const error = await catchErr(retrieveOrganizationLearner)({
          studentInformation,
          organizationLearnerRepository,
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

        organizationLearnerRepository.getLatestOrganizationLearner
          .withArgs({ nationalStudentId: studentInformation.ineIna, birthdate: studentInformation.birthdate })
          .resolves(organizationLearner);

        // when
        const error = await catchErr(retrieveOrganizationLearner)({
          studentInformation,
          organizationLearnerRepository,
          userRepository,
          userReconciliationService,
        });

        // then
        expect(error).to.be.instanceOf(UserNotFoundError);
      });
    });

    context('when user is reconciled to several organizations', function () {
      context('when all organization learners have the same INE, some are empty', function () {
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
          const thirdOrganization = domainBuilder.buildOrganization({ id: 9, name: 'Lycée The Night Watch' });
          const firstOrganizationLearner = domainBuilder.buildOrganizationLearner({
            id: 2,
            userId: expectedUser.id,
            organization: firstOrganization,
            updatedAt: new Date('2000-01-01T15:00:00Z'),
            ...studentInformation,
            nationalStudentId: studentInformation.ineIna,
          });
          const secondOrganizationLearner = domainBuilder.buildOrganizationLearner({
            id: 3,
            userId: expectedUser.id,
            organization: secondOrganization,
            updatedAt: new Date('2004-01-01T15:00:00Z'),
            ...studentInformation,
            nationalStudentId: studentInformation.ineIna,
          });
          const lastOrganizationLearner = domainBuilder.buildOrganizationLearner({
            id: 4,
            userId: expectedUser.id,
            organization: thirdOrganization,
            updatedAt: new Date('2005-01-01T15:00:00Z'),
            ...studentInformation,
          });
          const accountRecoveryDemand = domainBuilder.buildAccountRecoveryDemand({
            userId: expectedUser.id,
            organizationLearnerId: lastOrganizationLearner.id,
          });

          organizationLearnerRepository.getLatestOrganizationLearner
            .withArgs({ birthdate: studentInformation.birthdate, nationalStudentId: studentInformation.ineIna })
            .resolves(lastOrganizationLearner);

          userReconciliationService.findMatchingCandidateIdForGivenUser
            .withArgs([lastOrganizationLearner], {
              firstName: studentInformation.firstName,
              lastName: studentInformation.lastName,
            })
            .resolves(lastOrganizationLearner.id);

          organizationLearnerRepository.findByUserId
            .withArgs({ userId: expectedUser.id })
            .resolves([firstOrganizationLearner, secondOrganizationLearner, lastOrganizationLearner]);

          accountRecoveryDemandRepository.findByUserId.withArgs(expectedUser.id).resolves([accountRecoveryDemand]);

          userRepository.get.withArgs(expectedUser.id).resolves(expectedUser);

          // when
          const result = await retrieveOrganizationLearner({
            accountRecoveryDemandRepository,
            studentInformation,
            organizationLearnerRepository,
            userRepository,
            userReconciliationService,
          });

          // then
          const expectedResult = {
            firstName: 'Nanou',
            lastName: 'Monchose',
            username: 'nanou.monchose0705',
            email: 'nanou.monchose@example.net',
            id: 4,
            userId: 9,
            organizationId: 9,
          };
          expect(result).to.deep.equal(expectedResult);
        });
      });

      context('when at least one organization learner has a different INE with some empty', function () {
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
          const thirdOrganizationLearner = domainBuilder.buildOrganizationLearner({
            id: 9,
            userId: user.id,
            firstName: 'Nanou',
            lastName: 'Monchose',
            birthdate: '2004-05-07',
          });
          const accountRecoveryDemand = domainBuilder.buildAccountRecoveryDemand({
            userId: user.id,
            organizationLearnerId: secondOrganizationLearner.id,
          });

          organizationLearnerRepository.getLatestOrganizationLearner
            .withArgs({ birthdate: studentInformation.birthdate, nationalStudentId: studentInformation.ineIna })
            .resolves(firstOrganizationLearner);

          userReconciliationService.findMatchingCandidateIdForGivenUser
            .withArgs([firstOrganizationLearner], {
              firstName: studentInformation.firstName,
              lastName: studentInformation.lastName,
            })
            .resolves(firstOrganizationLearner.id);

          organizationLearnerRepository.findByUserId
            .withArgs({ userId: user.id })
            .resolves([firstOrganizationLearner, secondOrganizationLearner, thirdOrganizationLearner]);

          accountRecoveryDemandRepository.findByUserId.withArgs(user.id).resolves([accountRecoveryDemand]);

          // when
          const result = await catchErr(retrieveOrganizationLearner)({
            accountRecoveryDemandRepository,
            studentInformation,
            organizationLearnerRepository,
            userRepository,
            userReconciliationService,
          });

          // then
          expect(result).to.be.instanceof(MultipleOrganizationLearnersWithDifferentNationalStudentIdError);
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
          organizationLearnerId: organizationLearner.id,
        });

        organizationLearnerRepository.getLatestOrganizationLearner
          .withArgs({ birthdate: studentInformation.birthdate, nationalStudentId: studentInformation.ineIna })
          .resolves(organizationLearner);

        userReconciliationService.findMatchingCandidateIdForGivenUser
          .withArgs([organizationLearner], {
            firstName: studentInformation.firstName,
            lastName: studentInformation.lastName,
          })
          .resolves(organizationLearner.id);

        organizationLearnerRepository.findByUserId
          .withArgs({ userId: expectedUser.id })
          .resolves([organizationLearner]);

        accountRecoveryDemandRepository.findByUserId.withArgs(expectedUser.id).resolves([accountRecoveryDemand]);

        userRepository.get.withArgs(expectedUser.id).resolves(expectedUser);

        // when
        const result = await retrieveOrganizationLearner({
          accountRecoveryDemandRepository,
          studentInformation,
          organizationLearnerRepository,
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

    context('when firstName or lastName does not match organization learner', function () {
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

        organizationLearnerRepository.getLatestOrganizationLearner
          .withArgs({ birthdate: studentInformation.birthdate, nationalStudentId: studentInformation.ineIna })
          .resolves(organizationLearner);

        userReconciliationService.findMatchingCandidateIdForGivenUser
          .withArgs([organizationLearner], {
            firstName: studentInformation.firstName,
            lastName: studentInformation.lastName,
          })
          .resolves(undefined);

        // when
        const error = await catchErr(retrieveOrganizationLearner)({
          studentInformation,
          organizationLearnerRepository,
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
          organizationLearnerId: organizationLearner.id,
        });
        const accountRecoveryDemandUsed = domainBuilder.buildAccountRecoveryDemand({
          userId: expectedUser.id,
          organizationLearnerId: organizationLearner.id,
          used: true,
        });

        organizationLearnerRepository.getLatestOrganizationLearner
          .withArgs({ birthdate: studentInformation.birthdate, nationalStudentId: studentInformation.ineIna })
          .resolves(organizationLearner);

        userReconciliationService.findMatchingCandidateIdForGivenUser
          .withArgs([organizationLearner], {
            firstName: studentInformation.firstName,
            lastName: studentInformation.lastName,
          })
          .resolves(organizationLearner.id);

        organizationLearnerRepository.findByUserId
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
        const error = await catchErr(retrieveOrganizationLearner)({
          accountRecoveryDemandRepository,
          studentInformation,
          organizationLearnerRepository,
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
      const organizationLearnerId = '12';
      const accountRecoveryId = '34';
      const expectedResult = {
        id: accountRecoveryId,
        userId,
        newEmail,
        organizationLearnerId,
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

    describe('should throw error AccountRecoveryDemandExpired when demand has expired', function () {
      it('based on default expiration value', async function () {
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
      it('based on environment variable', async function () {
        // given
        features.scoAccountRecoveryKeyLifetimeMinutes = 1;
        const userId = '1234';
        const createdTwoMinutesAgo = dayjs().subtract(2, 'minutes').toDate();
        accountRecoveryDemandRepository.findByTemporaryKey.resolves({ userId, createdAt: createdTwoMinutesAgo });
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
});
