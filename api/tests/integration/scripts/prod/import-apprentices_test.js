/* eslint-disable no-sync */
const { expect, databaseBuilder, catchErr, knex, sinon } = require('../../../test-helper');
const importApprentices = require('../../../../scripts/prod/import-apprentices');
const iconv = require('iconv-lite');
const { CsvImportError, OrganizationNotFoundError } = require('../../../../lib/domain/errors');

const { COLUMNS } = require('../../../../lib/infrastructure/serializers/csv/schooling-registration-parser');

const schoolingRegistrationCsvColumns = [...COLUMNS, { label: 'UAI*' }].map((column) => column.label).join(';');

describe('Integration | Scripts | import-apprentices', function() {
  const fileSystem = {
    readFileSync: sinon.stub(),
  };

  describe('#importApprentices', function() {

    afterEach(async function() {
      await knex('schooling-registrations').delete();
    });

    context('when the header is correctly formed', function() {
      context('when there is no line', function() {
        it('create no registrations', async function() {
          const input = schoolingRegistrationCsvColumns;
          const encodedInput = iconv.encode(input, 'utf8');
          fileSystem.readFileSync.withArgs('tmp.csv').returns(encodedInput);

          await importApprentices('tmp.csv', fileSystem);
          const registrations = await knex.select('*').from('schooling-registrations');
          expect(registrations).to.be.empty;
        });
      });

      context('when there are lines', function() {
        it('create registrations for the correct organization', async function() {
          const organization1 = databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId: '12345' });
          const organization2 = databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId: '54321' });
          await databaseBuilder.commit();

          const registration1Attributes = {
            nationalApprenticeId: '9876543210F',
            firstName: 'Beatrix',
            middleName: 'The',
            thirdName: 'Bride',
            lastName: 'Kiddo',
            preferredLastName: 'Black Mamba',
            birthdate: '1970-01-01',
            birthCityCode: '97422',
            birthProvinceCode: '200',
            birthCountryCode: '100',
            status: 'AP',
            MEFCode: 'MEF1',
            division: 'Division 1',
            organizationId: organization1.id,
          };

          const registration2Attributes = {
            nationalApprenticeId: '0123456789F',
            firstName: 'O-Ren',
            lastName: 'Ishii',
            preferredLastName: 'Cottonmouth',
            birthdate: '1980-01-01',
            birthCity: 'Shangai',
            birthProvinceCode: '99',
            birthCountryCode: '132',
            status: 'AP',
            MEFCode: 'MEF1',
            division: 'Division 2',
            organizationId: organization2.id,
          };

          const input = `${schoolingRegistrationCsvColumns}
          9876543210F;Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;97422;;200;99100;AP;MEF1;Division 1;12345;
          0123456789F;O-Ren;;;Ishii;Cottonmouth;01/01/1980;;Shangai;99;99132;AP;MEF1;Division 2;54321;
          `;

          const encodedInput = iconv.encode(input, 'utf8');

          fileSystem.readFileSync.withArgs('tmp.csv').returns(encodedInput);

          await importApprentices('tmp.csv', fileSystem);
          const [registration1, registration2 ] = await knex.select('*').from('schooling-registrations').orderBy('organizationId');
          expect(registration1).to.include(registration1Attributes);
          expect(registration2).to.include(registration2Attributes);
        });

        context('when there is an error', function() {
          it('throws a OrganizationNotFoundError when externalId not found', async function() {
            databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId: '12345' });
            databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId: '678910' });

            await databaseBuilder.commit();

            const input = `${schoolingRegistrationCsvColumns}
            9876543210F;Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;97422;;200;99100;AP;MEF1;Division 1;12345;
            0123456789F;O-Ren;;;Ishii;Cottonmouth;01/01/1980;;Shangai;99;99132;AP;MEF1;Division 2;54321;
            `;

            const encodedInput = iconv.encode(input, 'utf8');

            fileSystem.readFileSync.withArgs('tmp.csv').returns(encodedInput);

            const err = await catchErr(importApprentices)('tmp.csv', fileSystem);
            expect(err).to.be.an.instanceOf(OrganizationNotFoundError);
          });

          it('throws a CsvImportError', async function() {
            databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId: '12345' });

            await databaseBuilder.commit();

            const header = schoolingRegistrationCsvColumns;
            const lineWithoutUniqueIdentifier = ';Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;97422;;200;99100;AP;MEF1;Division 1;12345;';
            const input =
            `${header}
            ${lineWithoutUniqueIdentifier}`;

            const encodedInput = iconv.encode(input, 'utf8');
            fileSystem.readFileSync.withArgs('tmp.csv').returns(encodedInput);

            const err = await catchErr(importApprentices)('tmp.csv', fileSystem);
            expect(err).to.be.an.instanceOf(CsvImportError);
          });
        });
      });
    });
    context('when the header is not correctly formed', function() {
      const requiredColumns = [...COLUMNS, { label: 'UAI*' }].map((column) => column.label);

      requiredColumns.forEach((missingColumn) => {
        it('throws a CsvImportError', async function() {
          const input = requiredColumns.filter((column) => column != missingColumn).join(';');

          const encodedInput = iconv.encode(input, 'utf8');
          fileSystem.readFileSync.withArgs('tmp.csv').returns(encodedInput);

          const err = await catchErr(importApprentices)('tmp.csv', fileSystem);
          expect(err).to.be.an.instanceOf(CsvImportError);
        });
      });
    });
  });
});
