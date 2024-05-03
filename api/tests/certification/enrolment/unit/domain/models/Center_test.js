import { Center } from '../../../../../../src/certification/enrolment/domain/models/Center.js';
import { CenterTypes } from '../../../../../../src/certification/enrolment/domain/models/CenterTypes.js';
import { catchErrSync, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Session | Domain | Models | Center', function () {
  describe('#hasBillingMode', function () {
    it('should return false when center is of type SCO', function () {
      // given
      const center = domainBuilder.certification.sessionManagement.buildCenter({ type: CenterTypes.SCO });

      // when / then
      expect(center).to.be.an.instanceOf(Center);
      expect(center.hasBillingMode).is.false;
    });

    it('should return true when center is not of type SCO', function () {
      // given
      const center = domainBuilder.certification.sessionManagement.buildCenter({ type: CenterTypes.SUP });

      // when / then
      expect(center).to.be.an.instanceOf(Center);
      expect(center.hasBillingMode).is.true;
    });

    context('should verify center type', function () {
      it('should return an error', function () {
        // given
        const notACenterType = 'Not a valid type';

        // when
        const error = catchErrSync(domainBuilder.certification.sessionManagement.buildCenter)({
          type: notACenterType,
        });

        // then
        expect(error).to.be.an.instanceOf(TypeError);
        expect(error.message).to.equal('Illegal enum value provided');
      });
    });
  });
});
