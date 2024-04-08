import _ from 'lodash';

import { OrganizationLearnersCouldNotBeSavedError } from '../../../../../../lib/domain/errors.js';
import { OrganizationLearner } from '../../../../../../lib/domain/models/index.js';
import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import * as organizationLearnerRepository from '../../../../../../lib/infrastructure/repositories/organization-learner-repository.js';
import { CommonOrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/models/ImportOrganizationLearnerSet.js';
import {
  addOrUpdateOrganizationOfOrganizationLearners,
  disableAllOrganizationLearnersInOrganization,
  disableCommonOrganizationLearnersFromOrganizationId,
  removeByIds,
  saveCommonOrganizationLearners,
} from '../../../../../../src/prescription/learner-management/infrastructure/repositories/organization-learner-repository.js';
import { ApplicationTransaction } from '../../../../../../src/prescription/shared/infrastructure/ApplicationTransaction.js';
import { catchErr, databaseBuilder, domainBuilder, expect, knex, sinon } from '../../../../../test-helper.js';

describe('Integration | Repository | Organization Learner Management | Organization Learner', function () {
  describe('#removeByIds', function () {
    let clock;
    const now = new Date('2023-02-02');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('delete one organization learner', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      }).id;
      const userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();

      // when
      const organizationLearnersIdsToDelete = [organizationLearnerId];

      await DomainTransaction.execute(async (domainTransaction) => {
        await removeByIds({ organizationLearnerIds: organizationLearnersIdsToDelete, userId, domainTransaction });
      });

      // then
      const organizationLearnerResult = await knex('organization-learners')
        .select('deletedAt', 'deletedBy')
        .where('id', organizationLearnerId)
        .first();

      expect(organizationLearnerResult.deletedAt).to.deep.equal(now);
      expect(organizationLearnerResult.deletedBy).to.equal(userId);
    });

    it('not update organization learner already deleted', async function () {
      // given
      const otherUserId = databaseBuilder.factory.buildUser().id;
      const userId = databaseBuilder.factory.buildUser().id;

      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        deletedAt: new Date('2020-02-01'),
        deletedBy: otherUserId,
      }).id;

      await databaseBuilder.commit();

      // when
      const organizationLearnersIdsToDelete = [organizationLearnerId];

      await DomainTransaction.execute(async (domainTransaction) => {
        await removeByIds({ organizationLearnerIds: organizationLearnersIdsToDelete, userId, domainTransaction });
      });

      // then
      const organizationLearnerResult = await knex('organization-learners')
        .select('deletedAt', 'deletedBy')
        .where('id', organizationLearnerId)
        .first();

      expect(organizationLearnerResult.deletedAt).to.deep.equal(new Date('2020-02-01'));
      expect(organizationLearnerResult.deletedBy).to.equal(otherUserId);
    });

    it('delete more than one organization learners at the same time', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const firstOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      }).id;
      const secondOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      }).id;
      const thirdOrganisationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      }).id;
      const userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();

      // when
      const organizationLearnersIdToDelete = [firstOrganizationLearnerId, secondOrganizationLearnerId];

      await DomainTransaction.execute(async (domainTransaction) => {
        await removeByIds({ organizationLearnerIds: organizationLearnersIdToDelete, userId, domainTransaction });
      });

      // then
      const learners = await knex('view-active-organization-learners').where({ organizationId });
      expect(learners.length).to.equal(1);
      expect(learners[0].id).to.equal(thirdOrganisationLearnerId);
    });
  });

  describe('#disableAllOrganizationLearnersInOrganization', function () {
    it('should disable organization learners for the given organization and nationalStudentId not in the list', async function () {
      const organization = databaseBuilder.factory.buildOrganization();
      const organizationLearnerActiveId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        nationalStudentId: '1234',
      }).id;
      const organizationLearnerDisabledId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        nationalStudentId: '5678',
      }).id;

      const otherOrganizationActiveOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        nationalStudentId: '9876',
      }).id;

      await databaseBuilder.commit();

      await DomainTransaction.execute((domainTransaction) => {
        return disableAllOrganizationLearnersInOrganization({
          domainTransaction,
          organizationId: organization.id,
          nationalStudentIds: ['1234'],
        });
      });

      const disabledOrganizationLearnerIds = await knex('organization-learners')
        .select('id')
        .where({ isDisabled: true })
        .pluck('id');

      const activeOrganizationLearnerIds = await knex('organization-learners')
        .select('id')
        .where({ isDisabled: false })
        .pluck('id');

      expect(disabledOrganizationLearnerIds).to.be.deep.members([organizationLearnerDisabledId]);
      expect(activeOrganizationLearnerIds).to.be.deep.members([
        organizationLearnerActiveId,
        otherOrganizationActiveOrganizationLearnerId,
      ]);
    });

    it('should update the date when an organization learner is disabled', async function () {
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        updatedAt: new Date('1970-01-01'),
      });
      await databaseBuilder.commit();

      await DomainTransaction.execute((domainTransaction) => {
        return disableAllOrganizationLearnersInOrganization({
          domainTransaction,
          organizationId: organizationLearner.organizationId,
          nationalStudentIds: [],
        });
      });

      const expectedDisabled = await knex('organization-learners').where('id', organizationLearner.id).first();
      expect(expectedDisabled.updatedAt).to.not.equal(organizationLearner.updatedAt);
    });

    it('should rollback when an error occurs during transaction', async function () {
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        updatedAt: new Date('1970-01-01'),
      });
      await databaseBuilder.commit();

      await catchErr(async () => {
        await DomainTransaction.execute(async (domainTransaction) => {
          await disableAllOrganizationLearnersInOrganization({
            domainTransaction,
            organizationId: organizationLearner.organizationId,
            nationalStudentIds: [],
          });
          throw new Error('an error occurs within the domain transaction');
        });
      });

      const organizationLearnerNotDisabled = await knex('organization-learners')
        .where('id', organizationLearner.id)
        .first();
      expect(organizationLearnerNotDisabled.isDisabled).to.be.false;
    });
  });

  describe('#addOrUpdateOrganizationOfOrganizationLearners', function () {
    context(
      'when imported organization learner is in a different organization as an existing organization learner with the same national student id',
      function () {
        context('and same birthday', function () {
          it('should save the imported organization learner with the user id of the existing one', async function () {
            // given
            const nationalStudentId = '123456A';
            const birthdate = '2000-01-01';
            const anotherOrganizationId = databaseBuilder.factory.buildOrganization().id;
            const existingOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
              id: 1,
              organizationId: databaseBuilder.factory.buildOrganization().id,
              nationalStudentId,
              birthdate,
              userId: databaseBuilder.factory.buildUser().id,
            });
            await databaseBuilder.commit();

            const importedOrganizationLearners = [
              new OrganizationLearner({
                lastName: 'Pipeau',
                firstName: 'Peaupi',
                birthdate,
                nationalStudentId,
                userId: null,
                isDisabled: false,
                organizationId: anotherOrganizationId,
              }),
            ];

            // when
            await DomainTransaction.execute((domainTransaction) => {
              return addOrUpdateOrganizationOfOrganizationLearners(
                importedOrganizationLearners,
                anotherOrganizationId,
                domainTransaction,
              );
            });

            // then
            const [newOrganizationLearner] = await organizationLearnerRepository.findByOrganizationId({
              organizationId: anotherOrganizationId,
            });
            expect(newOrganizationLearner).to.not.be.null;
            expect(newOrganizationLearner.userId).to.equal(existingOrganizationLearner.userId);
            expect(newOrganizationLearner.id).to.not.equal(existingOrganizationLearner.id);
            expect(newOrganizationLearner.organizationId).to.not.equal(existingOrganizationLearner.organizationId);
            expect(newOrganizationLearner.nationalStudentId).to.equal(existingOrganizationLearner.nationalStudentId);
            expect(newOrganizationLearner.birthdate).to.equal(existingOrganizationLearner.birthdate);
          });
        });

        context('and different birthday', function () {
          it('should save the organization learner without a user id', async function () {
            // given
            const nationalStudentId = '123456A';
            const anotherOrganizationId = databaseBuilder.factory.buildOrganization().id;
            const existingOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
              organizationId: databaseBuilder.factory.buildOrganization().id,
              nationalStudentId,
              birthdate: '2000-01-01',
              userId: databaseBuilder.factory.buildUser().id,
            });
            await databaseBuilder.commit();

            const importedOrganizationLearners = [
              new OrganizationLearner({
                lastName: 'Pipeau',
                firstName: 'Peaupi',
                birthdate: '2003-01-01',
                nationalStudentId,
                userId: null,
                isDisabled: false,
                organizationId: anotherOrganizationId,
              }),
            ];

            // when
            await DomainTransaction.execute((domainTransaction) => {
              return addOrUpdateOrganizationOfOrganizationLearners(
                importedOrganizationLearners,
                anotherOrganizationId,
                domainTransaction,
              );
            });

            // then
            const existingOrganizationLearners = await organizationLearnerRepository.findByIds({
              ids: [existingOrganizationLearner.id],
            });
            expect(existingOrganizationLearners).to.have.length(1);
            expect(existingOrganizationLearner).to.deep.contain(existingOrganizationLearners[0]);

            const [newOrganizationLearner] = await organizationLearnerRepository.findByOrganizationId({
              organizationId: anotherOrganizationId,
            });
            expect(newOrganizationLearner).to.not.be.null;
            expect(newOrganizationLearner.userId).to.be.null;
            expect(newOrganizationLearner.id).to.not.equal(existingOrganizationLearner.id);
            expect(newOrganizationLearner.organizationId).to.equal(anotherOrganizationId);
            expect(newOrganizationLearner.nationalStudentId).to.equal(existingOrganizationLearner.nationalStudentId);
            expect(newOrganizationLearner.birthdate).to.not.equal(existingOrganizationLearner.birthdate);
          });
        });
      },
    );

    context('when there are only organizationLearners to create', function () {
      let organizationLearners;
      let organizationId;
      let firstOrganizationLearner;

      beforeEach(async function () {
        organizationId = databaseBuilder.factory.buildOrganization().id;
        await databaseBuilder.commit();

        firstOrganizationLearner = new OrganizationLearner({
          lastName: 'Pipeau',
          preferredLastName: 'Toto',
          firstName: 'Corinne',
          middleName: 'Dorothée',
          thirdName: 'Driss',
          sex: 'F',
          birthdate: '2000-01-01',
          birthCity: 'Perpi',
          birthCityCode: '123456',
          birthProvinceCode: '66',
          birthCountryCode: '100',
          MEFCode: 'MEF123456',
          status: 'ST',
          nationalStudentId: null,
          division: '4B',
          userId: null,
          isDisabled: false,
          organizationId,
        });

        organizationLearners = [firstOrganizationLearner];
      });

      it('should create all organizationLearners', async function () {
        // when
        await DomainTransaction.execute((domainTransaction) => {
          return addOrUpdateOrganizationOfOrganizationLearners(organizationLearners, organizationId, domainTransaction);
        });

        // then
        const actualOrganizationLearners = await organizationLearnerRepository.findByOrganizationId({
          organizationId,
        });
        expect(actualOrganizationLearners).to.have.length(1);
        expect(
          _.omit(actualOrganizationLearners[0], ['updatedAt', 'id', 'certifiableAt', 'isCertifiable']),
        ).to.deep.equal(_.omit(firstOrganizationLearner, ['updatedAt', 'id', 'certifiableAt', 'isCertifiable']));
      });
    });

    context('when there are only organizationLearners to update', function () {
      let firstOrganizationLearner;
      let organizationId;
      let certifiableDate;

      beforeEach(async function () {
        certifiableDate = '2023-09-09';
        organizationId = databaseBuilder.factory.buildOrganization().id;
        firstOrganizationLearner = {
          firstName: 'Lucy',
          lastName: 'Handmade',
          birthdate: '1990-12-31',
          nationalStudentId: 'INE1',
          organizationId,
          isCertifiable: true,
          certifiableAt: new Date(certifiableDate),
        };

        databaseBuilder.factory.buildOrganizationLearner(firstOrganizationLearner);

        await databaseBuilder.commit();
      });

      context('when an organizationLearner is already imported', function () {
        it('should update organizationLearners attributes', async function () {
          // given
          const organizationLearners = [
            new OrganizationLearner({
              firstName: 'Boba',
              lastName: 'Fett',
              birthdate: '1986-01-05',
              nationalStudentId: 'INE1',
              status: firstOrganizationLearner.status,
              organizationId,
            }),
          ];

          // when
          await DomainTransaction.execute((domainTransaction) => {
            return addOrUpdateOrganizationOfOrganizationLearners(
              organizationLearners,
              organizationId,
              domainTransaction,
            );
          });

          // then
          const [updatedOrganizationLearner] = await knex('organization-learners').where({
            organizationId,
          });

          expect(updatedOrganizationLearner).to.not.be.null;
          expect(updatedOrganizationLearner.firstName).to.be.equal(organizationLearners[0].firstName);
          expect(updatedOrganizationLearner.lastName).to.be.equal(organizationLearners[0].lastName);
          expect(updatedOrganizationLearner.birthdate).to.be.equal(organizationLearners[0].birthdate);
        });

        it('should not erase certificability status', async function () {
          // given

          await databaseBuilder.commit();

          const organizationLearners = [
            new OrganizationLearner({
              firstName: 'Alex',
              lastName: 'Terieur',
              birthdate: '1992-07-07',
              nationalStudentId: 'INE1',
              organizationId,
            }),
          ];

          // when
          await DomainTransaction.execute((domainTransaction) => {
            return addOrUpdateOrganizationOfOrganizationLearners(
              organizationLearners,
              organizationId,
              domainTransaction,
            );
          });

          // then
          const [updatedOrganizationLearner] = await knex('organization-learners').where({
            organizationId,
          });

          expect(updatedOrganizationLearner.isCertifiable).to.be.true;
          expect(updatedOrganizationLearner.certifiableAt).to.deep.equal(certifiableDate);
        });
      });

      context('when an organizationLearner is already imported in several organizations', function () {
        let firstUpdatedOrganizationLearner;
        let otherFirstOrganizationLearner;
        let otherOrganizationId;
        let organizationLearners;

        beforeEach(async function () {
          otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
          otherFirstOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            firstName: 'Lucie',
            lastName: 'Handmad',
            birthdate: '1990-12-31',
            nationalStudentId: firstOrganizationLearner.nationalStudentId,
            status: firstOrganizationLearner.status,
            organizationId: otherOrganizationId,
          });

          await databaseBuilder.commit();

          firstUpdatedOrganizationLearner = new OrganizationLearner({
            firstName: 'Lili',
            lastName: firstOrganizationLearner.lastName,
            birthdate: firstOrganizationLearner.birthdate,
            nationalStudentId: firstOrganizationLearner.nationalStudentId,
            organizationId,
            status: firstOrganizationLearner.status,
          });

          organizationLearners = [firstUpdatedOrganizationLearner];
        });

        it('should update the organizationLearner only in the organization that imports the file', async function () {
          // when
          await DomainTransaction.execute((domainTransaction) => {
            return addOrUpdateOrganizationOfOrganizationLearners(
              organizationLearners,
              organizationId,
              domainTransaction,
            );
          });

          // then
          const [updatedOrganizationLearner] = await knex('organization-learners').where({
            organizationId,
          });
          const [notUpdatedOrganizationLearner] = await knex('organization-learners').where({
            organizationId: otherOrganizationId,
          });

          expect(updatedOrganizationLearner).to.not.be.null;
          expect(updatedOrganizationLearner.firstName).to.equal(firstUpdatedOrganizationLearner.firstName);
          expect(updatedOrganizationLearner.lastName).to.equal(firstUpdatedOrganizationLearner.lastName);
          expect(updatedOrganizationLearner.birthdate).to.equal(firstUpdatedOrganizationLearner.birthdate);

          expect(notUpdatedOrganizationLearner).to.not.be.null;
          expect(notUpdatedOrganizationLearner.firstName).to.equal(otherFirstOrganizationLearner.firstName);
          expect(notUpdatedOrganizationLearner.lastName).to.equal(otherFirstOrganizationLearner.lastName);
          expect(notUpdatedOrganizationLearner.birthdate).to.equal(otherFirstOrganizationLearner.birthdate);
        });
      });

      context('when an organization learner disabled already exists', function () {
        it('should enable the updated organization learner', async function () {
          // given
          const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            nationalStudentId: 'INE1',
            isDisabled: true,
          });
          const { id, organizationId } = organizationLearner;
          await databaseBuilder.commit();

          // when
          await DomainTransaction.execute((domainTransaction) => {
            return addOrUpdateOrganizationOfOrganizationLearners(
              [organizationLearner],
              organizationId,
              domainTransaction,
            );
          });

          // then
          const expectedEnabled = await knex('organization-learners').where({ id }).first();

          expect(expectedEnabled.isDisabled).to.be.false;
        });
      });
    });

    context('when an organizationLearner is saved with a userId already present in organization', function () {
      it('should save the organization learner with userId as null', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const { id: userId } = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildOrganizationLearner({
          nationalStudentId: 'INE1',
          userId,
        });
        databaseBuilder.factory.buildOrganizationLearner({
          nationalStudentId: 'INE2',
          organizationId: organizationId,
          userId,
        });
        await databaseBuilder.commit();

        // when
        const organizationLearner = domainBuilder.buildOrganizationLearner({ nationalStudentId: 'INE1' });
        await DomainTransaction.execute((domainTransaction) => {
          return addOrUpdateOrganizationOfOrganizationLearners(
            [organizationLearner],
            organizationId,
            domainTransaction,
          );
        });

        // then
        const expected = await knex('organization-learners')
          .where({ nationalStudentId: 'INE1', organizationId: organizationId })
          .first();

        expect(expected.userId).to.be.null;
      });

      it('should update the organization learner with userId as null', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const { id: userId } = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildOrganizationLearner({
          nationalStudentId: 'INE1',
          userId,
        });
        databaseBuilder.factory.buildOrganizationLearner({
          nationalStudentId: 'INE2',
          organizationId: organizationId,
          userId,
        });
        databaseBuilder.factory.buildOrganizationLearner({
          nationalStudentId: 'INE1',
          organizationId: organizationId,
          userId: null,
        });
        await databaseBuilder.commit();

        // when
        const organizationLearner = domainBuilder.buildOrganizationLearner({ nationalStudentId: 'INE1' });
        await DomainTransaction.execute((domainTransaction) => {
          return addOrUpdateOrganizationOfOrganizationLearners(
            [organizationLearner],
            organizationId,
            domainTransaction,
          );
        });

        // then
        const expected = await knex('organization-learners')
          .where({ nationalStudentId: 'INE1', organizationId: organizationId })
          .first();

        expect(expected.userId).to.be.null;
      });
    });

    context('when several imported organization learners are reconciled with the same userId', function () {
      it('should save both organization learners with userId as null', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const { id: userId } = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildOrganizationLearner({
          nationalStudentId: 'INE1',
          userId,
        });
        databaseBuilder.factory.buildOrganizationLearner({
          nationalStudentId: 'INE2',
          userId,
        });
        await databaseBuilder.commit();

        // when
        const organizationLearner1 = domainBuilder.buildOrganizationLearner({ nationalStudentId: 'INE1' });
        const organizationLearner2 = domainBuilder.buildOrganizationLearner({ nationalStudentId: 'INE2' });
        await DomainTransaction.execute((domainTransaction) => {
          return addOrUpdateOrganizationOfOrganizationLearners(
            [organizationLearner1, organizationLearner2],
            organizationId,
            domainTransaction,
          );
        });

        // then
        const expected1 = await knex('organization-learners')
          .where({ nationalStudentId: 'INE1', organizationId })
          .first();
        const expected2 = await knex('organization-learners')
          .where({ nationalStudentId: 'INE2', organizationId })
          .first();

        expect(expected1.userId).to.be.null;
        expect(expected2.userId).to.be.null;
      });
    });

    context('when there are organizationLearners in another organization', function () {
      let organizationLearners;
      let organizationId;
      let organizationLearnerFromFile;
      let userId;
      let nationalStudentId;
      const birthdate = '1990-12-31';

      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser().id;
        nationalStudentId = 'salut';
        organizationId = databaseBuilder.factory.buildOrganization().id;
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: otherOrganizationId,
          nationalStudentId,
        });
        await databaseBuilder.commit();

        organizationLearnerFromFile = new OrganizationLearner({
          firstName: 'Lucy',
          lastName: 'Handmade',
          birthdate,
          nationalStudentId,
          organizationId,
        });

        organizationLearners = [organizationLearnerFromFile];
      });

      it('should create organizationLearner and reconcile it with the help of another organizationLearner', async function () {
        // given
        databaseBuilder.factory.buildOrganizationLearner({ nationalStudentId, birthdate, userId });
        databaseBuilder.factory.buildCertificationCourse({ userId });
        await databaseBuilder.commit();

        // when
        await DomainTransaction.execute((domainTransaction) => {
          return addOrUpdateOrganizationOfOrganizationLearners(organizationLearners, organizationId, domainTransaction);
        });

        // then
        const newOrganizationLearner = await knex('organization-learners').where({
          organizationId,
          nationalStudentId,
        });
        expect(newOrganizationLearner[0].userId).to.equal(userId);
      });

      it('should update and reconcile organizationLearner with the help of another organizationLearner', async function () {
        // given
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          nationalStudentId,
          birthdate,
          userId: null,
        });
        databaseBuilder.factory.buildOrganizationLearner({ nationalStudentId, birthdate, userId });
        databaseBuilder.factory.buildCertificationCourse({ userId });
        await databaseBuilder.commit();

        // when
        await DomainTransaction.execute((domainTransaction) => {
          return addOrUpdateOrganizationOfOrganizationLearners(organizationLearners, organizationId, domainTransaction);
        });

        // then
        const newOrganizationLearner = await knex('organization-learners')
          .where({ organizationId, nationalStudentId })
          .first();
        expect(newOrganizationLearner.userId).to.equal(userId);
        expect(newOrganizationLearner.firstName).to.equal(organizationLearnerFromFile.firstName);
      });

      context('when userId is already defined for an organizationLearner', function () {
        it('should update organizationLearner but not override userId', async function () {
          // given
          const expectedUserId = databaseBuilder.factory.buildOrganizationLearner({
            organizationId,
            nationalStudentId,
          }).userId;
          await databaseBuilder.commit();

          // when
          await DomainTransaction.execute((domainTransaction) => {
            return addOrUpdateOrganizationOfOrganizationLearners(
              organizationLearners,
              organizationId,
              domainTransaction,
            );
          });

          // then
          const alreadyReconciledOrganizationLearners = await knex('organization-learners')
            .where({
              nationalStudentId: organizationLearnerFromFile.nationalStudentId,
              organizationId: organizationId,
            })
            .first();
          expect(alreadyReconciledOrganizationLearners.userId).to.equal(expectedUserId);
          expect(alreadyReconciledOrganizationLearners.firstName).to.equal(organizationLearnerFromFile.firstName);
        });
      });
    });

    context('when there are organizationLearners to create and organizationLearners to update', function () {
      let organizationLearners;
      let organizationId;
      let organizationLearnerToCreate, organizationLearnerUpdated;

      beforeEach(async function () {
        organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationLearner({
          firstName: 'Lucy',
          lastName: 'Handmade',
          birthdate: '1990-12-31',
          nationalStudentId: 'INE1',
          organizationId,
        });
        await databaseBuilder.commit();

        organizationLearnerUpdated = new OrganizationLearner({
          firstName: 'Lucy',
          lastName: 'Handmade',
          birthdate: '1990-12-31',
          nationalStudentId: 'INE1',
          organizationId,
        });

        organizationLearnerToCreate = new OrganizationLearner({
          firstName: 'Harry',
          lastName: 'Covert',
          birthdate: '1990-01-01',
          nationalStudentId: 'INE2',
          organizationId,
        });

        organizationLearners = [organizationLearnerUpdated, organizationLearnerToCreate];
      });

      it('should update and create all organizationLearners', async function () {
        // when
        await DomainTransaction.execute((domainTransaction) => {
          return addOrUpdateOrganizationOfOrganizationLearners(organizationLearners, organizationId, domainTransaction);
        });

        // then
        const actualOrganizationLearners = await knex('organization-learners').where({ organizationId });
        expect(actualOrganizationLearners).to.have.lengthOf(2);

        expect(_.map(actualOrganizationLearners, 'firstName')).to.have.members([
          organizationLearnerUpdated.firstName,
          organizationLearnerToCreate.firstName,
        ]);
      });
    });

    context('when an error occurs', function () {
      let organizationLearners;
      let organizationId;
      let firstOrganizationLearner, secondOrganizationLearner;
      const sameNationalStudentId = 'SAMEID123';

      beforeEach(async function () {
        organizationId = databaseBuilder.factory.buildOrganization().id;
        await databaseBuilder.commit();

        firstOrganizationLearner = new OrganizationLearner({
          firstName: 'Lucy',
          lastName: 'Handmade',
          birthdate: '1990-12-31',
          nationalStudentId: sameNationalStudentId,
          organizationId,
        });

        secondOrganizationLearner = new OrganizationLearner({
          firstName: 'Harry',
          lastName: 'Covert',
          birthdate: '1990-01-01',
          nationalStudentId: sameNationalStudentId,
          organizationId,
        });

        organizationLearners = [firstOrganizationLearner, secondOrganizationLearner];
      });

      it('should return a OrganizationLearnersCouldNotBeSavedError on unicity errors', async function () {
        // when
        let error;
        await DomainTransaction.execute(async (domainTransaction) => {
          error = await catchErr(addOrUpdateOrganizationOfOrganizationLearners, organizationLearnerRepository)(
            organizationLearners,
            organizationId,
            domainTransaction,
          );
        });

        // then
        expect(error).to.be.instanceof(OrganizationLearnersCouldNotBeSavedError);
      });

      it('should return a OrganizationLearnersCouldNotBeSavedError', async function () {
        // when
        let error;
        await DomainTransaction.execute(async (domainTransaction) => {
          error = await catchErr(addOrUpdateOrganizationOfOrganizationLearners, organizationLearnerRepository)(
            [{ nationalStudentId: 'something' }],
            organizationId,
            domainTransaction,
          );
        });

        // then
        expect(error).to.be.instanceof(OrganizationLearnersCouldNotBeSavedError);
      });
    });

    context('whenever an organization-learner is updated', function () {
      it('should update the updatedAt column in row', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const baseOrganizationLearner = {
          firstName: 'Lucy',
          lastName: 'Handmade',
          birthdate: '1990-12-31',
          nationalStudentId: 'INE1',
          organizationId,
        };
        const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner(baseOrganizationLearner).id;
        await databaseBuilder.commit();
        await knex('organization-learners')
          .update({ updatedAt: new Date('2019-01-01') })
          .where({ id: organizationLearnerId });
        const { updatedAt: beforeUpdatedAt } = await knex
          .select('updatedAt')
          .from('organization-learners')
          .where({ id: organizationLearnerId })
          .first();

        const organizationLearner_updated = new OrganizationLearner({
          ...baseOrganizationLearner,
          firstName: 'Lili',
        });

        // when
        await DomainTransaction.execute((domainTransaction) => {
          return addOrUpdateOrganizationOfOrganizationLearners(
            [organizationLearner_updated],
            organizationId,
            domainTransaction,
          );
        });

        // then
        const { updatedAt: afterUpdatedAt } = await knex
          .select('updatedAt')
          .from('organization-learners')
          .where({ id: organizationLearnerId })
          .first();

        expect(afterUpdatedAt).to.be.above(beforeUpdatedAt);
      });
    });

    context('when an error occurs during transaction', function () {
      it('should rollback', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const organizationLearner = new OrganizationLearner({ organizationId });

        // when
        await catchErr(async () => {
          await DomainTransaction.execute(async (domainTransaction) => {
            await addOrUpdateOrganizationOfOrganizationLearners(
              [organizationLearner],
              organizationId,
              domainTransaction,
            );
            throw new Error('an error occurs within the domain transaction');
          });
        });

        // then
        const organizationLearners = await knex.from('organization-learners');
        expect(organizationLearners).to.deep.equal([]);
      });
    });
  });

  describe('#saveCommonOrganizationLearners', function () {
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();
    });

    context('add new learner', function () {
      it('should save the new learner', async function () {
        const learnerData = new CommonOrganizationLearner({
          firstName: 'Sacha',
          lastName: 'Du Bourg Palette',
          organizationId,
          INE: '234567890',
        });

        await saveCommonOrganizationLearners([learnerData]);

        const [organizationLearner] = await knex.from('organization-learners');

        expect(organizationLearner.firstName).to.equal(learnerData.firstName);
        expect(organizationLearner.lastName).to.equal(learnerData.lastName);
        expect(organizationLearner.organizationId).to.equal(learnerData.organizationId);
        expect(organizationLearner.attributes).to.deep.equal(learnerData.attributes);
        expect(organizationLearner.isDisabled).to.be.false;
      });

      it('should save several learners', async function () {
        const learnerSacha = new CommonOrganizationLearner({
          firstName: 'Sacha',
          lastName: 'Du Bourg Palette',
          organizationId,
          INE: '234567890',
        });

        const learnerOndine = new CommonOrganizationLearner({
          firstName: 'Ondine',
          lastName: 'Azuria',
          organizationId,
          INE: '9876543210',
        });

        await saveCommonOrganizationLearners([learnerSacha, learnerOndine]);

        const organizationLearners = await knex.from('organization-learners');

        expect(organizationLearners).lengthOf(2);
      });

      it('should not save the learner when error occured', async function () {
        const learnerSacha = new CommonOrganizationLearner({
          firstName: 'Sacha',
          lastName: 'Du Bourg Palette',
          organizationId,
          INE: '234567890',
        });

        try {
          await ApplicationTransaction.execute(async () => {
            await saveCommonOrganizationLearners([learnerSacha]);
            throw new Error();
          });
        } catch {
          // something
        }

        const organizationLearners = await knex.from('organization-learners');

        expect(organizationLearners).lengthOf(0);
      });
    });
  });

  describe('#disableCommonOrganizationLearnersFromOrganizationId', function () {
    let organizationId;
    let clock;
    const now = new Date('2023-08-17');

    beforeEach(async function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
      organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();
    });

    afterEach(function () {
      clock.restore();
    });

    it('should set isDisabled to true and set updatedAt with today on organization learner', async function () {
      // given
      await databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      });
      await databaseBuilder.commit();

      // when
      await disableCommonOrganizationLearnersFromOrganizationId(organizationId);

      // then
      const [organizationLearner] = await knex.from('organization-learners');

      expect(organizationLearner.isDisabled).to.be.true;
      expect(organizationLearner.updatedAt).to.deep.equal(now);
    });

    it('should disable several organization learners from an organizationId', async function () {
      // given
      const learner1 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      });

      const learner2 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      });

      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: otherOrganizationId });

      await databaseBuilder.commit();

      // when
      await disableCommonOrganizationLearnersFromOrganizationId(organizationId);

      // then
      const organizationLearners = await knex.from('organization-learners').where({
        isDisabled: true,
      });

      expect(organizationLearners).lengthOf(2);
      expect(organizationLearners.map(({ id }) => id)).to.have.members([learner1.id, learner2.id]);
    });

    it('should not disable the learner when error occured', async function () {
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      await databaseBuilder.commit();

      try {
        await ApplicationTransaction.execute(async () => {
          await disableCommonOrganizationLearnersFromOrganizationId(organizationId);
          throw new Error();
        });
      } catch {
        // something
      }
      const organizationLearnerFromDatabase = await knex
        .from('organization-learners')
        .where({ id: organizationLearner.id })
        .first();

      expect(organizationLearnerFromDatabase.isDisabled).to.equal(false);
    });
  });
});
