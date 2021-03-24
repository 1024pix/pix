const PartnerCertification = require('../../../../lib/domain/models/PartnerCertification');
const { expect } = require('../../../test-helper');
const { ObjectValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | PartnerCertification', function() {
  describe('constructor', function() {
    let validArguments;
    beforeEach(function() {
      validArguments = {
        certificationCourseId: 123,
        partnerKey: 'partnerKey',
      };
    });

    it('should successfully instantiate object when passing all valid arguments', function() {
      // when
      expect(() => new PartnerCertification(validArguments)).not.to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when certificationCourseId is not valid', function() {
      // when
      expect(() => new PartnerCertification({ ...validArguments, certificationCourseId: 'coucou' })).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when partnerKey is not valid', function() {
      // when
      expect(() => new PartnerCertification({ ...validArguments, partnerKey: null })).to.throw(ObjectValidationError);
    });
  });
});
