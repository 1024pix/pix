const { expect, domainBuilder } = require('../../../test-helper');
const ComplementaryCertification = require('../../../../lib/domain/models/ComplementaryCertification');

describe('Unit | Domain | Models | ComplementaryCertification', function () {
  describe('#isClea', function () {
    it('should return true id name equals CléA Numérique', function () {
      // given
      const complementaryCertification = domainBuilder.buildComplementaryCertification({
        key: ComplementaryCertification.CLEA,
      });

      // when
      const isClea = complementaryCertification.isClea();

      // then
      expect(isClea).to.be.true;
    });

    it('should return false otherwise', function () {
      // given
      const complementaryCertification = domainBuilder.buildComplementaryCertification({
        key: 'Not cléa',
      });

      // when
      const isClea = complementaryCertification.isClea();

      // then
      expect(isClea).to.be.false;
    });
  });

  describe('#isPixPlusDroit', function () {
    it('should return true id name equals Pix+ Droit', function () {
      // given
      const complementaryCertification = domainBuilder.buildComplementaryCertification({
        key: ComplementaryCertification.PIX_PLUS_DROIT,
      });

      // when
      const isPixPlusDroit = complementaryCertification.isPixPlusDroit();

      // then
      expect(isPixPlusDroit).to.be.true;
    });

    it('should return false otherwise', function () {
      // given
      const complementaryCertification = domainBuilder.buildComplementaryCertification({
        key: 'Not pix+ droit',
      });

      // when
      const isPixPlusDroit = complementaryCertification.isPixPlusDroit();

      // then
      expect(isPixPlusDroit).to.be.false;
    });
  });

  describe('#isPixPlusEdu1ndDegre', function () {
    it('should return true if name equals Pix+ Édu 2nd degré', function () {
      // given
      const complementaryCertification = domainBuilder.buildComplementaryCertification({
        key: ComplementaryCertification.PIX_PLUS_EDU_1ER_DEGRE,
      });

      // when
      const isPixPlusEdu1erDegre = complementaryCertification.isPixPlusEdu1erDegre();

      // then
      expect(isPixPlusEdu1erDegre).to.be.true;
    });

    it('should return false otherwise', function () {
      // given
      const complementaryCertification = domainBuilder.buildComplementaryCertification({
        key: 'Not pix+ Édu',
      });

      // when
      const isPixPlusEdu1erDegre = complementaryCertification.isPixPlusEdu1erDegre();

      // then
      expect(isPixPlusEdu1erDegre).to.be.false;
    });
  });

  describe('#isPixPlusEdu2ndDegre', function () {
    it('should return true id key equals Pix+ Édu 1er degré', function () {
      // given
      const complementaryCertification = domainBuilder.buildComplementaryCertification({
        key: ComplementaryCertification.PIX_PLUS_EDU_2ND_DEGRE,
      });

      // when
      const isPixPlusEdu2ndDegre = complementaryCertification.isPixPlusEdu2ndDegre();

      // then
      expect(isPixPlusEdu2ndDegre).to.be.true;
    });

    it('should return false otherwise', function () {
      // given
      const complementaryCertification = domainBuilder.buildComplementaryCertification({
        key: 'Not pix+ Édu',
      });

      // when
      const isPixPlusEdu2ndDegre = complementaryCertification.isPixPlusEdu2ndDegre();

      // then
      expect(isPixPlusEdu2ndDegre).to.be.false;
    });
  });
});
