const { expect, domainBuilder, sinon } = require('../../../test-helper');
const findCertificationAssessments = require('../../../../lib/domain/usecases/find-certification-assessments');

describe('Unit | UseCase | find-certification-assessments', () => {

  const assessmentRepository = {
    getCertificationAssessmentByUserIdAndCourseId: () => {
    },
  };

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolve an empty array', () => {
    // given
    const userId = 1234;
    const courseId = 2;
    const filters = { type: 'CERTIFICATION', courseId };
    sandbox.stub(assessmentRepository, 'getCertificationAssessmentByUserIdAndCourseId').resolves(null);

    // when
    const promise = findCertificationAssessments({ userId, filters, assessmentRepository });

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal([]);
    });
  });

  it('should resolve an empty array since there is no courseId', () => {
    // given
    const userId = 1234;
    const courseId = null;
    const filters = { type: 'CERTIFICATION', courseId };

    // when
    const promise = findCertificationAssessments({ userId, filters, assessmentRepository });

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal([]);
    });
  });

  it('should resolve an assessment of type CERTIFICATION', () => {
    // given
    const userId = 1234;
    const course = domainBuilder.buildCertificationCourse();
    const filters = { type: 'CERTIFICATION', courseId: course.id };
    const  assessment = domainBuilder.buildAssessment({
      ...filters,
      userId,
    });
    sandbox.stub(assessmentRepository, 'getCertificationAssessmentByUserIdAndCourseId').resolves(assessment);

    // when
    const promise = findCertificationAssessments({ userId, filters, assessmentRepository });

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal([assessment]);
    });
  });
});
