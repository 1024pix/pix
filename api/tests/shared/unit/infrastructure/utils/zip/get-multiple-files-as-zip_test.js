import JSZip from 'jszip';

import { getMultipleFilesAsZip } from '../../../../../../src/shared/infrastructure/utils/zip/get-multiple-files-as-zip.js';
import { expect } from '../../../../../test-helper.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Utils | Zip | getMultipleFilesAsZip', function () {
  describe('#getMultipleFilesAsZip', function () {
    it('should return a zip buffer including every files', async function () {
      // given
      const pdfContent = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);

      const files = [
        { filename: 'dummy1.csv', content: 'nom;prenom\nDupont;Jean' },
        { filename: 'dummy2.pdf', content: pdfContent },
      ];

      // when
      const result = await getMultipleFilesAsZip({ files });

      // then
      expect(Buffer.isBuffer(result)).to.be.true;

      const archive = await JSZip.loadAsync(result);

      expect(Object.keys(archive.files)).to.have.members(['dummy1.csv', 'dummy2.pdf']);

      const extractedCsv = await archive.file('dummy1.csv').async('string');
      expect(extractedCsv).to.equal(files[0].content);

      const extractedPdf = await archive.file('dummy2.pdf').async('nodebuffer');
      expect(extractedPdf).to.deep.equal(files[1].content);
    });
  });

  describe('when there is no file', function () {
    it('should throw an error', async function () {
      // when
      const error = await catchErr(getMultipleFilesAsZip)({ files: [] });

      // then
      expect(error.message).to.equal('No file to zip');
    });
  });
});
