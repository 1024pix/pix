import { expect, domainBuilder } from '../../../../../test-helper.js';
import { Center } from '../../../../../../src/certification/session/domain/models/Center.js';

describe('Unit | Certification | Center | Domain | Models | Center', function () {
  describe('#hasBillingMode', function () {
    it('should return false when certification center is of type SCO', function () {
      // given
      const certificationCenter = domainBuilder.certification.session.buildCenter({ type: 'SCO' });

      // when / then
      expect(certificationCenter).to.be.an.instanceOf(Center);
      expect(certificationCenter.hasBillingMode).is.false;
    });

    it('should return true when certification center is not of type SCO', function () {
      // given
      const certificationCenter = domainBuilder.certification.session.buildCenter({ type: 'SUP' });

      // when / then
      expect(certificationCenter).to.be.an.instanceOf(Center);
      expect(certificationCenter.hasBillingMode).is.true;
    });
  });
});
