const { domainBuilder } = require('../../../../test-helper');
const { getCertificationAttestationsPdfBuffer, _forTestOnly } = require('../../../../../lib/infrastructure/utils/pdf/certification-attestation-pdf');
require('approvals')
  .mocha();
const jsonCycle = require('json-cycle');

describe('Integration | Infrastructure | Utils | Pdf | Certification Attestation Pdf', function() {
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
    await getCertificationAttestationsPdfBuffer({
      certificates: [certificate],
    });

    this.verifyAsJSON(jsonCycle.decycle(_forTestOnly.generatedPdfDoc),
      {
        reporters: ['gitdiff'],
      });
  });

  it('should generate a page per certificate', async function() {
    this.timeout(5000);
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

    // when
    await getCertificationAttestationsPdfBuffer({
      certificates: [
        certificateWithCleaAndPixPlusDroitMaitre,
        certificateWithCleaAndPixPlusDroitExpert,
        certificateWithoutCleaNorPixPlusDroit,
      ],
    });

    // then
    this.verifyAsJSON(jsonCycle.decycle(_forTestOnly.generatedPdfDoc),
      {
        reporters: ['gitdiff'],
      });
  });
});

