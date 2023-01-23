const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | CertificationCenter', function () {
  describe('#isSco', function () {
    it('should return true when certification center is of type SCO', function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter({ type: 'SCO' });

      // when / then
      expect(certificationCenter.isSco).is.true;
    });

    it('should return false when certification center is not of type SCO', function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter({ type: 'SUP' });

      // when / then
      expect(certificationCenter.isSco).is.false;
    });
  });
  describe('#hasBillingMode', function () {
    it('should return false when certification center is of type SCO', function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter({ type: 'SCO' });

      // when / then
      expect(certificationCenter.hasBillingMode).is.false;
    });

    it('should return true when certification center is not of type SCO', function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter({ type: 'SUP' });

      // when / then
      expect(certificationCenter.hasBillingMode).is.true;
    });
  });
  describe('#isHabilitated', function () {
    it('should return false when the certification center does not have the complementary certification', function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter({ habilitations: [] });

      // then
      expect(certificationCenter.isHabilitated()).to.be.false;
    });

    it('should return true when the certification center has complementary certification', function () {
      // given
      const cleaComplementaryCertification = domainBuilder.buildComplementaryCertification({
        key: 'PIX+',
      });
      const certificationCenter = domainBuilder.buildCertificationCenter({
        habilitations: [cleaComplementaryCertification],
      });

      // then
      expect(certificationCenter.isHabilitated('PIX+')).to.be.true;
    });
  });
});
