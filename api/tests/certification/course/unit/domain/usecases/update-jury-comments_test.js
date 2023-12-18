import { expect, sinon, domainBuilder } from '../../../../../test-helper.js';
import { updateJuryComments } from '../../../../../../src/certification/course/domain/usecases/update-jury-comments.js';

describe('Unit | UseCase | update-jury-comments', function () {
  it('should save jury comments', async function () {
    // given
    const assessmentResultRepository = {
      save: sinon.stub(),
    };
    const competenceMarkRepository = {
      findByCertificationCourseId: sinon.stub(),
      save: sinon.stub(),
    };
    const oldAssessmentResult = domainBuilder.buildAssessmentResult({ id: 56 });
    const newAssessmentResult = domainBuilder.buildAssessmentResult({ id: 78 });
    const competenceMark = domainBuilder.buildCompetenceMark({});

    assessmentResultRepository.save
      .withArgs({ certificationCourseId: 123, assessmentResult: oldAssessmentResult })
      .resolves(newAssessmentResult);
    competenceMarkRepository.findByCertificationCourseId.withArgs(123).resolves([competenceMark]);
    competenceMarkRepository.save.withArgs({ competenceMark, assessmentResultId: newAssessmentResult.id }).resolves();

    // when
    await updateJuryComments({
      certificationCourseId: 123,
      assessmentResult: oldAssessmentResult,
      assessmentResultRepository,
      competenceMarkRepository,
    });

    // then
    expect(competenceMarkRepository.findByCertificationCourseId).to.have.been.calledOnce;
    expect(assessmentResultRepository.save).to.have.been.calledOnce;
    expect(competenceMarkRepository.save).to.have.been.calledOnce;
  });
});
