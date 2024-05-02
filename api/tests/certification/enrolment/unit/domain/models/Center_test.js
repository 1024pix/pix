import { Center } from '../../../../../../src/certification/enrolment/domain/models/Center.js';
import { CenterTypes } from '../../../../../../src/certification/enrolment/domain/models/CenterTypes.js';
import { CERTIFICATION_FEATURES } from '../../../../../../src/certification/shared/domain/constants.js';
import { catchErrSync, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Session | Domain | Models | Center', function () {
  describe('#hasBillingMode', function () {
    it('should return false when center is of type SCO', function () {
      // given
      const center = domainBuilder.certification.session.buildCenter({ type: CenterTypes.SCO });

      // when / then
      expect(center).to.be.an.instanceOf(Center);
      expect(center.hasBillingMode).is.false;
    });

    it('should return true when center is not of type SCO', function () {
      // given
      const center = domainBuilder.certification.session.buildCenter({ type: CenterTypes.SUP });

      // when / then
      expect(center).to.be.an.instanceOf(Center);
      expect(center.hasBillingMode).is.true;
    });

    it('should return true when center is a complementary certification pilot', function () {
      // given
      const center = domainBuilder.certification.session.buildCenter({
        type: CenterTypes.SUP,
        features: [CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key],
      });

      // when / then
      expect(center).to.be.an.instanceOf(Center);
      expect(center.isComplementaryAlonePilot).is.true;
    });

    context('should verify center type', function () {
      it('should return an error', function () {
        // given
        const notACenterType = 'Not a valid type';

        // when
        const error = catchErrSync(domainBuilder.certification.session.buildCenter)({ type: notACenterType });

        // then
        expect(error).to.be.an.instanceOf(TypeError);
        expect(error.message).to.equal('Illegal enum value provided');
      });
    });
  });
});
