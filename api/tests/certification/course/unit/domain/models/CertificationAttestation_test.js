import { expect, domainBuilder } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | CertificationAttestation', function () {
  context('#setResultCompetenceTree', function () {
    it('should set the resultCompetenceTree on CertificationAttestation model', function () {
      // given
      const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({ id: 'someId' });
      const certificationAttestation = domainBuilder.buildCertificationAttestation();

      // when
      certificationAttestation.setResultCompetenceTree(resultCompetenceTree);

      // expect
      expect(certificationAttestation.resultCompetenceTree).to.deep.equal(resultCompetenceTree);
    });
  });

  context('#hasAcquiredAnyComplementaryCertifications', function () {
    it('should return true if certified badge for attestation is not empty', function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        certifiedBadges: [{ stickerUrl: 'https://images.pix.fr/stickers/test.pdf', message: null }],
      });

      // when
      const hasAcquiredAnyComplementaryCertifications =
        certificationAttestation.hasAcquiredAnyComplementaryCertifications();

      // expect
      expect(hasAcquiredAnyComplementaryCertifications).to.be.true;
    });

    it('should return false if certified badge images for attestation is empty', function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        certifiedBadges: [],
      });

      // when
      const hasAcquiredAnyComplementaryCertifications =
        certificationAttestation.hasAcquiredAnyComplementaryCertifications();

      // expect
      expect(hasAcquiredAnyComplementaryCertifications).to.be.false;
    });
  });
});
