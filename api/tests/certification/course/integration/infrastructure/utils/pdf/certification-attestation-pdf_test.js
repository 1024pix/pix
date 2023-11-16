import { domainBuilder, expect, nock, catchErr, sinon } from '../../../../../../test-helper.js';
import dayjs from 'dayjs';
import { isSameBinary } from '../../../../../../tooling/binary-comparator.js';
import { getCertificationAttestationsPdfBuffer } from '../../../../../../../src/certification/course/infrastructure/utils/pdf/certification-attestation-pdf.js';
import { CertificationAttestationGenerationError } from '../../../../../../../src/shared/domain/errors.js';
import fs from 'fs';
import pdfLibUtils from 'pdf-lib/cjs/utils/index.js';
import { writeFile } from 'fs/promises';
import * as url from 'url';
import { getI18n } from '../../../../../../tooling/i18n/i18n.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Infrastructure | Utils | Pdf | Certification Attestation Pdf', function () {
  beforeEach(async function () {
    _makePdfLibPredictable();

    nock('https://images.pix.fr')
      .get('/stickers/macaron_clea.pdf')
      // eslint-disable-next-line no-sync
      .reply(200, () => fs.readFileSync(`${__dirname}/stickers/macaron_clea.pdf`))
      .get('/stickers/macaron_droit_avance.pdf')
      // eslint-disable-next-line no-sync
      .reply(200, () => fs.readFileSync(`${__dirname}/stickers/macaron_droit_avance.pdf`))
      .get('/stickers/macaron_edu_2nd_initie.pdf')
      // eslint-disable-next-line no-sync
      .reply(200, () => fs.readFileSync(`${__dirname}/stickers/macaron_edu_2nd_initie.pdf`))
      .get('/stickers/macaron_droit_expert.pdf')
      // eslint-disable-next-line no-sync
      .reply(200, () => fs.readFileSync(`${__dirname}/stickers/macaron_droit_expert.pdf`));
  });

  it('should generate full attestation (non-regression test)', async function () {
    // given
    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree();
    const certificate = domainBuilder.buildCertificationAttestation({
      id: 1,
      firstName: 'Jean',
      lastName: 'Bon',
      resultCompetenceTree,
      certifiedBadges: [
        {
          stickerUrl: 'https://images.pix.fr/stickers/macaron_clea.pdf',
          message: null,
        },
        {
          stickerUrl: 'https://images.pix.fr/stickers/macaron_droit_avance.pdf',
          message: null,
        },
      ],
    });
    const referencePdfPath = 'certification-attestation-pdf_test_full.pdf';
    const i18n = getI18n();

    // when
    const { buffer } = await getCertificationAttestationsPdfBuffer({
      certificates: [certificate],
      isFrenchDomainExtension: true,
      i18n,
      creationDate: new Date('2021-01-01'),
    });

    await _writeFile(buffer, referencePdfPath);

    // then
    expect(
      await isSameBinary(`${__dirname}/${referencePdfPath}`, buffer),
      referencePdfPath + ' is not generated as expected',
    ).to.be.true;
  });

  it('should generate full attestation with Pix+ Édu temporary badge', async function () {
    // given
    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree();
    const certificate = domainBuilder.buildCertificationAttestation({
      id: 1,
      firstName: 'Jean',
      lastName: 'Bon',
      resultCompetenceTree,
      certifiedBadges: [
        {
          stickerUrl: 'https://images.pix.fr/stickers/macaron_edu_2nd_initie.pdf',
          message:
            'Vous avez obtenu le niveau “Pix+ Édu 2nd degré Initié (entrée dans le métier)” dans le cadre du volet 1 de la certification Pix+Édu. Votre niveau final sera déterminé à l’issue du volet 2',
        },
      ],
    });
    const referencePdfPath = 'certification-attestation-pdf_test_full_edu_temporary.pdf';
    const i18n = getI18n();

    // when
    const { buffer } = await getCertificationAttestationsPdfBuffer({
      certificates: [certificate],
      isFrenchDomainExtension: true,
      i18n,
      creationDate: new Date('2021-01-01'),
    });

    await _writeFile(buffer, referencePdfPath);

    // then
    expect(
      await isSameBinary(`${__dirname}/${referencePdfPath}`, buffer),
      referencePdfPath + ' is not generated as expected',
    ).to.be.true;
  });

  it('should generate full attestation with Pix+ Édu definitive badge', async function () {
    // given
    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree();
    const certificate = domainBuilder.buildCertificationAttestation({
      id: 1,
      firstName: 'Jean',
      lastName: 'Bon',
      resultCompetenceTree,
      certifiedBadges: [
        {
          stickerUrl: 'https://images.pix.fr/stickers/macaron_edu_2nd_initie.pdf',
          message:
            'Vous avez obtenu la certification Pix+Edu niveau "Pix+ Édu 2nd degré Initié (entrée dans le métier)"',
        },
      ],
    });
    const referencePdfPath = 'certification-attestation-pdf_test_full_edu.pdf';
    const i18n = getI18n();

    // when
    const { buffer } = await getCertificationAttestationsPdfBuffer({
      certificates: [certificate],
      isFrenchDomainExtension: true,
      i18n,
      creationDate: new Date('2021-01-01'),
    });

    await _writeFile(buffer, referencePdfPath);

    // then
    expect(
      await isSameBinary(`${__dirname}/${referencePdfPath}`, buffer),
      referencePdfPath + ' is not generated as expected',
    ).to.be.true;
  });

  it('should generate a page per certificate', async function () {
    // given
    const professionalizingValidityStartDate = new Date('2022-01-01');
    const deliveredBeforeStartDate = dayjs(professionalizingValidityStartDate).subtract(1, 'days').toDate();
    const deliveredAfterStartDate = dayjs(professionalizingValidityStartDate).add(1, 'days').toDate();

    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree();
    const certificateWithComplementaryCertificationsAndWithoutProfessionalizingMessage =
      domainBuilder.buildCertificationAttestation({
        id: 1,
        firstName: 'Jean',
        lastName: 'Bon',
        resultCompetenceTree,
        certifiedBadges: [
          {
            stickerUrl: 'https://images.pix.fr/stickers/macaron_clea.pdf',
            message: null,
          },
          {
            stickerUrl: 'https://images.pix.fr/stickers/macaron_droit_expert.pdf',
            message: null,
          },
        ],
        deliveredAt: deliveredBeforeStartDate,
      });
    const certificateWithComplementaryCertificationsAndWithProfessionalizingMessage =
      domainBuilder.buildCertificationAttestation({
        id: 2,
        firstName: 'Harry',
        lastName: 'Covert',
        resultCompetenceTree,
        certifiedBadges: [
          {
            stickerUrl: 'https://images.pix.fr/stickers/macaron_clea.pdf',
            message: null,
          },
          {
            stickerUrl: 'https://images.pix.fr/stickers/macaron_droit_avance.pdf',
            message: null,
          },
        ],
        deliveredAt: deliveredAfterStartDate,
      });
    const certificateWithoutComplementaryCertificationsAndWithoutProfessionalizingMessage =
      domainBuilder.buildCertificationAttestation({
        ...certificateWithComplementaryCertificationsAndWithoutProfessionalizingMessage,
        id: 2,
        firstName: 'Marc',
        lastName: 'Decaffé',
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        certifiedBadges: [],
        deliveredAt: deliveredBeforeStartDate,
      });
    const certificateComplementaryCertificationsAndWithProfessionalizingMessage =
      domainBuilder.buildCertificationAttestation({
        ...certificateWithComplementaryCertificationsAndWithoutProfessionalizingMessage,
        id: 2,
        firstName: 'Quentin',
        lastName: 'Bug Arrive En Prod',
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        certifiedBadges: [],
        deliveredAt: deliveredAfterStartDate,
      });
    const referencePdfPath = 'certification-attestation-pdf_several_pages.pdf';
    const i18n = getI18n();

    // when
    const { buffer } = await getCertificationAttestationsPdfBuffer({
      certificates: [
        certificateWithComplementaryCertificationsAndWithoutProfessionalizingMessage,
        certificateWithComplementaryCertificationsAndWithProfessionalizingMessage,
        certificateWithoutComplementaryCertificationsAndWithoutProfessionalizingMessage,
        certificateComplementaryCertificationsAndWithProfessionalizingMessage,
      ],
      isFrenchDomainExtension: true,
      i18n,
      creationDate: new Date('2021-01-01'),
    });

    await _writeFile(buffer, referencePdfPath);

    // then
    expect(
      await isSameBinary(`${__dirname}/${referencePdfPath}`, buffer),
      referencePdfPath + ' is not generated as expected',
    ).to.be.true;
  });

  it('should throw a CertificationAttestationGenerationError when a sticker cannot be retrieved', async function () {
    // given
    nock('https://images.pix.fr').get('/stickers/macaron.pdf').reply(503);

    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree();
    const certificate = domainBuilder.buildCertificationAttestation({
      id: 1,
      firstName: 'Jean',
      lastName: 'Bon',
      resultCompetenceTree,
      certifiedBadges: [
        {
          stickerUrl: 'https://images.pix.fr/stickers/macaron.pdf',
        },
      ],
    });
    const i18n = getI18n();

    // when
    const error = await catchErr(getCertificationAttestationsPdfBuffer)({
      certificates: [certificate],
      isFrenchDomainExtension: true,
      i18n,
      creationDate: new Date('2021-01-01'),
    });

    // then
    expect(error).to.be.an.instanceOf(CertificationAttestationGenerationError);
  });

  it('should generate certification confirmation in english', async function () {
    // given
    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree();
    const certificate = domainBuilder.buildCertificationAttestation({
      id: 1,
      firstName: 'Jean',
      lastName: 'Bon',
      resultCompetenceTree,
      certifiedBadges: [],
    });
    const referencePdfPath = 'EN-certification-confirmation-pdf_test.pdf';
    const i18n = getI18n();
    i18n.setLocale('en');

    // when
    const { buffer } = await getCertificationAttestationsPdfBuffer({
      certificates: [certificate],
      isFrenchDomainExtension: false,
      i18n,
      creationDate: new Date('2021-01-01'),
    });

    await _writeFile(buffer, referencePdfPath);

    // then
    expect(
      await isSameBinary(`${__dirname}/${referencePdfPath}`, buffer),
      referencePdfPath + ' is not generated as expected',
    ).to.be.true;
  });
});

async function _writeFile(buffer, outputFilename, dryRun = true) {
  // Note: to update or create the reference pdf, set dryRun to false.
  if (!dryRun) {
    await writeFile(`${__dirname}/${outputFilename}`, buffer);
  }
}

// Warning: call _restorePdfLib() when finished /!\
function _makePdfLibPredictable() {
  const suffixes = new Map();

  function autoIncrementSuffixByPrefix(prefix, suffixLength) {
    if (suffixLength === void 0) {
      suffixLength = 4;
    }

    const suffix = (suffixes.get(prefix) ?? Math.pow(10, suffixLength)) + 1;
    suffixes.set(prefix, suffix);

    return prefix + '-' + Math.floor(suffix);
  }

  sinon.stub(pdfLibUtils, 'addRandomSuffix').callsFake(autoIncrementSuffixByPrefix);
}
