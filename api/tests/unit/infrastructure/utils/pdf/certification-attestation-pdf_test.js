const { expect, domainBuilder } = require('../../../../test-helper');
const { getCertificationAttestationsPdfBuffer, _forTestOnly } = require('../../../../../lib/infrastructure/utils/pdf/certification-attestation-pdf');
require('approvals')
  .mocha();
const jsonCycle = require('json-cycle');

describe('Unit | Infrastructure | Utils | Pdf | Certification Attestation Pdf', function() {
  it('should generate full attestation (non-regression test)', async function() {
    this.timeout(5000);
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

    // when
    const { fileName } = await getCertificationAttestationsPdfBuffer({
      certificates: [certificate],
    });

    this.verifyAsJSON(jsonCycle.decycle(_forTestOnly.generatedPdfDoc),
      {
        reporters: ['gitdiff'],
      });
    expect(fileName).to.equal('attestation-pix-20181003.pdf');
  });

  it('should generate a page per certificate', async function() {
    this.timeout(5000);
    // given
    const resultCompetenceTree = domainBuilder.buildResultCompetenceTree();
    const certificate1 = domainBuilder.buildCertificationAttestation({
      id: 1,
      firstName: 'Jean',
      lastName: 'Bon',
      resultCompetenceTree,
      cleaCertificationImagePath: 'lib/infrastructure/utils/pdf/files/macaron_clea.png',
      pixPlusDroitCertificationImagePath: 'lib/infrastructure/utils/pdf/files/macaron_maitre.png',
    });
    const certificate2 = domainBuilder.buildCertificationAttestation({
      ...certificate1,
      id: 2,
      firstName: 'Jeanne',
      lastName: 'Bonne',
      cleaCertificationImagePath: null,
      pixPlusDroitCertificationImagePath: null,
    });

    // when
    await getCertificationAttestationsPdfBuffer({
      certificates: [certificate1, certificate2],
    });

    // then
    this.verifyAsJSON(jsonCycle.decycle(_forTestOnly.generatedPdfDoc),
      {
        reporters: ['gitdiff'],
      });
  });
});

