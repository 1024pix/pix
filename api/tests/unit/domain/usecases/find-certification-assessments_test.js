const { expect, domainBuilder, sinon } = require('../../../test-helper');
const findCertificationAssessments = require('../../../../lib/domain/usecases/find-certification-assessments');

describe('Unit | UseCase | find-certification-assessments', () => {

  const assessmentRepository = {};

  beforeEach(() => {
    assessmentRepository.findOneCertificationAssessmentByUserIdAndCourseId = sinon.stub();
  });

  it('should resolve an empty array when courseId is null', () => {
    // given
    const userId = 1234;
    const courseId = null;
    const filters = { type: 'CERTIFICATION', courseId, resumable: 'true' };

    // when
    const promise = findCertificationAssessments({ userId, filters, assessmentRepository });

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal([]);
    });
  });

  it('should resolve an empty array when resumable is false', () => {
    // given
    const userId = 1234;
    const courseId = null;
    const filters = { type: 'CERTIFICATION', courseId, resumable: 'false' };

    // when
    const promise = findCertificationAssessments({ userId, filters, assessmentRepository });

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal([]);
    });
  });

  it('should resolve an empty array when the repository returns null', () => {
    // given
    const userId = 1234;
    const courseId = 2;
    const filters = { type: 'CERTIFICATION', courseId, resumable: 'true' };
    assessmentRepository.findOneCertificationAssessmentByUserIdAndCourseId.resolves(null);

    // when
    const promise = findCertificationAssessments({ userId, filters, assessmentRepository });

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal([]);
    });
  });

  it('should resolve an assessment of type CERTIFICATION even if state is started', () => {
    // given
    const userId = 1234;
    const courseId = 5678;
    const filters = { type: 'CERTIFICATION', courseId, resumable: 'true' };
    const  assessment = domainBuilder.buildAssessment({
      type: 'CERTIFICATION',
      courseId,
      state: 'started',
      userId,
    });
    assessmentRepository.findOneCertificationAssessmentByUserIdAndCourseId.resolves(assessment);

    // when
    const promise = findCertificationAssessments({ userId, filters, assessmentRepository });

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal([assessment]);
    });
  });

  it('should resolve an assessment of type CERTIFICATION even if state is completed', () => {
    // given
    const userId = 1234;
    const courseId = 5678;
    const filters = { type: 'CERTIFICATION', courseId, resumable: 'true' };
    const  assessment = domainBuilder.buildAssessment({
      type: 'CERTIFICATION',
      courseId,
      state: 'completed',
      userId,
    });
    assessmentRepository.findOneCertificationAssessmentByUserIdAndCourseId.resolves(assessment);

    // when
    const promise = findCertificationAssessments({ userId, filters, assessmentRepository });

    // then
    return promise.then((result) => {
      expect(result).to.deep.equal([assessment]);
    });
  });
});
