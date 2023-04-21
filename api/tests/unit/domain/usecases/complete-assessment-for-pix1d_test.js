const { expect, sinon } = require('../../../test-helper');
const completeAssessmentForPix1d = require('../../../../lib/domain/usecases/complete-assessment-for-pix1d');

describe('Unit | UseCase | complete-assessment-for-pix1d', function () {
  it('should complete the assessment', async function () {
    const assessmentId = 2345;
    const assessmentRepository = { completeByAssessmentId: sinon.stub() };

    // when
    await completeAssessmentForPix1d({
      assessmentId,
      assessmentRepository,
    });

    // then
    expect(assessmentRepository.completeByAssessmentId).to.have.calledWithExactly(assessmentId);
  });
});
