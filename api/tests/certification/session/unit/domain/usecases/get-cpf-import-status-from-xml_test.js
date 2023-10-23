import { expect } from '../../../../../test-helper.js';
import { getCpfImportResults } from '../../../../../../src/certification/session/domain/usecases/get-cpf-import-status-from-xml.js';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('UNIT | Scripts | Certification | get-cpf-import-status-from-xml', function () {
  describe('#getCpfImportResults', function () {
    describe('when xml is not empty', function () {
      it('should retrieve certification ids from xml', async function () {
        // given
        const xmlPath = `${__dirname}/files/xml/cpfImportLog.xml`;

        // when
        const result = await getCpfImportResults(xmlPath);

        // then
        const expectedCpfImportErrorIds = ['1234'];
        const expectedCpfImportSuccessIds = ['4567', '891011'];

        expect(result).to.deep.equal({
          cpfImportErrorIds: expectedCpfImportErrorIds,
          cpfImportSuccessIds: expectedCpfImportSuccessIds,
        });
      });
    });

    describe('when xml is empty', function () {
      it('should return empty arrays', async function () {
        // given
        const xmlPath = `${__dirname}/files/xml/cpfImportLogEmpty.xml`;

        // when
        const result = await getCpfImportResults(xmlPath);

        // then
        expect(result).to.deep.equal({
          cpfImportErrorIds: [],
          cpfImportSuccessIds: [],
        });
      });
    });
  });
});
