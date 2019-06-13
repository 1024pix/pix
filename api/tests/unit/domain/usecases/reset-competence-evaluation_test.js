const { expect, sinon, catchErr } = require('../../../test-helper');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const competenceEvaluationService = require('../../../../lib/domain/services/competence-evaluation-service');
const resetCompetenceEvaluation = require('../../../../lib/domain/usecases/reset-competence-evaluation');
const { UserNotAuthorizedToAccessEntity, CompetenceResetError, NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | reset-competence-evaluation', () => {

  let requestedUserId;
  let knowledgeElements;

  const competenceId = 123;
  const authenticatedUserId = 456;
  const resetCompetenceEvaluationResult = Symbol('reset competence evaluation result');
  const competenceEvaluationRepository = {};
  const knowledgeElementRepository = {};
  let getRemainingDaysBeforeResetStub;

  beforeEach(() => {
    competenceEvaluationRepository.getByCompetenceIdAndUserId = sinon.stub();
    knowledgeElementRepository.findUniqByUserIdAndCompetenceId = sinon.stub();
    getRemainingDaysBeforeResetStub = sinon.stub(Scorecard, 'computeRemainingDaysBeforeReset');

    knowledgeElements = [{}, {}];
  });

  afterEach(function() {
    sinon.restore();
  });

  context('when the user owns the competenceEvaluation', () => {
    it('should reset the competenceEvaluation', async () => {
      // given
      requestedUserId = 456;
      const isCompetenceEvaluationExists = true;

      competenceEvaluationRepository.getByCompetenceIdAndUserId
        .withArgs({ competenceId, userId: authenticatedUserId })
        .resolves();

      sinon.stub(competenceEvaluationService, 'resetCompetenceEvaluation')
        .withArgs({ userId: authenticatedUserId, competenceId, isCompetenceEvaluationExists, knowledgeElementRepository, competenceEvaluationRepository })
        .resolves(resetCompetenceEvaluationResult);

      knowledgeElementRepository.findUniqByUserIdAndCompetenceId
        .withArgs({ userId: authenticatedUserId, competenceId })
        .resolves(knowledgeElements);

      getRemainingDaysBeforeResetStub
        .withArgs(knowledgeElements)
        .returns(0);

      // when
      const response = await resetCompetenceEvaluation({
        authenticatedUserId,
        requestedUserId,
        competenceId,
        competenceEvaluationRepository,
        knowledgeElementRepository
      });

      // then
      expect(competenceEvaluationService.resetCompetenceEvaluation).to.have.been.calledWithExactly({
        userId: authenticatedUserId, competenceId, isCompetenceEvaluationExists, knowledgeElementRepository, competenceEvaluationRepository
      });
      expect(response).to.equal(resetCompetenceEvaluationResult);
    });
  });

  context('when the user does not own the competenceEvaluation', () => {
    it('should throw an UserNotAuthorizedToUpdateResourceError error', async () => {
      // given
      requestedUserId = 789;

      // when
      const requestErr = await catchErr(resetCompetenceEvaluation)({
        authenticatedUserId,
        requestedUserId,
        competenceId,
        competenceEvaluationRepository,
        knowledgeElementRepository
      });

      // then
      expect(requestErr).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

  context('when there is no competenceEvaluation', () => {
    it('should reset knowledge elements', async () => {
      // given
      requestedUserId = 456;
      const isCompetenceEvaluationExists = false;

      knowledgeElementRepository.findUniqByUserIdAndCompetenceId
        .withArgs({ userId: authenticatedUserId, competenceId })
        .resolves(knowledgeElements);

      sinon.stub(competenceEvaluationService, 'resetCompetenceEvaluation')
        .withArgs({ userId: authenticatedUserId, competenceId, isCompetenceEvaluationExists, knowledgeElementRepository, competenceEvaluationRepository })
        .resolves(resetCompetenceEvaluationResult);

      competenceEvaluationRepository.getByCompetenceIdAndUserId
        .withArgs({ competenceId, userId: authenticatedUserId })
        .rejects(new NotFoundError());

      // when
      const response = await resetCompetenceEvaluation({ authenticatedUserId, requestedUserId, competenceId, competenceEvaluationRepository, knowledgeElementRepository });

      // then
      sinon.assert.called(competenceEvaluationService.resetCompetenceEvaluation);
      expect(response).to.equal(resetCompetenceEvaluationResult);
    });
  });

  context('when the remainingDaysBeforeReset is over 0', () => {
    it('should throw a CompetenceResetError error', async () => {
      // given
      requestedUserId = 456;
      knowledgeElementRepository.findUniqByUserIdAndCompetenceId
        .withArgs({ userId: authenticatedUserId, competenceId })
        .resolves(knowledgeElements);

      getRemainingDaysBeforeResetStub
        .withArgs(knowledgeElements)
        .returns(4);

      // when
      const requestErr = await catchErr(resetCompetenceEvaluation)({
        authenticatedUserId,
        requestedUserId,
        competenceId,
        competenceEvaluationRepository,
        knowledgeElementRepository
      });

      // then
      expect(requestErr).to.be.instanceOf(CompetenceResetError);
    });
  });

  context('when there is no knowledge elements', () => {
    it('should do nothing', async () => {
      // given
      requestedUserId = 456;
      knowledgeElementRepository.findUniqByUserIdAndCompetenceId
        .withArgs({ userId: authenticatedUserId, competenceId })
        .resolves([]);

      sinon.stub(competenceEvaluationService, 'resetCompetenceEvaluation');

      // when
      const response = await resetCompetenceEvaluation({ authenticatedUserId, requestedUserId, competenceId, competenceEvaluationRepository, knowledgeElementRepository });

      // then
      expect(response).to.equal(null);
      sinon.assert.notCalled(competenceEvaluationService.resetCompetenceEvaluation);
    });
  });
});
