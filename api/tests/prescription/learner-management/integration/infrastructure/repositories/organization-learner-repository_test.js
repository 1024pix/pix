import _ from 'lodash';
import sinon from 'sinon';

import { OrganizationLearnerCertificabilityNotUpdatedError } from '../../../../../../src/prescription/learner-management/domain/errors.js';
import { CommonOrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/models/CommonOrganizationLearner.js';
import { OrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearner.js';
import { OrganizationLearnerForAdmin } from '../../../../../../src/prescription/learner-management/domain/read-models/OrganizationLearnerForAdmin.js';
import {
  addOrUpdateOrganizationOfOrganizationLearners,
  countByUserId,
  disableAllOrganizationLearnersInOrganization,
  disableCommonOrganizationLearnersFromOrganizationId,
  findAllCommonLearnersFromOrganizationId,
  findAllCommonOrganizationLearnerByReconciliationInfos,
  findOrganizationLearnerIdsBeforeImportFeatureFromOrganizationId,
  findOrganizationLearnersByOrganizationIdAndLearnerIds,
  getLearnerInfo,
  getOrganizationLearnerForAdmin,
  reconcileUserByNationalStudentIdAndOrganizationId,
  reconcileUserToOrganizationLearner,
  saveCommonOrganizationLearners,
  update,
  updateCertificability,
  updateInBatchByIds,
} from '../../../../../../src/prescription/learner-management/infrastructure/repositories/organization-learner-repository.js';
import * as organizationLearnerRepository from '../../../../../../src/prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import {
  NotFoundError,
  OrganizationLearnersCouldNotBeSavedError,
  UserCouldNotBeReconciledError,
} from '../../../../../../src/shared/domain/errors.js';

import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Repository | Organization Learner Management | Organization Learner', function () {
  describe('#getOrganizationLearnerForAdmin', function () {
    let organizationLearnerId;

    beforeEach(function () {
      organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      return databaseBuilder.commit();
    });

    it('should return an instance of OrganizationLearnerForAdmin', async function () {
      // when
      const organizationLearner = await getOrganizationLearnerForAdmin(organizationLearnerId);

      // then
      expect(organizationLearner).to.be.an.instanceOf(OrganizationLearnerForAdmin);
      expect(organizationLearner.id).to.equal(organizationLearnerId);
    });

    it('should return a NotFoundError if no organizationLearner is found', async function () {
      // given
      const nonExistentOrganizationLearnerId = 678;

      // when
      const result = await catchErr(getOrganizationLearnerForAdmin)(nonExistentOrganizationLearnerId);

      // then
      expect(result).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#updateInBatchByIds', function () {
    let clock;
    const now = new Date('2023-02-02');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('update given organization learner', async function () {
      // given
      const adminUserId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const anotherOrganizationLearnerFromDB = databaseBuilder.factory.buildOrganizationLearner({
        lastName: 'Steve',
        preferredLastName: 'Mc',
        firstName: 'Chicken',
        middleName: 'Fry',
        thirdName: 'BBQ',
        sex: 'F',
        MEFCode: '14',
        birthdate: '2001-05-08',
        birthCity: 'Mans',
        birthCityCode: '546789',
        birthProvinceCode: '50',
        birthCountryCode: '19',
        status: 'AM/PM',
        nationalStudentId: '45679721',
        division: '6eme RAINBOW',
        updatedAt: new Date('1999-01-01'),
        email: 'littlecat@animal.org',
        studentNumber: '4987644',
        department: '52',
        educationalTeam: 'CoreTex',
        group: 'C',
        diploma: 'pujze, peozaeza; pzaezae',
        nationalApprenticeId: '489798485',
        deletedBy: null,
        deletedAt: null,
      });

      const organizationLearnerFromDB = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        lastName: 'Richard',
        preferredLastName: 'Maurice',
        firstName: 'jean',
        middleName: 'paul',
        thirdName: 'pierre',
        sex: 'M',
        MEFCode: '12',
        birthdate: '2001-05-06',
        birthCity: 'Mans',
        birthCityCode: '12345',
        birthProvinceCode: '45',
        birthCountryCode: '18',
        status: 'AP',
        nationalStudentId: '12314543',
        division: '6eme ROUGE',
        updatedAt: new Date('1999-01-01'),
        email: 'littlepeas@vegatable.org',
        studentNumber: '9876543',
        department: '51',
        educationalTeam: 'Core',
        group: 'B',
        diploma: 'pujze, peozaeza; pzaezae',
        nationalApprenticeId: '123456432',
        deletedBy: null,
        deletedAt: null,
      });

      await databaseBuilder.commit();

      // when
      const organizationLearner = domainBuilder.buildOrganizationLearner(organizationLearnerFromDB);
      organizationLearner.delete(adminUserId);

      await updateInBatchByIds([organizationLearner.dataToUpdateOnDeletion]);

      // then
      const organizationAnonymizedLearner = await knex('organization-learners')
        .where({ id: organizationLearner.id })
        .first();

      expect(organizationAnonymizedLearner.MEFCode).equal('12');
      expect(organizationAnonymizedLearner.lastName).equal('(anonymized)');
      expect(organizationAnonymizedLearner.firstName).equal('(anonymized)');
      expect(organizationAnonymizedLearner.preferredLastName).null;
      expect(organizationAnonymizedLearner.middleName).null;
      expect(organizationAnonymizedLearner.thirdName).null;
      expect(organizationAnonymizedLearner.sex).null;
      expect(organizationAnonymizedLearner.birthdate).deep.equal('2001-01-01');
      expect(organizationAnonymizedLearner.birthCity).null;
      expect(organizationAnonymizedLearner.birthCityCode).null;
      expect(organizationAnonymizedLearner.birthProvinceCode).null;
      expect(organizationAnonymizedLearner.birthCountryCode).null;
      expect(organizationAnonymizedLearner.status).null;
      expect(organizationAnonymizedLearner.nationalStudentId).null;
      expect(organizationAnonymizedLearner.division).null;
      expect(organizationAnonymizedLearner.updatedAt).deep.equal(now);
      expect(organizationAnonymizedLearner.email).null;
      expect(organizationAnonymizedLearner.studentNumber).null;
      expect(organizationAnonymizedLearner.department).null;
      expect(organizationAnonymizedLearner.educationalTeam).null;
      expect(organizationAnonymizedLearner.group).null;
      expect(organizationAnonymizedLearner.diploma).null;
      expect(organizationAnonymizedLearner.nationalApprenticeId).null;
      expect(organizationAnonymizedLearner.deletedBy).equal(adminUserId);
      expect(organizationAnonymizedLearner.deletedAt).deep.equal(now);

      const organizationLearnerActive = await knex('organization-learners')
        .where({ id: anotherOrganizationLearnerFromDB.id })
        .first();

      expect(organizationLearnerActive.MEFCode).equal(anotherOrganizationLearnerFromDB.MEFCode);
      expect(organizationLearnerActive.lastName).equal(anotherOrganizationLearnerFromDB.lastName);
      expect(organizationLearnerActive.firstName).equal(anotherOrganizationLearnerFromDB.firstName);
      expect(organizationLearnerActive.preferredLastName).equal(anotherOrganizationLearnerFromDB.preferredLastName);
      expect(organizationLearnerActive.middleName).equal(anotherOrganizationLearnerFromDB.middleName);
      expect(organizationLearnerActive.thirdName).equal(anotherOrganizationLearnerFromDB.thirdName);
      expect(organizationLearnerActive.sex).equal(anotherOrganizationLearnerFromDB.sex);
      expect(organizationLearnerActive.birthdate).equal(anotherOrganizationLearnerFromDB.birthdate);
      expect(organizationLearnerActive.birthCity).equal(anotherOrganizationLearnerFromDB.birthCity);
      expect(organizationLearnerActive.birthCityCode).equal(anotherOrganizationLearnerFromDB.birthCityCode);
      expect(organizationLearnerActive.birthProvinceCode).equal(anotherOrganizationLearnerFromDB.birthProvinceCode);
      expect(organizationLearnerActive.birthCountryCode).equal(anotherOrganizationLearnerFromDB.birthCountryCode);
      expect(organizationLearnerActive.status).equal(anotherOrganizationLearnerFromDB.status);
      expect(organizationLearnerActive.nationalStudentId).equal(anotherOrganizationLearnerFromDB.nationalStudentId);
      expect(organizationLearnerActive.division).equal(anotherOrganizationLearnerFromDB.division);
      expect(organizationLearnerActive.updatedAt).deep.equal(anotherOrganizationLearnerFromDB.updatedAt);
      expect(organizationLearnerActive.email).equal(anotherOrganizationLearnerFromDB.email);
      expect(organizationLearnerActive.studentNumber).equal(anotherOrganizationLearnerFromDB.studentNumber);
      expect(organizationLearnerActive.department).equal(anotherOrganizationLearnerFromDB.department);
      expect(organizationLearnerActive.educationalTeam).equal(anotherOrganizationLearnerFromDB.educationalTeam);
      expect(organizationLearnerActive.group).equal(anotherOrganizationLearnerFromDB.group);
      expect(organizationLearnerActive.diploma).equal(anotherOrganizationLearnerFromDB.diploma);
      expect(organizationLearnerActive.nationalApprenticeId).equal(
        anotherOrganizationLearnerFromDB.nationalApprenticeId,
      );
      expect(organizationLearnerActive.deletedBy).null;
      expect(organizationLearnerActive.deletedAt).null;
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
            expect(existingOrganizationLearners).to.have.lengthOf(1);
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
        expect(actualOrganizationLearners).to.have.lengthOf(1);
        expect({
          lastName: firstOrganizationLearner.lastName,
          preferredLastName: firstOrganizationLearner.preferredLastName,
          firstName: firstOrganizationLearner.firstName,
          middleName: firstOrganizationLearner.middleName,
          thirdName: firstOrganizationLearner.thirdName,
          sex: firstOrganizationLearner.sex,
          birthdate: firstOrganizationLearner.birthdate,
          birthCity: firstOrganizationLearner.birthCity,
          birthCityCode: firstOrganizationLearner.birthCityCode,
          birthProvinceCode: firstOrganizationLearner.birthProvinceCode,
          birthCountryCode: firstOrganizationLearner.birthCountryCode,
          MEFCode: firstOrganizationLearner.MEFCode,
          status: firstOrganizationLearner.status,
          nationalStudentId: firstOrganizationLearner.nationalStudentId,
          division: firstOrganizationLearner.division,
          userId: firstOrganizationLearner.userId,
          isDisabled: firstOrganizationLearner.isDisabled,
          organizationId: firstOrganizationLearner.organizationId,
        }).deep.equal({
          lastName: actualOrganizationLearners[0].lastName,
          preferredLastName: actualOrganizationLearners[0].preferredLastName,
          firstName: actualOrganizationLearners[0].firstName,
          middleName: actualOrganizationLearners[0].middleName,
          thirdName: actualOrganizationLearners[0].thirdName,
          sex: actualOrganizationLearners[0].sex,
          birthdate: actualOrganizationLearners[0].birthdate,
          birthCity: actualOrganizationLearners[0].birthCity,
          birthCityCode: actualOrganizationLearners[0].birthCityCode,
          birthProvinceCode: actualOrganizationLearners[0].birthProvinceCode,
          birthCountryCode: actualOrganizationLearners[0].birthCountryCode,
          MEFCode: actualOrganizationLearners[0].MEFCode,
          status: actualOrganizationLearners[0].status,
          nationalStudentId: actualOrganizationLearners[0].nationalStudentId,
          division: actualOrganizationLearners[0].division,
          userId: actualOrganizationLearners[0].userId,
          isDisabled: actualOrganizationLearners[0].isDisabled,
          organizationId: actualOrganizationLearners[0].organizationId,
        });
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

    context('when there are deleted organizationLearners with same nationalStudentId', function () {
      let organizationLearners;
      let organizationId;
      let firstOrganizationLearner;

      beforeEach(async function () {
        organizationId = databaseBuilder.factory.buildOrganization().id;

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
          nationalStudentId: '1234',
          division: '4B',
          userId: null,
          isDisabled: false,
          organizationId,
        });

        databaseBuilder.factory.buildOrganizationLearner({ ...firstOrganizationLearner, deletedAt: new Date() });

        await databaseBuilder.commit();

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
        expect(actualOrganizationLearners).to.have.lengthOf(1);
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
          await DomainTransaction.execute(async () => {
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

    context('update existing learner', function () {
      let clock;
      const now = new Date('2023-02-02');

      beforeEach(function () {
        clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
      });

      afterEach(function () {
        clock.restore();
      });

      it('should update existing learner', async function () {
        const organizationLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          firstName: 'Sacha',
          lastName: 'Du Bourg Palette',
          organizationId,
          isDisabled: true,
          updatedAt: new Date('2020-01-01'),
          attributes: {
            INE: '234567890',
          },
        });
        const organizationLearner2 = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner(
          {
            firstName: 'Pikachu',
            lastName: 'PikaPika',
            organizationId,
            isDisabled: false,
            updatedAt: new Date('2020-01-01'),
            attributes: {
              INE: '234567800',
            },
          },
        );

        await databaseBuilder.commit();

        const learnerData = new CommonOrganizationLearner({
          id: organizationLearner.id,
          firstName: 'Kasumi',
          lastName: 'Yawa',
          organizationId,
          INE: '12345',
        });

        const learner2Data = new CommonOrganizationLearner({
          id: organizationLearner2.id,
          firstName: 'Raichu',
          lastName: 'Pika',
          organizationId,
          INE: '12345',
        });

        await saveCommonOrganizationLearners([learnerData, learner2Data]);

        const updatedOrganizationLearners = await knex.from('organization-learners');

        expect(updatedOrganizationLearners[0].firstName).to.equal(learnerData.firstName);
        expect(updatedOrganizationLearners[0].lastName).to.equal(learnerData.lastName);
        expect(updatedOrganizationLearners[0].organizationId).to.equal(learnerData.organizationId);
        expect(updatedOrganizationLearners[0].attributes).to.deep.equal(learnerData.attributes);
        expect(updatedOrganizationLearners[0].isDisabled).to.be.false;
        expect(updatedOrganizationLearners[0].updatedAt).to.be.deep.equal(new Date('2023-02-02'));

        expect(updatedOrganizationLearners[1].firstName).to.equal(learner2Data.firstName);
        expect(updatedOrganizationLearners[1].lastName).to.equal(learner2Data.lastName);
        expect(updatedOrganizationLearners[1].organizationId).to.equal(learner2Data.organizationId);
        expect(updatedOrganizationLearners[1].attributes).to.deep.equal(learner2Data.attributes);
        expect(updatedOrganizationLearners[1].isDisabled).to.be.false;
        expect(updatedOrganizationLearners[1].updatedAt).to.be.deep.equal(new Date('2023-02-02'));
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
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      });
      await databaseBuilder.commit();

      // when
      await disableCommonOrganizationLearnersFromOrganizationId({ organizationId });

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
      await disableCommonOrganizationLearnersFromOrganizationId({ organizationId });

      // then
      const organizationLearners = await knex.from('organization-learners').where({
        isDisabled: true,
      });

      expect(organizationLearners).lengthOf(2);
      expect(organizationLearners.map(({ id }) => id)).to.have.members([learner1.id, learner2.id]);
    });

    it('should disable organization learners not in list from an organizationId', async function () {
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
      await disableCommonOrganizationLearnersFromOrganizationId({
        organizationId,
        excludeOrganizationLearnerIds: [learner1.id],
      });

      // then
      const organizationLearners = await knex.from('organization-learners').where({
        isDisabled: true,
      });

      expect(organizationLearners).lengthOf(1);
      expect(organizationLearners.map(({ id }) => id)).to.have.members([learner2.id]);
    });

    it('should not disable the learner when error occured', async function () {
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      await databaseBuilder.commit();

      try {
        await DomainTransaction.execute(async () => {
          await disableCommonOrganizationLearnersFromOrganizationId({ organizationId });
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

  describe('#findAllCommonLearnersFromOrganizationId', function () {
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();
    });

    it('should retrieve active learners', async function () {
      // given
      const firstLearnerData = new CommonOrganizationLearner({
        firstName: 'Sacha',
        lastName: 'Du Bourg Palette',
        organizationId,
        INE: '234567890',
        hooby: 'Pokemon Hunter',
      });

      const { firstName, lastName, id, userId, attributes } =
        databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          ...firstLearnerData,
          isDisabled: false,
          organizationId,
        });

      await databaseBuilder.commit();

      // when
      const organizationLearners = await findAllCommonLearnersFromOrganizationId({
        organizationId,
      });

      // then
      expect(organizationLearners).lengthOf(1);
      expect(organizationLearners[0]).instanceOf(CommonOrganizationLearner);
      expect(organizationLearners[0]).to.be.deep.equal({
        firstName,
        lastName,
        id,
        userId,
        attributes,
        organizationId,
      });
    });

    it('should retrieve disable learner', async function () {
      // given
      const learnerData = new CommonOrganizationLearner({
        firstName: 'Sacha',
        lastName: 'Du Bourg Palette',
        organizationId,
        INE: '234567890',
      });

      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        ...learnerData,
        isDisabled: true,
        organizationId,
      });
      await databaseBuilder.commit();

      // when
      const organizationLearners = await findAllCommonLearnersFromOrganizationId({
        organizationId,
      });

      // then
      expect(organizationLearners).lengthOf(1);
    });

    it('should not retrieve deleted learner', async function () {
      // given
      const learnerData = new CommonOrganizationLearner({
        firstName: 'Sacha',
        lastName: 'Du Bourg Palette',
        organizationId,
        INE: '234567890',
      });

      const userId = databaseBuilder.factory.buildUser().id;

      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        ...learnerData,
        isDisabled: false,
        deletedAt: new Date('2020-01-01'),
        deletedBy: userId,
        organizationId,
      });
      await databaseBuilder.commit();

      // when
      const organizationLearners = await findAllCommonLearnersFromOrganizationId({
        organizationId,
      });

      // then
      expect(organizationLearners).lengthOf(0);
    });

    it('should not retrieve learner from otherOrganizationId', async function () {
      // given
      const otherOrganizationId = databaseBuilder.factory.buildOrganization({}).id;
      const learnerData = new CommonOrganizationLearner({
        firstName: 'Sacha',
        lastName: 'Du Bourg Palette',
        organizationId: otherOrganizationId,
        INE: '234567890',
      });

      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        ...learnerData,
        isDisabled: false,
      });

      await databaseBuilder.commit();

      // when
      const organizationLearners = await findAllCommonLearnersFromOrganizationId({
        organizationId,
      });

      // then
      expect(organizationLearners).lengthOf(0);
    });
  });

  describe('#findAllCommonOrganizationLearnerByReconciliationInfos', function () {
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        firstName: 'Edgar',
        lastName: 'Aheurfix',
        attributes: {
          'date de naissance': '2020-01-01',
          hobby: 'manger',
        },
        userId: null,
        organizationId,
      });

      await databaseBuilder.commit();
    });

    describe('matching cases', function () {
      it('if use attributes data to match users', async function () {
        // given
        const organizationLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          firstName: 'Amandine',
          lastName: 'AheurFix',
          attributes: {
            'date de naissance': '2021-01-01',
            hobby: 'manger',
          },
          userId: null,
          organizationId,
        });

        await databaseBuilder.commit();

        // when
        const matchingLearner = await findAllCommonOrganizationLearnerByReconciliationInfos({
          organizationId,
          reconciliationInformations: {
            hobby: 'manger',
            'date de naissance': '2021-01-01',
          },
        });

        // then
        expect(matchingLearner).to.deep.equal([
          new CommonOrganizationLearner({
            firstName: organizationLearner.firstName,
            lastName: organizationLearner.lastName,
            organizationId: organizationLearner.organizationId,
            id: organizationLearner.id,
            ...organizationLearner.attributes,
          }),
        ]);
      });
    });

    describe('no matching cases', function () {
      it('if learner has no matching infos', async function () {
        // given
        databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          firstName: 'Amandine',
          lastName: 'AheurFix',
          attributes: {
            'date de naissance': '2020-01-01',
            hobby: 'Attendre',
          },
          organizationId,
        });

        await databaseBuilder.commit();

        // when
        const matchingLearner = await findAllCommonOrganizationLearnerByReconciliationInfos({
          organizationId,
          reconciliationInformations: {
            hobby: 'Rire',
          },
        });

        // then
        expect(matchingLearner).to.deep.equal([]);
      });

      it('if learner is in another organization', async function () {
        // given
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          firstName: 'Amandine',
          lastName: 'AheurFix',
          attributes: {
            'date de naissance': '2020-01-01',
            hobby: 'Attendre',
          },
          organizationId: otherOrganizationId,
        });

        await databaseBuilder.commit();

        // when
        const matchingLearner = await findAllCommonOrganizationLearnerByReconciliationInfos({
          organizationId,
          reconciliationInformations: {
            hobby: 'Attendre',
          },
        });

        // then
        expect(matchingLearner).to.deep.equal([]);
      });

      it('if learner is deleted', async function () {
        // given
        databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          firstName: 'Amandine',
          lastName: 'AheurFix',
          deletedAt: new Date('2020-01-01'),
          attributes: {
            'date de naissance': '2020-01-01',
            hobby: 'Attendre',
          },
          organizationId,
        });

        await databaseBuilder.commit();

        // when
        const matchingLearner = await findAllCommonOrganizationLearnerByReconciliationInfos({
          organizationId,
          reconciliationInformations: {
            hobby: 'Attendre',
          },
        });

        // then
        expect(matchingLearner).to.deep.equal([]);
      });

      it('if learner is disabled', async function () {
        // given
        databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          firstName: 'Amandine',
          lastName: 'AheurFix',
          isDisabled: true,
          attributes: {
            'date de naissance': '2020-01-01',
            hobby: 'Attendre',
          },
          organizationId,
        });

        await databaseBuilder.commit();

        // when
        const matchingLearner = await findAllCommonOrganizationLearnerByReconciliationInfos({
          organizationId,
          reconciliationInformations: {
            'date de naissance': '2020-01-01',
            hobby: 'Attendre',
          },
        });

        // then
        expect(matchingLearner).to.deep.equal([]);
      });
    });
  });

  describe('#update', function () {
    let organizationLearner;

    beforeEach(async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      organizationLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        firstName: 'Edgar',
        lastName: 'Aheurfix',
        attributes: {
          'date de naissance': '2020-01-01',
          hobby: 'manger',
        },
        userId: null,
        organizationId,
      });
      await databaseBuilder.commit();
    });

    it('should update an organizationLearner that match the id', async function () {
      const user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      organizationLearner.userId = user.id;
      const updated = await update(organizationLearner);
      expect(updated).to.be.true;

      const learner = await knex('view-active-organization-learners')
        .select('userId')
        .where({ id: organizationLearner.id })
        .first();

      expect(learner.userId).to.be.equal(user.id);
    });
  });

  describe('#reconcileUserByNationalStudentIdAndOrganizationId', function () {
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
          nationalStudentId: 'INE123456',
        });
        user = databaseBuilder.factory.buildUser({ firstName: 'Steeve', lastName: 'Roger' });
        await databaseBuilder.commit();
      });

      it('should save association between user and organization', async function () {
        // when
        const organizationLearnerPatched = await reconcileUserByNationalStudentIdAndOrganizationId({
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
        const error = await catchErr(reconcileUserByNationalStudentIdAndOrganizationId)({
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
        const error = await catchErr(reconcileUserByNationalStudentIdAndOrganizationId)({
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
        const error = await catchErr(reconcileUserByNationalStudentIdAndOrganizationId)({
          userId: fakeUserId,
          nationalStudentId: organizationLearner.nationalStudentId,
          organizationId: organization.id,
        });

        // then
        expect(error).to.be.instanceof(UserCouldNotBeReconciledError);
      });
    });
    context('when the organizationLearner has no national Student Id and there is anonymised learner', function () {
      it('should return an error', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const { id: userId } = databaseBuilder.factory.buildUser({ firstName: 'Natasha', lastName: 'Romanoff' });

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId: null,
          nationalStudentId: '123456789',
          firstName: 'Natasha',
          lastName: 'Romanoff',
          isDisabled: false,
        });

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId: null,
          firstName: '(anonymised)',
          lastName: '(anonymised)',
          nationalStudentId: null,
          isDisabled: false,
          deletedAt: new Date(),
        });

        await databaseBuilder.commit();

        // when
        const error = await catchErr(reconcileUserByNationalStudentIdAndOrganizationId)({
          userId,
          nationalStudentId: null,
          organizationId,
        });

        // then
        expect(error).to.be.instanceof(UserCouldNotBeReconciledError);
      });
    });

    context('when the organizationLearner has no national Student Id', function () {
      it('should return an error', async function () {
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const { id: userId } = databaseBuilder.factory.buildUser({ firstName: 'Natasha', lastName: 'Romanoff' });

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId: null,
          nationalStudentId: '123456789',
          firstName: 'Natasha',
          lastName: 'Romanoff',
          isDisabled: false,
        });

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId: null,
          firstName: '(anonymised)',
          lastName: '(anonymised)',
          nationalStudentId: null,
          isDisabled: false,
        });

        await databaseBuilder.commit();

        // when
        const error = await catchErr(reconcileUserByNationalStudentIdAndOrganizationId)({
          userId,
          nationalStudentId: null,
          organizationId,
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
        await databaseBuilder.commit();
        // when
        const error = await catchErr(reconcileUserByNationalStudentIdAndOrganizationId)({
          userId,
          nationalStudentId: organizationLearner.nationalStudentId,
          organizationId,
        });

        // then
        expect(error).to.be.instanceof(UserCouldNotBeReconciledError);
      });
    });
  });

  // copied from test/integration/repositories/organization-learner-repository-test.js
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

  describe('#findOrganizationLearnersByOrganizationIdAndLearnerIds', function () {
    let myOrganizationId;
    let otherOrganizationId;
    let organizationLearner;

    beforeEach(async function () {
      myOrganizationId = databaseBuilder.factory.buildOrganization().id;
      otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: myOrganizationId,
      });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: otherOrganizationId,
      }).id;
      await databaseBuilder.commit();
    });

    it('should return learners list', async function () {
      const otherOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: myOrganizationId,
      });
      await databaseBuilder.commit();
      const results = await findOrganizationLearnersByOrganizationIdAndLearnerIds({
        organizationId: myOrganizationId,
        organizationLearnerIds: [organizationLearner.id, otherOrganizationLearner.id],
      });

      expect(results).lengthOf(2);
      expect(results[0]).instanceOf(OrganizationLearner);
      expect(results[1]).instanceOf(OrganizationLearner);
      expect(results).to.deep.members([
        new OrganizationLearner(organizationLearner),
        new OrganizationLearner(otherOrganizationLearner),
      ]);
    });

    it('should return only learners matching organizationLearnersIds', async function () {
      const otherOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: myOrganizationId,
      });
      await databaseBuilder.commit();
      const results = await findOrganizationLearnersByOrganizationIdAndLearnerIds({
        organizationId: myOrganizationId,
        organizationLearnerIds: [otherOrganizationLearner.id],
      });

      expect(results).lengthOf(1);
      expect(results[0]).instanceOf(OrganizationLearner);
      expect(results).to.deep.members([new OrganizationLearner(otherOrganizationLearner)]);
    });

    it('should not return deleted learner', async function () {
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: myOrganizationId,
        deletedAt: new Date('2020-04-05'),
      });

      await databaseBuilder.commit();

      const results = await findOrganizationLearnersByOrganizationIdAndLearnerIds({
        organizationId: myOrganizationId,
        organizationLearnerIds: [organizationLearner.id],
      });
      expect(results).to.deep.equal([new OrganizationLearner(organizationLearner)]);
    });
  });

  describe('#reconcileUserToOrganizationLearner', function () {
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
      const organizationLearnerPatched = await reconcileUserToOrganizationLearner({
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
      const error = await catchErr(reconcileUserToOrganizationLearner)({
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
      const error = await catchErr(reconcileUserToOrganizationLearner)({
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
      const error = await catchErr(reconcileUserToOrganizationLearner)({
        userId: user.id,
        organizationLearnerId: disabledOrganizationLearner.id,
      });

      // then
      expect(error).to.be.instanceOf(UserCouldNotBeReconciledError);
    });
  });

  describe('#countByUserId', function () {
    let userId;
    let organizationId, otherOrganizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      otherOrganizationId = databaseBuilder.factory.buildOrganization().id;

      userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();
    });

    context('when there is no organization learner with userId', function () {
      it('should return 0', async function () {
        // given
        const notExistingUserId = 0;

        // when
        const result = await countByUserId(notExistingUserId);
        // then
        expect(result).to.equal(0);
      });
    });

    context('when organization learner with userId exist', function () {
      beforeEach(async function () {
        const otherUserId = databaseBuilder.factory.buildUser().id;

        databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId });
        databaseBuilder.factory.buildOrganizationLearner({ organizationId: otherOrganizationId, userId });
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId: otherUserId });

        await databaseBuilder.commit();
      });

      it('should return the number of organizationLearners with userId', async function () {
        // when
        const result = await countByUserId(userId);
        // then
        expect(result).to.equal(2);
      });
    });

    context('when disabled or deleted organization learner with userId exist', function () {
      let userLinkToNotActiveOrganizationLearnerId;

      beforeEach(async function () {
        userLinkToNotActiveOrganizationLearnerId = databaseBuilder.factory.buildUser().id;

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId: userLinkToNotActiveOrganizationLearnerId,
          deletedAt: new Date(),
          isDisabled: true,
        });
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: otherOrganizationId,
          userId: userLinkToNotActiveOrganizationLearnerId,
          isDisabled: true,
        });

        await databaseBuilder.commit();
      });

      it('should return the number of organizationLearners', async function () {
        // when
        const result = await countByUserId(userLinkToNotActiveOrganizationLearnerId);
        // then
        expect(result).to.equal(2);
      });
    });
  });

  describe('#findOrganizationLearnerIdsBeforeImportFeatureFromOrganizationId ', function () {
    let organizationId, organizationLearnerIdOfYesYes;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;

      organizationLearnerIdOfYesYes =
        databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          organizationId,
          firstName: 'Oui',
          lastName: 'Oui',
          userId: null,
          attributes: null,
        }).id;

      await databaseBuilder.commit();
    });

    it('should return an array of organization learner id given organizationId', async function () {
      const otherOrganizationLearnerId =
        databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          organizationId,
          firstName: 'Non',
          lastName: 'Non',
          userId: null,
          attributes: null,
        }).id;

      await databaseBuilder.commit();

      const results = await findOrganizationLearnerIdsBeforeImportFeatureFromOrganizationId({ organizationId });

      expect([organizationLearnerIdOfYesYes, otherOrganizationLearnerId]).to.be.deep.members(results);
    });

    it('should not return organization learners from other organization', async function () {
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId: databaseBuilder.factory.buildOrganization().id,
        firstName: 'Non',
        lastName: 'Non',
        userId: null,
        attributes: null,
      }).id;

      await databaseBuilder.commit();

      const results = await findOrganizationLearnerIdsBeforeImportFeatureFromOrganizationId({ organizationId });

      expect([organizationLearnerIdOfYesYes]).to.be.deep.members(results);
    });

    it('should not return organization learners already deleted', async function () {
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId,
        firstName: 'Non',
        lastName: 'Non',
        userId: null,
        attributes: null,
        deletedAt: new Date('2020-01-01'),
      }).id;

      await databaseBuilder.commit();

      const results = await findOrganizationLearnerIdsBeforeImportFeatureFromOrganizationId({ organizationId });

      expect([organizationLearnerIdOfYesYes]).to.be.deep.members(results);
    });

    it('should not return organization learners with attributes', async function () {
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        organizationId,
        firstName: 'Non',
        lastName: 'Non',
        userId: null,
        attributes: { test: 'toto' },
        deletedAt: null,
      }).id;

      await databaseBuilder.commit();

      const results = await findOrganizationLearnerIdsBeforeImportFeatureFromOrganizationId({ organizationId });

      expect([organizationLearnerIdOfYesYes]).to.be.deep.members(results);
    });
  });

  describe('#getLearnerInfo', function () {
    let organizationLearnerId;

    beforeEach(function () {
      organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      return databaseBuilder.commit();
    });

    it('should return an instance of OrganizationLearner', async function () {
      // when
      const organizationLearner = await getLearnerInfo(organizationLearnerId);

      // then
      expect(organizationLearner).to.be.an.instanceOf(OrganizationLearner);
      expect(organizationLearner.id).to.equal(organizationLearnerId);
    });

    it('should return a NotFoundError if no organizationLearner is found', async function () {
      // given
      const nonExistentStudentId = 678;

      // when
      const result = await catchErr(getLearnerInfo)(nonExistentStudentId);

      // then
      expect(result).to.be.instanceOf(NotFoundError);
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
      await updateCertificability(organizationLearner);

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

      const error = await catchErr(updateCertificability)(notExistingOrganizationLearner);

      // then
      expect(error).to.be.instanceof(OrganizationLearnerCertificabilityNotUpdatedError);
    });
  });
});
