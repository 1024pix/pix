const { expect, domainBuilder, sinon } = require('../../../test-helper');
const findPlacementAssessments = require('../../../../lib/domain/usecases/find-placement-assessments');

describe('Unit | UseCase | find-placement-assessments', () => {

  const assessmentRepository = {
    getStartedPlacementAssessmentByUserIdAndCourseId: () => {
    },
  };

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolve an empty array', () => {
    // given
    const userId = 1234;
    const courseId = 2;
    const filters = { type: 'PLACEMENT', courseId, state: 'started' };
    sandbox.stub(assessmentRepository, 'getStartedPlacementAssessmentByUserIdAndCourseId').resolves(null);

    // when
    const promise = findPlacementAssessments({ userId, filters, assessmentRepository });

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal([]);
    });
  });

  it('should resolve an empty array since state is completed', () => {
    // given
    const userId = 1234;
    const courseId = 2;
    const filters = { type: 'PLACEMENT', courseId, state: 'completed' };

    // when
    const promise = findPlacementAssessments({ userId, filters, assessmentRepository });

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal([]);
    });
  });

  it('should resolve an assessment of type PLACEMENT', () => {
    // given
    const userId = 1234;
    const course = domainBuilder.buildCertificationCourse();
    const filters = { type: 'PLACEMENT', courseId: course.id, state: 'started' };
    const  assessment = domainBuilder.buildAssessment({
      ...filters,
      userId,
    });
    sandbox.stub(assessmentRepository, 'getStartedPlacementAssessmentByUserIdAndCourseId').resolves(assessment);

    // when
    const promise = findPlacementAssessments({ userId, filters, assessmentRepository });

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal([assessment]);
    });
  });
});
