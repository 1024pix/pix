const PartnerCertificationScoring = require('../../../../lib/domain/models/PartnerCertificationScoring');
const { expect } = require('../../../test-helper');
const { ObjectValidationError } = require('../../../../lib/domain/errors');

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

    it('should throw an ObjectValidationError when certificationCourseId is not valid', function () {
      // when
      expect(() => new PartnerCertificationScoring({ ...validArguments, certificationCourseId: 'coucou' })).to.throw(
        ObjectValidationError
      );
    });

    it('should not throw an ObjectValidationError when partnerKey is null', function () {
      // when
      expect(() => new PartnerCertificationScoring({ ...validArguments, partnerKey: null })).to.not.throw(
        ObjectValidationError
      );
    });
  });
});
