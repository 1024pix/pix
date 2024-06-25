import { updateJuryComment } from '../../../../../../src/certification/session-management/domain/usecases/update-jury-comment.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | update-jury-comment', function () {
  it('should update jury comment', async function () {
    // given
    const certificationCourseId = 123;
    const assessmentResultCommentByJury = 'Hello';
    const oldAssessmentResult = domainBuilder.certification.sessionManagement.buildAssessmentResultJuryComment({
      id: 11,
    });

    const assessmentResultJuryCommentRepository = {
      getLatestAssessmentResultJuryComment: sinon.stub().resolves(oldAssessmentResult),
      update: sinon.stub(),
    };

    // when
    await updateJuryComment({
      certificationCourseId,
      assessmentResultCommentByJury,
      juryId: 456,
      assessmentResultJuryCommentRepository,
    });

    // then
    expect(assessmentResultJuryCommentRepository.getLatestAssessmentResultJuryComment).to.have.been.calledOnceWith({
      certificationCourseId,
    });

    expect(assessmentResultJuryCommentRepository.update).to.have.been.calledOnceWith({
      id: 11,
      juryId: 456,
      commentByJury: assessmentResultCommentByJury,
    });
  });
});
