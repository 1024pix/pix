import { expect, sinon, domainBuilder } from '../../../../../test-helper.js';
import { updateJuryComments } from '../../../../../../src/certification/course/domain/usecases/update-jury-comments.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { AssessmentResult } from '../../../../../../src/shared/domain/models/AssessmentResult.js';
import { CompetenceMark } from '../../../../../../lib/domain/models/index.js';

describe('Unit | UseCase | update-jury-comments', function () {
  let domainTransaction;
  beforeEach(function () {
    domainTransaction = {
      knexTransaction: Symbol('transaction'),
    };
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback(domainTransaction);
    });
  });

  it('should save jury comments', async function () {
    // given
    const assessmentResultComments = {
      commentForOrganization: null,
      commentForCandidate: null,
      commentByJury: 'Hello',
      assessmentId: 12345,
    };
    const competenceMark = domainBuilder.buildCompetenceMark({});
    const oldAssessmentResult = domainBuilder.buildAssessmentResult({ id: 56, competenceMarks: [competenceMark] });
    const newAssessmentResult = domainBuilder.buildAssessmentResult({ id: 78, juryId: 456, commentByJury: 'Hello' });

    const assessmentResultRepository = {
      getLatestByAssessmentId: sinon.stub().resolves(oldAssessmentResult),
      save: sinon.stub().resolves(newAssessmentResult),
    };
    const competenceMarkRepository = {
      save: sinon.stub().resolves(),
    };

    // when
    await updateJuryComments({
      certificationCourseId: 123,
      assessmentResultComments,
      juryId: 456,
      assessmentResultRepository,
      competenceMarkRepository,
    });

    // then
    expect(assessmentResultRepository.getLatestByAssessmentId).to.have.been.calledOnceWith({
      assessmentId: 12345,
      domainTransaction,
    });
    expect(assessmentResultRepository.save).to.have.been.calledOnceWith({
      certificationCourseId: 123,
      assessmentResult: sinon.match.instanceOf(AssessmentResult).and(
        sinon.match({
          ...oldAssessmentResult.clone,
          id: undefined,
          juryId: 456,
          emitter: AssessmentResult.emitters.PIX_JURY,
          commentForOrganization: assessmentResultComments.commentForOrganization,
          commentForCandidate: assessmentResultComments.commentForCandidate,
          commentByJury: assessmentResultComments.commentByJury,
        }),
      ),
      domainTransaction,
    });
    expect(competenceMarkRepository.save).to.have.been.calledOnceWith(
      sinon.match.instanceOf(CompetenceMark).and(
        sinon.match({
          ...competenceMark,
          assessmentResultId: newAssessmentResult.id,
        }),
      ),
      domainTransaction,
    );
  });
});
