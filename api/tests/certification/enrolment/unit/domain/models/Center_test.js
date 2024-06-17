import { CenterTypes } from '../../../../../../src/certification/enrolment/domain/models/CenterTypes.js';
import { CERTIFICATION_FEATURES } from '../../../../../../src/certification/shared/domain/constants.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Enrolment | Domain | Models | Center', function () {
  context('should enforce business rules', function () {
    it('should validate center type', function () {
      // given
      const notACenterType = 'Not a valid type';

      // when
      const error = catchErrSync(domainBuilder.certification.enrolment.buildCenter)({
        type: notACenterType,
      });

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
      expect(error.invalidAttributes).to.deep.equal([
        {
          attribute: 'type',
          message: '"type" must be one of [SUP, SCO, PRO]',
        },
      ]);
    });

    it('should validate the center habilitations', function () {
      // given
      const notAHabilitationType = { iAM: 'not an habilitation' };

      // when
      const error = catchErrSync(domainBuilder.certification.enrolment.buildCenter)({
        habilitations: [notAHabilitationType],
      });

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
      expect(error.invalidAttributes).to.deep.equal([
        {
          attribute: 0,
          message: '"habilitations[0]" must be an instance of "Habilitation"',
        },
      ]);
    });
  });

  context('#isComplementaryAlonePilot', function () {
    it('should return false', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        type: CenterTypes.SUP,
        features: [],
      });

      // when / then
      expect(center.isComplementaryAlonePilot).is.false;
    });

    it('should return true when center', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        type: CenterTypes.SUP,
        features: [CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key],
      });

      // when / then
      expect(center.isComplementaryAlonePilot).is.true;
    });
  });

  context('#hasBillingMode', function () {
    it('should return false when center is of type SCO', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({ type: CenterTypes.SCO });

      // when / then
      expect(center.hasBillingMode).is.false;
    });

    it('should return true when center is not of type SCO', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({ type: CenterTypes.SUP });

      // when / then
      expect(center.hasBillingMode).is.true;
    });
  });
});
