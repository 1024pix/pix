const { expect, databaseBuilder, knex } = require('../../../test-helper');
const iconv = require('iconv-lite');

const importHigherSchoolingRegistration = require('../../../../lib/domain/usecases/import-higher-schooling-registrations');
const higherSchoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/higher-schooling-registration-repository');
const HigherSchoolingRegistrationParser = require('../../../../lib/infrastructure/serializers/csv/higher-schooling-registration-parser');
const HigherSchoolingRegistrationColumns = require('../../../../lib/infrastructure/serializers/csv/higher-schooling-registration-columns');
const { getI18n } = require('../../../../tests/tooling/i18n/i18n');

const i18n = getI18n();

const higherSchoolingRegistrationColumns = new HigherSchoolingRegistrationColumns(i18n).columns.map((column) => column.label).join(';');

describe('Integration | UseCase | ImportHigherSchoolingRegistration', function() {

  afterEach(function() {
    return knex('schooling-registrations').delete();
  });

  context('when there is no schooling registrations for the organization', function() {
    it('parses the csv received and creates the HigherSchoolingRegistration', async function() {
      const input = `${higherSchoolingRegistrationColumns}
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
          O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;
      `.trim();

      const encodedInput = iconv.encode(input, 'utf8');

      const organization = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();
      await importHigherSchoolingRegistration({
        organizationId: organization.id,
        higherSchoolingRegistrationRepository,
        higherSchoolingRegistrationParser: new HigherSchoolingRegistrationParser(encodedInput, organization.id, i18n),
      });

      const registrations = await knex('schooling-registrations').where({ organizationId: organization.id });
      expect(registrations).to.have.lengthOf(2);
    });
  });

  context('when there are schooling registration for the organization', function() {
    context('when there is a supernumerary schooling registrations matching by student number', function() {
      context('which matches by student number but not by first name', function() {
        it('creates a new schooling registration with csv data', async function() {
          const input = `${higherSchoolingRegistrationColumns}
            Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        `.trim();

          const encodedInput = iconv.encode(input, 'utf8');

          const organization = databaseBuilder.factory.buildOrganization();
          databaseBuilder.factory.buildSchoolingRegistration({
            organizationId: organization.id,
            studentNumber: '123456',
            firstName: 'Bill',
            lastName: 'Kiddo',
            birthdate: '1970-01-01',
            isSupernumerary: true,
          });

          await databaseBuilder.commit();
          await importHigherSchoolingRegistration({
            organizationId: organization.id,
            higherSchoolingRegistrationRepository,
            higherSchoolingRegistrationParser: new HigherSchoolingRegistrationParser(encodedInput, organization.id, i18n),
          });

          const registrations = await knex('schooling-registrations').where({ organizationId: organization.id }).orderBy('createdAt');
          expect(registrations.length).to.equal(2);
          expect(registrations[0].firstName).to.equal('Bill');
          expect(registrations[0].studentNumber).to.equal('123456');
          expect(registrations[0].isSupernumerary).to.equal(true);
          expect(registrations[1].firstName).to.equal('Beatrix');
          expect(registrations[1].studentNumber).to.equal('123456');
          expect(registrations[1].isSupernumerary).to.equal(false);
        });
      });

      context('which matches by student number, first name, lastName and birthdate', function() {
        it('updates the existing schooling registration which have matched with csv data', async function() {
          const input = `${higherSchoolingRegistrationColumns}
            Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        `.trim();

          const encodedInput = iconv.encode(input, 'utf8');

          const organization = databaseBuilder.factory.buildOrganization();
          databaseBuilder.factory.buildSchoolingRegistration({
            organizationId: organization.id,
            studentNumber: '123456',
            firstName: 'Beatrix',
            lastName: 'Kiddo',
            birthdate: '1970-01-01',
            isSupernumerary: true,
            email: 'old.email@dva.com',
          });

          await databaseBuilder.commit();
          await importHigherSchoolingRegistration({
            organizationId: organization.id,
            higherSchoolingRegistrationRepository,
            higherSchoolingRegistrationParser: new HigherSchoolingRegistrationParser(encodedInput, organization.id, i18n),
          });

          const [registration] = await knex('schooling-registrations').where({ organizationId: organization.id });
          expect(registration.email).to.equal('thebride@example.net');
          expect(registration.isSupernumerary).to.equal(false);
        });
      });

      context('which matches by student number but not by birthdate', function() {
        it('creates a new schooling registration with csv data', async function() {
          const input = `${higherSchoolingRegistrationColumns}
            Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        `.trim();

          const encodedInput = iconv.encode(input, 'utf8');

          const organization = databaseBuilder.factory.buildOrganization();
          databaseBuilder.factory.buildSchoolingRegistration({
            organizationId: organization.id,
            studentNumber: '123456',
            firstName: 'Beatrix',
            lastName: 'Kiddo',
            birthdate: '2000-01-01',
            isSupernumerary: true,
          });

          await databaseBuilder.commit();
          await importHigherSchoolingRegistration({
            organizationId: organization.id,
            higherSchoolingRegistrationRepository,
            higherSchoolingRegistrationParser: new HigherSchoolingRegistrationParser(encodedInput, organization.id, i18n),
          });

          const registrations = await knex('schooling-registrations').where({ organizationId: organization.id }).orderBy('createdAt');
          expect(registrations.length).to.equal(2);
          expect(registrations[0].birthdate).to.equal('2000-01-01');
          expect(registrations[0].studentNumber).to.equal('123456');
          expect(registrations[0].isSupernumerary).to.equal(true);
          expect(registrations[1].birthdate).to.equal('1970-01-01');
          expect(registrations[1].studentNumber).to.equal('123456');
          expect(registrations[1].isSupernumerary).to.equal(false);

        });
      });

      context('which matches by student number but not by lastName', function() {
        it('creates a new schooling registration with csv data', async function() {
          const input = `${higherSchoolingRegistrationColumns}
            Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        `.trim();

          const encodedInput = iconv.encode(input, 'utf8');

          const organization = databaseBuilder.factory.buildOrganization();
          databaseBuilder.factory.buildSchoolingRegistration({
            organizationId: organization.id,
            studentNumber: '123456',
            firstName: 'Beatrix',
            lastName: 'Unknown',
            birthdate: '1970-01-01',
            isSupernumerary: true,
          });

          await databaseBuilder.commit();
          await importHigherSchoolingRegistration({
            organizationId: organization.id,
            higherSchoolingRegistrationRepository,
            higherSchoolingRegistrationParser: new HigherSchoolingRegistrationParser(encodedInput, organization.id, i18n),
          });

          const registrations = await knex('schooling-registrations').where({ organizationId: organization.id }).orderBy('createdAt');
          expect(registrations.length).to.equal(2);
          expect(registrations[0].lastName).to.equal('Unknown');
          expect(registrations[0].studentNumber).to.equal('123456');
          expect(registrations[0].isSupernumerary).to.equal(true);
          expect(registrations[1].lastName).to.equal('Kiddo');
          expect(registrations[1].studentNumber).to.equal('123456');
          expect(registrations[1].isSupernumerary).to.equal(false);
        });
      });

      context('which matches by student number but when there is an acceptable error in the first name', function() {
        it('updates the existing schooling registration which have matched with csv data', async function() {
          const input = `${higherSchoolingRegistrationColumns}
            Estelle;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        `.trim();

          const encodedInput = iconv.encode(input, 'utf8');

          const organization = databaseBuilder.factory.buildOrganization();
          databaseBuilder.factory.buildSchoolingRegistration({
            organizationId: organization.id,
            studentNumber: '123456',
            firstName: 'Estele',
            lastName: 'Kiddo',
            birthdate: '1970-01-01',
            isSupernumerary: true,
            email: 'old.email@dva.com',
          });

          await databaseBuilder.commit();
          await importHigherSchoolingRegistration({
            organizationId: organization.id,
            higherSchoolingRegistrationRepository,
            higherSchoolingRegistrationParser: new HigherSchoolingRegistrationParser(encodedInput, organization.id, i18n),
          });

          const [registration] = await knex('schooling-registrations').where({ organizationId: organization.id });
          expect(registration.email).to.equal('thebride@example.net');
          expect(registration.isSupernumerary).to.equal(false);
        });
      });

      context('which matches by student number but when there is an acceptable error in the last name', function() {
        it('updates the existing schooling registration which have matched with csv data', async function() {
          const input = `${higherSchoolingRegistrationColumns}
            Estelle;The;Bride;Landry;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        `.trim();

          const encodedInput = iconv.encode(input, 'utf8');

          const organization = databaseBuilder.factory.buildOrganization();
          databaseBuilder.factory.buildSchoolingRegistration({
            organizationId: organization.id,
            studentNumber: '123456',
            firstName: 'Estelle',
            lastName: 'Lendry',
            birthdate: '1970-01-01',
            isSupernumerary: true,
            email: 'old.email@dva.com',
          });

          await databaseBuilder.commit();
          await importHigherSchoolingRegistration({
            organizationId: organization.id,
            higherSchoolingRegistrationRepository,
            higherSchoolingRegistrationParser: new HigherSchoolingRegistrationParser(encodedInput, organization.id, i18n),
          });

          const [registration] = await knex('schooling-registrations').where({ organizationId: organization.id });
          expect(registration.email).to.equal('thebride@example.net');
          expect(registration.isSupernumerary).to.equal(false);
        });
      });
    });

    context('when there are several supernumerary schooling registrations which match by student number', function() {
      context('when there are several supernumerary schooling registrations matching', function() {
        it('creates a new schooling registration with csv data', async function() {
          const input = `${higherSchoolingRegistrationColumns}
            Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;email3@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        `.trim();

          const encodedInput = iconv.encode(input, 'utf8');

          const organization = databaseBuilder.factory.buildOrganization();

          databaseBuilder.factory.buildSchoolingRegistration({
            organizationId: organization.id,
            studentNumber: '123456',
            firstName: 'Beatrix',
            lastName: 'Kiddo',
            birthdate: '1970-01-01',
            isSupernumerary: true,
            createdAt: '2000-01-01',
          });
          databaseBuilder.factory.buildSchoolingRegistration({
            organizationId: organization.id,
            studentNumber: '123456',
            firstName: 'Beatrix',
            lastName: 'Kiddo',
            birthdate: '1970-01-01',
            isSupernumerary: true,
            createdAt: '2000-01-02',
          });

          await databaseBuilder.commit();
          await importHigherSchoolingRegistration({
            organizationId: organization.id,
            higherSchoolingRegistrationRepository,
            higherSchoolingRegistrationParser: new HigherSchoolingRegistrationParser(encodedInput, organization.id, i18n),
          });

          const registrations = await knex('schooling-registrations').where({ organizationId: organization.id }).orderBy('createdAt');
          expect(registrations.length).to.equal(3);
          expect(registrations[0].isSupernumerary).to.equal(true);
          expect(registrations[1].isSupernumerary).to.equal(true);
          expect(registrations[2].isSupernumerary).to.equal(false);
        });
      });

      context('when there one supernumerary schooling registration matching', function() {
        it('updates a the schooling registration with csv data', async function() {
          const input = `${higherSchoolingRegistrationColumns}
            Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;email@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        `.trim();

          const encodedInput = iconv.encode(input, 'utf8');

          const organization = databaseBuilder.factory.buildOrganization();

          databaseBuilder.factory.buildSchoolingRegistration({
            organizationId: organization.id,
            studentNumber: '123456',
            firstName: 'Beatrix',
            lastName: 'Kiddo',
            birthdate: '1970-01-01',
            isSupernumerary: true,
            createdAt: '2000-01-01',
          });
          databaseBuilder.factory.buildSchoolingRegistration({
            organizationId: organization.id,
            studentNumber: '123456',
            firstName: 'O-Ren',
            lastName: 'Ishii',
            birthdate: '1990-01-01',
            email: 'old@example.net',
            isSupernumerary: true,
            createdAt: '2000-01-02',
          });

          await databaseBuilder.commit();
          await importHigherSchoolingRegistration({
            organizationId: organization.id,
            higherSchoolingRegistrationRepository,
            higherSchoolingRegistrationParser: new HigherSchoolingRegistrationParser(encodedInput, organization.id, i18n),
          });

          const registrations = await knex('schooling-registrations').where({ organizationId: organization.id }).orderBy('createdAt');
          expect(registrations.length).to.equal(2);
          expect(registrations[0].isSupernumerary).to.equal(false);
          expect(registrations[0].email).to.equal('email@example.net');
          expect(registrations[1].isSupernumerary).to.equal(true);
          expect(registrations[1].email).to.equal('old@example.net');
        });
      });
    });

    context('when there is a schooling registration not supernumerary matching by student number', function() {
      it('updates the existing schooling registration which have matched with csv data', async function() {
        const input = `${higherSchoolingRegistrationColumns}
            Estelle;;;Landry;;01/01/2000;landry@elpresidente.com;123456;Négociation de ticket;;Merci pour le wording de VINCI!;Doctorat
        `.trim();

        const encodedInput = iconv.encode(input, 'utf8');

        const organization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          studentNumber: '123456',
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: '1970-01-01',
          isSupernumerary: false,
          email: 'old.email@dva.com',
          createdAt: '2000-01-01',
        });
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: organization.id,
          studentNumber: '123456',
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: '1970-01-01',
          isSupernumerary: true,
          email: 'other.email@dva.com',
          createdAt: '2000-01-02',
        });

        await databaseBuilder.commit();
        await importHigherSchoolingRegistration({
          organizationId: organization.id,
          higherSchoolingRegistrationRepository,
          higherSchoolingRegistrationParser: new HigherSchoolingRegistrationParser(encodedInput, organization.id, i18n),
        });

        const [registration1, registration2] = await knex('schooling-registrations').where({ organizationId: organization.id }).orderBy('createdAt');

        expect(registration1.firstName).to.equal('Estelle');
        expect(registration1.lastName).to.equal('Landry');
        expect(registration1.email).to.equal('landry@elpresidente.com');
        expect(registration1.department).to.equal('Négociation de ticket');
        expect(registration1.group).to.equal('Merci pour le wording de VINCI!');
        expect(registration1.diploma).to.equal('Doctorat');
        expect(registration1.isSupernumerary).to.equal(false);

        expect(registration2.email).to.equal('other.email@dva.com');
        expect(registration2.isSupernumerary).to.equal(true);

      });
    });
  });
});
