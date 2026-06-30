import { readFile, writeFile } from 'node:fs/promises';
import url from 'node:url';

import dayjs from 'dayjs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

import { generate } from '../../../../../../../src/certification/results/infrastructure/utils/pdf/generate-v3-pdf-certificate.js';
import { Frameworks } from '../../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { getI18n } from '../../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { expect } from '../../../../../../test-helper.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Infrastructure | Utils | Pdf | V3 Certificate Pdf', function () {
  let i18n, translate;

  beforeEach(function () {
    i18n = getI18n();
    translate = i18n.__;
  });

  describe('for a CORE or CLEA certification', function () {
    it('should generate a PDF buffer', async function () {
      // given
      const certificates = [domainBuilder.certification.results.buildCertificate()];

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
        domainBuilder.certification.results.buildCertificate(),
        domainBuilder.certification.results.buildCertificate(),
        domainBuilder.certification.results.buildCertificate(),
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
        domainBuilder.certification.results.buildCertificate({
          id: 123,
          firstName: 'Alain',
          lastName: 'Cendy',
          birthdate: '1977-04-14',
          birthplace: 'Saint-Ouen',
          isPublished: true,
          userId: 456,
          date: new Date('2020-01-01'),
          verificationCode: 'P-SOMECODE',
          deliveredAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          pixScore: 256,
          reachedMeshIndex: 3,
          sessionId: 789,
        }),
        domainBuilder.certification.results.buildCertificate({
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
          reachedMeshIndex: 3,
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
        expect(pageContent).to.include(
          `${certificates[index].firstName} ${certificates[index].lastName.toUpperCase()}`,
        );
        expect(pageContent).to.include(
          `né(e) le : ${dayjs(certificates[index].birthdate).format('DD/MM/YYYY')} à ${certificates[index].birthplace}`,
        );
        expect(pageContent).to.include(`le ${dayjs(certificates[index].deliveredAt).format('DD/MM/YYYY')}`);
        expect(pageContent).to.include(`${certificates[index].verificationCode}`);
        expect(pageContent).to.include(`${certificates[index].pixScore}`);
        expect(pageContent).to.include(translate('certification.meshlevel.CORE.LEVEL_INDEPENDENT_3.label'));
        expect(pageContent).to.include(translate('certification.meshlevel.CORE.LEVEL_INDEPENDENT_3.summary.user'));
        expect(pageContent).to.include(translate('certification.meshlevel.CORE.LEVEL_INDEPENDENT_3.description.user'));
        expect(pageContent).to.include(`${certificates[index].maxReachableScore}`);
        expect(pageContent).to.not.include(translate('certification.certificate.v3.complementary-content.title'));
      });
    });

    it('snapshot', async function () {
      // given
      const certificates = [
        domainBuilder.certification.results.buildCertificate({
          id: 123,
          firstName: 'Alain',
          lastName: 'Cendy',
          birthdate: '1977-04-14',
          birthplace: 'Saint-Ouen',
          isPublished: true,
          userId: 456,
          date: new Date('2020-01-01'),
          verificationCode: 'P-SOMECODE',
          deliveredAt: new Date('2021-05-05'),
          certificationCenter: "L'université du Pix /",
          pixScore: 256,
          reachedMeshIndex: 3,
          sessionId: 789,
        }),
      ];
      const referencePdfPath = 'certificate-test.pdf';
      const pdfStream = await generate({ certificates, i18n });
      const pdfBuffer = await _convertStreamToBuffer(pdfStream);
      // To update the reference PDF (snapshot), pass `dryRun = false` to `_writeFile`,
      // run this test once to regenerate the file, then revert `dryRun` to `true`.
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
          domainBuilder.certification.results.buildCertificate({
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
            reachedMeshIndex: 0,
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

    describe('when the candidate acquired a complementary certification (CLEA only)', function () {
      it('should display the complementary certification section', async function () {
        // given
        const certificates = [
          domainBuilder.certification.results.buildCertificate({
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
            acquiredComplementaryCertification: { label: 'CléA Numérique' },
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

        expect(content).to.include(translate('certification.certificate.v3.complementary-content.title'));
      });
    });
  });

  for (const { framework, reachedMeshIndex, expectedLevel } of [
    { framework: Frameworks.DROIT, reachedMeshIndex: 1, expectedLevel: 'LEVEL_CONFIRMED' },
    { framework: Frameworks.PRO_SANTE, reachedMeshIndex: 2, expectedLevel: 'LEVEL_ADVANCED' },
  ]) {
    describe(`for a Pix+ ${framework} certification`, function () {
      it('should display Pix+ title, framework label, and level', async function () {
        // given
        const certificates = [
          domainBuilder.certification.results.buildCertificate({
            firstName: 'Marie',
            lastName: 'Durand',
            birthdate: '1985-03-21',
            birthplace: 'Lyon',
            verificationCode: 'P-PIXPLUS',
            deliveredAt: new Date('2024-02-10'),
            certificationCenter: 'Centre de certification',
            pixScore: 300,
            reachedMeshIndex,
            certificationFramework: framework,
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

        expect(content).to.include(translate('certification.certificate.v3.main-content.title-pix-plus'));
        expect(content).to.include(translate(`certification.certificate.v3.pix-plus-labels.${framework}`));
        expect(content).to.include('Marie DURAND');
        expect(content).to.include('P-PIXPLUS');
        expect(content).to.include(translate('certification.certificate.v3.score-content.level-explanation.user'));
        expect(content).to.include(translate(`certification.meshlevel.${framework}.${expectedLevel}.label`));
        expect(content).to.include(translate(`certification.meshlevel.${framework}.${expectedLevel}.summary.user`));
        expect(content).to.not.include(translate('certification.certificate.v3.complementary-content.title'));
      });
    });
  }

  describe('for a Pix+ EDU certification', function () {
    for (const { framework, eduV3ExternalJuryResult, expectedLevel } of [
      { framework: Frameworks.EDU_1ER_DEGRE, eduV3ExternalJuryResult: null, expectedLevel: 'LEVEL_ADMISSIBLE' },
      { framework: Frameworks.EDU_2ND_DEGRE, eduV3ExternalJuryResult: 'ADVANCED', expectedLevel: 'LEVEL_ADVANCED' },
      { framework: Frameworks.EDU_CPE, eduV3ExternalJuryResult: 'EXPERT', expectedLevel: 'LEVEL_EXPERT' },
    ]) {
      it(`should display the ${expectedLevel} level for ${framework}`, async function () {
        // given
        const certificates = [
          domainBuilder.certification.results.buildCertificate({
            firstName: 'Sophie',
            lastName: 'Leroy',
            birthdate: '1988-11-05',
            birthplace: 'Toulouse',
            verificationCode: 'P-EDUPIX',
            deliveredAt: new Date('2024-02-10'),
            certificationCenter: 'INSPE de Toulouse',
            pixScore: 280,
            reachedMeshIndex: 0,
            certificationFramework: framework,
            eduV3ExternalJuryResult,
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

        expect(content).to.include(translate('certification.certificate.v3.main-content.title-pix-plus'));
        expect(content).to.include(translate(`certification.certificate.v3.pix-plus-labels.${framework}`));
        expect(content).to.include('Sophie LEROY');
        expect(content).to.include(translate(`certification.meshlevel.${framework}.${expectedLevel}.label`));
        expect(content).to.include(translate(`certification.meshlevel.${framework}.${expectedLevel}.summary.user`));
      });
    }
  });

  describe('Pix+ snapshot', function () {
    it('snapshot', async function () {
      // given
      const certificates = [
        domainBuilder.certification.results.buildCertificate({
          id: 300,
          firstName: 'Marie',
          lastName: 'Durand',
          birthdate: '1985-03-21',
          birthplace: 'Lyon',
          verificationCode: 'P-PIXPLUS',
          deliveredAt: new Date('2024-02-10'),
          certificationCenter: "L'université du Pix /",
          pixScore: 300,
          reachedMeshIndex: 1,
          certificationFramework: Frameworks.DROIT,
        }),
      ];
      const referencePdfPath = 'pix-plus-certificate-test.pdf';
      const pdfStream = await generate({ certificates, i18n });
      const pdfBuffer = await _convertStreamToBuffer(pdfStream);
      // To update the reference PDF (snapshot), pass `dryRun = false` to `_writeFile`,
      // run this test once to regenerate the file, then revert `dryRun` to `true`.
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
