import { expect, catchErr } from '../../../test-helper';
import { FileValidationError, NotFoundError } from '../../../../lib/domain/errors';
import { checkCsvHeader } from '../../../../scripts/helpers/csvHelpers';

describe('Integration | Scripts | Helpers | csvHelpers.js', function () {
  const withValidHeaderFilePath = `${__dirname}/files/withValidHeader-test.csv`;

  describe('#checkCsvHeader', function () {
    it('should throw NotFoundError if file does not exist', async function () {
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

    it('should throw FileValidationError if required field names are empty', async function () {
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

    it('should throw FileValidationError if required header field names are not present', async function () {
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
      expect(error.meta).to.equal('Headers missing: foo');
    });

    it('should not throw if required header field names are present', async function () {
      // given
      const requiredFieldNames = ['name', 'createdBy'];

      // then
      expect(
        await checkCsvHeader({
          filePath: withValidHeaderFilePath,
          requiredFieldNames,
        })
      ).to.not.throw;
    });
  });
});
