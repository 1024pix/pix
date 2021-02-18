const _ = require('lodash');
const { expect, sinon, catchErr } = require('../../../test-helper');
const findCompetenceEvaluationsByAssessment = require('../../../../lib/domain/usecases/find-competence-evaluations-by-assessment');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | find-competence-evaluations-by-assessment', () => {

  const userId = 1;
  const assessmentId = 2;
  const assessmentRepository = { ownedByUser: _.noop() };
  const competenceEvaluationRepository = { findByAssessmentId: _.noop() };

  beforeEach(() => {
    assessmentRepository.ownedByUser = sinon.stub();
    competenceEvaluationRepository.findByAssessmentId = sinon.stub();
  });

  it('should throw an UserNotAuthorizedToAccessEntityError error when user is not the owner of the assessment', async () => {
    // given
    assessmentRepository.ownedByUser.withArgs({ id: assessmentId, userId }).resolves(false);

    // when
    const error = await catchErr(findCompetenceEvaluationsByAssessment)({
      userId,
      assessmentId,
      competenceEvaluationRepository,
      assessmentRepository,
    });

    // then
    expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
  });

  it('should return the assessment competence-evaluations', async () => {
    // given
    const expectedCompetenceEvaluations = Symbol('competenceEvaluations');
    assessmentRepository.ownedByUser.withArgs({ id: assessmentId, userId }).resolves(true);
    competenceEvaluationRepository.findByAssessmentId.withArgs(assessmentId).resolves(expectedCompetenceEvaluations);

    // when
    const actualCompetenceEvaluations = await findCompetenceEvaluationsByAssessment({
      userId,
      assessmentId,
      competenceEvaluationRepository,
      assessmentRepository,
    });

    // then
    expect(actualCompetenceEvaluations).to.deep.equal(expectedCompetenceEvaluations);
  });

});
