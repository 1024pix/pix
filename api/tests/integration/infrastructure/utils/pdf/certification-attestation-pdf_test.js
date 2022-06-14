const { domainBuilder, expect } = require('../../../../test-helper');
const moment = require('moment');
const { isSameBinary } = require('../../../../tooling/binary-comparator');
const {
  getCertificationAttestationsPdfBuffer,
} = require('../../../../../lib/infrastructure/utils/pdf/certification-attestation-pdf');
const {
  PIX_EMPLOI_CLEA_V3,
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
} = require('../../../../../lib/domain/models/Badge').keys;

const { addRandomSuffix } = require('pdf-lib/cjs/utils');

describe('Integration | Infrastructure | Utils | Pdf | Certification Attestation Pdf', function () {
  beforeEach(function () {
    _makePdfLibPredictable();
  });

  afterEach(function () {
    _restorePdfLib();
  });

  it('should generate full attestation (non-regression test)', async function () {
    // given
    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree();
    const certificate = domainBuilder.buildCertificationAttestation({
      id: 1,
      firstName: 'Jean',
      lastName: 'Bon',
      resultCompetenceTree,
      certifiedBadges: [{ partnerKey: PIX_EMPLOI_CLEA_V3 }, { partnerKey: PIX_DROIT_MAITRE_CERTIF }],
    });
    const referencePdfPath = 'certification-attestation-pdf_test_full.pdf';

    // when
    const { buffer } = await getCertificationAttestationsPdfBuffer({
      certificates: [certificate],
      creationDate: new Date('2021-01-01'),
    });

    await _writeFile(buffer, referencePdfPath);

    // then
    expect(
      await isSameBinary(`${__dirname}/${referencePdfPath}`, buffer),
      referencePdfPath + ' is not generated as expected'
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
      certifiedBadges: [{ partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE, isTemporaryBadge: true }],
    });
    const referencePdfPath = 'certification-attestation-pdf_test_full_edu_temporary.pdf';

    // when
    const { buffer } = await getCertificationAttestationsPdfBuffer({
      certificates: [certificate],
      creationDate: new Date('2021-01-01'),
    });

    await _writeFile(buffer, referencePdfPath);

    // then
    expect(
      await isSameBinary(`${__dirname}/${referencePdfPath}`, buffer),
      referencePdfPath + ' is not generated as expected'
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
      certifiedBadges: [{ partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE, isTemporaryBadge: false }],
    });
    const referencePdfPath = 'certification-attestation-pdf_test_full_edu.pdf';

    // when
    const { buffer } = await getCertificationAttestationsPdfBuffer({
      certificates: [certificate],
      creationDate: new Date('2021-01-01'),
    });

    await _writeFile(buffer, referencePdfPath);

    // then
    expect(
      await isSameBinary(`${__dirname}/${referencePdfPath}`, buffer),
      referencePdfPath + ' is not generated as expected'
    ).to.be.true;
  });

  it('should generate a page per certificate', async function () {
    // given
    const professionalizingValidityStartDate = new Date('2022-01-01');
    const deliveredBeforeStartDate = moment(professionalizingValidityStartDate).subtract(1, 'days').toDate();
    const deliveredAfterStartDate = moment(professionalizingValidityStartDate).add(1, 'days').toDate();

    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree();
    const certificateWithComplementaryCertificationsAndWithoutProfessionalizingMessage =
      domainBuilder.buildCertificationAttestation({
        id: 1,
        firstName: 'Jean',
        lastName: 'Bon',
        resultCompetenceTree,
        certifiedBadges: [{ partnerKey: PIX_EMPLOI_CLEA_V3 }, { partnerKey: PIX_DROIT_MAITRE_CERTIF }],
        deliveredAt: deliveredBeforeStartDate,
      });
    const certificateWithComplementaryCertificationsAndWithProfessionalizingMessage =
      domainBuilder.buildCertificationAttestation({
        id: 2,
        firstName: 'Harry',
        lastName: 'Covert',
        resultCompetenceTree,
        certifiedBadges: [{ partnerKey: PIX_EMPLOI_CLEA_V3 }, { partnerKey: PIX_DROIT_EXPERT_CERTIF }],
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

    // when
    const { buffer } = await getCertificationAttestationsPdfBuffer({
      certificates: [
        certificateWithComplementaryCertificationsAndWithoutProfessionalizingMessage,
        certificateWithComplementaryCertificationsAndWithProfessionalizingMessage,
        certificateWithoutComplementaryCertificationsAndWithoutProfessionalizingMessage,
        certificateComplementaryCertificationsAndWithProfessionalizingMessage,
      ],
      creationDate: new Date('2021-01-01'),
    });

    await _writeFile(buffer, referencePdfPath);

    // then
    expect(
      await isSameBinary(`${__dirname}/${referencePdfPath}`, buffer),
      referencePdfPath + ' is not generated as expected'
    ).to.be.true;
  });
});

async function _writeFile(buffer, outputFilename, dryRun = true) {
  // Note: to update the reference pdf, set dryRun to false.
  if (!dryRun) {
    const { writeFile } = require('fs/promises');
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

  require('pdf-lib/cjs/utils').addRandomSuffix = autoIncrementSuffixByPrefix;
}

function _restorePdfLib() {
  require('pdf-lib/cjs/utils').addRandomSuffix = addRandomSuffix;
}
