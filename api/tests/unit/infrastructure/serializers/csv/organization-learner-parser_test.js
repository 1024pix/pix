const iconv = require('iconv-lite');
const { expect, catchErr } = require('../../../../test-helper');
const OrganizationLearnerParser = require('../../../../../lib/infrastructure/serializers/csv/organization-learner-parser');
const { CsvImportError } = require('../../../../../lib/domain/errors');
const OrganizationLearnerColumns = require('../../../../../lib/infrastructure/serializers/csv/organization-learner-columns');
const { getI18n } = require('../../../../tooling/i18n/i18n');
const i18n = getI18n();

const organizationLearnerCsvColumns = new OrganizationLearnerColumns(i18n).columns
  .map((column) => column.label)
  .join(';');

describe('Unit | Infrastructure | OrganizationLearnerParser', function () {
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
      'Code sexe*',
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    fieldList.forEach((field) => {
      context(`when the ${field} column is missing`, function () {
        it('should throw an CsvImportError', async function () {
          let input = organizationLearnerCsvColumns.replace(`${field}`, '');
          input = input.replace(';;', ';');
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new OrganizationLearnerParser(encodedInput, organizationId, i18n);

          const error = await catchErr(parser.parse, parser)();

          expect(error.code).to.equal('HEADER_REQUIRED');
        });
      });
    });

    context('when the Premier prénom* column is missing', function () {
      it('should throw an CsvImportError', async function () {
        const input = organizationLearnerCsvColumns.replace('Premier prénom*;', '');
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new OrganizationLearnerParser(encodedInput, organizationId, i18n);

        const error = await catchErr(parser.parse, parser)();

        expect(error.code).to.equal('ENCODING_NOT_SUPPORTED');
      });
    });
  });

  context('when the header is correctly formed', function () {
    context('when there is no line', function () {
      it('returns no organization learners', function () {
        const input = organizationLearnerCsvColumns;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new OrganizationLearnerParser(encodedInput, 123, i18n);

        const { learners } = parser.parse();

        expect(learners).to.be.empty;
      });
    });

    context('when there are lines', function () {
      context('when the data are correct', function () {
        it('returns an organization learner for each line', function () {
          const input = `${organizationLearnerCsvColumns}
          123F;Beatrix;The;Bride;Kiddo;Black Mamba;F;01/01/1970;97422;;200;99100;ST;MEF1;Division 1;
          456F;O-Ren;;;Ishii;Cottonmouth;M;01/01/1980;;Shangai;99;99132;ST;MEF1;Division 2;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new OrganizationLearnerParser(encodedInput, 456, i18n);

          const { learners } = parser.parse();
          expect(learners).to.have.lengthOf(2);
        });

        it('returns an organization learner for each line using the CSV column', function () {
          const input = `${organizationLearnerCsvColumns}
          123F;Beatrix;The;Bride;Kiddo;Black Mamba;f;01/01/1970;97422;;974;99100;ST;MEF1;Division 1;
          0123456789F;O-Ren;;;Ishii;Cottonmouth;m;01/01/1980;;Shangai;99;99132;AP;MEF1;Division 2;
          `;
          const organizationId = 789;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new OrganizationLearnerParser(encodedInput, organizationId, i18n);

          const { learners } = parser.parse();
          expect(learners[0]).to.includes({
            nationalStudentId: '123F',
            firstName: 'Beatrix',
            middleName: 'The',
            thirdName: 'Bride',
            lastName: 'Kiddo',
            preferredLastName: 'Black Mamba',
            sex: 'F',
            birthdate: '1970-01-01',
            birthCityCode: '97422',
            birthProvinceCode: '974',
            birthCountryCode: '100',
            status: 'ST',
            MEFCode: 'MEF1',
            division: 'Division 1',
            organizationId,
          });

          expect(learners[1]).to.includes({
            nationalStudentId: '0123456789F',
            firstName: 'O-Ren',
            lastName: 'Ishii',
            preferredLastName: 'Cottonmouth',
            sex: 'M',
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

        context('when division has spaces', function () {
          it('should trim division', function () {
            const input = `${organizationLearnerCsvColumns}
            123F;Beatrix;The;Bride;Kiddo;Black Mamba;F;01/01/1970;97422;;200;99100;ST;MEF1;  Division 1 ;
            `;
            const encodedInput = iconv.encode(input, 'utf8');
            const parser = new OrganizationLearnerParser(encodedInput, 456, i18n);

            const { learners } = parser.parse();
            expect(learners[0].division).to.equal('Division 1');
          });

          it('should remove extra space on division', function () {
            const input = `${organizationLearnerCsvColumns}
            123F;Beatrix;The;Bride;Kiddo;Black Mamba;F;01/01/1970;97422;;200;99100;ST;MEF1;Division     1;
            `;
            const encodedInput = iconv.encode(input, 'utf8');
            const parser = new OrganizationLearnerParser(encodedInput, 456, i18n);

            const { learners } = parser.parse();
            expect(learners[0].division).to.equal('Division 1');
          });
        });

        context('When the organization is Agriculture and file contain status AP', function () {
          it('should return organization learner with nationalStudentId', function () {
            const input = `${organizationLearnerCsvColumns}
            0123456789F;Beatrix;The;Bride;Kiddo;Black Mamba;F;01/01/1970;97422;;974;99100;AP;MEF1;Division 1;
            `;
            const encodedInput = iconv.encode(input, 'utf8');
            const parser = new OrganizationLearnerParser(encodedInput, 123, i18n);

            const { learners } = parser.parse();
            expect(learners[0]).to.includes({
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
          const input = `${organizationLearnerCsvColumns}
          123F;Beatrix;The;Bride;Kiddo;Black Mamba;F;01/01/1980;97422;;200;${wrongData};ST;MEF1;Division 1;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new OrganizationLearnerParser(encodedInput, 123, i18n);

          const error = await catchErr(parser.parse, parser)();

          //then
          expect(error.code).to.equal('INSEE_CODE_INVALID');
          expect(error.meta).to.deep.equal({ line: 2, field: 'Code pays naissance*' });
        });

        it('should throw an EntityValidationError with malformated birthCityCode', async function () {
          //given
          const wrongData = 'A1234';
          const input = `${organizationLearnerCsvColumns}
          123F;Beatrix;The;Bride;Kiddo;Black Mamba;F;01/01/1980;${wrongData};;974;99100;ST;MEF1;Division 1;
          `;
          const encodedInput = iconv.encode(input, 'utf8');
          const parser = new OrganizationLearnerParser(encodedInput, 123, i18n);

          const error = await catchErr(parser.parse, parser)();

          //then
          expect(error).to.be.an.instanceOf(CsvImportError);
          expect(error.code).to.equal('INSEE_CODE_INVALID');
          expect(error.meta).to.deep.equal({ line: 2, field: 'Code commune naissance**' });
        });

        context('When the organization is Agriculture and file contain status AP', function () {
          it('should return organization learner with nationalStudentId', function () {
            const input = `${organizationLearnerCsvColumns}
            0123456789F;Beatrix;The;Bride;Kiddo;Black Mamba;F;01/01/1970;97422;;974;99100;AP;MEF1;Division 1;
            `;
            const encodedInput = iconv.encode(input, 'utf8');
            const parser = new OrganizationLearnerParser(encodedInput, 123, i18n);

            const { learners } = parser.parse();
            expect(learners[0]).to.includes({
              nationalStudentId: '0123456789F',
              status: 'AP',
            });
          });
        });

        context('When csv has duplicates on national identifier', function () {
          context('when organization is SCO', function () {
            it('should throw an CsvImportError even with different status', async function () {
              const input = `${organizationLearnerCsvColumns}
              0123456789F;Beatrix;The;Bride;Kiddo;Black Mamba;F;01/05/1986;97422;;200;99100;ST;MEF1;Division 1;
              0123456789F;Beatrix;The;Bride;Kiddo;Black Mamba;F;01/05/1986;97422;;200;99100;AP;MEF1;Division 1;
              `;

              const encodedInput = iconv.encode(input, 'utf8');
              const parser = new OrganizationLearnerParser(encodedInput, 123, i18n);

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
