import { getDocument } from 'pdfjs-dist';

import { generate } from '../../../../../../../src/certification/results/infrastructure/utils/pdf/v3-certification-attestation-pdf.js';
import { getI18n } from '../../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { expect } from '../../../../../../test-helper.js';

describe('Integration | Infrastructure | Utils | Pdf | V3 Certification Attestation Pdf', function () {
  let i18n;

  beforeEach(function () {
    i18n = getI18n();
  });

  it('should generate a PDF buffer', async function () {
    // when
    const pdfStream = generate({
      certificates: [Symbol('attestation')],
      i18n,
    });

    const pdfBuffer = await _convertStreamToBuffer(pdfStream);

    // then
    expect(pdfBuffer.toString().substring(1, 4)).to.equal('PDF');
    expect(pdfBuffer.toString()).to.contain('/Type /Pages\n/Count 1');
  });

  it('should generate a page for each certificate', async function () {
    // when
    const pdfStream = await generate({
      certificates: [Symbol('attestation'), Symbol('attestation'), Symbol('attestation')],
      i18n,
    });

    const pdfBuffer = await _convertStreamToBuffer(pdfStream);

    // then
    expect(pdfBuffer.toString()).to.contain('/Type /Pages\n/Count 3');
  });

  it('should display data content', async function () {
    // given
    const certificates = [
      { firstName: 'Jane', lastName: 'Doe' },
      { firstName: 'John', lastName: 'Doe' },
    ];

    // when
    const pdfStream = await generate({ certificates, i18n });

    const pdfBuffer = await _convertStreamToBuffer(pdfStream);

    // then
    const parsedPdf = await getDocument({ data: new Uint8Array(pdfBuffer) }).promise;

    const pagesContent = [];
    for (let i = 1; i <= parsedPdf.numPages; i++) {
      const page = await parsedPdf.getPage(i);
      const content = await page.getTextContent();
      pagesContent.push(content.items.map((item) => item.str).join(' '));
    }

    expect(pagesContent.length).to.equal(2);
    expect(pagesContent[0]).to.eql(`${certificates[0].firstName} ${certificates[0].lastName}`);
    expect(pagesContent[1]).to.eql(`${certificates[1].firstName} ${certificates[1].lastName}`);
  });
});

function _convertStreamToBuffer(streamData) {
  return new Promise(function (resolve) {
    const chunks = [];

    streamData.on('readable', () => {
      let chunk;
      while (null !== (chunk = streamData.read())) {
        chunks.push(chunk);
      }
    });

    streamData.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}
