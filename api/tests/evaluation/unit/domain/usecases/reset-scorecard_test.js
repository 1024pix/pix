import sinon from 'sinon';

import { CompetenceResetError } from '../../../../../src/evaluation/domain/errors.js';
import { Scorecard } from '../../../../../src/evaluation/domain/models/Scorecard.js';
import { resetScorecard } from '../../../../../src/evaluation/domain/usecases/reset-scorecard.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | reset-scorecard', function () {
  let knowledgeState, resetScorecardResult, scorecard;
  const locale = 'fr-fr';

  const competenceId = 123;
  const userId = 456;
  const competenceEvaluationRepository = {};
  const knowledgeStateRepository = {};
  const competenceScoreRepository = {};
  const competenceRepository = {};
  const areaRepository = {};
  const assessmentRepository = {};
  const campaignParticipationRepository = {};
  const campaignRepository = {};
  const scorecardService = {};
  let getRemainingDaysBeforeResetStub;

  beforeEach(function () {
    resetScorecardResult = Symbol('reset scorecard result');
    scorecard = Symbol('Scorecard');
    competenceEvaluationRepository.existsByCompetenceIdAndUserId = sinon.stub();
    knowledgeStateRepository.findByUserId = sinon.stub();
    scorecardService.resetScorecard = sinon.stub();
    scorecardService.computeScorecard = sinon.stub();
    getRemainingDaysBeforeResetStub = sinon.stub(Scorecard, 'computeRemainingDaysBeforeReset');
    knowledgeState = domainBuilder.buildKnowledgeState.forSkills({ validatedSkillIds: ['skillA'], competenceId });
  });

  context('when the user owns the competenceEvaluation', function () {
    it('should reset the competenceEvaluation', async function () {
      // given
      const shouldResetCompetenceEvaluation = true;

      competenceEvaluationRepository.existsByCompetenceIdAndUserId.withArgs({ competenceId, userId }).resolves(true);

      scorecardService.resetScorecard
        .withArgs({
          userId,
          competenceId,
          shouldResetCompetenceEvaluation,
          knowledgeStateRepository,
          competenceEvaluationRepository,
          assessmentRepository,
          campaignParticipationRepository,
        })
        .resolves(resetScorecardResult);

      scorecardService.computeScorecard
        .withArgs({
          userId,
          competenceId,
          competenceRepository,
          areaRepository,
          competenceEvaluationRepository,
          knowledgeStateRepository,
          competenceScoreRepository,
          locale,
        })
        .resolves(scorecard);

      knowledgeStateRepository.findByUserId.withArgs({ userId }).resolves(knowledgeState);

      getRemainingDaysBeforeResetStub.returns(0);

      // when
      const response = await resetScorecard({
        userId,
        competenceId,
        scorecardService,
        assessmentRepository,
        campaignParticipationRepository,
        competenceRepository,
        areaRepository,
        competenceEvaluationRepository,
        knowledgeStateRepository,
        competenceScoreRepository,
        campaignRepository,
        locale,
      });

      // then
      expect(scorecardService.resetScorecard).to.have.been.calledWithExactly({
        userId,
        competenceId,
        shouldResetCompetenceEvaluation,
        assessmentRepository,
        campaignParticipationRepository,
        competenceRepository,
        knowledgeStateRepository,
        competenceEvaluationRepository,
        campaignRepository,
      });
      expect(response).to.equal(scorecard);
    });
  });

  context('when there is no competenceEvaluation', function () {
    it('should reset knowledge elements', async function () {
      // given
      const shouldResetCompetenceEvaluation = false;

      knowledgeStateRepository.findByUserId.withArgs({ userId }).resolves(knowledgeState);

      scorecardService.resetScorecard
        .withArgs({
          userId,
          competenceId,
          shouldResetCompetenceEvaluation,
          knowledgeStateRepository,
          competenceEvaluationRepository,
        })
        .resolves(resetScorecardResult);

      scorecardService.computeScorecard
        .withArgs({
          userId,
          competenceId,
          competenceRepository,
          areaRepository,
          competenceEvaluationRepository,
          knowledgeStateRepository,
          competenceScoreRepository,
          locale,
        })
        .resolves(scorecard);

      competenceEvaluationRepository.existsByCompetenceIdAndUserId.withArgs({ competenceId, userId }).resolves(false);

      // when
      const response = await resetScorecard({
        userId,
        competenceId,
        scorecardService,
        competenceRepository,
        areaRepository,
        competenceEvaluationRepository,
        knowledgeStateRepository,
        competenceScoreRepository,
        locale,
      });

      // then
      sinon.assert.called(scorecardService.resetScorecard);
      expect(response).to.equal(scorecard);
    });
  });

  context('when the remainingDaysBeforeReset is over 0', function () {
    it('should throw a CompetenceResetError error', async function () {
      // given
      knowledgeStateRepository.findByUserId.withArgs({ userId }).resolves(knowledgeState);

      getRemainingDaysBeforeResetStub.returns(4);

      // when
      const requestErr = await catchErr(resetScorecard)({
        userId,
        competenceId,
        scorecardService,
        competenceRepository,
        competenceEvaluationRepository,
        knowledgeStateRepository,
        locale,
      });

      // then
      expect(requestErr).to.be.instanceOf(CompetenceResetError);
    });
  });

  context('when there is no knowledge elements', function () {
    it('should do nothing', async function () {
      // given
      knowledgeStateRepository.findByUserId.withArgs({ userId }).resolves(domainBuilder.buildKnowledgeState());

      scorecardService.resetScorecard.resolves();

      // when
      const response = await resetScorecard({
        userId,
        competenceId,
        scorecardService,
        competenceRepository,
        competenceEvaluationRepository,
        knowledgeStateRepository,
        locale,
      });

      // then
      expect(response).to.equal(null);
      sinon.assert.notCalled(scorecardService.resetScorecard);
    });
  });
});
