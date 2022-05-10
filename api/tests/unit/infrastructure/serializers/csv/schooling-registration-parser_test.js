const iconv = require('iconv-lite');
const { expect, catchErr } = require('../../../../test-helper');
const SchoolingRegistrationParser = require('../../../../../lib/infrastructure/serializers/csv/schooling-registration-parser');
const { CsvImportError } = require('../../../../../lib/domain/errors');
const SchoolingRegistrationColumns = require('../../../../../lib/infrastructure/serializers/csv/schooling-registration-columns');
const { getI18n } = require('../../../../tooling/i18n/i18n');
const i18n = getI18n();

const schoolingRegistrationCsvColumns = new SchoolingRegistrationColumns(i18n).columns
  .map((column) => column.label)
  .join(';');
const COL_TO_REMOVE = 'Code sexe*';
const schoolingRegistrationCsvColumnsWithoutSexCode = new SchoolingRegistrationColumns(i18n).columns
  .map((column) => column.label)
  .filter((col) => col !== COL_TO_REMOVE)
  .join(';');

describe('Unit | Infrastructure | SchoolingRegistrationParser', function () {
  context('when the header is not correctly formed', function () {
    const organizationId = 123;

    const fieldList = [
      'Identifiant unique*',
      'Nom de famille*',
      'Date de naissance (jj/mm/aaaa)*',
      'Code département naissance*',
      'Code pays naissance*',
      'Statut*',
      'Code MEF*',
      'Division*',
    ];
    // eslint-disable-next-line mocha/no-setup-in-describe
    fieldList.forEach((field) => {
      context(`when the ${field} column is missing`, function () {
        it('should throw an CsvImportError', async function () {
          let input = schoolingRegistrationCsvColumns.replace(`${field}`, '');
          input = input.replace(';;', ';');
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new SchoolingRegistrationParser(encodedInput, organizationId, i18n);

          const error = await catchErr(parser.parse, parser)();

          expect(error.code).to.equal('HEADER_REQUIRED');
        });
      });
    });

    context('when the Premier prénom* column is missing', function () {
      it('should throw an CsvImportError', async function () {
        const input = schoolingRegistrationCsvColumns.replace('Premier prénom*;', '');
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new SchoolingRegistrationParser(encodedInput, organizationId, i18n);

        const error = await catchErr(parser.parse, parser)();

        expect(error.code).to.equal('ENCODING_NOT_SUPPORTED');
      });
    });
  });

  context('when the header is correctly formed', function () {
    context('when there is no line', function () {
      it('returns no registrations', function () {
        const input = schoolingRegistrationCsvColumns;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new SchoolingRegistrationParser(encodedInput, 123, i18n);

        const { registrations } = parser.parse();

        expect(registrations).to.be.empty;
      });
    });

    context('when there are lines', function () {
      context('when the data are correct', function () {
        context("when csv has 'Sex code' column", function () {
          it('returns a schooling registration for each line', function () {
            const input = `${schoolingRegistrationCsvColumns}
            123F;Beatrix;The;Bride;Kiddo;Black Mamba;1;01/01/1970;97422;;200;99100;ST;MEF1;Division 1;
            456F;O-Ren;;;Ishii;Cottonmouth;2;01/01/1980;;Shangai;99;99132;ST;MEF1;Division 2;
            `;
            const encodedInput = iconv.encode(input, 'utf8');
            const parser = new SchoolingRegistrationParser(encodedInput, 456, i18n);

            const { registrations } = parser.parse();
            expect(registrations).to.have.lengthOf(2);
          });

          it('returns schooling registrations for each line using the CSV column', function () {
            const input = `${schoolingRegistrationCsvColumns}
            123F;Beatrix;The;Bride;Kiddo;Black Mamba;M;01/01/1970;97422;;974;99100;ST;MEF1;Division 1;
            0123456789F;O-Ren;;;Ishii;Cottonmouth;f;01/01/1980;;Shangai;99;99132;AP;MEF1;Division 2;
            `;
            const organizationId = 789;
            const encodedInput = iconv.encode(input, 'utf8');
            const parser = new SchoolingRegistrationParser(encodedInput, organizationId, i18n);

            const { registrations } = parser.parse();
            expect(registrations[0]).to.includes({
              nationalStudentId: '123F',
              firstName: 'Beatrix',
              middleName: 'The',
              thirdName: 'Bride',
              lastName: 'Kiddo',
              preferredLastName: 'Black Mamba',
              sex: 'M',
              birthdate: '1970-01-01',
              birthCityCode: '97422',
              birthProvinceCode: '974',
              birthCountryCode: '100',
              status: 'ST',
              MEFCode: 'MEF1',
              division: 'Division 1',
              organizationId,
            });

            expect(registrations[1]).to.includes({
              nationalStudentId: '0123456789F',
              firstName: 'O-Ren',
              lastName: 'Ishii',
              preferredLastName: 'Cottonmouth',
              sex: 'F',
              birthdate: '1980-01-01',
              birthCity: 'Shangai',
              birthProvinceCode: '99',
              birthCountryCode: '132',
              status: 'AP',
              MEFCode: 'MEF1',
              division: 'Division 2',
              organizationId,
            });
          });
        });

        context("when csv does not have 'Sex code' column", function () {
          it('returns a schooling registration for each line', function () {
            const input = `${schoolingRegistrationCsvColumnsWithoutSexCode}
            123F;Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;97422;;200;99100;ST;MEF1;Division 1;
            456F;O-Ren;;;Ishii;Cottonmouth;01/01/1980;;Shangai;99;99132;ST;MEF1;Division 2;
            `;
            const encodedInput = iconv.encode(input, 'utf8');
            const parser = new SchoolingRegistrationParser(encodedInput, 456, i18n);

            const { registrations } = parser.parse();
            expect(registrations).to.have.lengthOf(2);
          });

          it('returns schooling registrations for each line using the CSV column', function () {
            const input = `${schoolingRegistrationCsvColumnsWithoutSexCode}
            123F;Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;97422;;974;99100;ST;MEF1;Division 1;
            0123456789F;O-Ren;;;Ishii;Cottonmouth;01/01/1980;;Shangai;99;99132;AP;MEF1;Division 2;
            `;
            const encodedInput = iconv.encode(input, 'utf8');
            const parser = new SchoolingRegistrationParser(encodedInput, 456, i18n);

            const { registrations } = parser.parse();
            expect(registrations[0]).to.includes({
              nationalStudentId: '123F',
              firstName: 'Beatrix',
              middleName: 'The',
              thirdName: 'Bride',
              lastName: 'Kiddo',
              preferredLastName: 'Black Mamba',
              sex: null,
              birthdate: '1970-01-01',
              birthCityCode: '97422',
              birthProvinceCode: '974',
              birthCountryCode: '100',
              status: 'ST',
              MEFCode: 'MEF1',
              division: 'Division 1',
              organizationId: 456,
            });

            expect(registrations[1]).to.includes({
              nationalStudentId: '0123456789F',
              firstName: 'O-Ren',
              lastName: 'Ishii',
              preferredLastName: 'Cottonmouth',
              sex: null,
              birthdate: '1980-01-01',
              birthCity: 'Shangai',
              birthProvinceCode: '99',
              birthCountryCode: '132',
              status: 'AP',
              MEFCode: 'MEF1',
              division: 'Division 2',
              organizationId: 456,
            });
          });
        });

        context('when division has spaces', function () {
          it('should trim division', function () {
            const input = `${schoolingRegistrationCsvColumns}
            123F;Beatrix;The;Bride;Kiddo;Black Mamba;1;01/01/1970;97422;;200;99100;ST;MEF1;  Division 1 ;
            `;
            const encodedInput = iconv.encode(input, 'utf8');
            const parser = new SchoolingRegistrationParser(encodedInput, 456, i18n);

            const { registrations } = parser.parse();
            expect(registrations[0].division).to.equal('Division 1');
          });

          it('should remove extra space on division', function () {
            const input = `${schoolingRegistrationCsvColumns}
            123F;Beatrix;The;Bride;Kiddo;Black Mamba;1;01/01/1970;97422;;200;99100;ST;MEF1;Division     1;
            `;
            const encodedInput = iconv.encode(input, 'utf8');
            const parser = new SchoolingRegistrationParser(encodedInput, 456, i18n);

            const { registrations } = parser.parse();
            expect(registrations[0].division).to.equal('Division 1');
          });
        });

        context('When the organization is Agriculture and file contain status AP', function () {
          it('should return schooling registration with nationalStudentId', function () {
            const input = `${schoolingRegistrationCsvColumns}
            0123456789F;Beatrix;The;Bride;Kiddo;Black Mamba;1;01/01/1970;97422;;974;99100;AP;MEF1;Division 1;
            `;
            const encodedInput = iconv.encode(input, 'utf8');
            const parser = new SchoolingRegistrationParser(encodedInput, 123, i18n);

            const { registrations } = parser.parse();
            expect(registrations[0]).to.includes({
              nationalStudentId: '0123456789F',
              status: 'AP',
            });
          });
        });
      });

      context('when the data are not correct', function () {
        it('should throw an EntityValidationError with malformated birthCountryCode', async function () {
          //given
          const wrongData = 'FRANC';
          const input = `${schoolingRegistrationCsvColumns}
          123F;Beatrix;The;Bride;Kiddo;Black Mamba;1;01/01/1980;97422;;200;${wrongData};ST;MEF1;Division 1;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new SchoolingRegistrationParser(encodedInput, 123, i18n);

          const error = await catchErr(parser.parse, parser)();

          //then
          expect(error.code).to.equal('INSEE_CODE_INVALID');
          expect(error.meta).to.deep.equal({ line: 2, field: 'Code pays naissance*' });
        });

        it('should throw an EntityValidationError with malformated birthCityCode', async function () {
          //given
          const wrongData = 'A1234';
          const input = `${schoolingRegistrationCsvColumns}
          123F;Beatrix;The;Bride;Kiddo;Black Mamba;1;01/01/1980;${wrongData};;974;99100;ST;MEF1;Division 1;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new SchoolingRegistrationParser(encodedInput, 123, i18n);

          const error = await catchErr(parser.parse, parser)();

          //then
          expect(error).to.be.an.instanceOf(CsvImportError);
          expect(error.code).to.equal('INSEE_CODE_INVALID');
          expect(error.meta).to.deep.equal({ line: 2, field: 'Code commune naissance**' });
        });

        context('When csv has duplicates on national identifier', function () {
          context('when organization is SCO', function () {
            it('should throw an CsvImportError even with different status', async function () {
              const input = `${schoolingRegistrationCsvColumns}
              0123456789F;Beatrix;The;Bride;Kiddo;Black Mamba;1;01/05/1986;97422;;200;99100;ST;MEF1;Division 1;
              0123456789F;Beatrix;The;Bride;Kiddo;Black Mamba;1;01/05/1986;97422;;200;99100;AP;MEF1;Division 1;
              `;

              const encodedInput = iconv.encode(input, 'utf8');
              const parser = new SchoolingRegistrationParser(encodedInput, 123, i18n);

              const error = await catchErr(parser.parse, parser)();

              //then
              expect(error.code).to.equal('IDENTIFIER_UNIQUE');
              expect(error.meta).to.deep.equal({ line: 3, field: 'Identifiant unique*' });
            });
          });
        });
      });
    });
  });
});
