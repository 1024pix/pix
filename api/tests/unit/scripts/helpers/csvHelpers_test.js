const { expect, catchErr } = require('../../../test-helper');
const { NotFoundError, FileValidationError } = require('../../../../lib/domain/errors');
const {
  checkCsvExtensionFile,
  parseCsv,
  readCsvFile,
  parseCsvWithHeader,
  checkCsvHeader,
} = require('../../../../scripts/helpers/csvHelpers');

describe('Unit | Scripts | Helpers | csvHelpers.js', function () {
  const notExistFilePath = 'notExist.csv';
  const badExtensionFilePath = `${__dirname}/files/bad_extension.html`;
  const validFilePath = `${__dirname}/files/valid-organizations-test.csv`;
  const utf8FilePath = `${__dirname}/files/utf8_excel-test.csv`;
  const withHeaderFilePath = `${__dirname}/files/withHeader-test.csv`;

  describe('#readCsvFile', function () {
    it('should throw a NotFoundError when file does not exist', async function () {
      // when
      const error = await catchErr(readCsvFile)(notExistFilePath);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`File ${notExistFilePath} not found!`);
    });
  });

  describe('#checkCsvExtensionFile', function () {
    it('should throw a FileValidationError when file extension is not ".csv"', async function () {
      // when
      const error = await catchErr(checkCsvExtensionFile)(badExtensionFilePath);

      // then
      expect(error).to.be.instanceOf(FileValidationError);
      expect(error.code).to.equal('INVALID_FILE_EXTENSION');
      expect(error.meta).to.deep.equal({ fileExtension: '.html' });
    });

    it('should not throw if file is valid', async function () {
      // then
      expect(await checkCsvExtensionFile(validFilePath)).to.not.throw;
    });
  });

  describe('#parseCsv', function () {
    it('should throw a NotFoundError when file does not exist', async function () {
      // when
      const error = await catchErr(parseCsv)(notExistFilePath);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`File ${notExistFilePath} not found!`);
    });

    it('should parse csv file with 3 lines', async function () {
      // given
      const options = { skipEmptyLines: true };

      // when
      const data = await parseCsv(validFilePath, options);

      // then
      expect(data.length).to.equal(3);
      expect(data[0][2]).to.equal('david.herault@pix.fr');
    });

    it('should cast the unexpected utf8 char add by Excel', async function () {
      // when
      const data = await parseCsv(utf8FilePath);

      // then
      expect(data.length).to.equal(4);
    });
  });

  describe('#parseCsvWithHeader', function () {
    it('should parse csv file with header', async function () {
      // given
      const expectedItems = [
        { uai: '0080017A', name: 'Collège Les Pixous' },
        { uai: '0080018B', name: 'Lycée Pix' },
        { uai: '0080040A', name: 'Lycée Tant Pix' },
      ];

      // when
      const items = await parseCsvWithHeader(withHeaderFilePath);

      // then
      expect(items.length).to.equal(3);
      expect(items).to.have.deep.members(expectedItems);
    });
  });

  describe('#checkCsvHeader', function () {
    it('should throw if headers does not match', async function () {
      // given
      const headers = ['uai', 'Name'];

      // when
      const error = await catchErr(checkCsvHeader)({ filePath: withHeaderFilePath, requiredFieldNames: headers });

      // then
      expect(error).to.be.instanceOf(FileValidationError);
      expect(error.code).to.equal('MISSING_REQUIRED_FIELD_NAMES');
      expect(error.meta).to.equal('Headers missing: Name');
    });

    it('should not throw if headers match', async function () {
      // given
      const headers = ['uai', 'name'];

      // when
      const error = await catchErr(checkCsvHeader)({ filePath: withHeaderFilePath, requiredFieldNames: headers });

      // then
      expect(error).to.be.equal('should have thrown an error');
    });
  });
});
