import { readFile, writeFile } from 'node:fs/promises';
import url from 'node:url';

import dayjs from 'dayjs';
import { getDocument } from 'pdfjs-dist';

import { generate } from '../../../../../../../src/certification/results/infrastructure/utils/pdf/v3-certification-attestation-pdf.js';
import { getI18n } from '../../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { domainBuilder, expect } from '../../../../../../test-helper.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Infrastructure | Utils | Pdf | V3 Certification Attestation Pdf', function () {
  let i18n;

  beforeEach(function () {
    i18n = getI18n();
  });

  it('should generate a PDF buffer', async function () {
    // given
    const certificates = [domainBuilder.certification.results.buildV3CertificationAttestation()];

    // when
    const pdfStream = await generate({ certificates, i18n });

    const pdfBuffer = await _convertStreamToBuffer(pdfStream);

    // then
    expect(pdfBuffer.toString().substring(1, 4)).to.equal('PDF');
    expect(pdfBuffer.toString()).to.contain('/Type /Pages\n/Count 1');
  });

  it('should generate a page for each certificate', async function () {
    // given
    const certificates = [
      domainBuilder.certification.results.buildV3CertificationAttestation(),
      domainBuilder.certification.results.buildV3CertificationAttestation(),
      domainBuilder.certification.results.buildV3CertificationAttestation(),
    ];

    // when
    const pdfStream = await generate({
      certificates,
      i18n,
    });

    const pdfBuffer = await _convertStreamToBuffer(pdfStream);

    // then
    expect(pdfBuffer.toString()).to.contain('/Type /Pages\n/Count 3');
  });

  it('should display data content', async function () {
    // given
    const certificates = [
      domainBuilder.certification.results.buildV3CertificationAttestation({
        id: 123,
        firstName: 'Alain',
        lastName: 'Cendy',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 256,
        sessionId: 789,
      }),
      domainBuilder.certification.results.buildV3CertificationAttestation({
        id: 128,
        firstName: 'Alain',
        lastName: 'Terieur',
        birthdate: '2013-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 123,
        date: new Date('2020-01-01'),
        verificationCode: 'P-123456BS',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2020-05-05'),
        certificationCenter: 'Centre des centres',
        pixScore: 256,
        sessionId: 789,
      }),
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

    pagesContent.forEach((pageContent, index) => {
      expect(pageContent).to.include(`Centre de certification : ${certificates[index].certificationCenter}`);
      expect(pageContent).to.include(`${certificates[index].firstName} ${certificates[index].lastName.toUpperCase()}`);
      expect(pageContent).to.include(
        `né(e) le : ${dayjs(certificates[index].birthdate).format('DD/MM/YYYY')} à ${certificates[index].birthplace}`,
      );
      expect(pageContent).to.include(`le ${dayjs(certificates[index].deliveredAt).format('DD/MM/YYYY')}`);
      expect(pageContent).to.include(`${certificates[index].verificationCode}`);
      expect(pageContent).to.include(`${certificates[index].pixScore}`);
      expect(pageContent).to.include('Indépendant 1');
      expect(pageContent).to.include('Vous avez des pratiques numériques simples');
      expect(pageContent).to.include('Vous savez naviguer sur le Web');
      expect(pageContent).to.include(`${certificates[index].maxReachableScore}`);
    });
  });

  it('snapshot', async function () {
    // given
    const certificates = [
      domainBuilder.certification.results.buildV3CertificationAttestation({
        id: 123,
        firstName: 'Alain',
        lastName: 'Cendy',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 256,
        sessionId: 789,
      }),
    ];
    const referencePdfPath = 'v3-attestation-test.pdf';
    const pdfStream = await generate({ certificates, i18n });
    const pdfBuffer = await _convertStreamToBuffer(pdfStream);
    // Method used to generate a new PDF certification attestation
    // Please check this method if you want to do so in case of snapshot upgrade
    await _writeFile(pdfBuffer, referencePdfPath);

    // when
    const parsedPdf = await getDocument({ data: new Uint8Array(pdfBuffer) }).promise;
    const page = await parsedPdf.getPage(1);
    const text = await page.getTextContent();

    text.items.forEach((item) => {
      delete item.fontName;
    });
    text.styles = Object.values(text.styles);

    const expectedBuffer = await readFile(`${__dirname}${referencePdfPath}`);
    const expectedParsedPdf = await getDocument({ data: new Uint8Array(expectedBuffer) }).promise;
    const expectedPage = await expectedParsedPdf.getPage(1);
    const expectedText = await expectedPage.getTextContent();

    expectedText.items.forEach((item) => {
      delete item.fontName;
    });
    expectedText.styles = Object.values(expectedText.styles);

    // then
    expect(text).to.deep.equal(expectedText);
  });

  describe('when the candidate global level is pre beginner (pix score under 64)', function () {
    it('should display data content without global level information', async function () {
      // given
      const certificates = [
        domainBuilder.certification.results.buildV3CertificationAttestation({
          id: 123,
          firstName: 'Alain',
          lastName: 'Cendy',
          birthdate: '1977-04-14',
          birthplace: 'Saint-Ouen',
          isPublished: true,
          userId: 456,
          date: new Date('2020-01-01'),
          verificationCode: 'P-SOMECODE',
          maxReachableLevelOnCertificationDate: 5,
          deliveredAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          pixScore: 50,
          sessionId: 789,
        }),
      ];

      // when
      const pdfStream = await generate({ certificates, i18n });

      const pdfBuffer = await _convertStreamToBuffer(pdfStream);

      // then
      const parsedPdf = await getDocument({ data: new Uint8Array(pdfBuffer) }).promise;

      const page = await parsedPdf.getPage(1);
      const text = await page.getTextContent();
      const content = text.items.map((item) => item.str).join(' ');

      expect(content).to.include(`Centre de certification : ${certificates[0].certificationCenter}`);
      expect(content).to.include(`${certificates[0].firstName} ${certificates[0].lastName.toUpperCase()}`);
      expect(content).to.include(
        `né(e) le : ${dayjs(certificates[0].birthdate).format('DD/MM/YYYY')} à ${certificates[0].birthplace}`,
      );
      expect(content).to.include(`le ${dayjs(certificates[0].deliveredAt).format('DD/MM/YYYY')}`);
      expect(content).to.include(`${certificates[0].verificationCode}`);
      expect(content).to.include(`${certificates[0].pixScore}`);
      expect(content).to.include(`${certificates[0].maxReachableScore}`);
      expect(content).to.not.include('Niveau global');
      expect(content).to.not.include('Votre niveau signifie que :');
    });
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

async function _writeFile(buffer, outputFilename, dryRun = true) {
  // Note: to update or create the reference pdf, set dryRun to false.
  if (!dryRun) {
    await writeFile(`${__dirname}/${outputFilename}`, buffer);
  }
}
