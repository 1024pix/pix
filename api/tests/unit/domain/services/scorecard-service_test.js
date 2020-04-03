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
          competenceEvaluation,
          blockReachablePixAndLevel: false
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
    let resetKnowledgeElement1;
    let resetKnowledgeElement2;

    const userId = 1;
    const competenceId = 2;
    const knowledgeElements = [{ id: 1 }, { id: 2 }];
    const updatedCompetenceEvaluation = Symbol('updated competence evaluation');
    resetKnowledgeElement2 = Symbol('reset knowledge element 2');
    resetKnowledgeElement1 = Symbol('reset knowledge element 1');

    context('when competence evaluation exists', function() {

      beforeEach(async () => {
        // when
        const shouldResetCompetenceEvaluation = true;
        assessmentRepository = { findNotAbortedSmartPlacementAssessmentsByUserId: sinon.stub() };
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

        [resetKnowledgeElements, resetCampaignParticipation, resetCompetenceEvaluation] = await scorecardService.resetScorecard({
          userId, competenceId, shouldResetCompetenceEvaluation, assessmentRepository, knowledgeElementRepository, competenceEvaluationRepository, campaignParticipationRepository
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
        assessmentRepository = { findNotAbortedSmartPlacementAssessmentsByUserId: sinon.stub() };
        knowledgeElementRepository = {
          save: sinon.stub(),
          findUniqByUserIdAndCompetenceId: sinon.stub(),
        };

        knowledgeElementRepository.findUniqByUserIdAndCompetenceId
          .withArgs({ userId, competenceId }).resolves(knowledgeElements);

        knowledgeElementRepository.save
          .onFirstCall().resolves(resetKnowledgeElement1)
          .onSecondCall().resolves(resetKnowledgeElement2);

        [resetKnowledgeElements, resetCampaignParticipation] = await scorecardService.resetScorecard({
          userId, competenceId, shouldResetCompetenceEvaluation, assessmentRepository, knowledgeElementRepository, competenceEvaluationRepository, campaignParticipationRepository,
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
      let campaignParticipation1;
      let campaignParticipation2;
      let campaign;
      const assessmentId1 = 12345;
      const assessmentId2 = 56789;
      const skillId = 'recmoustache';
      const campaignParticipation1Updated = Symbol('campaign participation 1 updated');
      const campaignParticipation2Updated = Symbol('campaign participation 2 updated');
      const shouldResetCompetenceEvaluation = false;

      beforeEach(async () => {
        const skill = domainBuilder.buildSkill({ id: skillId });
        const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill] });
        campaign = domainBuilder.buildCampaign.ofTypeAssessment({ targetProfileId: targetProfile.id, targetProfile });
        campaignParticipation1 = domainBuilder.buildCampaignParticipation({ id: 1, campaign, campaignId: campaign.id, isShared: false });
        campaignParticipation2 = domainBuilder.buildCampaignParticipation({ id: 2, campaign, campaignId: campaign.id, isShared: false });
        oldAssessment1 = domainBuilder.buildAssessment.ofTypeSmartPlacement({ id: assessmentId1, state: 'started', campaignParticipationId: campaignParticipation1.id, userId });
        oldAssessment2 = domainBuilder.buildAssessment.ofTypeSmartPlacement({ id: assessmentId2, state: 'started', campaignParticipationId: campaignParticipation2.id, userId });
        oldAssessment1Aborted = domainBuilder.buildAssessment({ ...oldAssessment1, state: Assessment.states.ABORTED, campaignParticipationId: campaignParticipation1.id });
        oldAssessment2Aborted = domainBuilder.buildAssessment({ ...oldAssessment2, state: Assessment.states.ABORTED, campaignParticipationId: campaignParticipation2.id });
        newAssessment1Saved = domainBuilder.buildAssessment({ id: 67890, campaignParticipationId: campaignParticipation1.id });
        newAssessment2Saved = domainBuilder.buildAssessment({ id: 98760, campaignParticipationId: campaignParticipation2.id });
        resetKnowledgeElement1 = domainBuilder.buildKnowledgeElement({ skillId });
        resetKnowledgeElement2 = domainBuilder.buildKnowledgeElement({ skillId });

        // when
        assessmentRepository = {
          findNotAbortedSmartPlacementAssessmentsByUserId: sinon.stub(),
          save: sinon.stub(),
          abortByAssessmentId: sinon.stub(),
        };
        knowledgeElementRepository = {
          save: sinon.stub(),
          findUniqByUserIdAndCompetenceId: sinon.stub(),
        };
        campaignParticipationRepository = {
          findOneByAssessmentIdWithSkillIds: sinon.stub(),
          updateAssessmentIdByOldAssessmentId: sinon.stub(),
        };

        assessmentRepository.findNotAbortedSmartPlacementAssessmentsByUserId.withArgs(userId).resolves([oldAssessment1, oldAssessment2]);

        assessmentRepository.abortByAssessmentId.withArgs(oldAssessment1.id).resolves(oldAssessment1Aborted);
        assessmentRepository.abortByAssessmentId.withArgs(oldAssessment2.id).resolves(oldAssessment2Aborted);

        assessmentRepository.save
          .onFirstCall().resolves(newAssessment1Saved)
          .onSecondCall().resolves(newAssessment2Saved);

        campaignParticipationRepository.findOneByAssessmentIdWithSkillIds.withArgs(oldAssessment1.id).resolves(campaignParticipation1);
        campaignParticipationRepository.findOneByAssessmentIdWithSkillIds.withArgs(oldAssessment2.id).resolves(campaignParticipation2);

        campaignParticipationRepository.updateAssessmentIdByOldAssessmentId
          .withArgs({ oldAssessmentId: oldAssessment1.id, newAssessmentId: newAssessment1Saved.id })
          .resolves(campaignParticipation1Updated);
        campaignParticipationRepository.updateAssessmentIdByOldAssessmentId
          .withArgs({ oldAssessmentId: oldAssessment2.id, newAssessmentId: newAssessment2Saved.id })
          .resolves(campaignParticipation2Updated);

        knowledgeElementRepository.findUniqByUserIdAndCompetenceId
          .withArgs({ userId, competenceId }).resolves(knowledgeElements);

        knowledgeElementRepository.save
          .onFirstCall().resolves(resetKnowledgeElement1)
          .onSecondCall().resolves(resetKnowledgeElement2);
      });

      // then
      it('should reset each knowledge Element', async () => {

        [resetKnowledgeElements, resetCampaignParticipation] = await scorecardService.resetScorecard({
          userId, competenceId, shouldResetCompetenceEvaluation, assessmentRepository, knowledgeElementRepository, campaignParticipationRepository, competenceEvaluationRepository,
        });

        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({ id: 1, status: 'reset', earnedPix: 0 });
        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({ id: 2, status: 'reset', earnedPix: 0 });
        expect(resetKnowledgeElements).to.deep.equal([resetKnowledgeElement1, resetKnowledgeElement2]);
      });

      it('should save a new Assessment', async () => {

        // when
        await scorecardService.resetScorecard({
          userId, competenceId, shouldResetCompetenceEvaluation, assessmentRepository, knowledgeElementRepository, campaignParticipationRepository, competenceEvaluationRepository,
        });
        // given
        expect(assessmentRepository.save.args[0][0]).to.include({ type: 'SMART_PLACEMENT', state: 'started', userId, campaignParticipationId: 1 });
        expect(assessmentRepository.save.args[1][0]).to.include({ type: 'SMART_PLACEMENT', state: 'started', userId, campaignParticipationId: 2 });
      });

      context('when campaign is already shared', function() {

        it('should return null for campaign participation', async function() {
          //given
          const campaignParticipation3 = domainBuilder.buildCampaignParticipation({ assessmentId: assessmentId1, campaign, campaignId: campaign.id, isShared: true });
          const campaignParticipation4 = domainBuilder.buildCampaignParticipation({ assessmentId: assessmentId2, campaign, campaignId: campaign.id, isShared: true });
          campaignParticipationRepository.findOneByAssessmentIdWithSkillIds.withArgs(assessmentId1).resolves(campaignParticipation3);
          campaignParticipationRepository.findOneByAssessmentIdWithSkillIds.withArgs(assessmentId2).resolves(campaignParticipation4);

          //when
          [resetKnowledgeElements, resetCampaignParticipation] =  await scorecardService.resetScorecard({
            userId, competenceId, shouldResetCompetenceEvaluation, assessmentRepository, knowledgeElementRepository, campaignParticipationRepository, competenceEvaluationRepository,
          });
          //then
          expect(resetCampaignParticipation).to.deep.equal([null, null]);
        });
      });

      context('when dosen \'t intersection between target skills and reset skills', function() {

        it('should return null for campaign participation', async function() {
          //given
          resetKnowledgeElement1 = domainBuilder.buildKnowledgeElement({ skillId: 'recAloevera' });
          resetKnowledgeElement2 = domainBuilder.buildKnowledgeElement({ skillId: 'recDing' });

          knowledgeElementRepository.save
            .onFirstCall().resolves(resetKnowledgeElement1)
            .onSecondCall().resolves(resetKnowledgeElement2);

          //when
          [resetKnowledgeElements, resetCampaignParticipation] =  await scorecardService.resetScorecard({
            userId, competenceId, shouldResetCompetenceEvaluation, assessmentRepository, knowledgeElementRepository, campaignParticipationRepository, competenceEvaluationRepository,
          });

          //then
          expect(resetCampaignParticipation).to.deep.equal([null, null]);
        });
      });

    });

    context('when campaign does not exists', function() {

      beforeEach(async () => {
        // when
        const shouldResetCompetenceEvaluation = false;
        assessmentRepository = {
          findNotAbortedSmartPlacementAssessmentsByUserId: sinon.stub(),
          save: sinon.stub(),
          abortByAssessmentId: sinon.stub(),
        };
        knowledgeElementRepository = {
          save: sinon.stub(),
          findUniqByUserIdAndCompetenceId: sinon.stub(),
        };

        assessmentRepository.findNotAbortedSmartPlacementAssessmentsByUserId.withArgs(userId).resolves(null);

        knowledgeElementRepository.findUniqByUserIdAndCompetenceId
          .withArgs({ userId, competenceId }).resolves(knowledgeElements);

        knowledgeElementRepository.save
          .onFirstCall().resolves(resetKnowledgeElement1)
          .onSecondCall().resolves(resetKnowledgeElement2);

        [resetKnowledgeElements, resetCampaignParticipation] = await scorecardService.resetScorecard({
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
        expect(assessmentRepository.abortByAssessmentId).to.not.have.been.called;
        expect(resetCampaignParticipation).to.equal(null);
      });
    });

  });

  describe('#_computeResetSkillsNotIncludedInTargetProfile', function() {

    it('should return true when no skill is in common between target profile and reset skills', function() {
      // given
      const targetObjectSkills = [{ id: 'recmoustache' }, { id: 'recherisson' }];
      const resetSkills = ['recbarbe', 'rectaupe'];

      // when
      const response = scorecardService._computeResetSkillsNotIncludedInTargetProfile({ targetObjectSkills, resetSkills });

      // then
      expect(response).to.equal(true);
    });

    it('should return false when some skills are in common between target profile and reset skills', function() {
      // given
      const targetObjectSkills = [{ id: 'recmoustache' }, { id: 'recherisson' }];
      const resetSkills = ['recmoustache', 'rectaupe'];

      // when
      const response = scorecardService._computeResetSkillsNotIncludedInTargetProfile({ targetObjectSkills, resetSkills });

      // then
      expect(response).to.equal(false);
    });

    it('should return false when all skills are in common between target profile and reset skills', function() {
      // given
      const targetObjectSkills = [{ id: 'recmoustache' }, { id: 'recherisson' }];
      const resetSkills = ['recmoustache', 'recherisson'];

      // when
      const response = scorecardService._computeResetSkillsNotIncludedInTargetProfile({ targetObjectSkills, resetSkills });

      // then
      expect(response).to.equal(false);
    });
  });

});
