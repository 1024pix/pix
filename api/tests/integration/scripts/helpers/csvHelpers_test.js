const { expect, catchErr } = require('../../../test-helper');
const { FileValidationError, NotFoundError } = require('../../../../lib/domain/errors');
const {
  checkCsvHeader,
  parseCsvWithHeaderAndRequiredFields,
} = require('../../../../scripts/helpers/csvHelpers');

describe('Integration | Scripts | Helpers | csvHelpers.js', () => {

  const withValidHeaderFilePath = `${__dirname}/files/withValidHeader-test.csv`;

  describe('#checkCsvHeader', () => {

    it('should throw NotFoundError if file does not exist', async () => {
      // given
      const nonExistentFile = 'nonExistentFile.csv';
      const requiredFieldNames = ['createdBy'];

      // when
      const error = await catchErr(checkCsvHeader)({
        filePath: nonExistentFile,
        requiredFieldNames,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('should throw FileValidationError if required field names are empty', async () => {
      // given
      const requiredFieldNames = [];

      // when
      const error = await catchErr(checkCsvHeader)({
        filePath: withValidHeaderFilePath,
        requiredFieldNames,
      });

      // then
      expect(error).to.be.instanceOf(FileValidationError);
      expect(error.code).to.equal('MISSING_REQUIRED_FIELD_NAMES');
    });

    it('should throw FileValidationError if required header field names are not present', async () => {
      // given
      const requiredFieldNames = ['foo'];

      // when
      const error = await catchErr(checkCsvHeader)({
        filePath: withValidHeaderFilePath,
        requiredFieldNames,
      });

      // then
      expect(error).to.be.instanceOf(FileValidationError);
      expect(error.code).to.equal('MISSING_REQUIRED_FIELD_NAMES');
      expect(error.meta).to.equal('Header are required: foo');
    });

    it('should not throw if required header field names are present', async () => {
      // given
      const requiredFieldNames = ['name', 'createdBy'];

      // then
      expect(await checkCsvHeader({
        filePath: withValidHeaderFilePath,
        requiredFieldNames,
      })).to.not.throw;
    });
  });

  describe('parseCsvWithHeaderAndRequiredFields', () => {

    it('should throw FileValidationError if required field value is empty', async () => {
      // given
      const requiredFieldNames = ['createdBy'];

      // when
      const error = await catchErr(parseCsvWithHeaderAndRequiredFields)({
        filePath: withValidHeaderFilePath,
        requiredFieldNames,
      });

      // then
      expect(error).to.be.instanceOf(FileValidationError);
      expect(error.code).to.equal('MISSING_REQUIRED_FIELD_VALUES');
      expect(error.meta).to.equal('Field values are required: createdBy');
    });
  });
});
