import { expect, sinon, domainBuilder } from '../../../../../test-helper.js';
import { rejectCertificationCourse } from '../../../../../../src/certification/course/domain/usecases/reject-certification-course.js';
import { AssessmentResult } from '../../../../../../lib/domain/models/index.js';

describe('Unit | UseCase | reject-certification-course', function () {
  it('should reject a newly created assessment result', async function () {
    // given
    const assessmentResultRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
    const certificationCourseId = 1;
    const assessmentResultId = 123;

    const assessmentResult = domainBuilder.buildAssessmentResult({
      assessmentId: assessmentResultId,
      status: AssessmentResult.status.VALIDATED,
    });

    assessmentResultRepository.getByCertificationCourseId
      .withArgs({ certificationCourseId })
      .resolves(assessmentResult);

    // when
    await rejectCertificationCourse({
      certificationCourseId: certificationCourseId,
      assessmentResultRepository,
    });

    // then
    const expectedAssessmentResult = new AssessmentResult({
      ...assessmentResult,
      status: AssessmentResult.status.REJECTED,
      id: undefined,
      createdAt: undefined,
    });

    expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
      certificationCourseId,
      assessmentResult: expectedAssessmentResult,
    });
  });
});
