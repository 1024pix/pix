import PartnerCertificationScoring from '../../../../lib/domain/models/PartnerCertificationScoring';
import { expect } from '../../../test-helper';
import { ObjectValidationError } from '../../../../lib/domain/errors';

describe('Unit | Domain | Models | PartnerCertificationScoring', function () {
  describe('constructor', function () {
    let validArguments;
    beforeEach(function () {
      validArguments = {
        complementaryCertificationCourseId: 999,
        certificationCourseId: 123,
        partnerKey: 'partnerKey',
      };
    });

    it('should successfully instantiate object when passing all valid arguments', function () {
      // when
      expect(() => new PartnerCertificationScoring(validArguments)).not.to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when complementaryCertificationCourseId is not valid', function () {
      // when
      expect(
        () => new PartnerCertificationScoring({ ...validArguments, complementaryCertificationCourseId: 'coucou' })
      ).to.throw(ObjectValidationError);
    });

    it('should not throw an ObjectValidationError when partnerKey is null', function () {
      // when
      expect(() => new PartnerCertificationScoring({ ...validArguments, partnerKey: null })).to.not.throw(
        ObjectValidationError
      );
    });
  });
});
