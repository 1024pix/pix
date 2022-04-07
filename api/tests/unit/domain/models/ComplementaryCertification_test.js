const { expect, domainBuilder } = require('../../../test-helper');
const ComplementaryCertification = require('../../../../lib/domain/models/ComplementaryCertification');

describe('Unit | Domain | Models | ComplementaryCertification', function () {
  describe('#isClea', function () {
    it('should return true id name equals CléA Numérique', function () {
      // given
      const complementaryCertification = domainBuilder.buildComplementaryCertification({
        name: ComplementaryCertification.CLEA,
      });

      // when
      const isClea = complementaryCertification.isClea();

      // then
      expect(isClea).to.be.true;
    });

    it('should return false otherwise', function () {
      // given
      const complementaryCertification = domainBuilder.buildComplementaryCertification({
        name: 'Not cléa',
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
        name: ComplementaryCertification.PIX_PLUS_DROIT,
      });

      // when
      const isPixPlusDroit = complementaryCertification.isPixPlusDroit();

      // then
      expect(isPixPlusDroit).to.be.true;
    });

    it('should return false otherwise', function () {
      // given
      const complementaryCertification = domainBuilder.buildComplementaryCertification({
        name: 'Not pix+ droit',
      });

      // when
      const isPixPlusDroit = complementaryCertification.isPixPlusDroit();

      // then
      expect(isPixPlusDroit).to.be.false;
    });
  });

  describe('#isPixPlusEdu', function () {
    it('should return true id name equals Pix+ Édu', function () {
      // given
      const complementaryCertification = domainBuilder.buildComplementaryCertification({
        name: ComplementaryCertification.PIX_PLUS_EDU,
      });

      // when
      const isPixPlusEdu = complementaryCertification.isPixPlusEdu();

      // then
      expect(isPixPlusEdu).to.be.true;
    });

    it('should return false otherwise', function () {
      // given
      const complementaryCertification = domainBuilder.buildComplementaryCertification({
        name: 'Not pix+ Édu',
      });

      // when
      const isPixPlusEdu = complementaryCertification.isPixPlusEdu();

      // then
      expect(isPixPlusEdu).to.be.false;
    });
  });
});
