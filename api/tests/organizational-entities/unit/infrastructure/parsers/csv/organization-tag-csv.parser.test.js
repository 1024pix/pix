import { organizationTagCsvParser } from '../../../../../../src/organizational-entities/infrastructure/parsers/csv/organization-tag-csv.parser.js';
import { ObjectValidationError } from '../../../../../../src/shared/domain/errors.js';
import { CsvImportError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, createTempFile, expect, removeTempFile } from '../../../../../test-helper.js';

const fileName = 'organizationTagCsvParser.test.csv';

describe('Unit | Organizational Entities | Domain | Service | organizationTagCsvParser', function () {
  let filePath;

  afterEach(async function () {
    if (filePath) {
      await removeTempFile(filePath);
    }
  });

  describe('when CSV file format is invalid: no header', function () {
    it('throws a CsvImportError', async function () {
      // given
      const firstOrganizationId = 2023;
      const firstTagName = 'COLLEGE';
      const fileData = `
      ${firstOrganizationId},${firstTagName}
      `;
      filePath = await createTempFile(fileName, fileData);

      // when
      const error = await catchErr(organizationTagCsvParser.getCsvData)(filePath);

      // then
      expect(error).to.be.an.instanceOf(CsvImportError);
    });
  });

  describe('when CSV file format is invalid: wrong header', function () {
    it('throws a CsvImportError', async function () {
      // given
      const csvHeader = 'tagName,Orga,foo,';
      const firstOrganizationId = 2023;
      const firstTagName = 'COLLEGE';
      const fileData = `${csvHeader}
      ${firstOrganizationId},${firstTagName}
      `;
      filePath = await createTempFile(fileName, fileData);

      // when
      const error = await catchErr(organizationTagCsvParser.getCsvData)(filePath);

      // then
      expect(error).to.be.an.instanceOf(CsvImportError);
    });
  });

  describe('when an organizationId has an invalid identifier format', function () {
    it('throws a ValidationError', async function () {
      // given
      const csvHeader = 'Organization ID,Tag name';
      const firstOrganizationId = 'some bogus iDenTiFier';
      const firstTagName = 'COLLEGE';
      const fileData = `${csvHeader}
      ${firstOrganizationId},${firstTagName}
      `;
      filePath = await createTempFile(fileName, fileData);

      // when
      const error = await catchErr(organizationTagCsvParser.getCsvData)(filePath);

      // then
      expect(error).to.be.an.instanceOf(ObjectValidationError);
    });
  });

  describe('when a tag name is missing', function () {
    it('throws a ValidationError', async function () {
      // given
      const csvHeader = 'Organization ID,Tag name';
      const firstOrganizationId = 2023;
      const fileData = `${csvHeader}
      ${firstOrganizationId},
      `;
      filePath = await createTempFile(fileName, fileData);

      // when
      const error = await catchErr(organizationTagCsvParser.getCsvData)(filePath);

      // then
      expect(error).to.be.an.instanceOf(ObjectValidationError);
    });
  });
});
