const { expect, sinon, catchErr } = require('../../../test-helper');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const resetScorecard = require('../../../../lib/domain/usecases/reset-scorecard');
const { UserNotAuthorizedToAccessEntity, CompetenceResetError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | reset-scorecard', () => {

  let requestedUserId;
  let knowledgeElements;

  const competenceId = 123;
  const authenticatedUserId = 456;
  const resetScorecardResult = Symbol('reset scorecard result');
  const scorecard = Symbol('Scorecard');
  const competenceEvaluationRepository = {};
  const knowledgeElementRepository = {};
  const competenceRepository = {};
  const scorecardService = {};
  let getRemainingDaysBeforeResetStub;

  beforeEach(() => {
    competenceEvaluationRepository.existsByCompetenceIdAndUserId = sinon.stub();
    knowledgeElementRepository.findUniqByUserIdAndCompetenceId = sinon.stub();
    scorecardService.resetScorecard = sinon.stub();
    scorecardService.computeScorecard = sinon.stub();
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
      const shouldResetCompetenceEvaluation = true;

      competenceEvaluationRepository.existsByCompetenceIdAndUserId
        .withArgs({ competenceId, userId: authenticatedUserId })
        .resolves(true);

      scorecardService.resetScorecard
        .withArgs({ userId: authenticatedUserId, competenceId, shouldResetCompetenceEvaluation, knowledgeElementRepository, competenceEvaluationRepository })
        .resolves(resetScorecardResult);

      scorecardService.computeScorecard
        .withArgs({ userId: authenticatedUserId, competenceId, competenceRepository, competenceEvaluationRepository, knowledgeElementRepository })
        .resolves(scorecard);

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
        scorecardService,
        competenceRepository,
        competenceEvaluationRepository,
        knowledgeElementRepository
      });

      // then
      expect(scorecardService.resetScorecard).to.have.been.calledWithExactly({
        userId: authenticatedUserId, competenceId, shouldResetCompetenceEvaluation, competenceRepository, knowledgeElementRepository, competenceEvaluationRepository
      });
      expect(response).to.equal(scorecard);
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
        scorecardService,
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
      const shouldResetCompetenceEvaluation = false;

      knowledgeElementRepository.findUniqByUserIdAndCompetenceId
        .withArgs({ userId: authenticatedUserId, competenceId })
        .resolves(knowledgeElements);

      scorecardService.resetScorecard
        .withArgs({ userId: authenticatedUserId, competenceId, shouldResetCompetenceEvaluation, knowledgeElementRepository, competenceEvaluationRepository })
        .resolves(resetScorecardResult);

      scorecardService.computeScorecard
        .withArgs({ userId: authenticatedUserId, competenceId, competenceRepository, competenceEvaluationRepository, knowledgeElementRepository })
        .resolves(scorecard);

      competenceEvaluationRepository.existsByCompetenceIdAndUserId
        .withArgs({ competenceId, userId: authenticatedUserId })
        .resolves(false);

      // when
      const response = await resetScorecard({ authenticatedUserId, requestedUserId, competenceId, scorecardService, competenceRepository, competenceEvaluationRepository, knowledgeElementRepository });

      // then
      sinon.assert.called(scorecardService.resetScorecard);
      expect(response).to.equal(scorecard);
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
        scorecardService,
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

      scorecardService.resetScorecard.resolves();

      // when
      const response = await resetScorecard({ authenticatedUserId, requestedUserId, competenceId, scorecardService, competenceRepository, competenceEvaluationRepository, knowledgeElementRepository });

      // then
      expect(response).to.equal(null);
      sinon.assert.notCalled(scorecardService.resetScorecard);
    });
  });
});
