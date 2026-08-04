import sinon from 'sinon';

import { scoAccountRecoveryService } from '../../../../../src/identity-access-management/domain/services/sco-account-recovery.service.js';
import {
  MultipleOrganizationLearnersWithDifferentNationalStudentIdError,
  UserNotFoundError,
} from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Identity Access Management | Domain | Service | sco-account-recovery', function () {
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
        const error = await catchErr(scoAccountRecoveryService.retrieveOrganizationLearner)({
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
        const error = await catchErr(scoAccountRecoveryService.retrieveOrganizationLearner)({
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
          const result = await scoAccountRecoveryService.retrieveOrganizationLearner({
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
          const result = await catchErr(scoAccountRecoveryService.retrieveOrganizationLearner)({
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
        const result = await scoAccountRecoveryService.retrieveOrganizationLearner({
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
        const error = await catchErr(scoAccountRecoveryService.retrieveOrganizationLearner)({
          studentInformation,
          organizationLearnerRepository,
          userRepository,
          userReconciliationService,
        });

        // then
        expect(error).an.instanceOf(UserNotFoundError);
      });
    });
  });
});
