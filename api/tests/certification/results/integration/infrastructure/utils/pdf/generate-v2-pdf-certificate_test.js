import { readFile, writeFile } from 'node:fs/promises';
import url from 'node:url';

import dayjs from 'dayjs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

import { generate } from '../../../../../../../src/certification/results/infrastructure/utils/pdf/generate-v2-pdf-certificate.js';
import { AlgorithmEngineVersion } from '../../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { ComplementaryCertificationKeys } from '../../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { getI18n } from '../../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';
import { buildCompetenceMark } from '../../../../../../tooling/domain-builder/factory/index.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Infrastructure | Utils | Pdf | V2 Certificate Pdf', function () {
  let i18n, translate;

  beforeEach(function () {
    i18n = getI18n();
    translate = i18n.__;
  });

  it('should generate a PDF buffer', async function () {
    // given
    const certificate = domainBuilder.buildCertificationAttestation({
      id: 1,
      version: AlgorithmEngineVersion.V2,
      firstName: 'Jean',
      lastName: 'Bon',
      resultCompetenceTree: _buildResultCompetenceTree(),
      certifiedBadges: [
        {
          stickerUrl: 'http://example.net/stickers/macaron_pixclea.pdf',
          message: null,
        },
      ],
    });
    const certificates = [certificate];

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
      domainBuilder.buildCertificationAttestation({
        version: AlgorithmEngineVersion.V2,
        resultCompetenceTree: _buildResultCompetenceTree(),
      }),
      domainBuilder.buildCertificationAttestation({
        version: AlgorithmEngineVersion.V2,
        resultCompetenceTree: _buildResultCompetenceTree(),
      }),
    ];

    // when
    const pdfStream = await generate({
      certificates,
      i18n,
    });

    const pdfBuffer = await _convertStreamToBuffer(pdfStream);

    // then
    expect(pdfBuffer.toString()).to.contain('/Type /Pages\n/Count 2');
  });

  it('snapshot', async function () {
    // given
    const certificates = [
      domainBuilder.buildCertificationAttestation({
        id: 1,
        version: AlgorithmEngineVersion.V2,
        firstName: 'Jean',
        lastName: 'Bon',
        resultCompetenceTree: _buildResultCompetenceTree(),
      }),
    ];
    const referencePdfPath = 'v2-certificate-test.pdf';
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

  it('should display data content', async function () {
    // given
    const certificate = domainBuilder.buildCertificationAttestation({
      id: 1,
      version: AlgorithmEngineVersion.V2,
      firstName: 'Jean',
      lastName: 'Bon',
      resultCompetenceTree: _buildResultCompetenceTree(),
      certifiedBadges: [
        {
          stickerUrl: 'http://example.net/stickers/macaron_pixclea.pdf',
          message: null,
        },
      ],
    });
    const certificates = [certificate];

    // when
    const pdfStream = await generate({ certificates, i18n, isFrenchDomainExtension: true });
    const pdfBuffer = await _convertStreamToBuffer(pdfStream);

    // then
    const content = await _getPDFContent(pdfBuffer);

    expect(content).to.include(translate('certification.certificate.v2.title'));
    expect(content).to.include(translate('certification.certificate.v2.description'));

    expect(content).to.include(translate('certification.certificate.v2.main-content.first-and-last-names'));
    expect(content).to.include(`${certificates[0].firstName} ${certificates[0].lastName}`);
    expect(content).to.include(translate('certification.certificate.v2.main-content.certification-center'));
    expect(content).to.include(`${certificates[0].certificationCenter}`);
    expect(content).to.include(translate('certification.certificate.v2.main-content.birth'));
    expect(content).to.include(
      `${dayjs(certificates[0].birthdate).format('DD/MM/YYYY')} à ${certificates[0].birthplace}`,
    );
    expect(content).to.include(translate('certification.certificate.v2.main-content.delivered-at'));
    expect(content).to.include(`${dayjs(certificates[0].deliveredAt).format('DD/MM/YYYY')}`);

    expect(content).to.include(translate('certification.certificate.v2.qr-code-content.title'));
    expect(content).to.include(translate('certification.certificate.v2.qr-code-content.verification-code'));
    expect(content).to.include(translate('certification.certificate.v2.qr-code-content.link.description'));
    expect(content).to.include(`${certificates[0].verificationCode}`);

    expect(content).to.include(`${certificates[0].pixScore}`);
    expect(content).to.include(`${certificates[0].maxReachableScore}`);
  });

  describe('_isDeliveredAfterProfessionalizingStartDate', function () {
    describe('when the certification was issued before France Compétences validity date', function () {
      it('should not display the professionalizing certification message in certificate', async function () {
        // given
        const certificate = domainBuilder.buildCertificationAttestation({
          id: 1,
          version: AlgorithmEngineVersion.V2,
          firstName: 'Jean',
          lastName: 'Bon',
          deliveredAt: new Date('2017-10-03T01:02:03Z'),
          resultCompetenceTree: _buildResultCompetenceTree(),
        });
        const certificates = [certificate];

        // when
        const pdfStream = await generate({ certificates, i18n, isFrenchDomainExtension: true });
        const pdfBuffer = await _convertStreamToBuffer(pdfStream);

        // then
        const content = await _getPDFContent(pdfBuffer);
        expect(content).to.not.include('Le certificat Pix est reconnu comme professionnalisant par France compétences');
      });
    });

    describe('when the domain is EN', function () {
      it('should not display the professionalizing certification message in certificate', async function () {
        // given
        const certificate = domainBuilder.buildCertificationAttestation({
          id: 1,
          version: AlgorithmEngineVersion.V2,
          firstName: 'Jean',
          lastName: 'Bon',
          deliveredAt: new Date('2023-10-03T01:02:03Z'),
          resultCompetenceTree: _buildResultCompetenceTree(),
        });
        const certificates = [certificate];

        // when
        const pdfStream = await generate({ certificates, i18n, isFrenchDomainExtension: false });
        const pdfBuffer = await _convertStreamToBuffer(pdfStream);

        // then
        const content = await _getPDFContent(pdfBuffer);
        expect(content).to.not.include('Le certificat Pix est reconnu comme professionnalisant par France compétences');
      });
    });

    it('should display the professionalizing certification message in certificate', async function () {
      // given
      const certificate = domainBuilder.buildCertificationAttestation({
        id: 1,
        version: AlgorithmEngineVersion.V2,
        firstName: 'Jean',
        lastName: 'Bon',
        deliveredAt: new Date('2023-10-03T01:02:03Z'),
        resultCompetenceTree: _buildResultCompetenceTree(),
      });
      const certificates = [certificate];

      // when
      const pdfStream = await generate({ certificates, i18n, isFrenchDomainExtension: true });
      const pdfBuffer = await _convertStreamToBuffer(pdfStream);

      // then
      const content = await _getPDFContent(pdfBuffer);
      expect(content).to.include('Le certificat Pix est reconnu comme professionnalisant par France compétences');
    });
  });

  describe('when the max reachable level passed during certification is lower than level 8', function () {
    it('should display the message for absolute max level in certificate', async function () {
      // given
      const certificate = domainBuilder.buildCertificationAttestation({
        id: 1,
        version: AlgorithmEngineVersion.V2,
        firstName: 'Jean',
        lastName: 'Bon',
        deliveredAt: new Date('2017-10-03T01:02:03Z'),
        maxReachableLevelOnCertificationDate: 5,
        resultCompetenceTree: _buildResultCompetenceTree(),
      });
      const certificates = [certificate];

      // when
      const pdfStream = await generate({ certificates, i18n, isFrenchDomainExtension: true });
      const pdfBuffer = await _convertStreamToBuffer(pdfStream);

      // then
      const content = await _getPDFContent(pdfBuffer);
      expect(content).to.include(translate('certification.certificate.v2.score-content.absolute-max-level-indication'));
    });
  });

  describe('when the max reachable level passed during certification is 8', function () {
    it('should not display the message for absolute max level in certificate', async function () {
      // given
      const certificate = domainBuilder.buildCertificationAttestation({
        id: 1,
        version: AlgorithmEngineVersion.V2,
        firstName: 'Jean',
        lastName: 'Bon',
        deliveredAt: new Date('2017-10-03T01:02:03Z'),
        maxReachableLevelOnCertificationDate: 8,
        resultCompetenceTree: _buildResultCompetenceTree(),
      });
      const certificates = [certificate];

      // when
      const pdfStream = await generate({ certificates, i18n, isFrenchDomainExtension: true });
      const pdfBuffer = await _convertStreamToBuffer(pdfStream);

      // then
      const content = await _getPDFContent(pdfBuffer);
      expect(content).to.not.include(
        translate('certification.certificate.v2.score-content.absolute-max-level-indication'),
      );
    });
  });

  describe('when the candidate acquired a complementary certification', function () {
    it('should display complementary certification information', async function () {
      // given
      const certificate = domainBuilder.buildCertificationAttestation({
        id: 1,
        version: AlgorithmEngineVersion.V2,
        firstName: 'Jean',
        lastName: 'Bon',
        deliveredAt: new Date('2017-10-03T01:02:03Z'),
        maxReachableLevelOnCertificationDate: 8,
        resultCompetenceTree: _buildResultCompetenceTree(),
        certifiedBadges: [
          {
            stickerUrl: 'http://example.net/stickers/macaron_pixdroit_avance.pdf',
            message: 'Vous avez réussi !',
            key: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
          },
        ],
      });
      const certificates = [certificate];

      // when
      const pdfStream = await generate({ certificates, i18n, isFrenchDomainExtension: true });
      const pdfBuffer = await _convertStreamToBuffer(pdfStream);

      // then
      const content = await _getPDFContent(pdfBuffer);
      expect(content).to.include(translate('certification.certificate.v2.complementary-certification-title'));
      expect(content).to.include(translate('Vous avez réussi !'));
    });

    it('snapshot', async function () {
      // given
      const certificate = domainBuilder.buildCertificationAttestation({
        id: 1,
        version: AlgorithmEngineVersion.V2,
        firstName: 'Jean',
        lastName: 'Bon',
        deliveredAt: new Date('2017-10-03T01:02:03Z'),
        maxReachableLevelOnCertificationDate: 8,
        resultCompetenceTree: _buildResultCompetenceTree(),
        certifiedBadges: [
          {
            stickerUrl: 'http://example.net/stickers/macaron_pixdroit_avance.pdf',
            message: 'Vous avez réussi !',
            key: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
          },
        ],
      });
      const referencePdfPath = 'v2-certificate-with-complementary-certification-test.pdf';
      const pdfStream = await generate({ certificates: [certificate], i18n });
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
  });
});

function _buildResultCompetenceTree() {
  return domainBuilder.buildResultCompetenceTree({
    competenceTree: domainBuilder.buildCompetenceTree({
      areas: [
        domainBuilder.buildArea({
          title: 'You',
          competences: [
            domainBuilder.buildCompetence(),
            domainBuilder.buildCompetence(),
            domainBuilder.buildCompetence(),
          ],
        }),
        domainBuilder.buildArea({
          id: 'recArea2',
          title: 'are',
          competences: [
            domainBuilder.buildCompetence({ id: 'recCOMP2', index: '1.2', areaId: 'recArea2' }),
            domainBuilder.buildCompetence({ id: 'recCOMP3', index: '1.2', areaId: 'recArea2' }),
            domainBuilder.buildCompetence({ id: 'recCOMP4', index: '1.2', areaId: 'recArea2' }),
            domainBuilder.buildCompetence({ id: 'recCOMP5', index: '1.2', areaId: 'recArea2' }),
          ],
        }),
        domainBuilder.buildArea({
          title: 'my',
          competences: [
            domainBuilder.buildCompetence(),
            domainBuilder.buildCompetence(),
            domainBuilder.buildCompetence(),
            domainBuilder.buildCompetence(),
          ],
        }),
        domainBuilder.buildArea({
          title: 'fire',
          competences: [
            domainBuilder.buildCompetence(),
            domainBuilder.buildCompetence(),
            domainBuilder.buildCompetence(),
            domainBuilder.buildCompetence(),
          ],
        }),
        domainBuilder.buildArea({
          title: '!',
          competences: [domainBuilder.buildCompetence(), domainBuilder.buildCompetence()],
        }),
      ],
    }),
    competenceMarks: [
      buildCompetenceMark(),
      [buildCompetenceMark({ level: -1, competence_code: '1.2', area_code: 'recArea2', competenceId: 'recCOMP3' })],
    ],
  });
}

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

async function _getPDFContent(pdfBuffer) {
  const parsedPdf = await getDocument({ data: new Uint8Array(pdfBuffer) }).promise;

  const page = await parsedPdf.getPage(1);
  const text = await page.getTextContent();
  return text.items.map((item) => item.str).join(' ');
}
