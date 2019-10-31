const { expect, catchErr } = require('../../../test-helper');

const { NotFoundError, FileValidationError } = require('../../../../lib/domain/errors');
const { checkCsvExtensionFile, parseCsv } = require('../../../../scripts/helpers/csvHelpers');

describe('Unit | Scripts | Helpers | csvHelpers.js', () => {

  describe('#checkCsvExtensionFile', () => {

    it('should throw a NotFoundError when file does not exist', async () => {
      // given
      const filePath = 'inexistant.file';

      // when
      const error = await catchErr(checkCsvExtensionFile)(filePath);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('File not found inexistant.file');
    });

    it('should throw a FileValidationError when file extension is not ".csv"', async () => {
      // given
      const filePath = `${__dirname}/file_with_bad_extension.html`;

      // when
      const error = await catchErr(checkCsvExtensionFile)(filePath);

      // then
      expect(error).to.be.instanceOf(FileValidationError);
      expect(error.message).to.equal('File extension not supported .html');
    });

    it('should return true if file is valid', () => {
      // given
      const filePath = `${__dirname}/valid-organizations-test-file.csv`;

      // when
      const result = checkCsvExtensionFile(filePath);

      // then
      expect(result).to.be.true;
    });

  });

  describe('#parseCsv', () => {

    it('should throw a NotFoundError when file does not exist', async () => {
      // given
      const filePath = 'inexistant.file';

      // when
      const error = await catchErr(parseCsv)(filePath);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('File not found inexistant.file');
    });

    it('should parse csv file with 3 lines', () => {
      // given
      const filePath = `${__dirname}/valid-organizations-test-file.csv`;
      const options = { skipEmptyLines: true };

      // when
      const data = parseCsv(filePath, options);

      // then
      expect(data.length).to.equal(3);
      expect(data[0][2]).to.equal('mail1@ac-reims.fr');
    });
  });

});
