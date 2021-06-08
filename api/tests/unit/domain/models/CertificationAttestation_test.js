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

  context('#get hasAcquiredCleaCertification', () => {

    it('should return true if clea image path has been set', () => {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        cleaCertificationImagePath: '/some/path',
      });

      // when
      const hasAcquiredCleaCertification = certificationAttestation.hasAcquiredCleaCertification;

      // expect
      expect(hasAcquiredCleaCertification).to.be.true;
    });

    it('should return true if clea no image path has been set', () => {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        cleaCertificationImagePath: null,
      });

      // when
      const hasAcquiredCleaCertification = certificationAttestation.hasAcquiredCleaCertification;

      // expect
      expect(hasAcquiredCleaCertification).to.be.false;
    });
  });

  context('#get hasAcquiredPixPlusDroitCertification', () => {

    it('should return true if pix plus droit image path has been set', () => {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        pixPlusDroitCertificationImagePath: '/some/path',
      });

      // when
      const hasAcquiredPixPlusDroitCertification = certificationAttestation.hasAcquiredPixPlusDroitCertification;

      // expect
      expect(hasAcquiredPixPlusDroitCertification).to.be.true;
    });

    it('should return true if not pix plus droit image path has been set', () => {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        pixPlusDroitCertificationImagePath: null,
      });

      // when
      const hasAcquiredPixPlusDroitCertification = certificationAttestation.hasAcquiredPixPlusDroitCertification;

      // expect
      expect(hasAcquiredPixPlusDroitCertification).to.be.false;
    });
  });
});
