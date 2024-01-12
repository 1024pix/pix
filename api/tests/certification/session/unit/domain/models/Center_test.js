import { expect, domainBuilder, catchErrSync } from '../../../../../test-helper.js';
import { Center } from '../../../../../../src/certification/session/domain/models/Center.js';
import { CenterTypes } from '../../../../../../src/certification/session/domain/models/CenterTypes.js';

describe('Unit | Certification | Session | Domain | Models | Center', function () {
  describe('#hasBillingMode', function () {
    it('should return false when certification center is of type SCO', function () {
      // given
      const certificationCenter = domainBuilder.certification.session.buildCenter({ type: CenterTypes.SCO });

      // when / then
      expect(certificationCenter).to.be.an.instanceOf(Center);
      expect(certificationCenter.hasBillingMode).is.false;
    });

    it('should return true when certification center is not of type SCO', function () {
      // given
      const certificationCenter = domainBuilder.certification.session.buildCenter({ type: CenterTypes.SUP });

      // when / then
      expect(certificationCenter).to.be.an.instanceOf(Center);
      expect(certificationCenter.hasBillingMode).is.true;
    });

    context('should verify center type', function () {
      it('should return an error', function () {
        // given
        const notACenterType = 'Not a valid type';

        // when
        const error = catchErrSync(domainBuilder.certification.session.buildCenter)({ type: notACenterType });

        // then
        expect(error).to.be.an.instanceOf(TypeError);
        expect(error.message).to.equal('Illegal argument provided');
      });
    });
  });
});
