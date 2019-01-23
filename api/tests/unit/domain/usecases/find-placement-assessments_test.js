const { expect, domainBuilder, sinon } = require('../../../test-helper');
const findPlacementAssessments = require('../../../../lib/domain/usecases/find-placement-assessments');

describe('Unit | UseCase | find-placement-assessments', () => {

  const assessmentRepository = {};

  beforeEach(() => {
    assessmentRepository.findOneLastPlacementAssessmentByUserIdAndCourseId = sinon.stub();
  });

  it('should resolve an empty array when courseId is null', () => {
    // given
    const userId = 1234;
    const courseId = 2;
    const filters = { type: 'PLACEMENT', courseId, resumable: 'true' };
    assessmentRepository.findOneLastPlacementAssessmentByUserIdAndCourseId.resolves(null);

    // when
    const promise = findPlacementAssessments({ userId, filters, assessmentRepository });

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal([]);
    });
  });

  it('should resolve an empty array when state is completed', () => {
    // given
    const userId = 1234;
    const courseId = 2;
    const filters = { type: 'PLACEMENT', courseId, resumable: 'true' };
    const assessment = domainBuilder.buildAssessment({
      type: 'PLACEMENT',
      state: 'completed',
      courseId,
      userId,
    });
    assessmentRepository.findOneLastPlacementAssessmentByUserIdAndCourseId.resolves(assessment);

    // when
    const promise = findPlacementAssessments({ userId, filters, assessmentRepository });

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal([]);
    });
  });

  it('should resolve an empty array when the repository returns null', () => {
    // given
    const userId = 1234;
    const courseId = 2;
    const filters = { type: 'PLACEMENT', courseId, resumable: 'true' };
    assessmentRepository.findOneLastPlacementAssessmentByUserIdAndCourseId.resolves(null);

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
    const courseId = 5678;
    const filters = { type: 'PLACEMENT', courseId, resumable: 'true' };
    const assessment = domainBuilder.buildAssessment({
      type: 'PLACEMENT',
      courseId,
      state: 'started',
      userId,
    });
    assessmentRepository.findOneLastPlacementAssessmentByUserIdAndCourseId.resolves(assessment);

    // when
    const promise = findPlacementAssessments({ userId, filters, assessmentRepository });

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal([assessment]);
    });
  });
});
