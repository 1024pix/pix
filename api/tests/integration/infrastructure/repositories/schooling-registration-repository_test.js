const _ = require('lodash');

const { expect, domainBuilder, databaseBuilder, knex, catchErr } = require('../../../test-helper');

const SchoolingRegistration = require('../../../../lib/domain/models/SchoolingRegistration');
const UserWithSchoolingRegistration = require('../../../../lib/domain/models/UserWithSchoolingRegistration');
const SchoolingRegistrationForAdmin = require('../../../../lib/domain/read-models/SchoolingRegistrationForAdmin');

const {
  NotFoundError,
  SchoolingRegistrationsCouldNotBeSavedError,
  SchoolingRegistrationNotFound,
  UserCouldNotBeReconciledError,
  UserNotFoundError,
} = require('../../../../lib/domain/errors');

const schoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/schooling-registration-repository');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

describe('Integration | Infrastructure | Repository | schooling-registration-repository', function () {
  describe('#findByIds', function () {
    it('should return all the schoolingRegistrations for given schoolingRegistration IDs', async function () {
      // given
      const student1 = databaseBuilder.factory.buildSchoolingRegistration();
      const student2 = databaseBuilder.factory.buildSchoolingRegistration();
      const ids = [student1.id, student2.id];
      await databaseBuilder.commit();

      // when
      const schoolingRegistrationsResult = await schoolingRegistrationRepository.findByIds({ ids });

      // then
      const anySchoolingRegistration = schoolingRegistrationsResult[0];
      expect(anySchoolingRegistration).to.be.an.instanceOf(SchoolingRegistration);
      expect(anySchoolingRegistration.firstName).to.equal(student1.firstName);
      expect(anySchoolingRegistration.lastName).to.equal(student1.lastName);
      expect(anySchoolingRegistration.birthdate).to.deep.equal(student1.birthdate);
      expect(_.map(schoolingRegistrationsResult, 'id')).to.have.members([student1.id, student2.id]);
    });

    it('should return empty array when there are no result', async function () {
      // given
      databaseBuilder.factory.buildSchoolingRegistration({ id: 1 });
      databaseBuilder.factory.buildSchoolingRegistration({ id: 2 });
      const notFoundIds = [3, 4];
      await databaseBuilder.commit();

      // when
      const schoolingRegistrations = await schoolingRegistrationRepository.findByIds({ ids: notFoundIds });

      // then
      expect(schoolingRegistrations).to.be.empty;
    });
  });

  describe('#findByOrganizationId', function () {
    it('should return instances of SchoolingRegistration', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        userId: null,
      });

      await databaseBuilder.commit();

      // when
      const schoolingRegistrations = await schoolingRegistrationRepository.findByOrganizationId({
        organizationId: organization.id,
      });

      // then
      const anySchoolingRegistration = schoolingRegistrations[0];
      expect(anySchoolingRegistration).to.be.an.instanceOf(SchoolingRegistration);

      expect(anySchoolingRegistration.firstName).to.equal(schoolingRegistration.firstName);
      expect(anySchoolingRegistration.lastName).to.equal(schoolingRegistration.lastName);
      expect(anySchoolingRegistration.birthdate).to.deep.equal(schoolingRegistration.birthdate);
    });

    it('should return all the schoolingRegistrations for a given organization ID', async function () {
      // given
      const organization_1 = databaseBuilder.factory.buildOrganization();
      const organization_2 = databaseBuilder.factory.buildOrganization();

      const user = databaseBuilder.factory.buildUser();

      const schoolingRegistration_1 = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization_1.id,
      });
      const schoolingRegistration_2 = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization_1.id,
        userId: user.id,
      });
      databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization_2.id });

      await databaseBuilder.commit();

      // when
      const schoolingRegistrations = await schoolingRegistrationRepository.findByOrganizationId({
        organizationId: organization_1.id,
      });

      // then
      expect(_.map(schoolingRegistrations, 'id')).to.have.members([
        schoolingRegistration_1.id,
        schoolingRegistration_2.id,
      ]);
    });

    it('should order schoolingRegistrations by lastName and then by firstName with no sensitive case', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      const schoolingRegistration_1 = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        lastName: 'Grenier',
      });
      const schoolingRegistration_2 = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        lastName: 'Avatar',
        firstName: 'Xavier',
      });
      const schoolingRegistration_3 = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        lastName: 'Avatar',
        firstName: 'Arthur',
      });
      const schoolingRegistration_4 = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        lastName: 'Avatar',
        firstName: 'MATHURIN',
      });

      await databaseBuilder.commit();

      // when
      const schoolingRegistrations = await schoolingRegistrationRepository.findByOrganizationId({
        organizationId: organization.id,
      });

      // then
      expect(_.map(schoolingRegistrations, 'id')).to.deep.include.ordered.members([
        schoolingRegistration_3.id,
        schoolingRegistration_4.id,
        schoolingRegistration_2.id,
        schoolingRegistration_1.id,
      ]);
    });

    it('should return empty array when there are no result', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();

      // when
      const schoolingRegistrations = await schoolingRegistrationRepository.findByOrganizationId({
        organizationId: organization.id,
      });

      // then
      expect(schoolingRegistrations).to.be.empty;
    });
  });

  describe('#findByOrganizationIdAndUpdatedAtOrderByDivision', function () {
    const AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR = '2020-10-15';

    it('should return instances of SchoolingRegistration', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        userId: null,
        division: '3A',
        updatedAt: new Date(AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR),
      });

      await databaseBuilder.commit();

      // when
      const paginatedSchoolingRegistrations =
        await schoolingRegistrationRepository.findByOrganizationIdAndUpdatedAtOrderByDivision({
          organizationId: organization.id,
          page: {
            size: 10,
            number: 1,
          },
          filter: { divisions: ['3A'] },
        });

      // then
      const expectedSchoolingRegistration = domainBuilder.buildSchoolingRegistration({
        ...schoolingRegistration,
        organization,
      });
      expect(paginatedSchoolingRegistrations.data[0]).to.deepEqualInstance(expectedSchoolingRegistration);
    });

    it('should return all the schoolingRegistrations for a given organization ID', async function () {
      // given
      const organization_1 = databaseBuilder.factory.buildOrganization();
      const organization_2 = databaseBuilder.factory.buildOrganization();

      const user = databaseBuilder.factory.buildUser();

      const schoolingRegistration_1 = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization_1.id,
        division: '3A',
        updatedAt: new Date(AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR),
      });
      const schoolingRegistration_2 = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization_1.id,
        userId: user.id,
        division: '3A',
        updatedAt: new Date(AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR),
      });
      databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization_2.id });

      await databaseBuilder.commit();

      // when
      const schoolingRegistrations =
        await schoolingRegistrationRepository.findByOrganizationIdAndUpdatedAtOrderByDivision({
          organizationId: organization_1.id,
          page: {
            size: 10,
            number: 1,
          },
          filter: { divisions: ['3A'] },
        });

      // then
      const expectedSchoolingRegistration_1 = domainBuilder.buildSchoolingRegistration({
        ...schoolingRegistration_1,
        organization: organization_1,
      });
      const expectedSchoolingRegistration_2 = domainBuilder.buildSchoolingRegistration({
        ...schoolingRegistration_2,
        organization: organization_1,
      });
      expect(schoolingRegistrations.data).to.deepEqualArray([
        expectedSchoolingRegistration_1,
        expectedSchoolingRegistration_2,
      ]);
    });

    it('should not return disabled schoolingRegistrations for a given organization ID', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const user = databaseBuilder.factory.buildUser();
      const notDisabledSchoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
        isDisabled: false,
        organizationId: organization.id,
        division: '3A',
        updatedAt: new Date(AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR),
      });
      databaseBuilder.factory.buildSchoolingRegistration({
        isDisabled: true,
        organizationId: organization.id,
        userId: user.id,
        division: '3A',
        updatedAt: new Date(AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR),
      });

      await databaseBuilder.commit();

      // when
      const schoolingRegistrations =
        await schoolingRegistrationRepository.findByOrganizationIdAndUpdatedAtOrderByDivision({
          organizationId: organization.id,
          page: {
            size: 10,
            number: 1,
          },
          filter: { divisions: ['3A'] },
        });

      // then
      const expectedNotDisabledSchoolingRegistration = domainBuilder.buildSchoolingRegistration({
        ...notDisabledSchoolingRegistration,
        organization,
      });
      expect(schoolingRegistrations.data).to.deepEqualArray([expectedNotDisabledSchoolingRegistration]);
    });

    it('should order schoolingRegistrations by division and last name and then first name with no sensitive case', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      const schoolingRegistration3B = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        division: '3b',
        updatedAt: new Date(AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR),
      });
      const schoolingRegistration3ABA = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        division: '3A',
        lastName: 'B',
        firstName: 'A',
        updatedAt: new Date(AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR),
      });
      const schoolingRegistration3ABB = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        division: '3A',
        lastName: 'B',
        firstName: 'B',
        updatedAt: new Date(AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR),
      });
      const schoolingRegistrationT2 = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        division: 'T2',
        updatedAt: new Date(AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR),
      });
      const schoolingRegistrationT1CB = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        division: 't1',
        lastName: 'C',
        firstName: 'B',
        updatedAt: new Date(AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR),
      });
      const schoolingRegistrationT1CA = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        division: 't1',
        lastName: 'C',
        firstName: 'A',
        updatedAt: new Date(AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR),
      });

      await databaseBuilder.commit();

      // when
      const schoolingRegistrations =
        await schoolingRegistrationRepository.findByOrganizationIdAndUpdatedAtOrderByDivision({
          organizationId: organization.id,
          page: {
            size: 10,
            number: 1,
          },
          filter: {},
        });

      // then
      const expectedSchoolingRegistration3ABA = domainBuilder.buildSchoolingRegistration({
        ...schoolingRegistration3ABA,
        organization,
      });
      const expectedSchoolingRegistration3ABB = domainBuilder.buildSchoolingRegistration({
        ...schoolingRegistration3ABB,
        organization,
      });
      const expectedSchoolingRegistration3B = domainBuilder.buildSchoolingRegistration({
        ...schoolingRegistration3B,
        organization,
      });
      const expectedSchoolingRegistrationT1CA = domainBuilder.buildSchoolingRegistration({
        ...schoolingRegistrationT1CA,
        organization,
      });
      const expectedSchoolingRegistrationT1CB = domainBuilder.buildSchoolingRegistration({
        ...schoolingRegistrationT1CB,
        organization,
      });
      const expectedSchoolingRegistrationT2 = domainBuilder.buildSchoolingRegistration({
        ...schoolingRegistrationT2,
        organization,
      });
      expect(schoolingRegistrations.data).to.deepEqualArray([
        expectedSchoolingRegistration3ABA,
        expectedSchoolingRegistration3ABB,
        expectedSchoolingRegistration3B,
        expectedSchoolingRegistrationT1CA,
        expectedSchoolingRegistrationT1CB,
        expectedSchoolingRegistrationT2,
      ]);
    });

    it('when there are two students and we ask for pages of one student, it should return one student on page two', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      const schoolingRegistration3B = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        division: '3b',
        updatedAt: new Date(AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR),
      });

      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        division: '3A',
        lastName: 'B',
        firstName: 'A',
        updatedAt: new Date(AFTER_BEGINNING_OF_THE_2020_SCHOOL_YEAR),
      });

      await databaseBuilder.commit();

      // when
      const schoolingRegistrations =
        await schoolingRegistrationRepository.findByOrganizationIdAndUpdatedAtOrderByDivision({
          organizationId: organization.id,
          page: {
            size: 1,
            number: 2,
          },
          filter: {},
        });

      // then
      const expectedSchoolingRegistrationInPage1 = domainBuilder.buildSchoolingRegistration({
        ...schoolingRegistration3B,
        organization,
      });
      expect(schoolingRegistrations.data).to.deepEqualArray([expectedSchoolingRegistrationInPage1]);
    });

    it('should filter out students registered after August 15, 2020', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      const beforeTheDate = new Date('2020-08-14T10:00:00Z');
      const afterTheDate = new Date('2020-08-16T10:00:00Z');
      databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, updatedAt: beforeTheDate });
      const earlierSchoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        updatedAt: afterTheDate,
      });

      await databaseBuilder.commit();

      // when
      const schoolingRegistrations =
        await schoolingRegistrationRepository.findByOrganizationIdAndUpdatedAtOrderByDivision({
          organizationId: organization.id,
          page: {
            size: 10,
            number: 1,
          },
          filter: {},
        });

      // then
      const expectedEarlierSchoolingRegistration = domainBuilder.buildSchoolingRegistration({
        ...earlierSchoolingRegistration,
        organization,
      });
      expect(schoolingRegistrations.data).to.deepEqualArray([expectedEarlierSchoolingRegistration]);
    });
  });

  describe('#findByUserId', function () {
    it('should return instances of SchoolingRegistration', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const userId = databaseBuilder.factory.buildUser().id;
      const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        userId,
      });

      await databaseBuilder.commit();

      // when
      const schoolingRegistrations = await schoolingRegistrationRepository.findByUserId({ userId });

      // then
      const anySchoolingRegistration = schoolingRegistrations[0];
      expect(anySchoolingRegistration).to.be.an.instanceOf(SchoolingRegistration);

      expect(anySchoolingRegistration.firstName).to.equal(schoolingRegistration.firstName);
      expect(anySchoolingRegistration.lastName).to.equal(schoolingRegistration.lastName);
      expect(anySchoolingRegistration.birthdate).to.deep.equal(schoolingRegistration.birthdate);
    });

    it('should return all the schoolingRegistrations for a given user ID', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;

      const schoolingRegistration_1 = databaseBuilder.factory.buildSchoolingRegistration({ userId });
      const schoolingRegistration_2 = databaseBuilder.factory.buildSchoolingRegistration({ userId });

      await databaseBuilder.commit();

      // when
      const schoolingRegistrations = await schoolingRegistrationRepository.findByUserId({ userId });

      // then
      expect(_.map(schoolingRegistrations, 'id')).to.have.members([
        schoolingRegistration_1.id,
        schoolingRegistration_2.id,
      ]);
    });

    it('should order schoolingRegistrations by id', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const schoolingRegistration_1 = databaseBuilder.factory.buildSchoolingRegistration({ userId });
      const schoolingRegistration_2 = databaseBuilder.factory.buildSchoolingRegistration({ userId });
      const schoolingRegistration_3 = databaseBuilder.factory.buildSchoolingRegistration({ userId });
      const schoolingRegistration_4 = databaseBuilder.factory.buildSchoolingRegistration({ userId });

      await databaseBuilder.commit();

      // when
      const schoolingRegistrations = await schoolingRegistrationRepository.findByUserId({ userId });

      // then
      expect(_.map(schoolingRegistrations, 'id')).to.deep.include.ordered.members([
        schoolingRegistration_1.id,
        schoolingRegistration_2.id,
        schoolingRegistration_3.id,
        schoolingRegistration_4.id,
      ]);
    });
  });

  describe('#isSchoolingRegistrationIdLinkedToUserAndSCOOrganization', function () {
    it('should return true when a schoolingRegistration matches an id and matches also a given user id and a SCO organization', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const otherUserId = databaseBuilder.factory.buildUser().id;
      const firstScoOrganizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;
      const secondScoOrganizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;
      const supOrganizationId = databaseBuilder.factory.buildOrganization({ type: 'SUP' }).id;
      const matchingSchoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
        userId,
        organizationId: firstScoOrganizationId,
      }).id;
      databaseBuilder.factory.buildSchoolingRegistration({ userId, organizationId: secondScoOrganizationId });
      databaseBuilder.factory.buildSchoolingRegistration({
        userId: otherUserId,
        organizationId: secondScoOrganizationId,
      });
      databaseBuilder.factory.buildSchoolingRegistration({ userId, organizationId: supOrganizationId });
      await databaseBuilder.commit();

      // when
      const isLinked = await schoolingRegistrationRepository.isSchoolingRegistrationIdLinkedToUserAndSCOOrganization({
        userId,
        schoolingRegistrationId: matchingSchoolingRegistrationId,
      });

      // then
      expect(isLinked).to.be.true;
    });

    it('should return false when no schoolingRegistration matches an id and matches also a given user id and a SCO organization', async function () {
      // when
      const isLinked = await schoolingRegistrationRepository.isSchoolingRegistrationIdLinkedToUserAndSCOOrganization({
        userId: 42,
        schoolingRegistrationId: 42,
      });

      // then
      expect(isLinked).to.be.false;
    });
  });

  describe('#disableAllSchoolingRegistrationsInOrganization', function () {
    it('should disable all schooling registration for the given organization', async function () {
      const organization = databaseBuilder.factory.buildOrganization();
      const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
      });
      const otherSchoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration();
      await databaseBuilder.commit();

      await DomainTransaction.execute((domainTransaction) => {
        return schoolingRegistrationRepository.disableAllSchoolingRegistrationsInOrganization({
          domainTransaction,
          organizationId: organization.id,
        });
      });

      const results = await knex('organization-learners').select();
      const expectedDisabled = results.find((result) => result.id === schoolingRegistration.id);
      expect(expectedDisabled.isDisabled).to.be.true;
      const expectedActive = results.find((result) => result.id === otherSchoolingRegistration.id);
      expect(expectedActive.isDisabled).to.be.false;
    });

    it('should update the date when a schooling registration is disabled', async function () {
      const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
        updatedAt: new Date('1970-01-01'),
      });
      await databaseBuilder.commit();

      await DomainTransaction.execute((domainTransaction) => {
        return schoolingRegistrationRepository.disableAllSchoolingRegistrationsInOrganization({
          domainTransaction,
          organizationId: schoolingRegistration.organizationId,
        });
      });

      const expectedDisabled = await knex('organization-learners').where('id', schoolingRegistration.id).first();
      expect(expectedDisabled.updatedAt).to.not.equal(schoolingRegistration.updatedAt);
    });

    it('should rollback when an error occurs during transaction', async function () {
      const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
        updatedAt: new Date('1970-01-01'),
      });
      await databaseBuilder.commit();

      await catchErr(async () => {
        await DomainTransaction.execute(async (domainTransaction) => {
          await schoolingRegistrationRepository.disableAllSchoolingRegistrationsInOrganization({
            domainTransaction,
            organizationId: schoolingRegistration.organizationId,
          });
          throw new Error('an error occurs within the domain transaction');
        });
      });

      const schoolingRegistrationNotDisabled = await knex('organization-learners')
        .where('id', schoolingRegistration.id)
        .first();
      expect(schoolingRegistrationNotDisabled.isDisabled).to.be.false;
    });
  });

  describe('#addOrUpdateOrganizationSchoolingRegistrations', function () {
    context('when there are only schoolingRegistrations to create', function () {
      let schoolingRegistrations;
      let organizationId;
      let schoolingRegistration_1;

      beforeEach(async function () {
        organizationId = databaseBuilder.factory.buildOrganization().id;
        await databaseBuilder.commit();

        schoolingRegistration_1 = new SchoolingRegistration({
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

        schoolingRegistrations = [schoolingRegistration_1];
      });

      afterEach(function () {
        return knex('organization-learners').delete();
      });

      it('should create all schoolingRegistrations', async function () {
        // when
        await DomainTransaction.execute((domainTransaction) => {
          return schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations(
            schoolingRegistrations,
            organizationId,
            domainTransaction
          );
        });

        // then
        const actualSchoolingRegistrations = await schoolingRegistrationRepository.findByOrganizationId({
          organizationId,
        });
        expect(actualSchoolingRegistrations).to.have.length(1);
        expect(_.omit(actualSchoolingRegistrations[0], ['updatedAt', 'id'])).to.deep.equal(
          _.omit(schoolingRegistration_1, ['updatedAt', 'id'])
        );
      });
    });

    context('when there are only schoolingRegistrations to update', function () {
      let schoolingRegistration_1;
      let organizationId;

      beforeEach(async function () {
        organizationId = databaseBuilder.factory.buildOrganization().id;
        schoolingRegistration_1 = {
          firstName: 'Lucy',
          lastName: 'Handmade',
          birthdate: '1990-12-31',
          nationalStudentId: 'INE1',
          organizationId,
        };

        databaseBuilder.factory.buildSchoolingRegistration(schoolingRegistration_1);

        await databaseBuilder.commit();
      });

      context('when a schoolingRegistration is already imported', function () {
        let schoolingRegistration_1_updated;
        let schoolingRegistrations;

        beforeEach(function () {
          // given
          schoolingRegistration_1_updated = new SchoolingRegistration({
            firstName: 'Boba',
            lastName: 'Fett',
            birthdate: '1986-01-05',
            nationalStudentId: 'INE1',
            status: schoolingRegistration_1.status,
            organizationId,
          });

          schoolingRegistrations = [schoolingRegistration_1_updated];
        });

        it('should update schoolingRegistrations attributes', async function () {
          // when
          await DomainTransaction.execute((domainTransaction) => {
            return schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations(
              schoolingRegistrations,
              organizationId,
              domainTransaction
            );
          });

          // then
          const updated_organization_schoolingRegistrations = await knex('organization-learners').where({
            organizationId,
          });

          expect(updated_organization_schoolingRegistrations).to.have.lengthOf(1);
          expect(updated_organization_schoolingRegistrations[0].firstName).to.be.equal(
            schoolingRegistration_1_updated.firstName
          );
          expect(updated_organization_schoolingRegistrations[0].lastName).to.be.equal(
            schoolingRegistration_1_updated.lastName
          );
          expect(updated_organization_schoolingRegistrations[0].birthdate).to.be.equal(
            schoolingRegistration_1_updated.birthdate
          );
        });
      });

      context('when a schoolingRegistration is already imported in several organizations', function () {
        let schoolingRegistration_1_updated;
        let schoolingRegistration_1_bis;
        let otherOrganizationId;
        let schoolingRegistrations;

        beforeEach(async function () {
          otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
          schoolingRegistration_1_bis = databaseBuilder.factory.buildSchoolingRegistration({
            firstName: 'Lucie',
            lastName: 'Handmad',
            birthdate: '1990-12-31',
            nationalStudentId: schoolingRegistration_1.nationalStudentId,
            status: schoolingRegistration_1.status,
            organizationId: otherOrganizationId,
          });

          await databaseBuilder.commit();

          schoolingRegistration_1_updated = new SchoolingRegistration({
            firstName: 'Lili',
            lastName: schoolingRegistration_1.lastName,
            birthdate: schoolingRegistration_1.birthdate,
            nationalStudentId: schoolingRegistration_1.nationalStudentId,
            organizationId,
            status: schoolingRegistration_1.status,
          });

          schoolingRegistrations = [schoolingRegistration_1_updated];
        });

        it('should update the schoolingRegistration only in the organization that imports the file', async function () {
          // when
          await DomainTransaction.execute((domainTransaction) => {
            return schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations(
              schoolingRegistrations,
              organizationId,
              domainTransaction
            );
          });

          // then
          const updated_organization_schoolingRegistrations = await knex('organization-learners').where({
            organizationId,
          });
          const not_updated_organization_schoolingRegistrations = await knex('organization-learners').where({
            organizationId: otherOrganizationId,
          });

          expect(updated_organization_schoolingRegistrations).to.have.lengthOf(1);

          expect(updated_organization_schoolingRegistrations[0].firstName).to.equal(
            schoolingRegistration_1_updated.firstName
          );
          expect(updated_organization_schoolingRegistrations[0].lastName).to.equal(
            schoolingRegistration_1_updated.lastName
          );
          expect(updated_organization_schoolingRegistrations[0].birthdate).to.equal(
            schoolingRegistration_1_updated.birthdate
          );

          expect(not_updated_organization_schoolingRegistrations).to.have.lengthOf(1);

          expect(not_updated_organization_schoolingRegistrations[0].firstName).to.equal(
            schoolingRegistration_1_bis.firstName
          );
          expect(not_updated_organization_schoolingRegistrations[0].lastName).to.equal(
            schoolingRegistration_1_bis.lastName
          );
          expect(not_updated_organization_schoolingRegistrations[0].birthdate).to.equal(
            schoolingRegistration_1_bis.birthdate
          );
        });
      });

      context('when a schooling registration disabled already exists', function () {
        it('should enable the updated schooling registration', async function () {
          // given
          const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
            nationalStudentId: 'INE1',
            isDisabled: true,
          });
          const { id, organizationId } = schoolingRegistration;
          await databaseBuilder.commit();

          // when
          await DomainTransaction.execute((domainTransaction) => {
            return schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations(
              [schoolingRegistration],
              organizationId,
              domainTransaction
            );
          });

          // then
          const expectedEnabled = await knex('organization-learners').where({ id }).first();

          expect(expectedEnabled.isDisabled).to.be.false;
        });
      });
    });

    context('when a schoolingRegistration is saved with a userId already present in organization', function () {
      it('should save the schooling registration with userId as null', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const { id: userId } = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildSchoolingRegistration({
          nationalStudentId: 'INE1',
          userId,
        });
        databaseBuilder.factory.buildSchoolingRegistration({
          nationalStudentId: 'INE2',
          organizationId: organizationId,
          userId,
        });
        await databaseBuilder.commit();

        // when
        const schoolingRegistration = domainBuilder.buildSchoolingRegistration({ nationalStudentId: 'INE1' });
        await DomainTransaction.execute((domainTransaction) => {
          return schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations(
            [schoolingRegistration],
            organizationId,
            domainTransaction
          );
        });

        // then
        const expected = await knex('organization-learners')
          .where({ nationalStudentId: 'INE1', organizationId: organizationId })
          .first();

        expect(expected.userId).to.be.null;
      });

      it('should update the schooling registration with userId as null', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const { id: userId } = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildSchoolingRegistration({
          nationalStudentId: 'INE1',
          userId,
        });
        databaseBuilder.factory.buildSchoolingRegistration({
          nationalStudentId: 'INE2',
          organizationId: organizationId,
          userId,
        });
        databaseBuilder.factory.buildSchoolingRegistration({
          nationalStudentId: 'INE1',
          organizationId: organizationId,
          userId: null,
        });
        await databaseBuilder.commit();

        // when
        const schoolingRegistration = domainBuilder.buildSchoolingRegistration({ nationalStudentId: 'INE1' });
        await DomainTransaction.execute((domainTransaction) => {
          return schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations(
            [schoolingRegistration],
            organizationId,
            domainTransaction
          );
        });

        // then
        const expected = await knex('organization-learners')
          .where({ nationalStudentId: 'INE1', organizationId: organizationId })
          .first();

        expect(expected.userId).to.be.null;
      });
    });

    context('when several imported schooling registrations are reconciliated with the same userId', function () {
      it('should save both schooling registrations with userId as null', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const { id: userId } = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildSchoolingRegistration({
          nationalStudentId: 'INE1',
          userId,
        });
        databaseBuilder.factory.buildSchoolingRegistration({
          nationalStudentId: 'INE2',
          userId,
        });
        await databaseBuilder.commit();

        // when
        const schoolingRegistration1 = domainBuilder.buildSchoolingRegistration({ nationalStudentId: 'INE1' });
        const schoolingRegistration2 = domainBuilder.buildSchoolingRegistration({ nationalStudentId: 'INE2' });
        await DomainTransaction.execute((domainTransaction) => {
          return schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations(
            [schoolingRegistration1, schoolingRegistration2],
            organizationId,
            domainTransaction
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

    context('when there are schoolingRegistrations in another organization', function () {
      let schoolingRegistrationInOtherOrganization, schoolingRegistrations;
      let organizationId;
      let schoolingRegistrationFromFile;
      let userId;
      let nationalStudentId;

      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser().id;
        organizationId = databaseBuilder.factory.buildOrganization().id;
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        schoolingRegistrationInOtherOrganization = databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: otherOrganizationId,
          nationalStudentId: 'salut',
        });
        nationalStudentId = schoolingRegistrationInOtherOrganization.nationalStudentId;
        await databaseBuilder.commit();

        schoolingRegistrationFromFile = new SchoolingRegistration({
          firstName: 'Lucy',
          lastName: 'Handmade',
          birthdate: '1990-12-31',
          nationalStudentId,
          organizationId,
        });

        schoolingRegistrations = [schoolingRegistrationFromFile];
      });

      afterEach(function () {
        return knex('organization-learners').delete();
      });

      it('should create schoolingRegistration and reconcile it thanks to another schoolingRegistration', async function () {
        // given
        databaseBuilder.factory.buildSchoolingRegistration({ nationalStudentId, userId });
        databaseBuilder.factory.buildCertificationCourse({ userId });
        await databaseBuilder.commit();

        // when
        await DomainTransaction.execute((domainTransaction) => {
          return schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations(
            schoolingRegistrations,
            organizationId,
            domainTransaction
          );
        });

        // then
        const newSchoolingRegistration = await knex('organization-learners').where({
          organizationId,
          nationalStudentId,
        });
        expect(newSchoolingRegistration[0].userId).to.equal(userId);
      });

      it('should update and reconcile schoolingRegistration thanks to another schoolingRegistration', async function () {
        // given
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId, nationalStudentId, userId: null });
        databaseBuilder.factory.buildSchoolingRegistration({ nationalStudentId, userId });
        databaseBuilder.factory.buildCertificationCourse({ userId });
        await databaseBuilder.commit();

        // when
        await DomainTransaction.execute((domainTransaction) => {
          return schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations(
            schoolingRegistrations,
            organizationId,
            domainTransaction
          );
        });

        // then
        const newSchoolingRegistration = await knex('organization-learners')
          .where({ organizationId, nationalStudentId })
          .first();
        expect(newSchoolingRegistration.userId).to.equal(userId);
        expect(newSchoolingRegistration.firstName).to.equal(schoolingRegistrationFromFile.firstName);
      });

      context('when userId is already defined for a schoolingRegistration', function () {
        it('should update schoolingRegistration but not override userId', async function () {
          // given
          const expectedUserId = databaseBuilder.factory.buildSchoolingRegistration({
            organizationId,
            nationalStudentId,
          }).userId;
          await databaseBuilder.commit();

          // when
          await DomainTransaction.execute((domainTransaction) => {
            return schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations(
              schoolingRegistrations,
              organizationId,
              domainTransaction
            );
          });

          // then
          const alreadyReconciledSchoolingRegistrations = await knex('organization-learners')
            .where({
              nationalStudentId: schoolingRegistrationFromFile.nationalStudentId,
              organizationId: organizationId,
            })
            .first();
          expect(alreadyReconciledSchoolingRegistrations.userId).to.equal(expectedUserId);
          expect(alreadyReconciledSchoolingRegistrations.firstName).to.equal(schoolingRegistrationFromFile.firstName);
        });
      });
    });

    context('when there are schoolingRegistrations to create and schoolingRegistrations to update', function () {
      let schoolingRegistrations;
      let organizationId;
      let schoolingRegistrationToCreate, schoolingRegistrationUpdated;

      beforeEach(async function () {
        organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildSchoolingRegistration({
          firstName: 'Lucy',
          lastName: 'Handmade',
          birthdate: '1990-12-31',
          nationalStudentId: 'INE1',
          organizationId,
        });
        await databaseBuilder.commit();

        schoolingRegistrationUpdated = new SchoolingRegistration({
          firstName: 'Lucy',
          lastName: 'Handmade',
          birthdate: '1990-12-31',
          nationalStudentId: 'INE1',
          organizationId,
        });

        schoolingRegistrationToCreate = new SchoolingRegistration({
          firstName: 'Harry',
          lastName: 'Covert',
          birthdate: '1990-01-01',
          nationalStudentId: 'INE2',
          organizationId,
        });

        schoolingRegistrations = [schoolingRegistrationUpdated, schoolingRegistrationToCreate];
      });

      afterEach(function () {
        return knex('organization-learners').delete();
      });

      it('should update and create all schoolingRegistrations', async function () {
        // when
        await DomainTransaction.execute((domainTransaction) => {
          return schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations(
            schoolingRegistrations,
            organizationId,
            domainTransaction
          );
        });

        // then
        const actualSchoolingRegistrations = await knex('organization-learners').where({ organizationId });
        expect(actualSchoolingRegistrations).to.have.lengthOf(2);

        expect(_.map(actualSchoolingRegistrations, 'firstName')).to.have.members([
          schoolingRegistrationUpdated.firstName,
          schoolingRegistrationToCreate.firstName,
        ]);
      });
    });

    context('when an error occurs', function () {
      let schoolingRegistrations;
      let organizationId;
      let schoolingRegistration_1, schoolingRegistration_2;
      const sameNationalStudentId = 'SAMEID123';

      beforeEach(async function () {
        organizationId = databaseBuilder.factory.buildOrganization().id;
        await databaseBuilder.commit();

        schoolingRegistration_1 = new SchoolingRegistration({
          firstName: 'Lucy',
          lastName: 'Handmade',
          birthdate: '1990-12-31',
          nationalStudentId: sameNationalStudentId,
          organizationId,
        });

        schoolingRegistration_2 = new SchoolingRegistration({
          firstName: 'Harry',
          lastName: 'Covert',
          birthdate: '1990-01-01',
          nationalStudentId: sameNationalStudentId,
          organizationId,
        });

        schoolingRegistrations = [schoolingRegistration_1, schoolingRegistration_2];
      });

      afterEach(function () {
        return knex('organization-learners').delete();
      });

      it('should return a SchoolingRegistrationsCouldNotBeSavedError on unicity errors', async function () {
        // when
        let error;
        await DomainTransaction.execute(async (domainTransaction) => {
          error = await catchErr(
            schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations,
            schoolingRegistrationRepository
          )(schoolingRegistrations, organizationId, domainTransaction);
        });

        // then
        expect(error).to.be.instanceof(SchoolingRegistrationsCouldNotBeSavedError);
      });

      it('should return a SchoolingRegistrationsCouldNotBeSavedError', async function () {
        // when
        let error;
        await DomainTransaction.execute(async (domainTransaction) => {
          error = await catchErr(
            schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations,
            schoolingRegistrationRepository
          )([{ nationalStudentId: 'something' }], organizationId, domainTransaction);
        });

        // then
        expect(error).to.be.instanceof(SchoolingRegistrationsCouldNotBeSavedError);
      });
    });

    context('whenever a schooling-registration is updated', function () {
      it('should update the updatedAt column in row', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const baseSchoolingRegistration = {
          firstName: 'Lucy',
          lastName: 'Handmade',
          birthdate: '1990-12-31',
          nationalStudentId: 'INE1',
          organizationId,
        };
        const schoolingRegistrationId =
          databaseBuilder.factory.buildSchoolingRegistration(baseSchoolingRegistration).id;
        await databaseBuilder.commit();
        await knex('organization-learners')
          .update({ updatedAt: new Date('2019-01-01') })
          .where({ id: schoolingRegistrationId });
        const { updatedAt: beforeUpdatedAt } = await knex
          .select('updatedAt')
          .from('organization-learners')
          .where({ id: schoolingRegistrationId })
          .first();

        const schoolingRegistration_updated = new SchoolingRegistration({
          ...baseSchoolingRegistration,
          firstName: 'Lili',
        });

        // when
        await DomainTransaction.execute((domainTransaction) => {
          return schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations(
            [schoolingRegistration_updated],
            organizationId,
            domainTransaction
          );
        });

        // then
        const { updatedAt: afterUpdatedAt } = await knex
          .select('updatedAt')
          .from('organization-learners')
          .where({ id: schoolingRegistrationId })
          .first();

        expect(afterUpdatedAt).to.be.above(beforeUpdatedAt);
      });
    });

    context('when an error occurs during transaction', function () {
      it('should rollback', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const schoolingRegistration = new SchoolingRegistration({ organizationId });

        // when
        await catchErr(async () => {
          await DomainTransaction.execute(async (domainTransaction) => {
            await schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations(
              [schoolingRegistration],
              organizationId,
              domainTransaction
            );
            throw new Error('an error occurs within the domain transaction');
          });
        });

        // then
        const schoolingRegistrations = await knex.from('organization-learners');
        expect(schoolingRegistrations).to.deep.equal([]);
      });
    });
  });

  describe('#findByOrganizationIdAndBirthdate', function () {
    let organization;

    beforeEach(async function () {
      organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildSchoolingRegistration({
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
      databaseBuilder.factory.buildSchoolingRegistration({
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

    it('should return found schoolingRegistrations with birthdate', async function () {
      // given
      const birthdate = '2000-03-31';

      // when
      const result = await schoolingRegistrationRepository.findByOrganizationIdAndBirthdate({
        organizationId: organization.id,
        birthdate,
      });

      // then
      expect(result.length).to.be.equal(2);
    });

    it('should return empty array when there are no active schooling-registrations', async function () {
      // given
      const birthdate = '2001-01-01';
      databaseBuilder.factory.buildSchoolingRegistration({
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
      const result = await schoolingRegistrationRepository.findByOrganizationIdAndBirthdate({
        organizationId: organization.id,
        birthdate,
      });

      // then
      expect(result.length).to.be.equal(0);
    });

    it('should return empty array when there are no schooling-registrations with the given birthdate', async function () {
      // given
      const birthdate = '2001-03-31';

      // when
      const result = await schoolingRegistrationRepository.findByOrganizationIdAndBirthdate({
        organizationId: organization.id,
        birthdate,
      });

      // then
      expect(result.length).to.be.equal(0);
    });

    it('should return empty array when there is no schooling-registrations with the given organizationId', async function () {
      // given
      const birthdate = '2000-03-31';

      // when
      const result = await schoolingRegistrationRepository.findByOrganizationIdAndBirthdate({
        organizationId: '999',
        birthdate,
      });

      // then
      expect(result.length).to.be.equal(0);
    });
  });

  describe('#dissociateUserAndSchoolingRegistration', function () {
    let schoolingRegistration;

    beforeEach(async function () {
      const user = databaseBuilder.factory.buildUser();
      schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ userId: user.id });
      await databaseBuilder.commit();
    });

    it('should delete association between user and schoolingRegistration', async function () {
      // when
      await schoolingRegistrationRepository.dissociateUserFromSchoolingRegistration(schoolingRegistration.id);

      // then
      const schoolingRegistrationPatched = await schoolingRegistrationRepository.get(schoolingRegistration.id);
      expect(schoolingRegistrationPatched.userId).to.equal(null);
    });
  });

  describe('#reconcileUserToSchoolingRegistration', function () {
    afterEach(function () {
      return knex('organization-learners').delete();
    });

    let organization;
    let schoolingRegistration;
    let user;

    beforeEach(async function () {
      organization = databaseBuilder.factory.buildOrganization();
      schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        userId: null,
        firstName: 'Steeve',
        lastName: 'Roger',
      });
      user = databaseBuilder.factory.buildUser({ firstName: 'Steeve', lastName: 'Roger' });
      await databaseBuilder.commit();
    });

    it('should save association between user and schoolingRegistration', async function () {
      // when
      const schoolingRegistrationPatched = await schoolingRegistrationRepository.reconcileUserToSchoolingRegistration({
        userId: user.id,
        schoolingRegistrationId: schoolingRegistration.id,
      });

      // then
      expect(schoolingRegistrationPatched).to.be.instanceof(SchoolingRegistration);
      expect(schoolingRegistrationPatched.userId).to.equal(user.id);
    });

    it('should return an error when we don’t find the schoolingRegistration to update', async function () {
      // given
      const fakeStudentId = 1;

      // when
      const error = await catchErr(schoolingRegistrationRepository.reconcileUserToSchoolingRegistration)({
        userId: user.id,
        schoolingRegistrationId: fakeStudentId,
      });

      // then
      expect(error).to.be.instanceOf(UserCouldNotBeReconciledError);
    });

    it('should return an error when the userId to link don’t match a user', async function () {
      // given
      const fakeUserId = 1;

      // when
      const error = await catchErr(schoolingRegistrationRepository.reconcileUserToSchoolingRegistration)({
        userId: fakeUserId,
        schoolingRegistrationId: schoolingRegistration.id,
      });

      // then
      expect(error).to.be.instanceOf(UserCouldNotBeReconciledError);
    });

    it('should return an error when the schooling registration is disabled', async function () {
      // given
      const disabledSchoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        userId: null,
        isDisabled: true,
      });

      // when
      const error = await catchErr(schoolingRegistrationRepository.reconcileUserToSchoolingRegistration)({
        userId: user.id,
        schoolingRegistrationId: disabledSchoolingRegistration.id,
      });

      // then
      expect(error).to.be.instanceOf(UserCouldNotBeReconciledError);
    });
  });

  describe('#reconcileUserAndOrganization', function () {
    afterEach(function () {
      return knex('organization-learners').delete();
    });

    context('when the schoolingRegistration is active', function () {
      let organization;
      let schoolingRegistration;
      let user;

      beforeEach(async function () {
        organization = databaseBuilder.factory.buildOrganization();
        schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
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
        const schoolingRegistrationPatched =
          await schoolingRegistrationRepository.reconcileUserByNationalStudentIdAndOrganizationId({
            userId: user.id,
            nationalStudentId: schoolingRegistration.nationalStudentId,
            organizationId: organization.id,
          });

        // then
        expect(schoolingRegistrationPatched).to.be.instanceof(SchoolingRegistration);
        expect(schoolingRegistrationPatched.userId).to.equal(user.id);
      });

      it('should return an error when we don’t find the schoolingRegistration for this organization to update', async function () {
        // given
        const fakeOrganizationId = 1;

        // when
        const error = await catchErr(schoolingRegistrationRepository.reconcileUserByNationalStudentIdAndOrganizationId)(
          {
            userId: user.id,
            nationalStudentId: schoolingRegistration.nationalStudentId,
            organizationId: fakeOrganizationId,
          }
        );

        // then
        expect(error).to.be.instanceof(UserCouldNotBeReconciledError);
      });

      it('should return an error when we don’t find the schoolingRegistration for this nationalStudentId to update', async function () {
        // given
        const fakeNationalStudentId = 1;

        // when
        const error = await catchErr(schoolingRegistrationRepository.reconcileUserByNationalStudentIdAndOrganizationId)(
          {
            userId: user.id,
            nationalStudentId: fakeNationalStudentId,
            organizationId: organization.id,
          }
        );

        // then
        expect(error).to.be.instanceof(UserCouldNotBeReconciledError);
      });

      it('should return an error when the userId to link don’t match a user', async function () {
        // given
        const fakeUserId = 1;

        // when
        const error = await catchErr(schoolingRegistrationRepository.reconcileUserByNationalStudentIdAndOrganizationId)(
          {
            userId: fakeUserId,
            nationalStudentId: schoolingRegistration.nationalStudentId,
            organizationId: organization.id,
          }
        );

        // then
        expect(error).to.be.instanceof(UserCouldNotBeReconciledError);
      });
    });

    context('when the schoolingRegistration is disabled', function () {
      it('should return an error', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const { id: userId } = databaseBuilder.factory.buildUser({ firstName: 'Natasha', lastName: 'Romanoff' });
        const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
          organizationId,
          userId: null,
          firstName: 'Natasha',
          lastName: 'Romanoff',
          isDisabled: true,
        });
        // when
        const error = await catchErr(schoolingRegistrationRepository.reconcileUserByNationalStudentIdAndOrganizationId)(
          {
            userId,
            nationalStudentId: schoolingRegistration.nationalStudentId,
            organizationId,
          }
        );

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
      databaseBuilder.factory.buildSchoolingRegistration({ organizationId, userId });
      return databaseBuilder.commit();
    });

    it('should return instance of SchoolingRegistration linked to the given userId and organizationId', async function () {
      // when
      const schoolingRegistration = await schoolingRegistrationRepository.findOneByUserIdAndOrganizationId({
        userId,
        organizationId,
      });

      // then
      expect(schoolingRegistration).to.be.an.instanceOf(SchoolingRegistration);
      expect(schoolingRegistration.userId).to.equal(userId);
    });

    it('should return null if there is no schoolingRegistration linked to the given userId', async function () {
      // given
      const otherUserId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const result = await schoolingRegistrationRepository.findOneByUserIdAndOrganizationId({
        userId: otherUserId,
        organizationId,
      });

      // then
      expect(result).to.equal(null);
    });

    it('should return null if there is no schoolingRegistration linked to the given organizationId', async function () {
      // given
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      // when
      const result = await schoolingRegistrationRepository.findOneByUserIdAndOrganizationId({
        userId,
        organizationId: otherOrganizationId,
      });

      // then
      expect(result).to.equal(null);
    });
  });

  describe('#get', function () {
    let schoolingRegistrationId;

    beforeEach(function () {
      schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration().id;
      return databaseBuilder.commit();
    });

    it('should return an instance of SchoolingRegistration', async function () {
      // when
      const schoolingRegistration = await schoolingRegistrationRepository.get(schoolingRegistrationId);

      // then
      expect(schoolingRegistration).to.be.an.instanceOf(SchoolingRegistration);
      expect(schoolingRegistration.id).to.equal(schoolingRegistrationId);
    });

    it('should return a NotFoundError if no schoolingRegistration is found', async function () {
      // given
      const nonExistentStudentId = 678;

      // when
      const result = await catchErr(schoolingRegistrationRepository.get)(nonExistentStudentId);

      // then
      expect(result).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#getSchoolingRegistrationForAdmin', function () {
    let schoolingRegistrationId;

    beforeEach(function () {
      schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration().id;
      return databaseBuilder.commit();
    });

    it('should return an instance of SchoolingRegistrationForAdmin', async function () {
      // when
      const schoolingRegistration = await schoolingRegistrationRepository.getSchoolingRegistrationForAdmin(
        schoolingRegistrationId
      );

      // then
      expect(schoolingRegistration).to.be.an.instanceOf(SchoolingRegistrationForAdmin);
      expect(schoolingRegistration.id).to.equal(schoolingRegistrationId);
    });

    it('should return a NotFoundError if no schoolingRegistration is found', async function () {
      // given
      const nonExistentSchoolingRegistrationId = 678;

      // when
      const result = await catchErr(schoolingRegistrationRepository.getSchoolingRegistrationForAdmin)(
        nonExistentSchoolingRegistrationId
      );

      // then
      expect(result).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#getLatestSchoolingRegistration', function () {
    it('should return the latest schooling registration', async function () {
      // given
      const expectedUserId = databaseBuilder.factory.buildUser().id;
      const latestOrganizationId = databaseBuilder.factory.buildOrganization({ id: 1 }).id;
      const oldestOrganizationId = databaseBuilder.factory.buildOrganization({ id: 3 }).id;

      const studentInformation = {
        ine: '123456789AA',
        birthdate: '2000-12-07',
      };
      databaseBuilder.factory.buildSchoolingRegistration({
        id: 1,
        organizationId: latestOrganizationId,
        userId: expectedUserId,
        birthdate: studentInformation.birthdate,
        nationalStudentId: studentInformation.ine,
        updatedAt: new Date('2013-01-01T15:00:00Z'),
      });
      databaseBuilder.factory.buildSchoolingRegistration({
        id: 80,
        organizationId: oldestOrganizationId,
        userId: expectedUserId,
        birthdate: studentInformation.birthdate,
        nationalStudentId: studentInformation.ine,
        updatedAt: new Date('2000-01-01T15:00:00Z'),
      });

      await databaseBuilder.commit();

      // when
      const schoolingRegistration = await schoolingRegistrationRepository.getLatestSchoolingRegistration({
        birthdate: studentInformation.birthdate,
        nationalStudentId: studentInformation.ine,
      });

      // then
      expect(schoolingRegistration.organizationId).to.equal(1);
      expect(schoolingRegistration.id).to.equal(1);
    });

    it('should return a UserNotFoundError if INE is invalid', async function () {
      // given
      const studentInformation = {
        ine: '123456789AB',
        birthdate: '2000-12-07',
      };
      databaseBuilder.factory.buildSchoolingRegistration({
        birthdate: studentInformation.birthdate,
        nationalStudentId: studentInformation.ine,
      });

      await databaseBuilder.commit();

      // when
      const result = await catchErr(schoolingRegistrationRepository.getLatestSchoolingRegistration)({
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
      databaseBuilder.factory.buildSchoolingRegistration({
        birthdate: studentInformation.birthdate,
        nationalStudentId: studentInformation.ine,
        userId: null,
      });

      await databaseBuilder.commit();

      // when
      const result = await catchErr(schoolingRegistrationRepository.getLatestSchoolingRegistration)({
        nationalStudentId: '123456789AB',
        birthdate: '2000-12-07',
      });

      // then
      expect(result).to.be.instanceOf(UserNotFoundError);
    });
  });

  describe('#findPaginatedFilteredSchoolingRegistrations', function () {
    it('should return instances of UserWithSchoolingRegistration', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        userId: null,
      });
      await databaseBuilder.commit();

      // when
      const { data } = await schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
        organizationId: organization.id,
      });

      // then
      expect(data[0]).to.be.an.instanceOf(UserWithSchoolingRegistration);
    });

    it('should return all the UserWithSchoolingRegistration for a given organization ID', async function () {
      // given
      const organization_1 = databaseBuilder.factory.buildOrganization();
      const organization_2 = databaseBuilder.factory.buildOrganization();

      const user = databaseBuilder.factory.buildUser();

      const schoolingRegistration_1 = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization_1.id,
      });
      const schoolingRegistration_2 = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization_1.id,
        userId: user.id,
      });
      databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization_2.id });

      await databaseBuilder.commit();

      // when
      const { data } = await schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
        organizationId: organization_1.id,
      });

      // then
      expect(_.map(data, 'id')).to.have.members([schoolingRegistration_1.id, schoolingRegistration_2.id]);
    });

    it('should return the schooling registrations not disabled', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
        isDisabled: false,
        organizationId: organization.id,
      });
      databaseBuilder.factory.buildSchoolingRegistration({ isDisabled: true, organizationId: organization.id });
      await databaseBuilder.commit();

      // when
      const { data } = await schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
        organizationId: organization.id,
      });

      // then
      expect(data).to.have.lengthOf(1);
      expect(data[0].id).to.equal(schoolingRegistration.id);
    });

    it('should order schoolingRegistrations by lastName and then by firstName with no sensitive case', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      const schoolingRegistration_1 = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        lastName: 'Grenier',
      });
      const schoolingRegistration_2 = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        lastName: 'Avatar',
        firstName: 'Xavier',
      });
      const schoolingRegistration_3 = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        lastName: 'Avatar',
        firstName: 'Arthur',
      });
      const schoolingRegistration_4 = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        lastName: 'Avatar',
        firstName: 'MATHURIN',
      });

      await databaseBuilder.commit();

      // when
      const { data } = await schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
        organizationId: organization.id,
      });

      // then
      expect(_.map(data, 'id')).to.deep.include.ordered.members([
        schoolingRegistration_3.id,
        schoolingRegistration_4.id,
        schoolingRegistration_2.id,
        schoolingRegistration_1.id,
      ]);
    });

    describe('When schoolingRegistration is filtered', function () {
      it('should return schooling registrations filtered by lastname', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, lastName: 'Grenier' });
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, lastName: 'Avatar' });
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, lastName: 'UvAtur' });
        await databaseBuilder.commit();

        // when
        const { data } = await schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
          organizationId: organization.id,
          filter: { lastName: 'Vat' },
        });

        // then
        expect(_.map(data, 'lastName')).to.deep.equal(['Avatar', 'UvAtur']);
      });

      it('should return schooling registrations filtered by firstname', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          firstName: 'Foo',
          lastName: '1',
        });
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          firstName: 'Bar',
          lastName: '2',
        });
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          firstName: 'Baz',
          lastName: '3',
        });
        await databaseBuilder.commit();

        // when
        const { data } = await schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
          organizationId: organization.id,
          filter: { firstName: 'ba' },
        });

        // then
        expect(_.map(data, 'firstName')).to.deep.equal(['Bar', 'Baz']);
      });

      it('should return schooling registrations filtered by student number', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          firstName: 'Foo',
          lastName: '1',
          studentNumber: 'FOO123',
        });
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          firstName: 'Bar',
          lastName: '2',
          studentNumber: 'BAR123',
        });
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          firstName: 'Baz',
          lastName: '3',
          studentNumber: 'BAZ123',
        });
        await databaseBuilder.commit();

        // when
        const { data } = await schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
          organizationId: organization.id,
          filter: { studentNumber: 'ba' },
        });

        // then
        expect(_.map(data, 'studentNumber')).to.deep.equal(['BAR123', 'BAZ123']);
      });

      it('should return schooling registrations filtered by division', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          lastName: '1',
          division: '4A',
        });
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          lastName: '2',
          division: '3B',
        });
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          lastName: '3',
          division: '3A',
        });
        await databaseBuilder.commit();

        // when
        const { data } = await schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
          organizationId: organization.id,
          filter: { divisions: ['3A', '3B'] },
        });

        // then
        expect(_.map(data, 'division')).to.deep.equal(['3B', '3A']);
      });

      it('should return schooling registrations filtered by group', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          lastName: '1',
          group: '4A',
        });
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          lastName: '2',
          group: '3B',
        });
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          lastName: '3',
          group: '3A',
        });
        await databaseBuilder.commit();

        // when
        const { data } = await schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
          organizationId: organization.id,
          filter: { groups: ['3A', '3B'] },
        });

        // then
        expect(_.map(data, 'group')).to.deep.equal(['3B', '3A']);
      });

      it('should return schooling registrations filtered by firstname AND lastname', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          firstName: 'John',
          lastName: 'Rambo',
        });
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          firstName: 'Jane',
          lastName: 'Rambo',
        });
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          firstName: 'Chuck',
          lastName: 'Norris',
        });
        await databaseBuilder.commit();

        // when
        const { data } = await schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
          organizationId: organization.id,
          filter: { firstName: 'ja', lastName: 'ram' },
        });

        // then
        expect(_.map(data, 'firstName')).to.deep.equal(['Jane']);
      });

      describe('When schoolingRegistration is filtered by user connexion type', function () {
        let organizationId;

        beforeEach(async function () {
          // given
          organizationId = databaseBuilder.factory.buildOrganization().id;

          databaseBuilder.factory.buildOrganizationLearnerWithUser({
            organizationId,
            lastName: 'Rambo',
            user: { email: 'john@rambo.com', username: null },
          });
          databaseBuilder.factory.buildOrganizationLearnerWithUser({
            organizationId,
            lastName: 'Willis',
            user: { email: null, username: 'willy' },
          });
          const schoolingRegistrationOfUserWithSamlId = databaseBuilder.factory.buildOrganizationLearnerWithUser({
            organizationId,
            lastName: 'Norris',
            user: { email: null, username: null },
          });
          databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
            externalIdentifier: 'chucky',
            userId: schoolingRegistrationOfUserWithSamlId.userId,
          });
          databaseBuilder.factory.buildOrganizationLearnerWithUser({
            organizationId,
            lastName: 'Lee',
            user: { email: null, username: null },
          });
          await databaseBuilder.commit();
        });

        it('should return schooling registrations filtered by "none" user connexion', async function () {
          // when
          const { data } = await schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
            organizationId,
            filter: { connexionType: 'none' },
          });

          // then
          expect(_.map(data, 'lastName')).to.deep.equal(['Lee']);
        });

        it('should return schooling registrations filtered by "identifiant" user connexion', async function () {
          // when
          const { data } = await schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
            organizationId,
            filter: { connexionType: 'identifiant' },
          });

          // then
          expect(_.map(data, 'lastName')).to.deep.equal(['Willis']);
        });

        it('should return schooling registrations filtered by "email" user connexion', async function () {
          // when
          const { data } = await schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
            organizationId,
            filter: { connexionType: 'email' },
          });

          // then
          expect(_.map(data, 'lastName')).to.deep.equal(['Rambo']);
        });

        it('should return schooling registrations filtered by "mediacentre" user connexion', async function () {
          // when
          const { data } = await schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
            organizationId,
            filter: { connexionType: 'mediacentre' },
          });

          // then
          expect(_.map(data, 'lastName')).to.deep.equal(['Norris']);
        });
      });

      it('should return schooling registrations paginated', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          firstName: 'Foo',
          lastName: '1',
        });
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          firstName: 'Bar',
          lastName: '2',
        });
        await databaseBuilder.commit();

        // when
        const { data } = await schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
          organizationId: organization.id,
          page: { number: 2, size: 1 },
        });

        // then
        expect(_.map(data, 'firstName')).to.deep.equal(['Bar']);
      });
    });

    describe('When schoolingRegistration is reconciled and authenticated by email (and/or) username', function () {
      it('should return all schoolingRegistration properties including the reconciled user:email,username', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();
        const user = databaseBuilder.factory.buildUser({
          organizationId: organization.id,
        });
        const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          userId: user.id,
        });
        const expectedUserWithSchoolingRegistration = new UserWithSchoolingRegistration({
          id: schoolingRegistration.id,
          firstName: schoolingRegistration.firstName,
          lastName: schoolingRegistration.lastName,
          birthdate: schoolingRegistration.birthdate,
          organizationId: schoolingRegistration.organizationId,
          username: user.username,
          userId: schoolingRegistration.userId,
          email: user.email,
          isAuthenticatedFromGAR: false,
          studentNumber: schoolingRegistration.studentNumber,
          division: schoolingRegistration.division,
          group: schoolingRegistration.group,
        });
        await databaseBuilder.commit();

        // when
        const { data } = await schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
          organizationId: organization.id,
        });

        // then
        expect(data[0]).to.deep.equal(expectedUserWithSchoolingRegistration);
      });
    });

    describe('When schoolingRegistration is reconciled  and  authenticated from GAR', function () {
      it('should return isAuthenticatedFromGAR property equal to true', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();
        const user = databaseBuilder.factory.buildUser({
          organizationId: organization.id,
          username: null,
          email: null,
        });
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
          externalIdentifier: 'samlId',
          userId: user.id,
        });
        const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          userId: user.id,
        });
        const expectedUserWithSchoolingRegistration = new UserWithSchoolingRegistration({
          id: schoolingRegistration.id,
          firstName: schoolingRegistration.firstName,
          lastName: schoolingRegistration.lastName,
          birthdate: schoolingRegistration.birthdate,
          organizationId: schoolingRegistration.organizationId,
          username: null,
          email: null,
          userId: schoolingRegistration.userId,
          isAuthenticatedFromGAR: true,
          studentNumber: schoolingRegistration.studentNumber,
          division: schoolingRegistration.division,
          group: schoolingRegistration.group,
        });
        await databaseBuilder.commit();

        // when
        const { data } = await schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
          organizationId: organization.id,
        });

        // then
        expect(data[0]).to.deep.equal(expectedUserWithSchoolingRegistration);
      });
    });

    describe('When schoolingRegistration is not reconciled', function () {
      it('should return empty email, username, userId', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();
        const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          userId: null,
        });

        const expectedUserWithSchoolingRegistration = new UserWithSchoolingRegistration({
          id: schoolingRegistration.id,
          firstName: schoolingRegistration.firstName,
          lastName: schoolingRegistration.lastName,
          birthdate: schoolingRegistration.birthdate,
          organizationId: schoolingRegistration.organizationId,
          username: null,
          email: null,
          userId: schoolingRegistration.userId,
          isAuthenticatedFromGAR: false,
          studentNumber: schoolingRegistration.studentNumber,
          division: schoolingRegistration.division,
          group: schoolingRegistration.group,
        });
        await databaseBuilder.commit();

        // when
        const { data } = await schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
          organizationId: organization.id,
        });

        // then
        expect(data[0]).to.deep.equal(expectedUserWithSchoolingRegistration);
      });
    });
  });

  describe('#updateUserIdWhereNull', function () {
    let userId;
    let schoolingRegistrationId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    it('should update userId if it was null before', async function () {
      // given
      schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
        userId: null,
      }).id;
      await databaseBuilder.commit();

      // when
      const updatedSchoolingRegistration = await schoolingRegistrationRepository.updateUserIdWhereNull({
        schoolingRegistrationId,
        userId,
      });

      // then
      expect(updatedSchoolingRegistration.userId).to.equal(userId);
    });

    it('should throw where schoolingRegistration is already linked with a user', async function () {
      // given
      schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
        userId,
      }).id;
      await databaseBuilder.commit();

      // when
      const error = await catchErr(schoolingRegistrationRepository.updateUserIdWhereNull)({
        schoolingRegistrationId,
        userId,
      });

      // then
      expect(error).to.be.an.instanceOf(SchoolingRegistrationNotFound);
    });
  });

  describe('#isActive', function () {
    it('returns true when there is no schooling registration', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId });
      await databaseBuilder.commit();

      const isActive = await schoolingRegistrationRepository.isActive({ userId, campaignId });

      expect(isActive).to.be.true;
    });

    it('returns true when the schooling registration is active', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId });
      databaseBuilder.factory.buildSchoolingRegistration({ userId, organizationId, isDisabled: false });
      await databaseBuilder.commit();

      const isActive = await schoolingRegistrationRepository.isActive({ userId, campaignId });

      expect(isActive).to.be.true;
    });

    it('returns false when the schooling registration is disabled', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId });
      databaseBuilder.factory.buildSchoolingRegistration({ userId, organizationId, isDisabled: true });
      await databaseBuilder.commit();

      const isActive = await schoolingRegistrationRepository.isActive({ userId, campaignId });

      expect(isActive).to.be.false;
    });

    it('takes into account only schooling registration for the given userId', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId });
      databaseBuilder.factory.buildSchoolingRegistration({ userId, organizationId, isDisabled: true });

      const otherUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCampaignParticipation({ userId: otherUserId, campaignId });
      databaseBuilder.factory.buildSchoolingRegistration({ userId: otherUserId, organizationId, isDisabled: false });
      await databaseBuilder.commit();

      const isActive = await schoolingRegistrationRepository.isActive({ userId: otherUserId, campaignId });

      expect(isActive).to.be.true;
    });

    it('takes into account only schooling registration for the given campaignId', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId });
      databaseBuilder.factory.buildSchoolingRegistration({ userId, organizationId, isDisabled: true });

      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const otherCampaignId = databaseBuilder.factory.buildCampaign({ organizationId: otherOrganizationId }).id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: otherCampaignId });
      databaseBuilder.factory.buildSchoolingRegistration({
        userId,
        organizationId: otherOrganizationId,
        isDisabled: false,
      });
      await databaseBuilder.commit();

      const isActive = await schoolingRegistrationRepository.isActive({ userId, campaignId: otherCampaignId });

      expect(isActive).to.be.true;
    });
  });
});
