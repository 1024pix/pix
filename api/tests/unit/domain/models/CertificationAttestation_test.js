const { expect, domainBuilder } = require('../../../test-helper');
const { PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2, PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF } =
  require('../../../../lib/domain/models/Badge').keys;

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

  context('#getAcquiredCleaCertification', function () {
    it('should return the acquired PIX_EMPLOI_CLEA badge', function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        acquiredPartnerCertificationKeys: ['OTHER_BADGE', PIX_EMPLOI_CLEA],
      });

      // when
      const acquiredCleaCertification = certificationAttestation.getAcquiredCleaCertification();

      // expect
      expect(acquiredCleaCertification).to.deep.equal(PIX_EMPLOI_CLEA);
    });

    it('should return the acquired PIX_EMPLOI_CLEA_V2 badge', function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        acquiredPartnerCertificationKeys: ['OTHER_BADGE', PIX_EMPLOI_CLEA_V2],
      });

      // when
      const acquiredCleaCertification = certificationAttestation.getAcquiredCleaCertification();

      // expect
      expect(acquiredCleaCertification).to.deep.equal(PIX_EMPLOI_CLEA_V2);
    });

    it('should return undefined if no clea badge has been acquired', function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        acquiredPartnerCertificationKeys: ['OTHER_BADGE_1', 'OTHER_BADGE_2'],
      });

      // when
      const acquiredCleaCertification = certificationAttestation.getAcquiredCleaCertification();

      // expect
      expect(acquiredCleaCertification).to.be.undefined;
    });
  });

  context('#getAcquiredPixPlusDroitCertification', function () {
    it('should return the acquired PIX_DROIT_MAITRE_CERTIF badge', function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        acquiredPartnerCertificationKeys: ['OTHER_BADGE', PIX_DROIT_MAITRE_CERTIF],
      });

      // when
      const acquiredPixPlusDroitCertification = certificationAttestation.getAcquiredPixPlusDroitCertification();

      // expect
      expect(acquiredPixPlusDroitCertification).to.deep.equal(PIX_DROIT_MAITRE_CERTIF);
    });

    it('should return the acquired PIX_DROIT_EXPERT_CERTIF badge', function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        acquiredPartnerCertificationKeys: ['OTHER_BADGE', PIX_DROIT_EXPERT_CERTIF],
      });

      // when
      const acquiredPixPlusDroitCertification = certificationAttestation.getAcquiredPixPlusDroitCertification();

      // expect
      expect(acquiredPixPlusDroitCertification).to.deep.equal(PIX_DROIT_EXPERT_CERTIF);
    });

    it('should return undefined if no Pix+ Droit badge has been acquired', function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        acquiredPartnerCertificationKeys: ['OTHER_BADGE_1', 'OTHER_BADGE_2'],
      });

      // when
      const acquiredPixPlusDroitCertification = certificationAttestation.getAcquiredPixPlusDroitCertification();

      // expect
      expect(acquiredPixPlusDroitCertification).to.be.undefined;
    });
  });

  context('#hasAcquiredAnyComplementaryCertifications', function () {
    it('should return true if certified badge images for attestation is not empty', function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        acquiredPartnerCertificationKeys: [PIX_EMPLOI_CLEA],
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
        acquiredPartnerCertificationKeys: [],
      });

      // when
      const hasAcquiredAnyComplementaryCertifications =
        certificationAttestation.hasAcquiredAnyComplementaryCertifications();

      // expect
      expect(hasAcquiredAnyComplementaryCertifications).to.be.false;
    });
  });
});
