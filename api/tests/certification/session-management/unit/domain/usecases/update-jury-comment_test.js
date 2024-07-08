import { updateJuryComment } from '../../../../../../src/certification/session-management/domain/usecases/update-jury-comment.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | update-jury-comment', function () {
  it('should update jury comment', async function () {
    // given
    const certificationCourseId = 123;
    const latestAssessmentResultId = 111;
    const newJuryId = 456;
    const newJuryComment = 'New';
    const latestAssessmentResult = domainBuilder.buildAssessmentResult({
      id: latestAssessmentResultId,
      commentByJury: 'OLD',
      juryId: 888,
    });

    const assessmentResultJuryCommentRepository = {
      getLatestAssessmentResult: sinon.stub().resolves(latestAssessmentResult),
      update: sinon.stub(),
    };

    // when
    await updateJuryComment({
      certificationCourseId,
      assessmentResultCommentByJury: newJuryComment,
      juryId: newJuryId,
      assessmentResultJuryCommentRepository,
    });

    // then
    expect(assessmentResultJuryCommentRepository.getLatestAssessmentResult).to.have.been.calledOnceWith({
      certificationCourseId,
    });

    const updatedAssessmentResult = domainBuilder.buildAssessmentResult({
      id: latestAssessmentResult.id,
      commentByJury: 'New',
      juryId: 456,
    });

    expect(assessmentResultJuryCommentRepository.update).to.have.been.calledOnceWith({
      assessmentResult: updatedAssessmentResult,
    });
  });
});
