const CleaCertification = require('../../../../lib/domain/models/CleaCertification');
const { expect } = require('../../../test-helper');
const { ObjectValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | CleaCertification', () => {
  describe('constructor', () => {
    let validArguments;
    beforeEach(() => {
      validArguments = {
        certificationCourseId: 123,
        partnerKey: 'partnerKey',
        hasAcquiredBadge: true,
        reproducibilityRate: 80,
        competenceMarks: [1],
        totalPixCleaByCompetence: { competence1:1 },
      };
    });

    it('should successfully instantiate object when passing all valid arguments', () => {
      // when
      expect(() => new CleaCertification(validArguments)).not.to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when hasAcquiredBadge is not valid', () => {
      // when
      expect(() => new CleaCertification({
        ...validArguments,
        hasAcquiredBadge: 'coucou'
      })).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when reproducibilityRate is not valid', () => {
      // when
      expect(() => new CleaCertification({
        ...validArguments,
        reproducibilityRate: 'coucou'
      })).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when competenceMarks is not valid', () => {
      // when
      expect(() => new CleaCertification({ ...validArguments, competenceMarks: [] })).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when totalPixCleaByCompetence is not valid', () => {
      // when
      expect(() => new CleaCertification({
        ...validArguments,
        totalPixCleaByCompetence: []
      })).to.throw(ObjectValidationError);
    });
  });
});
