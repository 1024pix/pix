import { expect } from '../../test-helper';
import { getCpfImportResults } from '../../../scripts/certification/get-cpf-import-status-from-xml';

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
