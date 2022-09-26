const { expect, catchErr } = require('../../../test-helper');
const { NotFoundError, FileValidationError } = require('../../../../lib/domain/errors');
const {
  checkCsvExtensionFile,
  parseCsv,
  readCsvFile,
  parseCsvWithHeader,
  checkCsvHeader,
  parseCsvWithHeaderAndRequiredFields,
} = require('../../../../scripts/helpers/csvHelpers');

describe('Unit | Scripts | Helpers | csvHelpers.js', function () {
  const notExistFilePath = 'notExist.csv';
  const emptyFilePath = `${__dirname}/files/organizations-empty-file.csv`;
  const badExtensionFilePath = `${__dirname}/files/bad_extension.html`;
  const validFilePath = `${__dirname}/files/valid-organizations-test.csv`;
  const organizationProWithTagsAndTargetProfilesFilePath = `${__dirname}/files/organizations-pro-with-tags-and-target-profiles-test.csv`;
  const utf8FilePath = `${__dirname}/files/utf8_excel-test.csv`;
  const withHeaderFilePath = `${__dirname}/files/withHeader-test.csv`;
  const withValidHeaderFilePath = `${__dirname}/files/withValidHeaderFilePath.csv`;

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

    context('when email column exists', function () {
      it('should remove spaces', async function () {
        // given & when
        const data = await parseCsvWithHeader(organizationProWithTagsAndTargetProfilesFilePath);

        // then
        expect(data[0].email).to.equal('team-acces@example.net');
      });
    });

    context('when credits column exists and the value is empty', function () {
      it('should return 0 by default', async function () {
        // given & when
        const data = await parseCsvWithHeader(organizationProWithTagsAndTargetProfilesFilePath);

        // then
        expect(data[0].credit).to.equal(0);
      });
    });

    context('when locale column exists and the value is empty', function () {
      it('should return fr-fr by default', async function () {
        // given & when
        const data = await parseCsvWithHeader(organizationProWithTagsAndTargetProfilesFilePath);

        // then
        expect(data[0].locale).to.equal('fr-fr');
      });
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

    it('should not throw if headers empty', async function () {
      // given
      const headers = ['uai', 'name'];

      // when
      const error = await catchErr(checkCsvHeader)({ filePath: emptyFilePath, requiredFieldNames: headers });

      // then
      expect(error).to.be.instanceOf(FileValidationError);
      expect(error.meta).to.equal('File is empty');
    });
  });

  describe('#parseCsvWithHeaderAndRequiredFields', function () {
    it('should throw FileValidationError if required field value is empty', async function () {
      // given
      const requiredFieldNames = ['title', 'type'];

      // when
      const error = await catchErr(parseCsvWithHeaderAndRequiredFields)({
        filePath: withValidHeaderFilePath,
        requiredFieldNames,
      });

      // then
      expect(error).to.be.instanceOf(FileValidationError);
      expect(error.code).to.equal('MISSING_REQUIRED_FIELD_VALUES');
      expect(error.meta).to.equal('Field values are required for type');
    });

    it('should parse .csv with header and required fields', async function () {
      // given
      const requiredFieldNames = ['uai', 'name'];
      const expectedItems = [
        { uai: '0080017A', name: 'Collège Les Pixous' },
        { uai: '0080018B', name: 'Lycée Pix' },
        { uai: '0080040A', name: 'Lycée Tant Pix' },
      ];

      // when
      const data = await parseCsvWithHeaderAndRequiredFields({
        filePath: withHeaderFilePath,
        requiredFieldNames,
      });

      // then
      expect(data.length).to.equal(3);
      expect(data).to.have.deep.members(expectedItems);
    });
  });
});
