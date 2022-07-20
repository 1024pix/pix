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

  describe('#isHabilitatedPixPlusEdu1erDegre', function () {
    it('should return false when the certification center does not have Pix+ Edu 1er degre habilitation', function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter({ habilitations: [] });

      // then
      expect(certificationCenter.isHabilitatedPixPlusEdu1erDegre).to.be.false;
    });

    it('should return true when the certification center has Pix+ Edu 1er degre habilitation', function () {
      // given
      const pixPlusEdu1erDegreComplementaryCertification = domainBuilder.buildComplementaryCertification({
        name: 'Pix+ Édu 1er degré',
      });
      const certificationCenter = domainBuilder.buildCertificationCenter({
        habilitations: [pixPlusEdu1erDegreComplementaryCertification],
      });

      // then
      expect(certificationCenter.isHabilitatedPixPlusEdu1erDegre).to.be.true;
    });
  });

  describe('#isHabilitatedPixPlusEdu2ndDegre', function () {
    it('should return false when the certification center does not have Pix+ Edu 2nd degre habilitation', function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter({ habilitations: [] });

      // then
      expect(certificationCenter.isHabilitatedPixPlusEdu2ndDegre).to.be.false;
    });

    it('should return true when the certification center has Pix+ Edu 2nd degre habilitation', function () {
      // given
      const complementaryCertification = domainBuilder.buildComplementaryCertification({
        name: 'Pix+ Édu 2nd degré',
      });
      const certificationCenter = domainBuilder.buildCertificationCenter({
        habilitations: [complementaryCertification],
      });

      // then
      expect(certificationCenter.isHabilitatedPixPlusEdu2ndDegre).to.be.true;
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
