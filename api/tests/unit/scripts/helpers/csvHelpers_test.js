const { expect, catchErr } = require('../../../test-helper');
const { NotFoundError, FileValidationError } = require('../../../../lib/domain/errors');
const {
  parseCsv,
  readCsvFile,
  parseCsvWithHeader,
  checkCsvHeader,
  parseCsvWithHeaderAndRequiredFields,
} = require('../../../../scripts/helpers/csvHelpers');
const {
  batchOrganizationOptionsWithHeader,
} = require('../../../../scripts/create-organizations-with-tags-and-target-profiles');
const { UnprocessableEntityError } = require('../../../../lib/application/http-errors');

describe('Unit | Scripts | Helpers | csvHelpers.js', function () {
  const notExistFilePath = 'notExist.csv';
  const emptyFilePath = `${__dirname}/files/organizations-empty-file.csv`;
  const validFilePath = `${__dirname}/files/valid-organizations-test.csv`;
  const organizationWithTagsAndTargetProfilesFilePath = `${__dirname}/files/organizations-with-tags-and-target-profiles-test.csv`;
  const utf8FilePath = `${__dirname}/files/utf8_excel-test.csv`;
  const withHeaderFilePath = `${__dirname}/files/withHeader-test.csv`;
  const withValidHeaderFilePath = `${__dirname}/files/withValidHeaderFilePath.csv`;
  const sessionsForMassImportFilePath = `${__dirname}/files/import-sessions-with-sex-value-in-lowercase-test.csv`;

  describe('#readCsvFile', function () {
    it('should throw a NotFoundError when file does not exist', async function () {
      // when
      const error = await catchErr(readCsvFile)(notExistFilePath);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`File ${notExistFilePath} not found!`);
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

    context('with custom transform', function () {
      context('when email column exists', function () {
        it('should remove spaces', async function () {
          // given & when
          const data = await parseCsvWithHeader(
            organizationWithTagsAndTargetProfilesFilePath,
            batchOrganizationOptionsWithHeader
          );

          // then
          expect(data[0].emailInvitations).to.equal('team-acces@example.net');
          expect(data[0].DPOEmail).to.equal('superadmin@example.net');
        });
      });

      context('when credits column exists and the value is empty', function () {
        it('should return 0 by default', async function () {
          // given & when
          const data = await parseCsvWithHeader(
            organizationWithTagsAndTargetProfilesFilePath,
            batchOrganizationOptionsWithHeader
          );

          // then
          expect(data[0].credit).to.equal(0);
        });
      });

      context('when locale column exists and the value is empty', function () {
        it('should return fr-fr by default', async function () {
          // given & when
          const data = await parseCsvWithHeader(
            organizationWithTagsAndTargetProfilesFilePath,
            batchOrganizationOptionsWithHeader
          );

          // then
          expect(data[0].locale).to.equal('fr-fr');
        });
      });

      it('should convert isManagingStudents to a boolean', async function () {
        // given & when
        const data = await parseCsvWithHeader(
          organizationWithTagsAndTargetProfilesFilePath,
          batchOrganizationOptionsWithHeader
        );

        // then
        expect(data[0].isManagingStudents).to.equal(false);
        expect(data[1].isManagingStudents).to.equal(true);
        expect(data[2].isManagingStudents).to.equal(false);
      });

      it('should convert identityProviderForCampaigns to uppercase', async function () {
        // given & when
        const data = await parseCsvWithHeader(
          organizationWithTagsAndTargetProfilesFilePath,
          batchOrganizationOptionsWithHeader
        );

        // then
        expect(data[0].identityProviderForCampaigns).to.equal('POLE_EMPLOI');
      });

      it('should convert organizationInvitationRole to uppercase', async function () {
        // given & when
        const data = await parseCsvWithHeader(
          organizationWithTagsAndTargetProfilesFilePath,
          batchOrganizationOptionsWithHeader
        );

        // then
        expect(data[0].organizationInvitationRole).to.equal('ADMIN');
      });

      it('should convert type to uppercase', async function () {
        // given & when
        const data = await parseCsvWithHeader(
          organizationWithTagsAndTargetProfilesFilePath,
          batchOrganizationOptionsWithHeader
        );

        // then
        expect(data[0].type).to.equal('PRO');
      });

      it('should convert sex to uppercase', async function () {
        // given & when
        const result = await parseCsvWithHeader(sessionsForMassImportFilePath);

        // then
        const data = result[0];
        expect(data['* Sexe (M ou F)']).to.equal('F');
      });
    });

    context('when csv file is empty or contains only the header line', function () {
      it(' should return an unprocessable entity error', async function () {
        // given & when
        const error = await catchErr(parseCsvWithHeader)(emptyFilePath);

        // then
        expect(error).to.be.instanceOf(UnprocessableEntityError);
        expect(error.message).to.equal('No session data in csv');
        expect(error.code).to.equal('CSV_DATA_REQUIRED');
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
      await checkCsvHeader({ filePath: withHeaderFilePath, requiredFieldNames: headers });
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
