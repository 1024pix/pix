const { expect, sinon, catchErr } = require('../../../test-helper');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const resetScorecard = require('../../../../lib/domain/usecases/reset-scorecard');
const { CompetenceResetError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | reset-scorecard', function() {

  let knowledgeElements;

  const competenceId = 123;
  const userId = 456;
  const resetScorecardResult = Symbol('reset scorecard result');
  const scorecard = Symbol('Scorecard');
  const competenceEvaluationRepository = {};
  const knowledgeElementRepository = {};
  const competenceRepository = {};
  const assessmentRepository = {};
  const campaignParticipationRepository = {};
  const scorecardService = {};
  let getRemainingDaysBeforeResetStub;

  beforeEach(function() {
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

  context('when the user owns the competenceEvaluation', function() {
    it('should reset the competenceEvaluation', async function() {
      // given
      const shouldResetCompetenceEvaluation = true;

      competenceEvaluationRepository.existsByCompetenceIdAndUserId
        .withArgs({ competenceId, userId })
        .resolves(true);

      scorecardService.resetScorecard
        .withArgs({ userId, competenceId, shouldResetCompetenceEvaluation, knowledgeElementRepository, competenceEvaluationRepository, assessmentRepository, campaignParticipationRepository })
        .resolves(resetScorecardResult);

      scorecardService.computeScorecard
        .withArgs({ userId, competenceId, competenceRepository, competenceEvaluationRepository, knowledgeElementRepository })
        .resolves(scorecard);

      knowledgeElementRepository.findUniqByUserIdAndCompetenceId
        .withArgs({ userId, competenceId })
        .resolves(knowledgeElements);

      getRemainingDaysBeforeResetStub
        .withArgs(knowledgeElements)
        .returns(0);

      // when
      const response = await resetScorecard({
        userId,
        competenceId,
        scorecardService,
        assessmentRepository,
        campaignParticipationRepository,
        competenceRepository,
        competenceEvaluationRepository,
        knowledgeElementRepository,
      });

      // then
      expect(scorecardService.resetScorecard).to.have.been.calledWithExactly({
        userId, competenceId, shouldResetCompetenceEvaluation, assessmentRepository, campaignParticipationRepository, competenceRepository, knowledgeElementRepository, competenceEvaluationRepository,
      });
      expect(response).to.equal(scorecard);
    });
  });

  context('when there is no competenceEvaluation', function() {
    it('should reset knowledge elements', async function() {
      // given
      const shouldResetCompetenceEvaluation = false;

      knowledgeElementRepository.findUniqByUserIdAndCompetenceId
        .withArgs({ userId, competenceId })
        .resolves(knowledgeElements);

      scorecardService.resetScorecard
        .withArgs({ userId, competenceId, shouldResetCompetenceEvaluation, knowledgeElementRepository, competenceEvaluationRepository })
        .resolves(resetScorecardResult);

      scorecardService.computeScorecard
        .withArgs({ userId, competenceId, competenceRepository, competenceEvaluationRepository, knowledgeElementRepository })
        .resolves(scorecard);

      competenceEvaluationRepository.existsByCompetenceIdAndUserId
        .withArgs({ competenceId, userId })
        .resolves(false);

      // when
      const response = await resetScorecard({ userId, competenceId, scorecardService, competenceRepository, competenceEvaluationRepository, knowledgeElementRepository });

      // then
      sinon.assert.called(scorecardService.resetScorecard);
      expect(response).to.equal(scorecard);
    });
  });

  context('when the remainingDaysBeforeReset is over 0', function() {
    it('should throw a CompetenceResetError error', async function() {
      // given
      knowledgeElementRepository.findUniqByUserIdAndCompetenceId
        .withArgs({ userId, competenceId })
        .resolves(knowledgeElements);

      getRemainingDaysBeforeResetStub
        .withArgs(knowledgeElements)
        .returns(4);

      // when
      const requestErr = await catchErr(resetScorecard)({
        userId,
        competenceId,
        scorecardService,
        competenceRepository,
        competenceEvaluationRepository,
        knowledgeElementRepository,
      });

      // then
      expect(requestErr).to.be.instanceOf(CompetenceResetError);
    });
  });

  context('when there is no knowledge elements', function() {
    it('should do nothing', async function() {
      // given
      knowledgeElementRepository.findUniqByUserIdAndCompetenceId
        .withArgs({ userId, competenceId })
        .resolves([]);

      scorecardService.resetScorecard.resolves();

      // when
      const response = await resetScorecard({ userId, competenceId, scorecardService, competenceRepository, competenceEvaluationRepository, knowledgeElementRepository });

      // then
      expect(response).to.equal(null);
      sinon.assert.notCalled(scorecardService.resetScorecard);
    });
  });
});
