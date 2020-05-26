const _ = require('lodash');
const CertificationAssessment = require('../../../../lib/domain/models/CertificationAssessment');
const { expect } = require('../../../test-helper');
const { ObjectValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | CertificationAssessment', () => {

  describe('constructor', () => {
    let validArguments;
    beforeEach(() => {
      validArguments = {
        id: 123,
        userId: 123,
        certificationCourseId: 123,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-01'),
        state: CertificationAssessment.states.STARTED,
        isV2Certification: true,
        certificationChallenges: ['challenge'],
        certificationAnswers: ['answer'],
      };
    });

    it('should successfully instantiate object when passing all valid arguments', () => {
      // when
      expect(() => new CertificationAssessment(validArguments)).not.to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when id is not valid', () => {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, id: 'coucou' })).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when userId is not valid', () => {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, userId: 'les zouzous' })).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when certificationCourseId is not valid', () => {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, certificationCourseId: 'ça gaze ?' })).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when createdAt is not valid', () => {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, createdAt: 'coucou' })).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when completed is not valid', () => {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, completedAt: 'ça pétille !' })).to.throw(ObjectValidationError);
    });

    _.forIn(CertificationAssessment.states, (value) => {
      it(`should not throw an ObjectValidationError when state is ${value}`, () => {
        // when
        expect(() => new CertificationAssessment({ ...validArguments, state: value })).not.to.throw(ObjectValidationError);
      });
    });

    it('should throw an ObjectValidationError when status is of unknown value', () => {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, state: 'aaa' })).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when isV2Certification is not valid', () => {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, isV2Certification: 'glouglou' })).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when certificationChallenges is not valid', () => {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, certificationChallenges: 'glouglou' })).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when certificationAnswers is not valid', () => {
      // when
      expect(() => new CertificationAssessment({ ...validArguments, certificationAnswers: 'glouglou' })).to.throw(ObjectValidationError);
    });
  });
});
