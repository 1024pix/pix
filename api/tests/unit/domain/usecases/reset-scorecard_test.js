const { expect, sinon, catchErr } = require('../../../test-helper');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const scorecardService = require('../../../../lib/domain/services/scorecard-service');
const resetScorecard = require('../../../../lib/domain/usecases/reset-scorecard');
const { UserNotAuthorizedToAccessEntity, CompetenceResetError, NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | reset-scorecard', () => {

  let requestedUserId;
  let knowledgeElements;

  const competenceId = 123;
  const authenticatedUserId = 456;
  const resetScorecardResult = Symbol('reset scorecard result');
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

      sinon.stub(scorecardService, 'resetScorecard')
        .withArgs({ userId: authenticatedUserId, competenceId, isCompetenceEvaluationExists, knowledgeElementRepository, competenceEvaluationRepository })
        .resolves(resetScorecardResult);

      knowledgeElementRepository.findUniqByUserIdAndCompetenceId
        .withArgs({ userId: authenticatedUserId, competenceId })
        .resolves(knowledgeElements);

      getRemainingDaysBeforeResetStub
        .withArgs(knowledgeElements)
        .returns(0);

      // when
      const response = await resetScorecard({
        authenticatedUserId,
        requestedUserId,
        competenceId,
        competenceEvaluationRepository,
        knowledgeElementRepository
      });

      // then
      expect(scorecardService.resetScorecard).to.have.been.calledWithExactly({
        userId: authenticatedUserId, competenceId, isCompetenceEvaluationExists, knowledgeElementRepository, competenceEvaluationRepository
      });
      expect(response).to.equal(resetScorecardResult);
    });
  });

  context('when the user does not own the competenceEvaluation', () => {
    it('should throw an UserNotAuthorizedToUpdateResourceError error', async () => {
      // given
      requestedUserId = 789;

      // when
      const requestErr = await catchErr(resetScorecard)({
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

      sinon.stub(scorecardService, 'resetScorecard')
        .withArgs({ userId: authenticatedUserId, competenceId, isCompetenceEvaluationExists, knowledgeElementRepository, competenceEvaluationRepository })
        .resolves(resetScorecardResult);

      competenceEvaluationRepository.getByCompetenceIdAndUserId
        .withArgs({ competenceId, userId: authenticatedUserId })
        .rejects(new NotFoundError());

      // when
      const response = await resetScorecard({ authenticatedUserId, requestedUserId, competenceId, competenceEvaluationRepository, knowledgeElementRepository });

      // then
      sinon.assert.called(scorecardService.resetScorecard);
      expect(response).to.equal(resetScorecardResult);
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
      const requestErr = await catchErr(resetScorecard)({
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

      sinon.stub(scorecardService, 'resetScorecard');

      // when
      const response = await resetScorecard({ authenticatedUserId, requestedUserId, competenceId, competenceEvaluationRepository, knowledgeElementRepository });

      // then
      expect(response).to.equal(null);
      sinon.assert.notCalled(scorecardService.resetScorecard);
    });
  });
});
