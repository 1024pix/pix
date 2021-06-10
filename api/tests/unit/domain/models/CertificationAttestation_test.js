const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | CertificationAttestation', () => {

  context('#setResultCompetenceTree', () => {

    it('should set the resultCompetenceTree on CertificationAttestation model', () => {
      // given
      const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({ id: 'someId' });
      const certificationAttestation = domainBuilder.buildCertificationAttestation();

      // when
      certificationAttestation.setResultCompetenceTree(resultCompetenceTree);

      // expect
      expect(certificationAttestation.resultCompetenceTree).to.deep.equal(resultCompetenceTree);
    });
  });

  context('#hasAcquiredCleaCertification', () => {

    it('should return true if clea image path has been set', () => {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        cleaCertificationImagePath: '/some/path',
      });

      // when
      const hasAcquiredCleaCertification = certificationAttestation.hasAcquiredCleaCertification();

      // expect
      expect(hasAcquiredCleaCertification).to.be.true;
    });

    it('should return true if clea no image path has been set', () => {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        cleaCertificationImagePath: null,
      });

      // when
      const hasAcquiredCleaCertification = certificationAttestation.hasAcquiredCleaCertification();

      // expect
      expect(hasAcquiredCleaCertification).to.be.false;
    });
  });

  context('#hasAcquiredPixPlusDroitCertification', () => {

    it('should return true if pix plus droit image path has been set', () => {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        pixPlusDroitCertificationImagePath: '/some/path',
      });

      // when
      const hasAcquiredPixPlusDroitCertification = certificationAttestation.hasAcquiredPixPlusDroitCertification();

      // expect
      expect(hasAcquiredPixPlusDroitCertification).to.be.true;
    });

    it('should return true if not pix plus droit image path has been set', () => {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        pixPlusDroitCertificationImagePath: null,
      });

      // when
      const hasAcquiredPixPlusDroitCertification = certificationAttestation.hasAcquiredPixPlusDroitCertification();

      // expect
      expect(hasAcquiredPixPlusDroitCertification).to.be.false;
    });
  });

  context('#hasAcquiredAnyComplementaryCertifications', () => {

    it('should return true if pix plus droit certification only has been acquired', () => {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: '/some/path',
      });

      // when
      const hasAcquiredAnyComplementaryCertifications = certificationAttestation.hasAcquiredAnyComplementaryCertifications();

      // expect
      expect(hasAcquiredAnyComplementaryCertifications).to.be.true;
    });

    it('should return true if clea certification only has been acquired', () => {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        cleaCertificationImagePath: '/some/path',
        pixPlusDroitCertificationImagePath: null,
      });

      // when
      const hasAcquiredAnyComplementaryCertifications = certificationAttestation.hasAcquiredAnyComplementaryCertifications();

      // expect
      expect(hasAcquiredAnyComplementaryCertifications).to.be.true;
    });

    it('should return true if both pix plus droit and clea certifications have been acquired', () => {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        cleaCertificationImagePath: '/some/path',
        pixPlusDroitCertificationImagePath: 'some/other/path',
      });

      // when
      const hasAcquiredAnyComplementaryCertifications = certificationAttestation.hasAcquiredAnyComplementaryCertifications();

      // expect
      expect(hasAcquiredAnyComplementaryCertifications).to.be.true;
    });

    it('should return false if none of clea or pix plus certifications have been acquired', () => {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
      });

      // when
      const hasAcquiredAnyComplementaryCertifications = certificationAttestation.hasAcquiredAnyComplementaryCertifications();

      // expect
      expect(hasAcquiredAnyComplementaryCertifications).to.be.false;
    });
  });
});
