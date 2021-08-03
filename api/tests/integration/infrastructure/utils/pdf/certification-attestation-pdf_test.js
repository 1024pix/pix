const { domainBuilder, expect } = require('../../../../test-helper');
const { isSameBinary } = require('../../../../tooling/binary-comparator');
const { getCertificationAttestationsPdfBuffer } = require('../../../../../lib/infrastructure/utils/pdf/certification-attestation-pdf');

const { addRandomSuffix } = require('pdf-lib/cjs/utils');

describe('Integration | Infrastructure | Utils | Pdf | Certification Attestation Pdf', function() {

  beforeEach(function() {
    _makePdfLibPredictable();
  });

  afterEach(function() {
    _restorePdfLib();
  });

  it('should generate full attestation (non-regression test)', async function() {
    // given
    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree();
    const certificate = domainBuilder.buildCertificationAttestation({
      id: 1,
      firstName: 'Jean',
      lastName: 'Bon',
      resultCompetenceTree,
      cleaCertificationImagePath: 'lib/infrastructure/utils/pdf/files/macaron_clea.png',
      pixPlusDroitCertificationImagePath: 'lib/infrastructure/utils/pdf/files/macaron_maitre.png',
    });
    const referencePdfPath = __dirname + '/certification-attestation-pdf_test_full.pdf';

    // when
    const { buffer } = await getCertificationAttestationsPdfBuffer({
      certificates: [certificate],
      creationDate: new Date('2021-01-01'),
    });

    // Note: to update the reference pdf, you can run the test with the followling lines.
    //
    // const { writeFile } = require('fs/promises');
    // await writeFile(referencePdfPath, buffer);

    // then
    expect(await isSameBinary(referencePdfPath, buffer)).to.be.true;
  });

  it('should generate a page per certificate', async function() {
    // given
    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree();
    const certificateWithCleaAndPixPlusDroitMaitre = domainBuilder.buildCertificationAttestation({
      id: 1,
      firstName: 'Jean',
      lastName: 'Bon',
      resultCompetenceTree,
      cleaCertificationImagePath: 'lib/infrastructure/utils/pdf/files/macaron_clea.png',
      pixPlusDroitCertificationImagePath: 'lib/infrastructure/utils/pdf/files/macaron_maitre.png',
    });
    const certificateWithCleaAndPixPlusDroitExpert = domainBuilder.buildCertificationAttestation({
      id: 2,
      firstName: 'Harry',
      lastName: 'Covert',
      resultCompetenceTree,
      cleaCertificationImagePath: 'lib/infrastructure/utils/pdf/files/macaron_clea.png',
      pixPlusDroitCertificationImagePath: 'lib/infrastructure/utils/pdf/files/macaron_expert.png',
    });
    const certificateWithoutCleaNorPixPlusDroit = domainBuilder.buildCertificationAttestation({
      ...certificateWithCleaAndPixPlusDroitMaitre,
      id: 2,
      firstName: 'Marc',
      lastName: 'Decaffé',
      cleaCertificationImagePath: null,
      pixPlusDroitCertificationImagePath: null,
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
    if (suffixLength === void 0) { suffixLength = 4; }

    const suffix = (suffixes.get(prefix) ?? Math.pow(10, suffixLength)) + 1;
    suffixes.set(prefix, suffix);

    return prefix + '-' + Math.floor(suffix);
  }

  require('pdf-lib/cjs/utils').addRandomSuffix = autoIncrementSuffixByPrefix;
}

function _restorePdfLib() {
  require('pdf-lib/cjs/utils').addRandomSuffix = addRandomSuffix;
}
