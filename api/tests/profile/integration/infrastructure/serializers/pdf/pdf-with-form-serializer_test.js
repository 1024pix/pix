import { writeFile } from 'node:fs/promises';
import * as url from 'node:url';

import JSZip from 'jszip';

import { serialize } from '../../../../../../src/profile/infrastructure/serializers/pdf/pdf-with-form-serializer.js';
import { expect } from '../../../../../test-helper.js';
import { isSameBinary } from '../../../../../tooling/binary-comparator.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Infrastructure | Serializers | Pdf | PdfWithForm', function () {
  context('when there is one object to serialize in pdf', function () {
    it('should return pdf as a buffer', async function () {
      // given
      const expectedFilename = '/expected-pdf-with-form.pdf';

      const template = `${__dirname}/template.pdf`;
      const data = new Map();
      data.set('fullName', 'Nom complet');
      data.set('date', '12/02/21');

      // when
      const buffer = await serialize(template, data, new Date('2024-10-01'));

      await _writeFile({ outputFilename: expectedFilename, buffer });

      // then
      expect(await isSameBinary(`${__dirname}${expectedFilename}`, buffer)).to.be.true;
    });
  });

  context('when there are multiple objects to serialize in a zip', function () {
    it('should return zip as a buffer', async function () {
      // given
      const expectedFirstFilename = '/expected-first.pdf';
      const expectedSecondFilename = '/expected-second.pdf';

      const template = `${__dirname}/template.pdf`;
      const data = [new Map(), new Map()];
      data[0].set('fullName', 'Nom complet 1');
      data[0].set('filename', 'Sans titre 1');
      data[1].set('fullName', 'Nom complet 2');
      data[1].set('filename', 'Sans titre 2');

      // when
      const buffer = await serialize(template, data, new Date('2024-10-01'));

      const zip = new JSZip();
      await zip.loadAsync(buffer);

      const firstPdfBuffer = await zip.file(data[0].get('filename') + '.pdf').async('nodebuffer');
      const secondPdfBuffer = await zip.file(data[1].get('filename') + '.pdf').async('nodebuffer');

      await _writeFile({ outputFilename: expectedFirstFilename, buffer: firstPdfBuffer });
      await _writeFile({ outputFilename: expectedSecondFilename, buffer: secondPdfBuffer });

      // then
      expect(await isSameBinary(`${__dirname}${expectedFirstFilename}`, firstPdfBuffer)).to.be.true;
      expect(await isSameBinary(`${__dirname}${expectedSecondFilename}`, secondPdfBuffer)).to.be.true;
    });
  });
});

async function _writeFile({ buffer, outputFilename, dryRun = true }) {
  // Note: to update or create the reference pdf, set dryRun to false.
  if (!dryRun) {
    await writeFile(`${__dirname}/${outputFilename}`, buffer);
  }
}
