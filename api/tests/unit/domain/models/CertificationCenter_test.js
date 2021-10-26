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

  describe('#isAccreditedPixPlusDroit', function () {
    it('should return false when the certification center does not have Pix+ Droit accreditation', function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter({ accreditations: [] });

      // then
      expect(certificationCenter.isAccreditedPixPlusDroit).to.be.false;
    });

    it('should return true when the certification center has Pix+ Droit complementary certification', function () {
      // given
      const pixPlusDroitComplementaryCertification = domainBuilder.buildComplementaryCertification({
        name: 'Pix+ Droit',
      });
      const certificationCenter = domainBuilder.buildCertificationCenter({
        accreditations: [pixPlusDroitComplementaryCertification],
      });

      // then
      expect(certificationCenter.isAccreditedPixPlusDroit).to.be.true;
    });
  });

  describe('#isAccreditedClea', function () {
    it('should return false when the certification center does not have Cléa numérique complementary certification', function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter({ accreditations: [] });

      // then
      expect(certificationCenter.isAccreditedClea).to.be.false;
    });

    it('should return true when the certification center has Cléa numérique complementary certification', function () {
      // given
      const pixPlusDroitComplementaryCertification = domainBuilder.buildComplementaryCertification({
        name: 'CléA Numérique',
      });
      const certificationCenter = domainBuilder.buildCertificationCenter({
        accreditations: [pixPlusDroitComplementaryCertification],
      });

      // then
      expect(certificationCenter.isAccreditedClea).to.be.true;
    });
  });
});
