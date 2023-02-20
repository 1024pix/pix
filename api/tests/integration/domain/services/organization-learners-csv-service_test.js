import _ from 'lodash';
import { expect, catchErr } from '../../../test-helper';
import { CsvImportError } from '../../../../lib/domain/errors';
import organizationLearnersCsvService from '../../../../lib/domain/services/organization-learners-csv-service';
import { getI18n } from '../../../tooling/i18n/i18n';
const i18n = getI18n();

describe('Integration | Services | organization-learners-csv-service', function () {
  describe('extractOrganizationLearnersInformation', function () {
    it('should parse two organizationLearners information', async function () {
      // given
      const organization = { id: 123, isAgriculture: true };
      const path = `${process.cwd()}/tests/tooling/fixtures/siecle-file/siecle-csv-with-two-valid-students.csv`;
      const expectedOrganizationLearners = [
        {
          lastName: 'Corse',
          preferredLastName: 'Cottonmouth',
          firstName: 'Léa',
          middleName: 'Jeannette',
          thirdName: 'Klervi',
          birthdate: '1990-01-01',
          birthCityCode: '2A214',
          birthCity: undefined,
          birthCountryCode: '100',
          birthProvinceCode: '2A',
          MEFCode: 'MEF1',
          status: 'AP',
          nationalStudentId: '4581234567F',
          division: 'Division 2',
          sex: 'M',
        },
        {
          lastName: 'Corse',
          preferredLastName: undefined,
          firstName: 'Léo',
          middleName: undefined,
          thirdName: undefined,
          birthdate: '1990-01-01',
          birthCityCode: undefined,
          birthCity: 'Plymouth',
          birthCountryCode: '132',
          birthProvinceCode: '99',
          MEFCode: 'MEF1',
          status: 'ST',
          nationalStudentId: '4581234567G',
          division: 'Division 1',
          sex: 'F',
        },
      ];

      // when
      const results = await organizationLearnersCsvService.extractOrganizationLearnersInformation(
        path,
        organization,
        i18n
      );

      //then
      const actualResult = _.map(results, (result) =>
        _.omit(result, ['id', 'organizationId', 'userId', 'updatedAt', 'isDisabled'])
      );
      expect(actualResult).to.deep.equal(expectedOrganizationLearners);
    });

    it('when the encoding is not supported it throws an error', async function () {
      // given
      const organization = { id: 123, isAgriculture: true };
      const path = `${process.cwd()}/tests/tooling/fixtures/siecle-file/siecle-csv-with-unknown-encoding.csv`;
      // when
      const error = await catchErr(organizationLearnersCsvService.extractOrganizationLearnersInformation)(
        path,
        organization,
        i18n
      );

      //then
      expect(error).to.be.instanceof(CsvImportError);
      expect(error.code).to.equal('ENCODING_NOT_SUPPORTED');
    });

    it('should abort parsing and reject with duplicate national student id error', async function () {
      // given
      const organization = { id: 123, isAgriculture: true };
      const path = `${process.cwd()}/tests/tooling/fixtures/siecle-file/siecle-csv-with-duplicate-national-student-id.csv`;
      // when
      const error = await catchErr(organizationLearnersCsvService.extractOrganizationLearnersInformation)(
        path,
        organization,
        i18n
      );

      //then
      expect(error).to.be.instanceof(CsvImportError);
      expect(error.code).to.equal('IDENTIFIER_UNIQUE');
      expect(error.meta).to.deep.equal({ field: 'Identifiant unique*', line: 3 });
    });

    it('should abort parsing and reject with missing national student id error', async function () {
      // given
      const organization = { id: 123, isAgriculture: true };
      const path = `${process.cwd()}/tests/tooling/fixtures/siecle-file/siecle-csv-with-no-national-student-id.csv`;
      // when
      const error = await catchErr(organizationLearnersCsvService.extractOrganizationLearnersInformation)(
        path,
        organization,
        i18n
      );

      //then
      expect(error).to.be.instanceof(CsvImportError);
      expect(error.code).to.equal('FIELD_REQUIRED');
      expect(error.meta).to.deep.equal({ field: 'Identifiant unique*', line: 2 });
    });
  });
});
