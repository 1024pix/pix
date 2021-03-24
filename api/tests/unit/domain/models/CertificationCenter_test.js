const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | CertificationCenter', function() {

  describe('#isSco', function() {

    it('should return true when certification center is of type SCO', function() {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter({ type: 'SCO' });

      // when / then
      expect(certificationCenter.isSco).is.true;
    });

    it('should return false when certification center is not of type SCO', function() {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter({ type: 'SUP' });

      // when / then
      expect(certificationCenter.isSco).is.false;
    });
  });

});
