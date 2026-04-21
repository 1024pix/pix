import { createReadStream } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import * as url from 'node:url';

import { PDFDocument } from 'pdf-lib';

import { serializeStream } from '../../../../../../src/profile/infrastructure/serializers/pdf/pdf-with-form-serializer.js';

import { isSameBinary } from '../../../../../tooling/test-utils/file.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Infrastructure | Serializers | Pdf | PdfWithForm', function () {
  context('#serializeStream', function () {
    context('when there is one object to serialize in pdf', function () {
      it('should return pdf as a buffer', async function () {
        // given
        const expectedFilename = '/expected-pdf-with-form.pdf';

        const stream = createReadStream(`${__dirname}/template.pdf`);
        const data = new Map();
        data.set('fullName', 'Ķatherine AvecUnCharChelou');
        data.set('date', '12/02/21');

        // when
        const buffer = await serializeStream(stream, data, new Date('2024-10-01'));

        await recreatePDFFileReferenceTest({ outputFilename: expectedFilename, buffer });

        // then
        expect(await isSameBinary(`${__dirname}${expectedFilename}`, buffer)).to.be.true;
      });
    });

    context('when there are multiple objects to serialize', function () {
      it('should return a single multi-page pdf as a buffer', async function () {
        // given
        const stream = createReadStream(`${__dirname}/template.pdf`);
        const data = [new Map(), new Map()];
        data[0].set('fullName', 'Nom complet 1');
        data[0].set('filename', 'Sans titre 1');
        data[1].set('fullName', 'Nom complet 2');
        data[1].set('filename', 'Sans titre 2');

        // when
        const buffer = await serializeStream(stream, data, new Date('2024-10-01'));

        // then
        expect(Buffer.isBuffer(buffer)).to.be.true;
        const pdfDoc = await PDFDocument.load(buffer);
        expect(pdfDoc.getPageCount()).to.equal(2);
      });
    });
  });
});

async function recreatePDFFileReferenceTest({ buffer, outputFilename, dryRun = true }) {
  // Note: to update or create the reference pdf, set dryRun to false.
  if (!dryRun) {
    await writeFile(`${__dirname}/${outputFilename}`, buffer);
  }
}
