const { expect, sinon, catchErr } = require('../../../test-helper');
const CompetenceEvaluation = require('../../../../lib/domain/models/CompetenceEvaluation');
const resetCompetenceEvaluation = require('../../../../lib/domain/usecases/reset-competence-evaluation');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | reset-competence-evaluation', () => {

  let competenceEvaluation;
  const competenceEvaluationId = 111;
  const competenceId = 123;
  const authenticatedUserId = 456;
  let requestedUserId = 456;

  const competenceEvaluationRepository = {};

  beforeEach(() => {
    competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId = sinon.stub();

    competenceEvaluation = {
      id: competenceEvaluationId,
      competenceId,
      userId: authenticatedUserId,
      status: CompetenceEvaluation.statuses.STARTED,
    };
  });

  context('when the user owns the competenceEvaluation', () => {
    it('should update the competenceEvaluation', async () => {
      // given
      const expectedCompetenceEvaluation = {
        ...competenceEvaluation,
        status: CompetenceEvaluation.statuses.RESET,
      };

      competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId
        .withArgs(authenticatedUserId, competenceId, CompetenceEvaluation.statuses.RESET)
        .resolves(expectedCompetenceEvaluation);

      // when
      const updatedCompetenceEvaluation = await resetCompetenceEvaluation({ authenticatedUserId, requestedUserId, competenceId, competenceEvaluationRepository });

      // then
      expect(updatedCompetenceEvaluation).to.deep.equal(expectedCompetenceEvaluation);
    });
  });

  context('when the user does not own the competenceEvaluation', () => {
    it('should throw an UserNotAuthorizedToUpdateResourceError error', async () => {
      // given
      requestedUserId = 789;

      // when
      const requestErr = await catchErr(resetCompetenceEvaluation)({ authenticatedUserId, requestedUserId, competenceId, competenceEvaluationRepository });

      // then
      expect(requestErr).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });
});
