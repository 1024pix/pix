const { expect, sinon, domainBuilder } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const CompetenceEvaluation = require('../../../../lib/domain/models/CompetenceEvaluation');
const scorecardService = require('../../../../lib/domain/services/scorecard-service');

describe('Unit | Service | ScorecardService', function() {

  describe('#computeScorecard', function() {

    let competenceRepository;
    let knowledgeElementRepository;
    let competenceEvaluationRepository;
    let buildFromStub;
    let competenceId;
    let authenticatedUserId;

    beforeEach(() => {
      competenceId = 1;
      authenticatedUserId = 1;
      competenceRepository = { get: sinon.stub() };
      knowledgeElementRepository = { findUniqByUserIdAndCompetenceId: sinon.stub() };
      competenceEvaluationRepository = { findByUserId: sinon.stub() };
      buildFromStub = sinon.stub(Scorecard, 'buildFrom');
    });

    afterEach(() => {
      sinon.restore();
    });

    context('And user asks for his own scorecard', () => {

      it('should return the user scorecard', async () => {
        // given
        const earnedPixForCompetenceId1 = 8;
        const levelForCompetenceId1 = 1;
        const pixScoreAheadOfNextLevelForCompetenceId1 = 0;

        const competence = domainBuilder.buildCompetence({ id: 1 });

        competenceRepository.get.resolves(competence);

        const knowledgeElementList = [
          domainBuilder.buildKnowledgeElement({ competenceId: 1 }),
          domainBuilder.buildKnowledgeElement({ competenceId: 1 }),
        ];

        knowledgeElementRepository.findUniqByUserIdAndCompetenceId.resolves(knowledgeElementList);

        const assessment = domainBuilder.buildAssessment({ state: 'completed', type: 'COMPETENCE_EVALUATION' });
        const competenceEvaluation = domainBuilder.buildCompetenceEvaluation({
          competenceId: 1,
          assessmentId: assessment.id,
          assessment
        });

        competenceEvaluationRepository.findByUserId.resolves([competenceEvaluation]);

        const expectedUserScorecard = domainBuilder.buildUserScorecard({
          name: competence.name,
          earnedPix: earnedPixForCompetenceId1,
          level: levelForCompetenceId1,
          pixScoreAheadOfNextLevel: pixScoreAheadOfNextLevelForCompetenceId1
        });

        buildFromStub.withArgs({
          userId: authenticatedUserId,
          knowledgeElements: knowledgeElementList,
          competence,
          competenceEvaluation
        }).returns(expectedUserScorecard);

        // when
        const userScorecard = await scorecardService.computeScorecard({
          userId: authenticatedUserId,
          competenceId,
          competenceRepository,
          competenceEvaluationRepository,
          knowledgeElementRepository
        });

        //then
        expect(userScorecard).to.deep.equal(expectedUserScorecard);
      });
    });
  });

  describe('#resetScorecard', function() {

    let resetCampaignParticipation;
    let resetKnowledgeElements;
    let resetCompetenceEvaluation;
    let assessmentRepository;
    let knowledgeElementRepository;
    let competenceEvaluationRepository;
    let campaignParticipationRepository;

    const userId = 1;
    const competenceId = 2;
    const knowledgeElements = [{ id: 1 }, { id: 2 }];
    const resetKnowledgeElement1 = Symbol('reset knowledge element 1');
    const resetKnowledgeElement2 = Symbol('reset knowledge element 2');
    const updatedCompetenceEvaluation = Symbol('updated competence evaluation');

    context('when competence evaluation exists', function() {

      beforeEach(async () => {
        // when
        const shouldResetCompetenceEvaluation = true;
        assessmentRepository = { findSmartPlacementAssessmentsByUserId: sinon.stub() };
        competenceEvaluationRepository = { updateStatusByUserIdAndCompetenceId: sinon.stub() };
        knowledgeElementRepository = {
          save: sinon.stub(),
          findUniqByUserIdAndCompetenceId: sinon.stub(),
        };

        competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId
          .withArgs({ userId, competenceId, status: CompetenceEvaluation.statuses.RESET })
          .resolves(updatedCompetenceEvaluation);

        knowledgeElementRepository.findUniqByUserIdAndCompetenceId
          .withArgs({ userId, competenceId }).resolves(knowledgeElements);

        knowledgeElementRepository.save
          .onFirstCall().resolves(resetKnowledgeElement1)
          .onSecondCall().resolves(resetKnowledgeElement2);

        [resetCampaignParticipation, resetCompetenceEvaluation, resetKnowledgeElements] = await scorecardService.resetScorecard({
          userId, competenceId, shouldResetCompetenceEvaluation, assessmentRepository, knowledgeElementRepository, competenceEvaluationRepository,
        });
      });

      // then
      it('should reset each knowledge elements', async () => {
        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({ id: 1, status: 'reset', earnedPix: 0 });
        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({ id: 2, status: 'reset', earnedPix: 0 });
        expect(resetKnowledgeElements).to.deep.equal([resetKnowledgeElement1, resetKnowledgeElement2]);
      });

      it('should reset the competence evaluation', () => {
        expect(resetCompetenceEvaluation).to.deep.equal(updatedCompetenceEvaluation);
      });
    });

    context('when competence evaluation does not exists - there is only knowledge elements thanks to campaign', function() {

      beforeEach(async () => {
        // when
        const shouldResetCompetenceEvaluation = false;
        assessmentRepository = { findSmartPlacementAssessmentsByUserId: sinon.stub() };
        knowledgeElementRepository = {
          save: sinon.stub(),
          findUniqByUserIdAndCompetenceId: sinon.stub(),
        };

        knowledgeElementRepository.findUniqByUserIdAndCompetenceId
          .withArgs({ userId, competenceId }).resolves(knowledgeElements);

        knowledgeElementRepository.save
          .onFirstCall().resolves(resetKnowledgeElement1)
          .onSecondCall().resolves(resetKnowledgeElement2);

        [resetCampaignParticipation, resetKnowledgeElements] = await scorecardService.resetScorecard({
          userId, competenceId, shouldResetCompetenceEvaluation, assessmentRepository, knowledgeElementRepository, competenceEvaluationRepository,
        });
      });

      // then
      it('should reset each knowledge elements', async () => {
        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({ id: 1, status: 'reset', earnedPix: 0 });
        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({ id: 2, status: 'reset', earnedPix: 0 });
        expect(resetKnowledgeElements).to.deep.equal([resetKnowledgeElement1, resetKnowledgeElement2]);
      });
    });

    context('when campaign exists', function() {

      let oldAssessment1;
      let oldAssessment2;
      let oldAssessment1Aborted;
      let oldAssessment2Aborted;
      let newAssessment1Saved;
      let newAssessment2Saved;
      const campaignParticipation1 = Symbol('campaign participation 1');
      const campaignParticipation2 = Symbol('campaign participation 2');
      const campaignParticipation1Updated = Symbol('campaign participation 1 updated');
      const campaignParticipation2Updated = Symbol('campaign participation 2 updated');
      const shouldResetCompetenceEvaluation = false;

      beforeEach(async () => {
        oldAssessment1 = domainBuilder.buildAssessment({ id: 12345 });
        oldAssessment2 = domainBuilder.buildAssessment({ id: 54321 });
        oldAssessment1Aborted = domainBuilder.buildAssessment({ ...oldAssessment1, state: Assessment.states.ABORTED });
        oldAssessment2Aborted = domainBuilder.buildAssessment({ ...oldAssessment2, state: Assessment.states.ABORTED });
        newAssessment1Saved = domainBuilder.buildAssessment({ id: 67890 });
        newAssessment2Saved = domainBuilder.buildAssessment({ id: 98760 });

        // when
        assessmentRepository = {
          findSmartPlacementAssessmentsByUserId: sinon.stub(),
          save: sinon.stub(),
          updateStateById: sinon.stub(),
        };
        knowledgeElementRepository = {
          save: sinon.stub(),
          findUniqByUserIdAndCompetenceId: sinon.stub(),
        };
        campaignParticipationRepository = {
          findOneByAssessmentId: sinon.stub(),
          updateAssessmentIdByOldAssessmentId: sinon.stub(),
        };

        assessmentRepository.findSmartPlacementAssessmentsByUserId.withArgs(userId).resolves([oldAssessment1, oldAssessment2]);

        assessmentRepository.updateStateById.withArgs({ id: oldAssessment1.id, state: Assessment.states.ABORTED }).resolves(oldAssessment1Aborted);
        assessmentRepository.updateStateById.withArgs({ id: oldAssessment2.id, state: Assessment.states.ABORTED }).resolves(oldAssessment2Aborted);

        assessmentRepository.save
          .onFirstCall().resolves(newAssessment1Saved)
          .onSecondCall().resolves(newAssessment2Saved);

        campaignParticipationRepository.findOneByAssessmentId.withArgs(oldAssessment1.id).resolves(campaignParticipation1);
        campaignParticipationRepository.findOneByAssessmentId.withArgs(oldAssessment2.id).resolves(campaignParticipation2);

        campaignParticipationRepository.updateAssessmentIdByOldAssessmentId
          .withArgs({ oldAssessmentId: oldAssessment1.id, assessmentId: newAssessment1Saved.id })
          .resolves(campaignParticipation1Updated);
        campaignParticipationRepository.updateAssessmentIdByOldAssessmentId
          .withArgs({ oldAssessmentId: oldAssessment2.id, assessmentId: newAssessment2Saved.id })
          .resolves(campaignParticipation2Updated);

        knowledgeElementRepository.findUniqByUserIdAndCompetenceId
          .withArgs({ userId, competenceId }).resolves(knowledgeElements);

        knowledgeElementRepository.save
          .onFirstCall().resolves(resetKnowledgeElement1)
          .onSecondCall().resolves(resetKnowledgeElement2);

        [resetCampaignParticipation, resetKnowledgeElements] = await scorecardService.resetScorecard({
          userId, competenceId, shouldResetCompetenceEvaluation, assessmentRepository, knowledgeElementRepository, campaignParticipationRepository, competenceEvaluationRepository,
        });
      });

      // then
      it('should reset each assessments', async () => {
        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({ id: 1, status: 'reset', earnedPix: 0 });
        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({ id: 2, status: 'reset', earnedPix: 0 });
        expect(resetKnowledgeElements).to.deep.equal([resetKnowledgeElement1, resetKnowledgeElement2]);
      });

      it('should update old assessment and save another assessment', async () => {
        expect(resetCampaignParticipation).to.deep.equal([campaignParticipation1Updated, campaignParticipation2Updated]);
      });
    });

    context('when campaign does not exists', function() {

      beforeEach(async () => {
        // when
        const shouldResetCompetenceEvaluation = false;
        assessmentRepository = {
          findSmartPlacementAssessmentsByUserId: sinon.stub(),
          save: sinon.stub(),
          updateStateById: sinon.stub(),
        };
        knowledgeElementRepository = {
          save: sinon.stub(),
          findUniqByUserIdAndCompetenceId: sinon.stub(),
        };

        assessmentRepository.findSmartPlacementAssessmentsByUserId.withArgs(userId).resolves(null);

        knowledgeElementRepository.findUniqByUserIdAndCompetenceId
          .withArgs({ userId, competenceId }).resolves(knowledgeElements);

        knowledgeElementRepository.save
          .onFirstCall().resolves(resetKnowledgeElement1)
          .onSecondCall().resolves(resetKnowledgeElement2);

        [resetCampaignParticipation, resetKnowledgeElements] = await scorecardService.resetScorecard({
          userId, competenceId, shouldResetCompetenceEvaluation, assessmentRepository, knowledgeElementRepository, competenceEvaluationRepository,
        });
      });

      // then
      it('should reset each assessments', async () => {
        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({ id: 1, status: 'reset', earnedPix: 0 });
        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({ id: 2, status: 'reset', earnedPix: 0 });
        expect(resetKnowledgeElements).to.deep.equal([resetKnowledgeElement1, resetKnowledgeElement2]);
      });

      it('should not save another assessment', async () => {
        expect(assessmentRepository.save).to.not.have.been.called;
        expect(assessmentRepository.updateStateById).to.not.have.been.called;
        expect(resetCampaignParticipation).to.equal(null);
      });
    });

  });

});
