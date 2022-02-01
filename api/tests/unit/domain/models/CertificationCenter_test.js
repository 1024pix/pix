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

  describe('#isHabilitatedPixPlusDroit', function () {
    it('should return false when the certification center does not have Pix+ Droit habilitation', function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter({ habilitations: [] });

      // then
      expect(certificationCenter.isHabilitatedPixPlusDroit).to.be.false;
    });

    it('should return true when the certification center has Pix+ Droit complementary certification', function () {
      // given
      const pixPlusDroitComplementaryCertification = domainBuilder.buildComplementaryCertification({
        name: 'Pix+ Droit',
      });
      const certificationCenter = domainBuilder.buildCertificationCenter({
        habilitations: [pixPlusDroitComplementaryCertification],
      });

      // then
      expect(certificationCenter.isHabilitatedPixPlusDroit).to.be.true;
    });
  });

  describe('#isHabilitatedClea', function () {
    it('should return false when the certification center does not have Cléa numérique complementary certification', function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter({ habilitations: [] });

      // then
      expect(certificationCenter.isHabilitatedClea).to.be.false;
    });

    it('should return true when the certification center has Cléa numérique complementary certification', function () {
      // given
      const pixPlusDroitComplementaryCertification = domainBuilder.buildComplementaryCertification({
        name: 'CléA Numérique',
      });
      const certificationCenter = domainBuilder.buildCertificationCenter({
        habilitations: [pixPlusDroitComplementaryCertification],
      });

      // then
      expect(certificationCenter.isHabilitatedClea).to.be.true;
    });
  });
});
