const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | ShareableCertificate', () => {

  context('#get hasAcquiredCleaCertification', () => {

    it('should return true if clea is acquired', () => {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        cleaCertificationStatus: 'acquired',
      });

      // when
      const hasAcquiredCleaCertification = certificationAttestation.hasAcquiredCleaCertification;

      // expect
      expect(hasAcquiredCleaCertification).to.be.true;
    });

    it('should return true if clea is not acquired', () => {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        cleaCertificationStatus: 'not_acquired',
      });

      // when
      const hasAcquiredCleaCertification = certificationAttestation.hasAcquiredCleaCertification;

      // expect
      expect(hasAcquiredCleaCertification).to.be.false;
    });
  });
});
