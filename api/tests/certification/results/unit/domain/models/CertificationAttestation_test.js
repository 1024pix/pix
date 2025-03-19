import { SESSIONS_VERSIONS } from '../../../../../../src/certification/shared/domain/models/SessionVersion.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | CertificationAttestation', function () {
  context('#setResultCompetenceTree', function () {
    it('should set the resultCompetenceTree on CertificationAttestation model', function () {
      // given
      const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({ id: 'someId' });
      const certificationAttestation = domainBuilder.buildCertificationAttestation({ version: SESSIONS_VERSIONS.V2 });

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
        version: SESSIONS_VERSIONS.V2,
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
        version: SESSIONS_VERSIONS.V2,
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
