import { PartnerCertificationScoring } from '../../../../lib/domain/models/PartnerCertificationScoring.js';
import { ObjectValidationError } from '../../../../src/shared/domain/errors.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Domain | Models | PartnerCertificationScoring', function () {
  describe('constructor', function () {
    let validArguments;

    beforeEach(function () {
      validArguments = {
        complementaryCertificationCourseId: 999,
        complementaryCertificationBadgeId: 60,
        certificationCourseId: 123,
        hasAcquiredPixCertification: true,
      };
    });

    it('should successfully instantiate object when passing all valid arguments', function () {
      // when
      expect(() => new PartnerCertificationScoring(validArguments)).not.to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when complementaryCertificationCourseId is not valid', function () {
      // when
      expect(
        () => new PartnerCertificationScoring({ ...validArguments, complementaryCertificationCourseId: 'coucou' }),
      ).to.throw(ObjectValidationError);
    });

    it('should not throw an ObjectValidationError when complementaryCerticationBadgeId is null', function () {
      // when
      expect(
        () => new PartnerCertificationScoring({ ...validArguments, complementaryCerticationBadgeId: null }),
      ).to.not.throw(ObjectValidationError);
    });
  });
});
