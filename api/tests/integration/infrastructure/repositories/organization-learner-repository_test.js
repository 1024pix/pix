import _ from 'lodash';

import { expect, domainBuilder, databaseBuilder, knex, catchErr, sinon } from '../../../test-helper.js';
import { OrganizationLearner } from '../../../../lib/domain/models/OrganizationLearner.js';
import { OrganizationLearnerForAdmin } from '../../../../lib/domain/read-models/OrganizationLearnerForAdmin.js';
import { ORGANIZATION_FEATURE } from '../../../../lib/domain/constants.js';

import {
  NotFoundError,
  OrganizationLearnersCouldNotBeSavedError,
  OrganizationLearnerNotFound,
  UserCouldNotBeReconciledError,
  UserNotFoundError,
  OrganizationLearnerCertificabilityNotUpdatedError,
} from '../../../../lib/domain/errors.js';

import * as organizationLearnerRepository from '../../../../lib/infrastructure/repositories/organization-learner-repository.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import dayjs from 'dayjs';

describe('Integration | Infrastructure | Repository | organization-learner-repository', function () {
  describe('#findByIds', function () {
    it('should return all the organizationLearners for given organizationLearner IDs', async function () {
      // given
      const organizationLearner1 = databaseBuilder.factory.buildOrganizationLearner();
      const organizationLearner2 = databaseBuilder.factory.buildOrganizationLearner();
      const ids = [organizationLearner1.id, organizationLearner2.id];
      await databaseBuilder.commit();

      // when
      const organizationLearnersResult = await organizationLearnerRepository.findByIds({ ids });

      // then
      const anyOrganizationLearner = organizationLearnersResult[0];
      expect(anyOrganizationLearner).to.be.an.instanceOf(OrganizationLearner);
      expect(anyOrganizationLearner.firstName).to.equal(organizationLearner1.firstName);
      expect(anyOrganizationLearner.lastName).to.equal(organizationLearner1.lastName);
      expect(anyOrganizationLearner.birthdate).to.deep.equal(organizationLearner1.birthdate);
      expect(_.map(organizationLearnersResult, 'id')).to.have.members([
        organizationLearner1.id,
        organizationLearner2.id,
      ]);
    });

    it('should return empty array when there are no result', async function () {
      // given
      databaseBuilder.factory.buildOrganizationLearner({ id: 1 });
      databaseBuilder.factory.buildOrganizationLearner({ id: 2 });
      const notFoundIds = [3, 4];
      await databaseBuilder.commit();

      // when
      const organizationLearners = await organizationLearnerRepository.findByIds({ ids: notFoundIds });

      // then
      expect(organizationLearners).to.be.empty;
    });
  });

  describe('#findByOrganizationId', function () {
    it('should return instances of OrganizationLearner', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: null,
      });

      await databaseBuilder.commit();

      // when
      const organizationLearners = await organizationLearnerRepository.findByOrganizationId({
        organizationId: organization.id,
      });

      // then
      const anyOrganizationLearner = organizationLearners[0];
      expect(anyOrganizationLearner).to.be.an.instanceOf(OrganizationLearner);

      expect(anyOrganizationLearner.firstName).to.equal(organizationLearner.firstName);
      expect(anyOrganizationLearner.lastName).to.equal(organizationLearner.lastName);
      expect(anyOrganizationLearner.birthdate).to.deep.equal(organizationLearner.birthdate);
    });

    it('should return all the organizationLearners for a given organization ID', async function () {
      // given
      const organization_1 = databaseBuilder.factory.buildOrganization();
      const organization_2 = databaseBuilder.factory.buildOrganization();

      const user = databaseBuilder.factory.buildUser();

      const firstOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization_1.id,
      });
      const secondOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization_1.id,
        userId: user.id,
      });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization_2.id });

      await databaseBuilder.commit();

      // when
      const organizationLearners = await organizationLearnerRepository.findByOrganizationId({
        organizationId: organization_1.id,
      });

      // then
      expect(_.map(organizationLearners, 'id')).to.have.members([
        firstOrganizationLearner.id,
        secondOrganizationLearner.id,
      ]);
    });

    it('should order organizationLearners by lastName and then by firstName with no sensitive case', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      const firstOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        lastName: 'Grenier',
      });
      const secondOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        lastName: 'Avatar',
        firstName: 'Xavier',
      });
      const thirdOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        lastName: 'Avatar',
        firstName: 'Arthur',
      });
      const fourthOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        lastName: 'Avatar',
        firstName: 'MATHURIN',
      });

      await databaseBuilder.commit();

      // when
      const organizationLearners = await organizationLearnerRepository.findByOrganizationId({
        organizationId: organization.id,
      });

      // then
      expect(_.map(organizationLearners, 'id')).to.deep.include.ordered.members([
        thirdOrganizationLearner.id,
        fourthOrganizationLearner.id,
        secondOrganizationLearner.id,
        firstOrganizationLearner.id,
      ]);
    });

    it('should return empty array when there are no result', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();

      // when
      const organizationLearners = await organizationLearnerRepository.findByOrganizationId({
        organizationId: organization.id,
      });

      // then
      expect(organizationLearners).to.be.empty;
    });
  });

  describe('#findByOrganizationIdAndUpdatedAtOrderByDivision', function () {
    const afterBeginningOfThe2020SchoolYear = new Date('2020-10-15');
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers(afterBeginningOfThe2020SchoolYear);
    });

    afterEach(function () {
      clock.restore();
    });

    it('should return instances of OrganizationLearner', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: null,
        division: '3A',
        updatedAt: new Date(),
      });

      await databaseBuilder.commit();

      // when
      const paginatedOrganizationLearners =
        await organizationLearnerRepository.findByOrganizationIdAndUpdatedAtOrderByDivision({
          organizationId: organization.id,
          page: {
            size: 10,
            number: 1,
          },
          filter: { divisions: ['3A'] },
        });

      // then
      const expectedOrganizationLearner = domainBuilder.buildOrganizationLearner({
        ...organizationLearner,
        organization,
      });
      expect(paginatedOrganizationLearners.data[0]).to.deepEqualInstance(expectedOrganizationLearner);
    });

    it('should return all the organizationLearners for a given organization ID', async function () {
      // given
      const organization_1 = databaseBuilder.factory.buildOrganization();
      const organization_2 = databaseBuilder.factory.buildOrganization();

      const user = databaseBuilder.factory.buildUser();

      const firstOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization_1.id,
        division: '3A',
        updatedAt: new Date(),
      });
      const secondOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization_1.id,
        userId: user.id,
        division: '3A',
        updatedAt: new Date(),
      });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization_2.id });

      await databaseBuilder.commit();

      // when
      const organizationLearners = await organizationLearnerRepository.findByOrganizationIdAndUpdatedAtOrderByDivision({
        organizationId: organization_1.id,
        page: {
          size: 10,
          number: 1,
        },
        filter: { divisions: ['3A'] },
      });

      // then
      const expectedFirstOrganizationLearner = domainBuilder.buildOrganizationLearner({
        ...firstOrganizationLearner,
        organization: organization_1,
      });
      const expectedSecondOrganizationLearner = domainBuilder.buildOrganizationLearner({
        ...secondOrganizationLearner,
        organization: organization_1,
      });
      expect(organizationLearners.data).to.deepEqualArray([
        expectedFirstOrganizationLearner,
        expectedSecondOrganizationLearner,
      ]);
    });

    it('should not return disabled organizationLearners for a given organization ID', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const user = databaseBuilder.factory.buildUser();
      const notDisabledOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        isDisabled: false,
        organizationId: organization.id,
        division: '3A',
        updatedAt: new Date(),
      });
      databaseBuilder.factory.buildOrganizationLearner({
        isDisabled: true,
        organizationId: organization.id,
        userId: user.id,
        division: '3A',
        updatedAt: new Date(),
      });

      await databaseBuilder.commit();

      // when
      const organizationLearners = await organizationLearnerRepository.findByOrganizationIdAndUpdatedAtOrderByDivision({
        organizationId: organization.id,
        page: {
          size: 10,
          number: 1,
        },
        filter: { divisions: ['3A'] },
      });

      // then
      const expectedNotDisabledOrganizationLearner = domainBuilder.buildOrganizationLearner({
        ...notDisabledOrganizationLearner,
        organization,
      });
      expect(organizationLearners.data).to.deepEqualArray([expectedNotDisabledOrganizationLearner]);
    });

    it('should order organizationLearners by division and last name and then first name with no sensitive case', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      const organizationLearner3B = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        division: '3b',
        updatedAt: new Date(),
      });
      const organizationLearner3ABA = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        division: '3A',
        lastName: 'B',
        firstName: 'A',
        updatedAt: new Date(),
      });
      const organizationLearner3ABB = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        division: '3A',
        lastName: 'B',
        firstName: 'B',
        updatedAt: new Date(),
      });
      const organizationLearnerT2 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        division: 'T2',
        updatedAt: new Date(),
      });
      const organizationLearnerT1CB = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        division: 't1',
        lastName: 'C',
        firstName: 'B',
        updatedAt: new Date(),
      });
      const organizationLearnerT1CA = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        division: 't1',
        lastName: 'C',
        firstName: 'A',
        updatedAt: new Date(),
      });

      await databaseBuilder.commit();

      // when
      const organizationLearners = await organizationLearnerRepository.findByOrganizationIdAndUpdatedAtOrderByDivision({
        organizationId: organization.id,
        page: {
          size: 10,
          number: 1,
        },
        filter: {},
      });

      // then
      const expectedOrganizationLearner3ABA = domainBuilder.buildOrganizationLearner({
        ...organizationLearner3ABA,
        organization,
      });
      const expectedOrganizationLearner3ABB = domainBuilder.buildOrganizationLearner({
        ...organizationLearner3ABB,
        organization,
      });
      const expectedOrganizationLearner3B = domainBuilder.buildOrganizationLearner({
        ...organizationLearner3B,
        organization,
      });
      const expectedOrganizationLearnerT1CA = domainBuilder.buildOrganizationLearner({
        ...organizationLearnerT1CA,
        organization,
      });
      const expectedOrganizationLearnerT1CB = domainBuilder.buildOrganizationLearner({
        ...organizationLearnerT1CB,
        organization,
      });
      const expectedOrganizationLearnerT2 = domainBuilder.buildOrganizationLearner({
        ...organizationLearnerT2,
        organization,
      });
      expect(organizationLearners.data).to.deepEqualArray([
        expectedOrganizationLearner3ABA,
        expectedOrganizationLearner3ABB,
        expectedOrganizationLearner3B,
        expectedOrganizationLearnerT1CA,
        expectedOrganizationLearnerT1CB,
        expectedOrganizationLearnerT2,
      ]);
    });

    it('when there are two students and we ask for pages of one student, it should return one student on page two', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      const organizationLearner3B = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        division: '3b',
        updatedAt: new Date(),
      });

      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        division: '3A',
        lastName: 'B',
        firstName: 'A',
        updatedAt: new Date(),
      });

      await databaseBuilder.commit();

      // when
      const organizationLearners = await organizationLearnerRepository.findByOrganizationIdAndUpdatedAtOrderByDivision({
        organizationId: organization.id,
        page: {
          size: 1,
          number: 2,
        },
        filter: {},
      });

      // then
      const expectedOrganizationLearnerInPage1 = domainBuilder.buildOrganizationLearner({
        ...organizationLearner3B,
        organization,
      });
      expect(organizationLearners.data).to.deepEqualArray([expectedOrganizationLearnerInPage1]);
    });

    it('should filter out students registered after August 15, 2020', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      const beforeTheDate = new Date('2020-08-14T10:00:00Z');
      const afterTheDate = new Date('2020-08-16T10:00:00Z');
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id, updatedAt: beforeTheDate });
      const earlierOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        updatedAt: afterTheDate,
      });

      await databaseBuilder.commit();

      // when
      const organizationLearners = await organizationLearnerRepository.findByOrganizationIdAndUpdatedAtOrderByDivision({
        organizationId: organization.id,
        page: {
          size: 10,
          number: 1,
        },
        filter: {},
      });

      // then
      const expectedEarlierOrganizationLearner = domainBuilder.buildOrganizationLearner({
        ...earlierOrganizationLearner,
        organization,
      });
      expect(organizationLearners.data).to.deepEqualArray([expectedEarlierOrganizationLearner]);
    });
  });

  describe('#findByUserId', function () {
    it('should return instances of OrganizationLearner', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId,
      });

      await databaseBuilder.commit();

      // when
      const organizationLearners = await organizationLearnerRepository.findByUserId({ userId });

      // then
      const anyOrganizationLearner = organizationLearners[0];
      expect(anyOrganizationLearner).to.be.an.instanceOf(OrganizationLearner);

      expect(anyOrganizationLearner.firstName).to.equal(organizationLearner.firstName);
      expect(anyOrganizationLearner.lastName).to.equal(organizationLearner.lastName);
      expect(anyOrganizationLearner.birthdate).to.deep.equal(organizationLearner.birthdate);
    });

    it('should return all the organizationLearners for a given user ID', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;

      const firstOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({ userId });
      const secondOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({ userId });

      await databaseBuilder.commit();

      // when
      const organizationLearners = await organizationLearnerRepository.findByUserId({ userId });

      // then
      expect(_.map(organizationLearners, 'id')).to.have.members([
        firstOrganizationLearner.id,
        secondOrganizationLearner.id,
      ]);
    });

    it('should order organizationLearners by id', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const firstOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({ userId });
      const secondOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({ userId });
      const thirdOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({ userId });
      const fourthOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({ userId });

      await databaseBuilder.commit();

      // when
      const organizationLearners = await organizationLearnerRepository.findByUserId({ userId });

      // then
      expect(_.map(organizationLearners, 'id')).to.deep.include.ordered.members([
        firstOrganizationLearner.id,
        secondOrganizationLearner.id,
        thirdOrganizationLearner.id,
        fourthOrganizationLearner.id,
      ]);
    });
  });

  describe('#isOrganizationLearnerIdLinkedToUserAndSCOOrganization', function () {
    it('should return true when an organizationLearnermatches an id and matches also a given user id and a SCO organization', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const otherUserId = databaseBuilder.factory.buildUser().id;
      const firstScoOrganizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;
      const secondScoOrganizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;
      const supOrganizationId = databaseBuilder.factory.buildOrganization({ type: 'SUP' }).id;
      const matchingOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        userId,
        organizationId: firstScoOrganizationId,
      }).id;
      databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId: secondScoOrganizationId });
      databaseBuilder.factory.buildOrganizationLearner({
        userId: otherUserId,
        organizationId: secondScoOrganizationId,
      });
      databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId: supOrganizationId });
      await databaseBuilder.commit();

      // when
      const isLinked = await organizationLearnerRepository.isOrganizationLearnerIdLinkedToUserAndSCOOrganization({
        userId,
        organizationLearnerId: matchingOrganizationLearnerId,
      });

      // then
      expect(isLinked).to.be.true;
    });

    it('should return false when no organizationLearner matches an id and matches also a given user id and a SCO organization', async function () {
      // when
      const isLinked = await organizationLearnerRepository.isOrganizationLearnerIdLinkedToUserAndSCOOrganization({
        userId: 42,
        organizationLearnerId: 42,
      });

      // then
      expect(isLinked).to.be.false;
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
        return organizationLearnerRepository.disableAllOrganizationLearnersInOrganization({
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
        return organizationLearnerRepository.disableAllOrganizationLearnersInOrganization({
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
          await organizationLearnerRepository.disableAllOrganizationLearnersInOrganization({
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
        afterEach(function () {
          return knex('organization-learners').delete();
        });

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
              return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
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
              return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
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

      afterEach(function () {
        return knex('organization-learners').delete();
      });

      it('should create all organizationLearners', async function () {
        // when
        await DomainTransaction.execute((domainTransaction) => {
          return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
            organizationLearners,
            organizationId,
            domainTransaction,
          );
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
            return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
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
            return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
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
            return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
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
            return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
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
          return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
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
          return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
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
          return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
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

      afterEach(function () {
        return knex('organization-learners').delete();
      });

      it('should create organizationLearner and reconcile it with the help of another organizationLearner', async function () {
        // given
        databaseBuilder.factory.buildOrganizationLearner({ nationalStudentId, birthdate, userId });
        databaseBuilder.factory.buildCertificationCourse({ userId });
        await databaseBuilder.commit();

        // when
        await DomainTransaction.execute((domainTransaction) => {
          return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
            organizationLearners,
            organizationId,
            domainTransaction,
          );
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
          return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
            organizationLearners,
            organizationId,
            domainTransaction,
          );
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
            return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
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

      afterEach(function () {
        return knex('organization-learners').delete();
      });

      it('should update and create all organizationLearners', async function () {
        // when
        await DomainTransaction.execute((domainTransaction) => {
          return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
            organizationLearners,
            organizationId,
            domainTransaction,
          );
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

      afterEach(function () {
        return knex('organization-learners').delete();
      });

      it('should return a OrganizationLearnersCouldNotBeSavedError on unicity errors', async function () {
        // when
        let error;
        await DomainTransaction.execute(async (domainTransaction) => {
          error = await catchErr(
            organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners,
            organizationLearnerRepository,
          )(organizationLearners, organizationId, domainTransaction);
        });

        // then
        expect(error).to.be.instanceof(OrganizationLearnersCouldNotBeSavedError);
      });

      it('should return a OrganizationLearnersCouldNotBeSavedError', async function () {
        // when
        let error;
        await DomainTransaction.execute(async (domainTransaction) => {
          error = await catchErr(
            organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners,
            organizationLearnerRepository,
          )([{ nationalStudentId: 'something' }], organizationId, domainTransaction);
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
          return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
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
            await organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
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

  describe('#findByOrganizationIdAndBirthdate', function () {
    let organization;

    beforeEach(async function () {
      organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: null,
        preferredLastName: 'Lee',
        lastName: 'Lieber',
        firstName: 'Stanley',
        middleName: 'Martin',
        thirdName: 'Stan',
        birthdate: '2000-03-31',
        studentNumber: '123A',
        isDisabled: false,
      });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: null,
        lastName: 'See',
        firstName: 'Johnny',
        birthdate: '2000-03-31',
        studentNumber: '456A',
        isDisabled: false,
      });
      await databaseBuilder.commit();
    });

    it('should return found organizationLearners with birthdate', async function () {
      // given
      const birthdate = '2000-03-31';

      // when
      const result = await organizationLearnerRepository.findByOrganizationIdAndBirthdate({
        organizationId: organization.id,
        birthdate,
      });

      // then
      expect(result.length).to.be.equal(2);
    });

    it('should return empty array when there are no active organization-learners', async function () {
      // given
      const birthdate = '2001-01-01';
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: null,
        lastName: 'Stark',
        firstName: 'Anthony',
        birthdate,
        studentNumber: '006A',
        isDisabled: true,
      });
      await databaseBuilder.commit();

      // when
      const result = await organizationLearnerRepository.findByOrganizationIdAndBirthdate({
        organizationId: organization.id,
        birthdate,
      });

      // then
      expect(result.length).to.be.equal(0);
    });

    it('should return empty array when there are no organization-learners with the given birthdate', async function () {
      // given
      const birthdate = '2001-03-31';

      // when
      const result = await organizationLearnerRepository.findByOrganizationIdAndBirthdate({
        organizationId: organization.id,
        birthdate,
      });

      // then
      expect(result.length).to.be.equal(0);
    });

    it('should return empty array when there is no organization-learners with the given organizationId', async function () {
      // given
      const birthdate = '2000-03-31';

      // when
      const result = await organizationLearnerRepository.findByOrganizationIdAndBirthdate({
        organizationId: '999',
        birthdate,
      });

      // then
      expect(result.length).to.be.equal(0);
    });
  });

  context('Organizationlearners to dissocate', function () {
    let clock;

    beforeEach(async function () {
      clock = sinon.useFakeTimers({
        now: new Date('2023-10-12'),
        toFake: ['Date'],
      });
    });

    afterEach(async function () {
      clock.restore();
    });

    describe('#dissociateUserFromOrganizationLearner', function () {
      it('should delete association between user and organizationLearner', async function () {
        // given
        const userToNotDissociate = databaseBuilder.factory.buildUser();
        const organizationLearnerToNotDissociate = databaseBuilder.factory.buildOrganizationLearner({
          userId: userToNotDissociate.id,
        });
        const userToDissociate = databaseBuilder.factory.buildUser();
        const organizationLearnerToDissociate = databaseBuilder.factory.buildOrganizationLearner({
          userId: userToDissociate.id,
        });
        await databaseBuilder.commit();

        // when
        await organizationLearnerRepository.dissociateUserFromOrganizationLearner(organizationLearnerToDissociate.id);

        // then
        const organizationLearnerDissociate = await knex('organization-learners')
          .where({ id: organizationLearnerToDissociate.id })
          .first();
        const organizationLearnerNotDissociate = await knex('organization-learners')
          .where({ id: organizationLearnerToNotDissociate.id })
          .first();

        expect(organizationLearnerDissociate.userId).to.equal(null);
        expect(organizationLearnerNotDissociate.userId).to.equal(userToNotDissociate.id);
      });

      it('should set updatedAt to today', async function () {
        // given
        const userToDissociate = databaseBuilder.factory.buildUser();
        const organizationLearnerToDissociate = databaseBuilder.factory.buildOrganizationLearner({
          userId: userToDissociate.id,
          isCertifiable: true,
          certifiableAt: new Date(),
        });
        await databaseBuilder.commit();

        // when
        await organizationLearnerRepository.dissociateUserFromOrganizationLearner(organizationLearnerToDissociate.id);

        // then
        const organizationLearnerPatched = await knex('organization-learners')
          .where({ id: organizationLearnerToDissociate.id })
          .first();
        expect(organizationLearnerPatched.updatedAt).to.deep.equal(new Date('2023-10-12'));
      });

      it('should reset isCertifiable and certifiableAt to null', async function () {
        // given
        const userToDissociate = databaseBuilder.factory.buildUser();
        const organizationLearnerToDissociate = databaseBuilder.factory.buildOrganizationLearner({
          userId: userToDissociate.id,
          isCertifiable: true,
          certifiableAt: new Date(),
        });
        await databaseBuilder.commit();

        // when
        await organizationLearnerRepository.dissociateUserFromOrganizationLearner(organizationLearnerToDissociate.id);

        // then
        const organizationLearnerPatched = await knex('organization-learners')
          .where({ id: organizationLearnerToDissociate.id })
          .first();
        expect(organizationLearnerPatched.isCertifiable).to.equal(null);
        expect(organizationLearnerPatched.certifiableAt).to.equal(null);
      });
    });

    describe('#dissociateAllStudentsByUserId', function () {
      it('should delete association between user and organization learner in a managing student organization', async function () {
        // given
        const notManagingStudentOrganization = databaseBuilder.factory.buildOrganization({ isManagingStudents: false });
        const managingStudentOrganization = databaseBuilder.factory.buildOrganization({ isManagingStudents: true });
        const otherManagingStudentOrganization = databaseBuilder.factory.buildOrganization({
          isManagingStudents: true,
        });

        const otherUser = databaseBuilder.factory.buildUser();
        const userIdToDissociate = databaseBuilder.factory.buildUser().id;

        const initialDate = new Date('2023-01-01');

        const otherOrganizationLearnerToNotDissociate = databaseBuilder.factory.buildOrganizationLearner({
          userId: otherUser.id,
          organizationId: managingStudentOrganization.id,
          updatedAt: initialDate,
        });
        const organizationLearnerToNotDissociate = databaseBuilder.factory.buildOrganizationLearner({
          userId: userIdToDissociate,
          organizationId: notManagingStudentOrganization.id,
          updatedAt: initialDate,
        });
        const firstOrganizationLearnerToDissociate = databaseBuilder.factory.buildOrganizationLearner({
          userId: userIdToDissociate,
          organizationId: managingStudentOrganization.id,
          updatedAt: initialDate,
        });
        const secondOrganizationLearnerToDissociate = databaseBuilder.factory.buildOrganizationLearner({
          userId: userIdToDissociate,
          organizationId: otherManagingStudentOrganization.id,
          updatedAt: initialDate,
        });
        await databaseBuilder.commit();

        // when
        await organizationLearnerRepository.dissociateAllStudentsByUserId({ userId: userIdToDissociate });

        // then
        const allDissociatedOrganizationLearners = await knex('organization-learners').whereNull('userId');
        const dissociatedUserIds = [];
        const dissociatedUpdatedAt = [];

        allDissociatedOrganizationLearners.forEach((organizationLearner) => {
          dissociatedUserIds.push(organizationLearner.id);
          dissociatedUpdatedAt.push(organizationLearner.updatedAt);
        });

        expect(allDissociatedOrganizationLearners.length).to.be.equal(2);
        expect(dissociatedUserIds).to.be.members([
          firstOrganizationLearnerToDissociate.id,
          secondOrganizationLearnerToDissociate.id,
        ]);
        expect(dissociatedUpdatedAt).to.be.deep.members([new Date('2023-10-12'), new Date('2023-10-12')]);

        const allNonDissociatedOrganizationLearners = await knex('organization-learners').whereNotNull('userId');
        const nonDissociatedUserIds = [];
        const nonDissociatedUpdatedAt = [];

        allNonDissociatedOrganizationLearners.forEach((organizationLearner) => {
          nonDissociatedUserIds.push(organizationLearner.id);
          nonDissociatedUpdatedAt.push(organizationLearner.updatedAt);
        });
        expect(allNonDissociatedOrganizationLearners.length).to.be.equal(2);
        expect(nonDissociatedUserIds).to.be.members([
          otherOrganizationLearnerToNotDissociate.id,
          organizationLearnerToNotDissociate.id,
        ]);
        expect(nonDissociatedUpdatedAt).to.be.deep.members([initialDate, initialDate]);
      });
    });
  });

  describe('#reconcileUserToOrganizationLearner', function () {
    afterEach(function () {
      return knex('organization-learners').delete();
    });

    let organization;
    let organizationLearner;
    let user;
    let initialDate;

    beforeEach(async function () {
      initialDate = new Date('2023-01-01');
      organization = databaseBuilder.factory.buildOrganization();
      organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: null,
        firstName: 'Steeve',
        lastName: 'Roger',
        updatedAt: initialDate,
      });
      user = databaseBuilder.factory.buildUser({ firstName: 'Steeve', lastName: 'Roger' });
      await databaseBuilder.commit();
    });

    it('should save association between user and organizationLearner', async function () {
      // when
      const organizationLearnerPatched = await organizationLearnerRepository.reconcileUserToOrganizationLearner({
        userId: user.id,
        organizationLearnerId: organizationLearner.id,
      });

      // then
      expect(organizationLearnerPatched).to.be.instanceof(OrganizationLearner);
      expect(organizationLearnerPatched.updatedAt).to.be.above(initialDate);
      expect(organizationLearnerPatched.userId).to.equal(user.id);
    });

    it('should return an error when we don’t find the organizationLearner to update', async function () {
      // given
      const fakeStudentId = 1;

      // when
      const error = await catchErr(organizationLearnerRepository.reconcileUserToOrganizationLearner)({
        userId: user.id,
        organizationLearnerId: fakeStudentId,
      });

      // then
      expect(error).to.be.instanceOf(UserCouldNotBeReconciledError);
    });

    it('should return an error when the userId to link don’t match a user', async function () {
      // given
      const fakeUserId = 1;

      // when
      const error = await catchErr(organizationLearnerRepository.reconcileUserToOrganizationLearner)({
        userId: fakeUserId,
        organizationLearnerId: organizationLearner.id,
      });

      // then
      expect(error).to.be.instanceOf(UserCouldNotBeReconciledError);
    });

    it('should return an error when the organization learner is disabled', async function () {
      // given
      const disabledOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: null,
        isDisabled: true,
      });

      // when
      const error = await catchErr(organizationLearnerRepository.reconcileUserToOrganizationLearner)({
        userId: user.id,
        organizationLearnerId: disabledOrganizationLearner.id,
      });

      // then
      expect(error).to.be.instanceOf(UserCouldNotBeReconciledError);
    });
  });

  describe('#reconcileUserAndOrganization', function () {
    afterEach(function () {
      return knex('organization-learners').delete();
    });

    context('when the organizationLearner is active', function () {
      let organization;
      let organizationLearner;
      let user;
      let initialDate;

      beforeEach(async function () {
        initialDate = new Date('2023-01-01');
        organization = databaseBuilder.factory.buildOrganization();
        organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          userId: null,
          firstName: 'Steeve',
          lastName: 'Roger',
          isDisabled: false,
        });
        user = databaseBuilder.factory.buildUser({ firstName: 'Steeve', lastName: 'Roger' });
        await databaseBuilder.commit();
      });

      it('should save association between user and organization', async function () {
        // when
        const organizationLearnerPatched =
          await organizationLearnerRepository.reconcileUserByNationalStudentIdAndOrganizationId({
            userId: user.id,
            nationalStudentId: organizationLearner.nationalStudentId,
            organizationId: organization.id,
          });

        // then
        expect(organizationLearnerPatched).to.be.instanceof(OrganizationLearner);
        expect(organizationLearnerPatched.updatedAt).to.be.above(initialDate);
        expect(organizationLearnerPatched.userId).to.equal(user.id);
      });

      it('should return an error when we don’t find the organizationLearner for this organization to update', async function () {
        // given
        const fakeOrganizationId = 1;

        // when
        const error = await catchErr(organizationLearnerRepository.reconcileUserByNationalStudentIdAndOrganizationId)({
          userId: user.id,
          nationalStudentId: organizationLearner.nationalStudentId,
          organizationId: fakeOrganizationId,
        });

        // then
        expect(error).to.be.instanceof(UserCouldNotBeReconciledError);
      });

      it('should return an error when we don’t find the organizationLearner for this nationalStudentId to update', async function () {
        // given
        const fakeNationalStudentId = 1;

        // when
        const error = await catchErr(organizationLearnerRepository.reconcileUserByNationalStudentIdAndOrganizationId)({
          userId: user.id,
          nationalStudentId: fakeNationalStudentId,
          organizationId: organization.id,
        });

        // then
        expect(error).to.be.instanceof(UserCouldNotBeReconciledError);
      });

      it('should return an error when the userId to link don’t match a user', async function () {
        // given
        const fakeUserId = 1;

        // when
        const error = await catchErr(organizationLearnerRepository.reconcileUserByNationalStudentIdAndOrganizationId)({
          userId: fakeUserId,
          nationalStudentId: organizationLearner.nationalStudentId,
          organizationId: organization.id,
        });

        // then
        expect(error).to.be.instanceof(UserCouldNotBeReconciledError);
      });
    });

    context('when the organizationLearner is disabled', function () {
      it('should return an error', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const { id: userId } = databaseBuilder.factory.buildUser({ firstName: 'Natasha', lastName: 'Romanoff' });
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId: null,
          firstName: 'Natasha',
          lastName: 'Romanoff',
          isDisabled: true,
        });
        // when
        const error = await catchErr(organizationLearnerRepository.reconcileUserByNationalStudentIdAndOrganizationId)({
          userId,
          nationalStudentId: organizationLearner.nationalStudentId,
          organizationId,
        });

        // then
        expect(error).to.be.instanceof(UserCouldNotBeReconciledError);
      });
    });
  });

  describe('#findOneByUserIdAndOrganizationId', function () {
    let userId;
    let organizationId;

    beforeEach(function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId });
      return databaseBuilder.commit();
    });

    it('should return instance of OrganizationLearner linked to the given userId and organizationId', async function () {
      // when
      const organizationLearner = await organizationLearnerRepository.findOneByUserIdAndOrganizationId({
        userId,
        organizationId,
      });

      // then
      expect(organizationLearner).to.be.an.instanceOf(OrganizationLearner);
      expect(organizationLearner.userId).to.equal(userId);
    });

    it('should return null if there is no organizationLearner linked to the given userId', async function () {
      // given
      const otherUserId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const result = await organizationLearnerRepository.findOneByUserIdAndOrganizationId({
        userId: otherUserId,
        organizationId,
      });

      // then
      expect(result).to.equal(null);
    });

    it('should return null if there is no organizationLearner linked to the given organizationId', async function () {
      // given
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      // when
      const result = await organizationLearnerRepository.findOneByUserIdAndOrganizationId({
        userId,
        organizationId: otherOrganizationId,
      });

      // then
      expect(result).to.equal(null);
    });
  });

  describe('#get', function () {
    let organizationLearnerId;

    beforeEach(function () {
      organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      return databaseBuilder.commit();
    });

    it('should return an instance of OrganizationLearner', async function () {
      // when
      const organizationLearner = await organizationLearnerRepository.get(organizationLearnerId);

      // then
      expect(organizationLearner).to.be.an.instanceOf(OrganizationLearner);
      expect(organizationLearner.id).to.equal(organizationLearnerId);
    });

    it('should return a NotFoundError if no organizationLearner is found', async function () {
      // given
      const nonExistentStudentId = 678;

      // when
      const result = await catchErr(organizationLearnerRepository.get)(nonExistentStudentId);

      // then
      expect(result).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#getOrganizationLearnerForAdmin', function () {
    let organizationLearnerId;

    beforeEach(function () {
      organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      return databaseBuilder.commit();
    });

    it('should return an instance of OrganizationLearnerForAdmin', async function () {
      // when
      const organizationLearner =
        await organizationLearnerRepository.getOrganizationLearnerForAdmin(organizationLearnerId);

      // then
      expect(organizationLearner).to.be.an.instanceOf(OrganizationLearnerForAdmin);
      expect(organizationLearner.id).to.equal(organizationLearnerId);
    });

    it('should return a NotFoundError if no organizationLearner is found', async function () {
      // given
      const nonExistentOrganizationLearnerId = 678;

      // when
      const result = await catchErr(organizationLearnerRepository.getOrganizationLearnerForAdmin)(
        nonExistentOrganizationLearnerId,
      );

      // then
      expect(result).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#getLatestOrganizationLearner', function () {
    it('should return the latest organization learner', async function () {
      // given
      const expectedUserId = databaseBuilder.factory.buildUser().id;
      const latestOrganizationId = databaseBuilder.factory.buildOrganization({ id: 1 }).id;
      const oldestOrganizationId = databaseBuilder.factory.buildOrganization({ id: 3 }).id;

      const studentInformation = {
        ine: '123456789AA',
        birthdate: '2000-12-07',
      };
      databaseBuilder.factory.buildOrganizationLearner({
        id: 1,
        organizationId: latestOrganizationId,
        userId: expectedUserId,
        birthdate: studentInformation.birthdate,
        nationalStudentId: studentInformation.ine,
        updatedAt: new Date('2013-01-01T15:00:00Z'),
      });
      databaseBuilder.factory.buildOrganizationLearner({
        id: 80,
        organizationId: oldestOrganizationId,
        userId: expectedUserId,
        birthdate: studentInformation.birthdate,
        nationalStudentId: studentInformation.ine,
        updatedAt: new Date('2000-01-01T15:00:00Z'),
      });

      await databaseBuilder.commit();

      // when
      const organizationLearner = await organizationLearnerRepository.getLatestOrganizationLearner({
        birthdate: studentInformation.birthdate,
        nationalStudentId: studentInformation.ine,
      });

      // then
      expect(organizationLearner.organizationId).to.equal(1);
      expect(organizationLearner.id).to.equal(1);
    });

    it('should return a UserNotFoundError if INE is invalid', async function () {
      // given
      const studentInformation = {
        ine: '123456789AB',
        birthdate: '2000-12-07',
      };
      databaseBuilder.factory.buildOrganizationLearner({
        birthdate: studentInformation.birthdate,
        nationalStudentId: studentInformation.ine,
      });

      await databaseBuilder.commit();

      // when
      const result = await catchErr(organizationLearnerRepository.getLatestOrganizationLearner)({
        nationalStudentId: '222256789AB',
        birthdate: '2000-12-07',
      });

      // then
      expect(result).to.be.instanceOf(UserNotFoundError);
    });

    it('should return a UserNotFoundError if userId is null', async function () {
      // given
      const studentInformation = {
        ine: '123456789AB',
        birthdate: '2000-12-07',
      };
      databaseBuilder.factory.buildOrganizationLearner({
        birthdate: studentInformation.birthdate,
        nationalStudentId: studentInformation.ine,
        userId: null,
      });

      await databaseBuilder.commit();

      // when
      const result = await catchErr(organizationLearnerRepository.getLatestOrganizationLearner)({
        nationalStudentId: '123456789AB',
        birthdate: '2000-12-07',
      });

      // then
      expect(result).to.be.instanceOf(UserNotFoundError);
    });
  });

  describe('#updateUserIdWhereNull', function () {
    let userId;
    let organizationLearnerId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    it('should update userId if it was null before', async function () {
      // given
      organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        userId: null,
      }).id;
      await databaseBuilder.commit();

      // when
      const updatedOrganizationLearner = await organizationLearnerRepository.updateUserIdWhereNull({
        organizationLearnerId,
        userId,
      });

      // then
      expect(updatedOrganizationLearner.userId).to.equal(userId);
    });

    it('should throw where organizationLearner is already linked with a user', async function () {
      // given
      organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        userId,
      }).id;
      await databaseBuilder.commit();

      // when
      const error = await catchErr(organizationLearnerRepository.updateUserIdWhereNull)({
        organizationLearnerId,
        userId,
      });

      // then
      expect(error).to.be.an.instanceOf(OrganizationLearnerNotFound);
    });
  });

  describe('#isActive', function () {
    it('returns true when there is no organization learner', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId });
      await databaseBuilder.commit();

      const isActive = await organizationLearnerRepository.isActive({ userId, campaignId });

      expect(isActive).to.be.true;
    });

    it('returns true when the organization learner is active', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId });
      databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId, isDisabled: false });
      await databaseBuilder.commit();

      const isActive = await organizationLearnerRepository.isActive({ userId, campaignId });

      expect(isActive).to.be.true;
    });

    it('returns false when the organization learner is disabled', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId });
      databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId, isDisabled: true });
      await databaseBuilder.commit();

      const isActive = await organizationLearnerRepository.isActive({ userId, campaignId });

      expect(isActive).to.be.false;
    });

    it('takes into account only organization learner for the given userId', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId });
      databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId, isDisabled: true });

      const otherUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCampaignParticipation({ userId: otherUserId, campaignId });
      databaseBuilder.factory.buildOrganizationLearner({ userId: otherUserId, organizationId, isDisabled: false });
      await databaseBuilder.commit();

      const isActive = await organizationLearnerRepository.isActive({ userId: otherUserId, campaignId });

      expect(isActive).to.be.true;
    });

    it('takes into account only organization learner for the given campaignId', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId });
      databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId, isDisabled: true });

      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const otherCampaignId = databaseBuilder.factory.buildCampaign({ organizationId: otherOrganizationId }).id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: otherCampaignId });
      databaseBuilder.factory.buildOrganizationLearner({
        userId,
        organizationId: otherOrganizationId,
        isDisabled: false,
      });
      await databaseBuilder.commit();

      const isActive = await organizationLearnerRepository.isActive({ userId, campaignId: otherCampaignId });

      expect(isActive).to.be.true;
    });
  });
  describe('#updateCertificability', function () {
    it('should update isCertifiable and certifiableAt', async function () {
      // given
      const organizationLearner = new OrganizationLearner(
        databaseBuilder.factory.buildOrganizationLearner({ isCertifiable: null, certifiableAt: null }),
      );
      await databaseBuilder.commit();

      // when
      organizationLearner.isCertifiable = true;
      organizationLearner.certifiableAt = new Date('2023-01-01');
      await organizationLearnerRepository.updateCertificability(organizationLearner);

      // then
      const { isCertifiable, certifiableAt } = await knex('organization-learners')
        .where({ id: organizationLearner.id })
        .first();
      expect(isCertifiable).to.be.true;
      expect(new Date(certifiableAt)).to.deep.equal(organizationLearner.certifiableAt);
    });

    it('should throw an error if it does not update anything', async function () {
      // given
      const notExistingOrganizationLearner = new OrganizationLearner({ id: 1 });
      await databaseBuilder.commit();

      // when
      notExistingOrganizationLearner.isCertifiable = true;
      notExistingOrganizationLearner.certifiableAt = new Date('2023-01-01');

      const error = await catchErr(organizationLearnerRepository.updateCertificability)(notExistingOrganizationLearner);

      // then
      expect(error).to.be.instanceof(OrganizationLearnerCertificabilityNotUpdatedError);
    });
  });
  describe('#countByOrganizationsWhichNeedToComputeCertificability', function () {
    let featureId;
    let fromUserActivityDate;
    let toUserActivityDate;

    beforeEach(function () {
      fromUserActivityDate = dayjs('2023-07-02').hour(21).minute(0).second(0).millisecond(0).toDate();
      toUserActivityDate = dayjs('2023-07-03').hour(21).minute(0).second(0).millisecond(0).toDate();
      featureId = databaseBuilder.factory.buildFeature(
        ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY,
      ).id;
    });

    it('should return count of organization learners with lastLoggedAt in the past 24hours', async function () {
      // given
      const userNotComputed = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildUserLogin({
        userId: userNotComputed,
        lastLoggedAt: dayjs('2023-07-03').hour(21).minute(0).second(0).millisecond(0),
      });

      const anotherUserNotComputed = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildUserLogin({
        userId: anotherUserNotComputed,
        lastLoggedAt: dayjs('2023-07-02').hour(21).minute(0).second(0).millisecond(0),
      });

      const userComputed = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildUserLogin({
        userId: userComputed,
        lastLoggedAt: dayjs('2023-07-02').hour(20).minute(59).second(0).millisecond(0),
      });

      const { organizationId } = databaseBuilder.factory.buildOrganizationLearner({ userId: userNotComputed });
      databaseBuilder.factory.buildOrganizationLearner({ userId: userComputed, organizationId });
      databaseBuilder.factory.buildOrganizationLearner({ userId: anotherUserNotComputed, organizationId });

      databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
      await databaseBuilder.commit();

      // when
      const result = await DomainTransaction.execute(async (domainTransaction) => {
        return organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability({
          fromUserActivityDate,
          toUserActivityDate,
          domainTransaction,
        });
      });

      // then
      expect(result).to.equal(1);
    });

    it('should not count organization learners not reconciliated', async function () {
      // given
      const { organizationId } = databaseBuilder.factory.buildOrganizationLearner({ userId: null });

      databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
      await databaseBuilder.commit();

      // when
      const result = await DomainTransaction.execute(async (domainTransaction) => {
        return organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability({
          fromUserActivityDate,
          domainTransaction,
        });
      });

      // then
      expect(result).to.equal(0);
    });

    it('should not count a disabled organization learner', async function () {
      // given
      const { organizationId, userId } = databaseBuilder.factory.buildOrganizationLearner({ isDisabled: true });
      databaseBuilder.factory.buildUserLogin({ userId, lastLoggedAt: new Date() });

      databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
      await databaseBuilder.commit();

      // when
      const result = await DomainTransaction.execute(async (domainTransaction) => {
        return organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability({
          fromUserActivityDate,
          domainTransaction,
        });
      });

      // then
      expect(result).to.equal(0);
    });

    context('when "skipLoggedLastDayCheck" option is passed', function () {
      it('should return count of all organization learners', async function () {
        // given
        const userRecentlyConnectedId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildUserLogin({ userId: userRecentlyConnectedId, lastLoggedAt: new Date() });
        const userNotRecentlyConnectedId = databaseBuilder.factory.buildUser().id;

        const { organizationId } = databaseBuilder.factory.buildOrganizationLearner({
          userId: userRecentlyConnectedId,
        });
        databaseBuilder.factory.buildOrganizationLearner({ userId: userNotRecentlyConnectedId, organizationId });

        databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
        await databaseBuilder.commit();

        // when
        const result = await DomainTransaction.execute(async (domainTransaction) => {
          return organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability({
            fromUserActivityDate,
            skipLoggedLastDayCheck: true,
            domainTransaction,
          });
        });

        // then
        expect(result).to.equal(2);
      });

      it('should not count organization learners not reconciliated with option skipLoggedLastDayCheck', async function () {
        // given
        const { organizationId } = databaseBuilder.factory.buildOrganizationLearner({ userId: null });

        databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
        await databaseBuilder.commit();

        // when
        const result = await DomainTransaction.execute(async (domainTransaction) => {
          return organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability({
            fromUserActivityDate,
            skipLoggedLastDayCheck: true,
            domainTransaction,
          });
        });

        // then
        expect(result).to.equal(0);
      });
    });

    context('when "onlyNotComputed" option is passed', function () {
      it('should not use this option if "skipLoggedLastDayCheck" is not true', async function () {
        // given
        const { organizationId } = databaseBuilder.factory.buildOrganizationLearner({ isCertifiable: null });

        databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
        await databaseBuilder.commit();

        // when
        const result = await DomainTransaction.execute(async (domainTransaction) => {
          return organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability({
            fromUserActivityDate,
            skipLoggedLastDayCheck: false,
            onlyNotComputed: true,
            domainTransaction,
          });
        });

        // then
        expect(result).to.equal(0);
      });

      it('should return count of organization learners with no certificability', async function () {
        // given
        const { organizationId } = databaseBuilder.factory.buildOrganizationLearner({ isCertifiable: null });

        databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
        await databaseBuilder.commit();

        // when
        const result = await DomainTransaction.execute(async (domainTransaction) => {
          return organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability({
            fromUserActivityDate,
            skipLoggedLastDayCheck: true,
            onlyNotComputed: true,
            domainTransaction,
          });
        });

        // then
        expect(result).to.equal(1);
      });

      it('should not count organization learners already computed', async function () {
        // given
        const { organizationId } = databaseBuilder.factory.buildOrganizationLearner({ isCertifiable: true });
        databaseBuilder.factory.buildOrganizationLearner({ isCertifiable: null, organizationId });

        databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
        await databaseBuilder.commit();

        // when
        const result = await DomainTransaction.execute(async (domainTransaction) => {
          return organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability({
            fromUserActivityDate,
            skipLoggedLastDayCheck: true,
            onlyNotComputed: true,
            domainTransaction,
          });
        });

        // then
        expect(result).to.equal(1);
      });
    });
  });

  describe('#findByOrganizationsWhichNeedToComputeCertificability', function () {
    let featureId;
    let fromUserActivityDate;
    let toUserActivityDate;

    beforeEach(function () {
      fromUserActivityDate = dayjs('2023-07-02').hour(21).minute(0).second(0).millisecond(0).toDate();
      toUserActivityDate = dayjs('2023-07-03').hour(21).minute(0).second(0).millisecond(0).toDate();
      featureId = databaseBuilder.factory.buildFeature(
        ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY,
      ).id;
    });

    it('should return only organization learner with lastLoggedAt in the past 24hours', async function () {
      // given
      const userNotComputed = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildUserLogin({
        userId: userNotComputed,
        lastLoggedAt: dayjs('2023-07-03').hour(21).minute(1).second(0).millisecond(0),
      });

      const anotherUserNotComputed = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildUserLogin({
        userId: anotherUserNotComputed,
        lastLoggedAt: dayjs('2023-07-02').hour(20).minute(59).second(0).millisecond(0),
      });

      const userComputed = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildUserLogin({
        userId: userComputed,
        lastLoggedAt: dayjs('2023-07-02').hour(21).minute(1).second(0).millisecond(0),
      });

      const { organizationId } = databaseBuilder.factory.buildOrganizationLearner({ userId: userNotComputed });
      const { id: organizationLearnerIdComputed } = databaseBuilder.factory.buildOrganizationLearner({
        userId: userComputed,
        organizationId,
      });
      databaseBuilder.factory.buildOrganizationLearner({ userId: anotherUserNotComputed, organizationId });

      databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
      await databaseBuilder.commit();

      // when
      const result = await DomainTransaction.execute(async (domainTransaction) => {
        return organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability({
          domainTransaction,
          fromUserActivityDate,
          toUserActivityDate,
        });
      });

      // then
      expect(result).to.deep.equal([organizationLearnerIdComputed]);
    });

    it('should not return an organization learner not reconciliated', async function () {
      // given
      const { organizationId } = databaseBuilder.factory.buildOrganizationLearner({ userId: null });

      databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
      await databaseBuilder.commit();

      // when
      const result = await DomainTransaction.execute(async (domainTransaction) => {
        return organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability({
          domainTransaction,
          fromUserActivityDate,
          toUserActivityDate,
        });
      });

      // then
      expect(result).to.be.empty;
    });

    it('should not return a disabled organization learner id', async function () {
      // given
      const { organizationId, userId } = databaseBuilder.factory.buildOrganizationLearner({ isDisabled: true });
      databaseBuilder.factory.buildUserLogin({ userId, lastLoggedAt: new Date('2023-07-03T19:00:00Z') });
      databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
      await databaseBuilder.commit();

      // when
      const result = await DomainTransaction.execute(async (domainTransaction) => {
        return organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability({
          domainTransaction,
          fromUserActivityDate,
          toUserActivityDate,
        });
      });

      // then
      expect(result).to.be.empty;
    });

    it('should not return an organization learner id for organizations that cannot compute certificability', async function () {
      // given
      const { userId } = databaseBuilder.factory.buildOrganizationLearner();
      databaseBuilder.factory.buildUserLogin({ userId, lastLoggedAt: new Date('2023-07-03T19:00:00Z') });
      await databaseBuilder.commit();

      // when
      const result = await DomainTransaction.execute(async (domainTransaction) => {
        return organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability({
          domainTransaction,
          fromUserActivityDate,
          toUserActivityDate,
        });
      });

      // then
      expect(result).to.be.empty;
    });

    it('should not return an organization learner id for organizations with other features', async function () {
      // given
      const { organizationId, userId } = databaseBuilder.factory.buildOrganizationLearner();
      databaseBuilder.factory.buildUserLogin({ userId, lastLoggedAt: new Date('2023-07-03T19:00:00Z') });
      const otherFeatureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT).id;
      databaseBuilder.factory.buildOrganizationFeature({ featureId: otherFeatureId, organizationId });
      await databaseBuilder.commit();

      // when
      const result = await DomainTransaction.execute(async (domainTransaction) => {
        return organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability({
          domainTransaction,
          fromUserActivityDate,
          toUserActivityDate,
        });
      });

      // then
      expect(result).to.deep.equal([]);
    });

    context('when "skippLoggedLastDayCheck" option is passed', function () {
      it('should return all organization learners', async function () {
        // given
        const userRecentlyConnectedId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildUserLogin({
          userId: userRecentlyConnectedId,
          lastLoggedAt: new Date('2023-07-01'),
        });
        const userNotRecentlyConnectedId = databaseBuilder.factory.buildUser().id;

        const { id: organizationLearnerRecentlyConnecterId, organizationId } =
          databaseBuilder.factory.buildOrganizationLearner({ userId: userRecentlyConnectedId });
        const { id: organizationLearnerNotRecentlyConnectedId } = databaseBuilder.factory.buildOrganizationLearner({
          userId: userNotRecentlyConnectedId,
          organizationId,
        });

        databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
        await databaseBuilder.commit();

        // when
        const result = await DomainTransaction.execute(async (domainTransaction) => {
          return organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability({
            skipLoggedLastDayCheck: true,
            domainTransaction,
            fromUserActivityDate,
            toUserActivityDate,
          });
        });

        // then
        expect(result).to.deep.include.members([
          organizationLearnerNotRecentlyConnectedId,
          organizationLearnerRecentlyConnecterId,
        ]);
      });

      it('should not return an organization learner not reconciliated with option skipLoggedLastDayCheck', async function () {
        // given
        const { organizationId } = databaseBuilder.factory.buildOrganizationLearner({ userId: null });

        databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
        await databaseBuilder.commit();

        // when
        const result = await DomainTransaction.execute(async (domainTransaction) => {
          return organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability({
            fromUserActivityDate,
            toUserActivityDate,
            skipLoggedLastDayCheck: true,
            domainTransaction,
          });
        });

        // then
        expect(result).to.be.empty;
      });
    });

    context('when "onlyNotComputed" option is passed', function () {
      it('should return organization learners with no certificability', async function () {
        // given
        const { organizationId, id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({
          isCertifiable: null,
        });

        databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
        await databaseBuilder.commit();

        // when
        const result = await DomainTransaction.execute(async (domainTransaction) => {
          return organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability({
            fromUserActivityDate,
            toUserActivityDate,
            skipLoggedLastDayCheck: true,
            onlyNotComputed: true,
            domainTransaction,
          });
        });

        // then
        expect(result).to.deep.equal([organizationLearnerId]);
      });

      it('should not return organization learners already computed', async function () {
        // given
        const { organizationId } = databaseBuilder.factory.buildOrganizationLearner({ isCertifiable: true });
        const { id: learnerNeverBeenComputed } = databaseBuilder.factory.buildOrganizationLearner({
          isCertifiable: null,
          organizationId,
        });

        databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
        await databaseBuilder.commit();

        // when
        const result = await DomainTransaction.execute(async (domainTransaction) => {
          return organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability({
            fromUserActivityDate,
            toUserActivityDate,
            skipLoggedLastDayCheck: true,
            onlyNotComputed: true,
            domainTransaction,
          });
        });

        // then
        expect(result).to.deep.equal([learnerNeverBeenComputed]);
      });

      it('should not use this option if "skipLoggedLastDayCheck" is not true', async function () {
        // given
        const { organizationId } = databaseBuilder.factory.buildOrganizationLearner({ isCertifiable: true });
        databaseBuilder.factory.buildOrganizationLearner({
          isCertifiable: null,
          organizationId,
        });

        databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
        await databaseBuilder.commit();

        // when
        const result = await DomainTransaction.execute(async (domainTransaction) => {
          return organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability({
            fromUserActivityDate,
            toUserActivityDate,
            skipLoggedLastDayCheck: false,
            onlyNotComputed: true,
            domainTransaction,
          });
        });

        // then
        expect(result).to.be.empty;
      });
    });

    it('should returned ordered by id', async function () {
      // given
      const { organizationId, userId } = databaseBuilder.factory.buildOrganizationLearner({ id: 12 });
      databaseBuilder.factory.buildUserLogin({
        userId,
        lastLoggedAt: dayjs('2023-07-03').hour(18).minute(0).second(0).millisecond(0).toDate(),
      });
      const { userId: otherUserId } = databaseBuilder.factory.buildOrganizationLearner({ id: 3, organizationId });
      databaseBuilder.factory.buildUserLogin({
        userId: otherUserId,
        lastLoggedAt: dayjs('2023-07-03').hour(2).minute(0).second(0).millisecond(0).toDate(),
      });
      const { userId: anotherUserId } = databaseBuilder.factory.buildOrganizationLearner({ id: 567, organizationId });
      databaseBuilder.factory.buildUserLogin({
        userId: anotherUserId,
        lastLoggedAt: dayjs('2023-07-03').hour(12).minute(6).second(0).millisecond(0).toDate(),
      });
      databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
      await databaseBuilder.commit();

      // when
      const result = await DomainTransaction.execute(async (domainTransaction) => {
        return organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability({
          fromUserActivityDate,
          toUserActivityDate,
          limit: 3,
          domainTransaction,
        });
      });

      // then
      expect(result).to.be.deep.equal([3, 12, 567]);
    });

    it('should limit ids returned', async function () {
      // given
      const { organizationId, userId } = databaseBuilder.factory.buildOrganizationLearner();
      databaseBuilder.factory.buildUserLogin({ userId, lastLoggedAt: new Date('2023-07-03T19:00:00Z') });
      const { userId: otherUserId } = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      databaseBuilder.factory.buildUserLogin({ userId: otherUserId, lastLoggedAt: new Date('2023-07-03T19:00:00Z') });
      databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
      await databaseBuilder.commit();

      // when
      const result = await DomainTransaction.execute(async (domainTransaction) => {
        return organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability({
          fromUserActivityDate,
          toUserActivityDate,
          limit: 1,
          domainTransaction,
        });
      });

      // then
      expect(result.length).to.be.equal(1);
    });

    it('should return ids from offset', async function () {
      // given
      const { organizationId, userId } = databaseBuilder.factory.buildOrganizationLearner();
      databaseBuilder.factory.buildUserLogin({ userId, lastLoggedAt: new Date('2023-07-03T19:00:00Z') });
      const { userId: otherUserId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      });
      databaseBuilder.factory.buildUserLogin({ userId: otherUserId, lastLoggedAt: new Date('2023-07-03T19:00:00Z') });
      databaseBuilder.factory.buildOrganizationFeature({ featureId, organizationId });
      await databaseBuilder.commit();

      // when
      const result = await DomainTransaction.execute(async (domainTransaction) => {
        return organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability({
          fromUserActivityDate,
          toUserActivityDate,
          offset: 1,
          domainTransaction,
        });
      });

      // then
      expect(result.length).to.be.equal(1);
    });
  });
});
