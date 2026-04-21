import sinon from 'sinon';

import {
  findOrganizationLearnersToMigrate,
  MigrateLearnerFromStaticImportToGeneric,
} from '../../../../src/prescription/scripts/migrate-learner-from-static-import-to-generic.js';

import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('Script | Prod | Migrate learner from static import to generic', function () {
  describe('context AGRI', function () {
    let organizationAgri, anotherOrganizationAgri, tagIdSco;

    beforeEach(async function () {
      organizationAgri = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
      anotherOrganizationAgri = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
      const tagIdAgri = databaseBuilder.factory.buildTag({ name: 'AGRICULTURE' }).id;
      tagIdSco = databaseBuilder.factory.buildTag({ name: 'SCO' }).id;

      databaseBuilder.factory.buildOrganizationTag({ organizationId: organizationAgri.id, tagId: tagIdAgri });
      databaseBuilder.factory.buildOrganizationTag({ organizationId: organizationAgri.id, tagId: tagIdSco });

      databaseBuilder.factory.buildOrganizationTag({ organizationId: anotherOrganizationAgri.id, tagId: tagIdAgri });

      const organizationPro = databaseBuilder.factory.buildOrganization({ type: 'PRO', isManagingStudents: false });
      const organizationNonImport = databaseBuilder.factory.buildOrganization({
        type: 'SCO',
        isManagingStudents: false,
      });
      const organizationSCONoAgri = databaseBuilder.factory.buildOrganization({
        type: 'SCO',
        isManagingStudents: true,
      });
      const organizationSUP = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });

      databaseBuilder.factory.buildOrganizationTag({ organizationId: organizationSCONoAgri.id, tagId: tagIdSco });
      databaseBuilder.factory.buildOrganizationTag({ organizationId: organizationNonImport.id, tagId: tagIdSco });

      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organizationNonImport.id });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organizationPro.id });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organizationSCONoAgri.id });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organizationSUP.id });

      await databaseBuilder.commit();
    });

    describe('findOrganizationLearnersToMigrate', function () {
      it('should return learner from organization matching requirement', async function () {
        databaseBuilder.factory.buildOrganizationLearner({ organizationId: organizationAgri.id });
        databaseBuilder.factory.buildOrganizationLearner({ organizationId: anotherOrganizationAgri.id });

        await databaseBuilder.commit();

        const organizationLearners = await findOrganizationLearnersToMigrate('AGRI');

        expect(organizationLearners).lengthOf(2);
      });

      it('should return deleted learner from organization matching requirement', async function () {
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organizationAgri.id,
          deletedAt: new Date(),
        });
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: anotherOrganizationAgri.id,
          deletedAt: new Date(),
        });

        await databaseBuilder.commit();

        const organizationLearners = await findOrganizationLearnersToMigrate('AGRI');

        expect(organizationLearners).lengthOf(2);
      });
    });

    describe('Handle', function () {
      it('should update learner from organization matching requirement', async function () {
        const script = new MigrateLearnerFromStaticImportToGeneric();
        const logger = { info: sinon.spy(), error: sinon.spy() };

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organizationAgri.id,
          middleName: 'oui',
          thirdName: 'non',
          preferredLastName: 'quoi',
          sex: 'M',
          birthCity: 'Tournai',
          nationalStudentId: '197446465',
          birthCityCode: '15468',
          birthCountryCode: 'B487',
          birthProvinceCode: '184',
          MEFCode: '666',
          status: 'AT-AT',
          division: 'StormTrooper',
          birthdate: '2012-01-16',
        });

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: anotherOrganizationAgri.id,
          middleName: 'jean',
          thirdName: 'pierre',
          preferredLastName: 'yves',
          nationalStudentId: '249849874',
          sex: 'F',
          birthCity: 'Caramba',
          birthCityCode: '97891',
          birthCountryCode: 'A787',
          birthProvinceCode: '666',
          MEFCode: '78921B45',
          status: 'AT-ST',
          division: 'DeathStar',
          birthdate: '1845-01-16',
        });

        await databaseBuilder.commit();

        await script.handle({ options: { dryRun: false, typology: 'AGRI' }, logger });

        const learnerAttributes = await knex('organization-learners')
          .select('attributes')
          .whereNotNull('attributes')
          .pluck('attributes');

        expect(learnerAttributes).lengthOf(2);
        expect(learnerAttributes).deep.members([
          {
            middleName: 'jean',
            thirdName: 'pierre',
            preferredLastName: 'yves',
            sex: 'F',
            birthCity: 'Caramba',
            birthCityCode: '97891',
            nationalStudentId: '249849874',
            birthCountryCode: 'A787',
            birthProvinceCode: '666',
            MEFCode: '78921B45',
            status: 'AT-ST',
            division: 'DeathStar',
            birthdate: '1845-01-16',
          },
          {
            middleName: 'oui',
            thirdName: 'non',
            preferredLastName: 'quoi',
            sex: 'M',
            birthCity: 'Tournai',
            nationalStudentId: '197446465',
            birthCityCode: '15468',
            birthCountryCode: 'B487',
            birthProvinceCode: '184',
            MEFCode: '666',
            status: 'AT-AT',
            division: 'StormTrooper',
            birthdate: '2012-01-16',
          },
        ]);
      });
    });
  });

  describe('context SCO', function () {
    let organizationSCO, anotherOrganizationSCO, tagIdSco;

    beforeEach(async function () {
      organizationSCO = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
      anotherOrganizationSCO = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
      tagIdSco = databaseBuilder.factory.buildTag({ name: 'SCO' }).id;

      const organizationPro = databaseBuilder.factory.buildOrganization({ type: 'PRO', isManagingStudents: false });
      const organizationNonImport = databaseBuilder.factory.buildOrganization({
        type: 'SCO',
        isManagingStudents: false,
      });
      const organizationSCOAgri = databaseBuilder.factory.buildOrganization({
        type: 'SCO',
        isManagingStudents: true,
      });
      const tagIdAgri = databaseBuilder.factory.buildTag({ name: 'AGRICULTURE' }).id;

      const organizationSUP = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });

      databaseBuilder.factory.buildOrganizationTag({ organizationId: organizationSCOAgri.id, tagId: tagIdSco });
      databaseBuilder.factory.buildOrganizationTag({ organizationId: organizationSCOAgri.id, tagId: tagIdAgri });
      databaseBuilder.factory.buildOrganizationTag({ organizationId: organizationNonImport.id, tagId: tagIdSco });

      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organizationNonImport.id });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organizationPro.id });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organizationSCOAgri.id });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organizationSUP.id });

      await databaseBuilder.commit();
    });

    describe('findOrganizationLearnersToMigrate', function () {
      it('should update learner from organization matching requirement', async function () {
        databaseBuilder.factory.buildOrganizationLearner({ organizationId: organizationSCO.id });
        databaseBuilder.factory.buildOrganizationLearner({ organizationId: anotherOrganizationSCO.id });

        await databaseBuilder.commit();

        const organizationLearners = await findOrganizationLearnersToMigrate('SCO');

        expect(organizationLearners).lengthOf(2);
      });

      it('should return deleted learner from organization matching requirement', async function () {
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organizationSCO.id,
          deletedAt: new Date(),
        });
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: anotherOrganizationSCO.id,
          deletedAt: new Date(),
        });

        await databaseBuilder.commit();

        const organizationLearners = await findOrganizationLearnersToMigrate('SCO');

        expect(organizationLearners).lengthOf(2);
      });
    });

    describe('Handle', function () {
      it('should update learner from organization matching requirement', async function () {
        const script = new MigrateLearnerFromStaticImportToGeneric();
        const logger = { info: sinon.spy(), error: sinon.spy() };

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organizationSCO.id,
          middleName: 'oui',
          thirdName: 'non',
          preferredLastName: 'quoi',
          sex: 'M',
          birthCity: 'Tournai',
          nationalStudentId: '197446465',
          birthCityCode: '15468',
          birthCountryCode: 'B487',
          birthProvinceCode: '184',
          MEFCode: '666',
          status: 'AT-AT',
          division: 'StormTrooper',
          birthdate: '2012-01-16',
        });

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: anotherOrganizationSCO.id,
          middleName: 'jean',
          thirdName: 'pierre',
          preferredLastName: 'yves',
          nationalStudentId: '249849874',
          sex: 'F',
          birthCity: 'Caramba',
          birthCityCode: '97891',
          birthCountryCode: 'A787',
          birthProvinceCode: '666',
          MEFCode: '78921B45',
          status: 'AT-ST',
          division: 'DeathStar',
          birthdate: '1845-01-16',
        });

        await databaseBuilder.commit();

        await script.handle({ options: { dryRun: false, typology: 'SCO' }, logger });

        const learnerAttributes = await knex('organization-learners')
          .select('attributes')
          .whereNotNull('attributes')
          .pluck('attributes');

        expect(learnerAttributes).lengthOf(2);
        expect(learnerAttributes).deep.members([
          {
            middleName: 'jean',
            thirdName: 'pierre',
            preferredLastName: 'yves',
            sex: 'F',
            birthCity: 'Caramba',
            birthCityCode: '97891',
            nationalStudentId: '249849874',
            birthCountryCode: 'A787',
            birthProvinceCode: '666',
            MEFCode: '78921B45',
            status: 'AT-ST',
            division: 'DeathStar',
            birthdate: '1845-01-16',
          },
          {
            middleName: 'oui',
            thirdName: 'non',
            preferredLastName: 'quoi',
            sex: 'M',
            birthCity: 'Tournai',
            nationalStudentId: '197446465',
            birthCityCode: '15468',
            birthCountryCode: 'B487',
            birthProvinceCode: '184',
            MEFCode: '666',
            status: 'AT-AT',
            division: 'StormTrooper',
            birthdate: '2012-01-16',
          },
        ]);
      });
    });
  });

  describe('context SUP', function () {
    let organizationSUP, anotherOrganizationSUP;

    beforeEach(async function () {
      organizationSUP = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });
      anotherOrganizationSUP = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });

      const organizationPro = databaseBuilder.factory.buildOrganization({ type: 'PRO', isManagingStudents: false });
      const organizationSCOImport = databaseBuilder.factory.buildOrganization({
        type: 'SCO',
        isManagingStudents: true,
      });
      const organizationSCONonImport = databaseBuilder.factory.buildOrganization({
        type: 'SCO',
        isManagingStudents: false,
      });
      const organizationSCOAgri = databaseBuilder.factory.buildOrganization({
        type: 'SCO',
        isManagingStudents: true,
      });
      const tagIdAgri = databaseBuilder.factory.buildTag({ name: 'AGRICULTURE' }).id;

      const organizationNonImportSUP = databaseBuilder.factory.buildOrganization({
        type: 'SUP',
        isManagingStudents: false,
      });

      databaseBuilder.factory.buildOrganizationTag({ organizationId: organizationSCOAgri.id, tagId: tagIdAgri });

      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organizationSCONonImport.id });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organizationSCOImport.id });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organizationPro.id });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organizationSCOAgri.id });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: organizationNonImportSUP.id });

      await databaseBuilder.commit();
    });

    describe('findOrganizationLearnersToMigrate', function () {
      it('should return learner from organization matching requirement', async function () {
        databaseBuilder.factory.buildOrganizationLearner({ organizationId: organizationSUP.id });
        databaseBuilder.factory.buildOrganizationLearner({ organizationId: anotherOrganizationSUP.id });

        await databaseBuilder.commit();

        const organizationLearners = await findOrganizationLearnersToMigrate('SUP');

        expect(organizationLearners).lengthOf(2);
      });

      it('should return deleted learner from organization matching requirement', async function () {
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organizationSUP.id,
          deletedAt: new Date(),
        });
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: anotherOrganizationSUP.id,
          deletedAt: new Date(),
        });

        await databaseBuilder.commit();

        const organizationLearners = await findOrganizationLearnersToMigrate('SUP');

        expect(organizationLearners).lengthOf(2);
      });
    });

    describe('Handle', function () {
      it('should update learner from organization matching requirement', async function () {
        const script = new MigrateLearnerFromStaticImportToGeneric();
        const logger = { info: sinon.spy(), error: sinon.spy() };

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organizationSUP.id,
          middleName: 'oui',
          thirdName: 'non',
          preferredLastName: 'quoi',
          birthdate: '2012-01-16',
          studentNumber: '1448956',
          department: 'science',
          email: 'io.io@io.fr',
          educationalTeam: 'pouet',
          group: 'T4',
          diploma: 'licence',
          status: 'erier,erkeorknemrlepmr,emrer',
        });

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: anotherOrganizationSUP.id,
          middleName: 'jean',
          thirdName: 'pierre',
          preferredLastName: 'yves',
          birthdate: '1940-01-16',
          studentNumber: '98765654',
          department: 'lettrer',
          email: 'pouet.io@io.fr',
          educationalTeam: 'cacahuete',
          group: 'T2',
          diploma: 'master',
          status: 'manger',
        });

        await databaseBuilder.commit();

        await script.handle({ options: { dryRun: false, typology: 'SUP' }, logger });

        const learnerAttributes = await knex('organization-learners')
          .select('attributes')
          .whereNotNull('attributes')
          .pluck('attributes');

        expect(learnerAttributes).lengthOf(2);
        expect(learnerAttributes).deep.members([
          {
            middleName: 'jean',
            thirdName: 'pierre',
            preferredLastName: 'yves',
            birthdate: '1940-01-16',
            studentNumber: '98765654',
            department: 'lettrer',
            email: 'pouet.io@io.fr',
            educationalTeam: 'cacahuete',
            group: 'T2',
            diploma: 'master',
            status: 'manger',
          },
          {
            middleName: 'oui',
            thirdName: 'non',
            preferredLastName: 'quoi',
            birthdate: '2012-01-16',
            studentNumber: '1448956',
            department: 'science',
            email: 'io.io@io.fr',
            educationalTeam: 'pouet',
            group: 'T4',
            diploma: 'licence',
            status: 'erier,erkeorknemrlepmr,emrer',
          },
        ]);
      });
    });
  });
});
