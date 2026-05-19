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
  findByOrganizationId,
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
import { expect } from '../../../../../test-helper.js';
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

  describe('#findByOrganizationId', function () {
    it('should return userId and nationalStudentId for non-deleted learners in the organization', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId: user.id, nationalStudentId: 'INE1' });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId: null, nationalStudentId: 'INE2' });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        nationalStudentId: 'INE3',
        deletedAt: new Date(),
      });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: otherOrganizationId,
        nationalStudentId: 'INE4',
      });
      await databaseBuilder.commit();

      const result = await DomainTransaction.execute(() => findByOrganizationId({ organizationId }));

      expect(result).to.have.lengthOf(2);
      expect(result).to.deep.include({ userId: user.id, nationalStudentId: 'INE1' });
      expect(result).to.deep.include({ userId: null, nationalStudentId: 'INE2' });
    });
  });

  describe('#addOrUpdateOrganizationOfOrganizationLearners', function () {
    context('when there are only organizationLearners to create', function () {
      it('should create all organizationLearners', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        await databaseBuilder.commit();

        const learner = new OrganizationLearner({
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

        await DomainTransaction.execute(() => addOrUpdateOrganizationOfOrganizationLearners([learner]));

        const rows = await knex('organization-learners').where({ organizationId });
        expect(rows).to.have.lengthOf(1);
        expect(rows[0].firstName).to.equal(learner.firstName);
        expect(rows[0].lastName).to.equal(learner.lastName);
        expect(rows[0].organizationId).to.equal(learner.organizationId);
      });
    });

    context('when there are only organizationLearners to update', function () {
      it('should update organizationLearners attributes', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationLearner({
          firstName: 'Lucy',
          lastName: 'Handmade',
          birthdate: '1990-12-31',
          nationalStudentId: 'INE1',
          organizationId,
        });
        await databaseBuilder.commit();

        const updated = new OrganizationLearner({
          firstName: 'Boba',
          lastName: 'Fett',
          birthdate: '1986-01-05',
          nationalStudentId: 'INE1',
          organizationId,
        });

        await DomainTransaction.execute(() => addOrUpdateOrganizationOfOrganizationLearners([updated]));

        const [row] = await knex('organization-learners').where({ organizationId });
        expect(row.firstName).to.equal('Boba');
        expect(row.lastName).to.equal('Fett');
      });

      it('should not erase certificability status', async function () {
        const certifiableDate = '2023-09-09';
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationLearner({
          nationalStudentId: 'INE1',
          organizationId,
          isCertifiable: true,
          certifiableAt: new Date(certifiableDate),
        });
        await databaseBuilder.commit();

        const updated = new OrganizationLearner({
          firstName: 'Alex',
          lastName: 'Dupont',
          nationalStudentId: 'INE1',
          organizationId,
        });

        await DomainTransaction.execute(() => addOrUpdateOrganizationOfOrganizationLearners([updated]));

        const [row] = await knex('organization-learners').where({ organizationId });
        expect(row.isCertifiable).to.be.true;
        expect(row.certifiableAt).to.deep.equal(certifiableDate);
      });

      it('should update the organizationLearner only in the given organization', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationLearner({
          nationalStudentId: 'INE1',
          firstName: 'Lucy',
          organizationId,
        });
        databaseBuilder.factory.buildOrganizationLearner({
          nationalStudentId: 'INE1',
          firstName: 'Lucie',
          organizationId: otherOrganizationId,
        });
        await databaseBuilder.commit();

        const updated = new OrganizationLearner({
          firstName: 'Lili',
          lastName: 'Dupont',
          nationalStudentId: 'INE1',
          organizationId,
        });

        await DomainTransaction.execute(() => addOrUpdateOrganizationOfOrganizationLearners([updated]));

        const [updatedRow] = await knex('organization-learners').where({ organizationId });
        const [untouchedRow] = await knex('organization-learners').where({ organizationId: otherOrganizationId });
        expect(updatedRow.firstName).to.equal('Lili');
        expect(untouchedRow.firstName).to.equal('Lucie');
      });

      it('should enable a disabled organization learner', async function () {
        const { id, organizationId } = databaseBuilder.factory.buildOrganizationLearner({
          nationalStudentId: 'INE1',
          isDisabled: true,
        });
        await databaseBuilder.commit();

        const learner = new OrganizationLearner({
          firstName: 'Alex',
          lastName: 'Dupont',
          nationalStudentId: 'INE1',
          organizationId,
        });

        await DomainTransaction.execute(() => addOrUpdateOrganizationOfOrganizationLearners([learner]));

        const row = await knex('organization-learners').where({ id }).first();
        expect(row.isDisabled).to.be.false;
      });
    });

    context('when there are deleted organizationLearners with same nationalStudentId', function () {
      it('should create a new organizationLearner', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const learner = new OrganizationLearner({
          firstName: 'Alex',
          lastName: 'Dupont',
          nationalStudentId: '1234',
          organizationId,
        });
        databaseBuilder.factory.buildOrganizationLearner({ ...learner, deletedAt: new Date() });
        await databaseBuilder.commit();

        await DomainTransaction.execute(() => addOrUpdateOrganizationOfOrganizationLearners([learner]));

        const actual = await findByOrganizationId({ organizationId });
        expect(actual).to.have.lengthOf(1);
      });
    });

    context('when there are organizationLearners to create and to update', function () {
      it('should update and create all organizationLearners', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationLearner({ nationalStudentId: 'INE1', organizationId });
        await databaseBuilder.commit();

        const toUpdate = new OrganizationLearner({
          firstName: 'Lucy',
          lastName: 'Granger',
          nationalStudentId: 'INE1',
          organizationId,
        });
        const toCreate = new OrganizationLearner({
          firstName: 'Harry',
          lastName: 'Potter',
          nationalStudentId: 'INE2',
          organizationId,
        });

        await DomainTransaction.execute(() => addOrUpdateOrganizationOfOrganizationLearners([toUpdate, toCreate]));

        const rows = await knex('organization-learners').where({ organizationId });
        expect(rows).to.have.lengthOf(2);
        expect(_.map(rows, 'firstName')).to.have.members(['Lucy', 'Harry']);
      });
    });

    context('when an error occurs', function () {
      it('should return a OrganizationLearnersCouldNotBeSavedError on unicity errors', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        await databaseBuilder.commit();

        const learner1 = new OrganizationLearner({ nationalStudentId: 'SAME', organizationId });
        const learner2 = new OrganizationLearner({ nationalStudentId: 'SAME', organizationId });

        let error;
        await DomainTransaction.execute(async () => {
          error = await catchErr(addOrUpdateOrganizationOfOrganizationLearners)([learner1, learner2]);
        });

        expect(error).to.be.instanceof(OrganizationLearnersCouldNotBeSavedError);
      });
    });

    context('whenever an organization-learner is updated', function () {
      it('should update the updatedAt column', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const id = databaseBuilder.factory.buildOrganizationLearner({ nationalStudentId: 'INE1', organizationId }).id;
        await databaseBuilder.commit();
        await knex('organization-learners')
          .update({ updatedAt: new Date('2019-01-01') })
          .where({ id });
        const { updatedAt: before } = await knex
          .select('updatedAt')
          .from('organization-learners')
          .where({ id })
          .first();

        const updated = new OrganizationLearner({
          firstName: 'Lili',
          lastName: 'Dupont',
          nationalStudentId: 'INE1',
          organizationId,
        });

        await DomainTransaction.execute(() => addOrUpdateOrganizationOfOrganizationLearners([updated]));

        const { updatedAt: after } = await knex.select('updatedAt').from('organization-learners').where({ id }).first();
        expect(after).to.be.above(before);
      });
    });

    context('when an error occurs during transaction', function () {
      it('should rollback', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        await databaseBuilder.commit();

        const learner = new OrganizationLearner({ organizationId });

        await catchErr(async () => {
          await DomainTransaction.execute(async () => {
            await addOrUpdateOrganizationOfOrganizationLearners([learner]);
            throw new Error('an error occurs within the domain transaction');
          });
        });

        const rows = await knex.from('organization-learners');
        expect(rows).to.deep.equal([]);
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
      const otherUserId = databaseBuilder.factory.buildUser().id;

      const firstOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({ userId });
      const secondOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({ userId });
      databaseBuilder.factory.buildOrganizationLearner({ userId: otherUserId });

      await databaseBuilder.commit();

      // when
      const organizationLearners = await organizationLearnerRepository.findByUserId({ userId });

      // then
      expect(_.map(organizationLearners, 'id')).to.deep.equal([
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
