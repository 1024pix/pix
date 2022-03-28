const { domainBuilder, expect } = require('../../../../test-helper');
const { isSameBinary } = require('../../../../tooling/binary-comparator');
const {
  getCertificationAttestationsPdfBuffer,
} = require('../../../../../lib/infrastructure/utils/pdf/certification-attestation-pdf');
const {
  PIX_EMPLOI_CLEA,
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
      acquiredComplementaryCertifications: [{ partnerKey: PIX_EMPLOI_CLEA }, { partnerKey: PIX_DROIT_MAITRE_CERTIF }],
    });
    const referencePdfPath = __dirname + '/certification-attestation-pdf_test_full.pdf';

    // when
    const { buffer } = await getCertificationAttestationsPdfBuffer({
      certificates: [certificate],
      creationDate: new Date('2021-01-01'),
    });

    // Note: to update the reference pdf, you can run the test with the following lines.
    //
    // const { writeFile } = require('fs/promises');
    // await writeFile(referencePdfPath, buffer);

    // then
    expect(await isSameBinary(referencePdfPath, buffer)).to.be.true;
  });

  it('should generate full attestation with Pix+ Édu temporary badge', async function () {
    // given
    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree();
    const certificate = domainBuilder.buildCertificationAttestation({
      id: 1,
      firstName: 'Jean',
      lastName: 'Bon',
      resultCompetenceTree,
      acquiredComplementaryCertifications: [{ temporaryPartnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE }],
    });
    const referencePdfPath = __dirname + '/certification-attestation-pdf_test_full_edu_temporary.pdf';

    // when
    const { buffer } = await getCertificationAttestationsPdfBuffer({
      certificates: [certificate],
      creationDate: new Date('2021-01-01'),
    });

    // Note: to update the reference pdf, you can run the test with the following lines.
    //
    // const { writeFile } = require('fs/promises');
    // await writeFile(referencePdfPath, buffer);

    // then
    expect(await isSameBinary(referencePdfPath, buffer)).to.be.true;
  });

  it('should generate full attestation with Pix+ Édu definitive badge', async function () {
    // given
    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree();
    const certificate = domainBuilder.buildCertificationAttestation({
      id: 1,
      firstName: 'Jean',
      lastName: 'Bon',
      resultCompetenceTree,
      acquiredComplementaryCertifications: [{ partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE }],
    });
    const referencePdfPath = __dirname + '/certification-attestation-pdf_test_full_edu.pdf';

    // when
    const { buffer } = await getCertificationAttestationsPdfBuffer({
      certificates: [certificate],
      creationDate: new Date('2021-01-01'),
    });

    // Note: to update the reference pdf, you can run the test with the following lines.
    //
    // const { writeFile } = require('fs/promises');
    // await writeFile(referencePdfPath, buffer);

    // then
    expect(await isSameBinary(referencePdfPath, buffer)).to.be.true;
  });

  it('should generate a page per certificate', async function () {
    // given
    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree();
    const certificateWithCleaAndPixPlusDroitMaitre = domainBuilder.buildCertificationAttestation({
      id: 1,
      firstName: 'Jean',
      lastName: 'Bon',
      resultCompetenceTree,
      acquiredComplementaryCertifications: [{ partnerKey: PIX_EMPLOI_CLEA }, { partnerKey: PIX_DROIT_MAITRE_CERTIF }],
    });
    const certificateWithCleaAndPixPlusDroitExpert = domainBuilder.buildCertificationAttestation({
      id: 2,
      firstName: 'Harry',
      lastName: 'Covert',
      resultCompetenceTree,
      acquiredComplementaryCertifications: [{ partnerKey: PIX_EMPLOI_CLEA }, { partnerKey: PIX_DROIT_EXPERT_CERTIF }],
    });
    const certificateWithoutCleaNorPixPlusDroit = domainBuilder.buildCertificationAttestation({
      ...certificateWithCleaAndPixPlusDroitMaitre,
      id: 2,
      firstName: 'Marc',
      lastName: 'Decaffé',
      cleaCertificationImagePath: null,
      pixPlusDroitCertificationImagePath: null,
      acquiredComplementaryCertifications: [],
    });
    const referencePdfPath = __dirname + '/certification-attestation-pdf_several_pages.pdf';

    // when
    const { buffer } = await getCertificationAttestationsPdfBuffer({
      certificates: [
        certificateWithCleaAndPixPlusDroitMaitre,
        certificateWithCleaAndPixPlusDroitExpert,
        certificateWithoutCleaNorPixPlusDroit,
      ],
      creationDate: new Date('2021-01-01'),
    });

    // Note: to update the reference pdf, you can run the test with the followling lines.
    //
    // const { writeFile } = require('fs/promises');
    // await writeFile(referencePdfPath, buffer);

    // then
    expect(await isSameBinary(referencePdfPath, buffer)).to.be.true;
  });
});

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
