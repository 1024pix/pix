import { expect, catchErr } from '../../../../../test-helper.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';

import { CsvWithNoSessionDataError } from '../../../../../../src/certification/session/domain/errors.js';

import {
  parseCsv,
  readCsvFile,
  parseCsvWithHeader,
} from '../../../../../../src/certification/shared/application/helpers/csvHelpers.js';

import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Certification | Shared | Integration | Application | Helpers | csvHelpers.js', function () {
  const notExistFilePath = 'notExist.csv';
  const emptyFilePath = `${__dirname}/files/empty-file-test.csv`;
  const validFilePath = `${__dirname}/files/valid-file-test.csv`;
  const utf8FilePath = `${__dirname}/files/utf8_excel-test.csv`;
  const withHeaderFilePath = `${__dirname}/files/file-with-header-test.csv`;
  const sessionsForMassImportFilePath = `${__dirname}/files/file-with-sex-value-in-lowercase-test.csv`;

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

    it('should parse csv file with 2 lines', async function () {
      // given
      const options = { skipEmptyLines: true };

      // when
      const data = await parseCsv(validFilePath, options);

      // then
      expect(data.length).to.equal(2);
      expect(data[0][2]).to.equal('Salle Beagle');
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
        {
          'Numéro de session préexistante': '',
          '* Nom de la salle': 'Salle Beagle',
          '* Nom de naissance': 'leBeagle',
          '* Nom du site': 'Centre des chiens',
          '* Prénom': 'Jude',
          '* Surveillant(s)': 'Doggo',
        },
        {
          'Numéro de session préexistante': '1',
          '* Nom de la salle': 'Salle Abyssin',
          '* Nom de naissance': 'Abyssin',
          '* Nom du site': 'Centre des chats',
          '* Prénom': 'Lou',
          '* Surveillant(s)': 'Catty',
        },
      ];

      // when
      const items = await parseCsvWithHeader(withHeaderFilePath);

      // then
      expect(items.length).to.equal(2);
      expect(items).to.have.deep.members(expectedItems);
    });

    context('with custom transform', function () {
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
        expect(error).to.be.instanceOf(CsvWithNoSessionDataError);
        expect(error.message).to.equal('No session data in csv');
        expect(error.code).to.equal('CSV_DATA_REQUIRED');
      });
    });
  });
});
