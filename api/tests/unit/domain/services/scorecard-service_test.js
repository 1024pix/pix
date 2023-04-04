const { expect, sinon, domainBuilder } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const CompetenceEvaluation = require('../../../../lib/domain/models/CompetenceEvaluation');
const scorecardService = require('../../../../lib/domain/services/scorecard-service');
const CampaignParticipationStatuses = require('../../../../lib/domain/models/CampaignParticipationStatuses');

const { STARTED, SHARED } = CampaignParticipationStatuses;

describe('Unit | Service | ScorecardService', function () {
  describe('#computeScorecard', function () {
    let competenceRepository;
    let areaRepository;
    let knowledgeElementRepository;
    let competenceEvaluationRepository;
    let buildFromStub;
    let competenceId;
    let authenticatedUserId;

    beforeEach(function () {
      competenceId = 1;
      authenticatedUserId = 1;
      competenceRepository = { get: sinon.stub() };
      areaRepository = { get: sinon.stub() };
      knowledgeElementRepository = { findUniqByUserIdAndCompetenceId: sinon.stub() };
      competenceEvaluationRepository = { findByUserId: sinon.stub() };
      buildFromStub = sinon.stub(Scorecard, 'buildFrom');
    });

    context('And user asks for his own scorecard', function () {
      it('should return the user scorecard', async function () {
        // given
        const earnedPixForCompetenceId1 = 8;
        const levelForCompetenceId1 = 1;
        const pixScoreAheadOfNextLevelForCompetenceId1 = 0;

        const competence = domainBuilder.buildCompetence({ id: 1, areaId: 'area' });
        const area = domainBuilder.buildArea({ id: 'area' });

        competenceRepository.get.resolves(competence);
        areaRepository.get.resolves(area);

        const knowledgeElementList = [
          domainBuilder.buildKnowledgeElement({ competenceId: 1 }),
          domainBuilder.buildKnowledgeElement({ competenceId: 1 }),
        ];

        knowledgeElementRepository.findUniqByUserIdAndCompetenceId.resolves(knowledgeElementList);

        const assessment = domainBuilder.buildAssessment({ state: 'completed', type: 'COMPETENCE_EVALUATION' });
        const competenceEvaluation = domainBuilder.buildCompetenceEvaluation({
          competenceId: 1,
          assessmentId: assessment.id,
          assessment,
        });

        competenceEvaluationRepository.findByUserId.resolves([competenceEvaluation]);

        const expectedUserScorecard = domainBuilder.buildUserScorecard({
          name: competence.name,
          earnedPix: earnedPixForCompetenceId1,
          level: levelForCompetenceId1,
          pixScoreAheadOfNextLevel: pixScoreAheadOfNextLevelForCompetenceId1,
        });

        buildFromStub
          .withArgs({
            userId: authenticatedUserId,
            knowledgeElements: knowledgeElementList,
            competence,
            area,
            competenceEvaluation,
            allowExcessLevel: false,
            allowExcessPix: false,
          })
          .returns(expectedUserScorecard);

        // when
        const userScorecard = await scorecardService.computeScorecard({
          userId: authenticatedUserId,
          competenceId,
          areaRepository,
          competenceRepository,
          competenceEvaluationRepository,
          knowledgeElementRepository,
        });

        //then
        expect(userScorecard).to.deep.equal(expectedUserScorecard);
      });
    });
  });

  describe('#resetScorecard', function () {
    let resetCampaignParticipation;
    let resetKnowledgeElements;
    let resetCompetenceEvaluation;
    let assessmentRepository;
    let knowledgeElementRepository;
    let competenceEvaluationRepository;
    let campaignParticipationRepository;
    let campaignRepository;
    let resetKnowledgeElement1;
    let resetKnowledgeElement2;

    const userId = 1;
    const competenceId = 2;
    const knowledgeElements = [{ id: 1 }, { id: 2 }];
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const updatedCompetenceEvaluation = Symbol('updated competence evaluation');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    resetKnowledgeElement2 = Symbol('reset knowledge element 2');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    resetKnowledgeElement1 = Symbol('reset knowledge element 1');

    context('when competence evaluation exists', function () {
      beforeEach(async function () {
        // when
        const shouldResetCompetenceEvaluation = true;
        assessmentRepository = { findNotAbortedCampaignAssessmentsByUserId: sinon.stub() };
        competenceEvaluationRepository = { updateStatusByUserIdAndCompetenceId: sinon.stub() };
        knowledgeElementRepository = {
          save: sinon.stub(),
          findUniqByUserIdAndCompetenceId: sinon.stub(),
        };

        competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId
          .withArgs({ userId, competenceId, status: CompetenceEvaluation.statuses.RESET })
          .resolves(updatedCompetenceEvaluation);

        knowledgeElementRepository.findUniqByUserIdAndCompetenceId
          .withArgs({ userId, competenceId })
          .resolves(knowledgeElements);

        knowledgeElementRepository.save
          .onFirstCall()
          .resolves(resetKnowledgeElement1)
          .onSecondCall()
          .resolves(resetKnowledgeElement2);

        [resetKnowledgeElements, resetCampaignParticipation, resetCompetenceEvaluation] =
          await scorecardService.resetScorecard({
            userId,
            competenceId,
            shouldResetCompetenceEvaluation,
            assessmentRepository,
            knowledgeElementRepository,
            competenceEvaluationRepository,
            campaignParticipationRepository,
          });
      });

      // then
      it('should reset each knowledge elements', async function () {
        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({
          id: 1,
          status: 'reset',
          earnedPix: 0,
        });
        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({
          id: 2,
          status: 'reset',
          earnedPix: 0,
        });
        expect(resetKnowledgeElements).to.deep.equal([resetKnowledgeElement1, resetKnowledgeElement2]);
      });

      it('should reset the competence evaluation', function () {
        expect(resetCompetenceEvaluation).to.deep.equal(updatedCompetenceEvaluation);
      });
    });

    context(
      'when competence evaluation does not exists - there is only knowledge elements thanks to campaign',
      function () {
        beforeEach(async function () {
          // when
          const shouldResetCompetenceEvaluation = false;
          assessmentRepository = { findNotAbortedCampaignAssessmentsByUserId: sinon.stub() };
          knowledgeElementRepository = {
            save: sinon.stub(),
            findUniqByUserIdAndCompetenceId: sinon.stub(),
          };

          knowledgeElementRepository.findUniqByUserIdAndCompetenceId
            .withArgs({ userId, competenceId })
            .resolves(knowledgeElements);

          knowledgeElementRepository.save
            .onFirstCall()
            .resolves(resetKnowledgeElement1)
            .onSecondCall()
            .resolves(resetKnowledgeElement2);

          [resetKnowledgeElements, resetCampaignParticipation] = await scorecardService.resetScorecard({
            userId,
            competenceId,
            shouldResetCompetenceEvaluation,
            assessmentRepository,
            knowledgeElementRepository,
            competenceEvaluationRepository,
            campaignParticipationRepository,
          });
        });

        // then
        it('should reset each knowledge elements', async function () {
          expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({
            id: 1,
            status: 'reset',
            earnedPix: 0,
          });
          expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({
            id: 2,
            status: 'reset',
            earnedPix: 0,
          });
          expect(resetKnowledgeElements).to.deep.equal([resetKnowledgeElement1, resetKnowledgeElement2]);
        });
      }
    );

    context('when campaign exists', function () {
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      const campaignParticipation1Updated = Symbol('campaign participation 1 updated');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      const campaignParticipation2Updated = Symbol('campaign participation 2 updated');
      const shouldResetCompetenceEvaluation = false;

      beforeEach(async function () {
        const skill = domainBuilder.buildSkill({ id: skillId });
        const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill] });
        campaign = domainBuilder.buildCampaign.ofTypeAssessment({ targetProfileId: targetProfile.id, targetProfile });
        campaignParticipation1 = domainBuilder.buildCampaignParticipation({
          id: 1,
          campaign,
          status: STARTED,
        });
        campaignParticipation2 = domainBuilder.buildCampaignParticipation({
          id: 2,
          campaign,
          status: STARTED,
        });
        oldAssessment1 = domainBuilder.buildAssessment.ofTypeCampaign({
          id: assessmentId1,
          state: 'started',
          campaignParticipationId: campaignParticipation1.id,
          userId,
        });
        oldAssessment2 = domainBuilder.buildAssessment.ofTypeCampaign({
          id: assessmentId2,
          state: 'started',
          campaignParticipationId: campaignParticipation2.id,
          userId,
        });
        oldAssessment1Aborted = domainBuilder.buildAssessment({
          ...oldAssessment1,
          state: Assessment.states.ABORTED,
          campaignParticipationId: campaignParticipation1.id,
        });
        oldAssessment2Aborted = domainBuilder.buildAssessment({
          ...oldAssessment2,
          state: Assessment.states.ABORTED,
          campaignParticipationId: campaignParticipation2.id,
        });
        newAssessment1Saved = domainBuilder.buildAssessment({
          id: 67890,
          campaignParticipationId: campaignParticipation1.id,
        });
        newAssessment2Saved = domainBuilder.buildAssessment({
          id: 98760,
          campaignParticipationId: campaignParticipation2.id,
        });
        resetKnowledgeElement1 = domainBuilder.buildKnowledgeElement({ skillId });
        resetKnowledgeElement2 = domainBuilder.buildKnowledgeElement({ skillId });

        // when
        assessmentRepository = {
          findNotAbortedCampaignAssessmentsByUserId: sinon.stub(),
          save: sinon.stub(),
          abortByAssessmentId: sinon.stub(),
        };
        knowledgeElementRepository = {
          save: sinon.stub(),
          findUniqByUserIdAndCompetenceId: sinon.stub(),
        };
        campaignParticipationRepository = {
          get: sinon.stub(),
          updateAssessmentIdByOldAssessmentId: sinon.stub(),
        };

        campaignRepository = {
          findSkillIdsByCampaignParticipationId: sinon.stub(),
        };

        assessmentRepository.findNotAbortedCampaignAssessmentsByUserId
          .withArgs(userId)
          .resolves([oldAssessment1, oldAssessment2]);

        assessmentRepository.abortByAssessmentId.withArgs(oldAssessment1.id).resolves(oldAssessment1Aborted);
        assessmentRepository.abortByAssessmentId.withArgs(oldAssessment2.id).resolves(oldAssessment2Aborted);

        assessmentRepository.save
          .onFirstCall()
          .resolves(newAssessment1Saved)
          .onSecondCall()
          .resolves(newAssessment2Saved);

        campaignParticipationRepository.get.withArgs(campaignParticipation1.id).resolves(campaignParticipation1);
        campaignParticipationRepository.get.withArgs(campaignParticipation2.id).resolves(campaignParticipation2);

        campaignParticipationRepository.updateAssessmentIdByOldAssessmentId
          .withArgs({ oldAssessmentId: oldAssessment1.id, newAssessmentId: newAssessment1Saved.id })
          .resolves(campaignParticipation1Updated);
        campaignParticipationRepository.updateAssessmentIdByOldAssessmentId
          .withArgs({ oldAssessmentId: oldAssessment2.id, newAssessmentId: newAssessment2Saved.id })
          .resolves(campaignParticipation2Updated);

        campaignRepository.findSkillIdsByCampaignParticipationId
          .withArgs({ campaignParticipationId: campaignParticipation1.id })
          .resolves([skillId]);
        campaignRepository.findSkillIdsByCampaignParticipationId
          .withArgs({ campaignParticipationId: campaignParticipation2.id })
          .resolves([skillId]);

        knowledgeElementRepository.findUniqByUserIdAndCompetenceId
          .withArgs({ userId, competenceId })
          .resolves(knowledgeElements);

        knowledgeElementRepository.save
          .onFirstCall()
          .resolves(resetKnowledgeElement1)
          .onSecondCall()
          .resolves(resetKnowledgeElement2);
      });

      // then
      it('should reset each knowledge Element', async function () {
        [resetKnowledgeElements, resetCampaignParticipation] = await scorecardService.resetScorecard({
          userId,
          competenceId,
          shouldResetCompetenceEvaluation,
          assessmentRepository,
          knowledgeElementRepository,
          campaignParticipationRepository,
          competenceEvaluationRepository,
          campaignRepository,
        });

        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({
          id: 1,
          status: 'reset',
          earnedPix: 0,
        });
        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({
          id: 2,
          status: 'reset',
          earnedPix: 0,
        });
        expect(resetKnowledgeElements).to.deep.equal([resetKnowledgeElement1, resetKnowledgeElement2]);
      });

      it('should save a new Assessment', async function () {
        // when
        await scorecardService.resetScorecard({
          userId,
          competenceId,
          shouldResetCompetenceEvaluation,
          assessmentRepository,
          knowledgeElementRepository,
          campaignParticipationRepository,
          competenceEvaluationRepository,
          campaignRepository,
        });
        // given
        expect(assessmentRepository.save.args[0][0].assessment).to.include({
          type: 'CAMPAIGN',
          state: 'started',
          userId,
          campaignParticipationId: 1,
        });
        expect(assessmentRepository.save.args[1][0].assessment).to.include({
          type: 'CAMPAIGN',
          state: 'started',
          userId,
          campaignParticipationId: 2,
        });
      });

      context('when campaign participation is already shared', function () {
        it('should return null for campaign participation', async function () {
          //given
          const campaignParticipation1Shared = domainBuilder.buildCampaignParticipation({
            id: 1,
            campaign,
            status: SHARED,
          });
          const campaignParticipation2Shared = domainBuilder.buildCampaignParticipation({
            id: 2,
            campaign,
            status: SHARED,
          });

          campaignParticipationRepository.get
            .withArgs(campaignParticipation1.id)
            .resolves(campaignParticipation1Shared);
          campaignParticipationRepository.get
            .withArgs(campaignParticipation2.id)
            .resolves(campaignParticipation2Shared);

          //when
          [resetKnowledgeElements, resetCampaignParticipation] = await scorecardService.resetScorecard({
            userId,
            competenceId,
            shouldResetCompetenceEvaluation,
            assessmentRepository,
            knowledgeElementRepository,
            campaignParticipationRepository,
            competenceEvaluationRepository,
            campaignRepository,
          });
          //then
          expect(resetCampaignParticipation).to.deep.equal([null, null]);
        });
      });

      context("when dosen 't intersection between target skills and reset skills", function () {
        it('should return null for campaign participation', async function () {
          //given
          resetKnowledgeElement1 = domainBuilder.buildKnowledgeElement({ skillId: 'recAloevera' });
          resetKnowledgeElement2 = domainBuilder.buildKnowledgeElement({ skillId: 'recDing' });

          knowledgeElementRepository.save
            .onFirstCall()
            .resolves(resetKnowledgeElement1)
            .onSecondCall()
            .resolves(resetKnowledgeElement2);

          //when
          [resetKnowledgeElements, resetCampaignParticipation] = await scorecardService.resetScorecard({
            userId,
            competenceId,
            shouldResetCompetenceEvaluation,
            assessmentRepository,
            knowledgeElementRepository,
            campaignParticipationRepository,
            competenceEvaluationRepository,
            campaignRepository,
          });

          //then
          expect(resetCampaignParticipation).to.deep.equal([null, null]);
        });
      });
    });

    context('when campaign does not exists', function () {
      beforeEach(async function () {
        // when
        const shouldResetCompetenceEvaluation = false;
        assessmentRepository = {
          findNotAbortedCampaignAssessmentsByUserId: sinon.stub(),
          save: sinon.stub(),
          abortByAssessmentId: sinon.stub(),
        };
        knowledgeElementRepository = {
          save: sinon.stub(),
          findUniqByUserIdAndCompetenceId: sinon.stub(),
        };

        assessmentRepository.findNotAbortedCampaignAssessmentsByUserId.withArgs(userId).resolves(null);

        knowledgeElementRepository.findUniqByUserIdAndCompetenceId
          .withArgs({ userId, competenceId })
          .resolves(knowledgeElements);

        knowledgeElementRepository.save
          .onFirstCall()
          .resolves(resetKnowledgeElement1)
          .onSecondCall()
          .resolves(resetKnowledgeElement2);

        [resetKnowledgeElements, resetCampaignParticipation] = await scorecardService.resetScorecard({
          userId,
          competenceId,
          shouldResetCompetenceEvaluation,
          assessmentRepository,
          knowledgeElementRepository,
          competenceEvaluationRepository,
          campaignRepository,
        });
      });

      // then
      it('should reset each assessments', async function () {
        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({
          id: 1,
          status: 'reset',
          earnedPix: 0,
        });
        expect(knowledgeElementRepository.save).to.have.been.calledWithExactly({
          id: 2,
          status: 'reset',
          earnedPix: 0,
        });
        expect(resetKnowledgeElements).to.deep.equal([resetKnowledgeElement1, resetKnowledgeElement2]);
      });

      it('should not save another assessment', async function () {
        expect(assessmentRepository.save).to.not.have.been.called;
        expect(assessmentRepository.abortByAssessmentId).to.not.have.been.called;
        expect(resetCampaignParticipation).to.equal(null);
      });
    });
  });

  describe('#_computeResetSkillsNotIncludedInTargetProfile', function () {
    it('should return true when no skill is in common between target profile and reset skills', function () {
      // given
      const targetedSkillIds = ['recmoustache', 'recherisson'];
      const resetSkillIds = ['recbarbe', 'rectaupe'];

      // when
      const response = scorecardService._computeResetSkillsNotIncludedInCampaign({
        targetedSkillIds,
        resetSkillIds,
      });

      // then
      expect(response).to.equal(true);
    });

    it('should return false when some skills are in common between target profile and reset skills', function () {
      // given
      const skillIds = ['recmoustache', 'recherisson'];
      const resetSkillIds = ['recmoustache', 'rectaupe'];

      // when
      const response = scorecardService._computeResetSkillsNotIncludedInCampaign({
        skillIds,
        resetSkillIds,
      });

      // then
      expect(response).to.equal(false);
    });

    it('should return false when all skills are in common between target profile and reset skills', function () {
      // given
      const skillIds = ['recmoustache', 'recherisson'];
      const resetSkillIds = ['recmoustache', 'recherisson'];

      // when
      const response = scorecardService._computeResetSkillsNotIncludedInCampaign({
        skillIds,
        resetSkillIds,
      });

      // then
      expect(response).to.equal(false);
    });
  });
});
