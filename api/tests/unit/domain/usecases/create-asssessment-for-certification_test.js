const { expect } = require('../../../test-helper');

const createAssessmentForCertification = require('../../../../lib/domain/usecases/create-assessment-for-certification');
const Assessment = require('../../../../lib/domain/models/Assessment');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');
const { ObjectValidationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-assessment-for-certification', () => {
  let assessment;
  let assessmentRepository;
  let certificationCourseRepository;
  let dependencies;

  beforeEach(function() {
    assessment = Assessment.fromAttributes({
      type: 'CERTIFICATION',
      userId: 'userId',
      courseId: 'courseId',
    });

    assessmentRepository = {
      async save(assessment) {
        return Assessment.fromAttributes({ ...assessment, id: 'assessmentId' });
      }
    };

    certificationCourseRepository = {
    };

    dependencies = {
      assessmentRepository,
      certificationCourseRepository,
    };
  });

  context('when requested certification course belongs to requested user', function() {
    beforeEach(function() {
      certificationCourseRepository.get = async (id) => {
        return new CertificationCourse({
          id,
          userId: 'userId',
        });
      };
    });

    it('should save and return the assessment', async function() {
      // when
      const savedAssessment = await createAssessmentForCertification({
        ...dependencies,
        assessment,
      });

      // then
      expect(savedAssessment.id).to.equal('assessmentId');
      expect(savedAssessment.state).to.equal('started');
    });
  });

  context('when requested certification course does not belong to requested user', function() {
    beforeEach(function() {
      certificationCourseRepository.get = async (id) => {
        return new CertificationCourse({
          id,
          userId: 'otherUserId',
        });
      };
    });

    it('should fail validation', async function() {
      // when
      const promise = createAssessmentForCertification({
        ...dependencies,
        assessment,
      });

      await expect(promise).to.be.rejectedWith(ObjectValidationError, 'Certification course must belong to user');
    });
  });
});
