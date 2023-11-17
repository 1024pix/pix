import { expect, sinon, domainBuilder } from '../../../../test-helper.js';
import {
  Assessment,
  CompetenceEvaluation,
  CampaignParticipationStatuses,
} from '../../../../../lib/domain/models/index.js';
import { Scorecard } from '../../../../../src/evaluation/domain/models/Scorecard.js';
import * as scorecardService from '../../../../../src/evaluation/domain/services/scorecard-service.js';
import { KnowledgeElement } from '../../../../../lib/domain/models/KnowledgeElement.js';

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
    let updatedCompetenceEvaluation;
    let userId;
    let competenceId;
    let knowledgeElements;
    let firstResetKe;
    let secondResetKe;

    const firstSkillId = 'recmoustache';
    const secondSkillId = 'rouflaquette';

    beforeEach(function () {
      updatedCompetenceEvaluation = Symbol('updated competence evaluation');
      resetKnowledgeElement2 = Symbol('reset knowledge element 2');
      resetKnowledgeElement1 = Symbol('reset knowledge element 1');
      userId = 1;
      competenceId = 2;
      knowledgeElements = [
        domainBuilder.buildKnowledgeElement({ id: 1, skillId: firstSkillId }),
        domainBuilder.buildKnowledgeElement({ id: 2, skillId: secondSkillId }),
      ];
      knowledgeElementRepository = {
        save: sinon.stub(),
        findUniqByUserIdAndCompetenceId: sinon.stub(),
      };
      assessmentRepository = {
        findNotAbortedCampaignAssessmentsByUserId: sinon.stub(),
        save: sinon.stub(),
        abortByAssessmentId: sinon.stub(),
      };

      knowledgeElementRepository.findUniqByUserIdAndCompetenceId
        .withArgs({ userId, competenceId })
        .resolves(knowledgeElements);

      firstResetKe = KnowledgeElement.reset(knowledgeElements[0]);
      secondResetKe = KnowledgeElement.reset(knowledgeElements[1]);

      resetKnowledgeElement1 = Symbol('reset knowledge element 1');
      resetKnowledgeElement2 = Symbol('reset knowledge element 2');
      updatedCompetenceEvaluation = Symbol('updated competence evaluation');
    });

    context('when competence evaluation exists', function () {
      beforeEach(async function () {
        // when
        const shouldResetCompetenceEvaluation = true;
        competenceEvaluationRepository = { updateStatusByUserIdAndCompetenceId: sinon.stub() };

        competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId
          .withArgs({ userId, competenceId, status: CompetenceEvaluation.statuses.RESET })
          .resolves(updatedCompetenceEvaluation);

        knowledgeElementRepository.save.withArgs(firstResetKe).resolves(resetKnowledgeElement1);
        knowledgeElementRepository.save.withArgs(secondResetKe).resolves(resetKnowledgeElement2);

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
        expect(resetKnowledgeElements).to.deep.equal([resetKnowledgeElement1, resetKnowledgeElement2]);
      });

      it('should reset the competence evaluation', async function () {
        expect(resetCompetenceEvaluation).to.deep.equal(updatedCompetenceEvaluation);
      });
    });

    context(
      'when competence evaluation does not exists - there is only knowledge elements thanks to campaign',
      function () {
        it('should reset each knowledge elements', async function () {
          // given
          const shouldResetCompetenceEvaluation = false;
          knowledgeElementRepository.save.withArgs(firstResetKe).resolves(resetKnowledgeElement1);
          knowledgeElementRepository.save.withArgs(secondResetKe).resolves(resetKnowledgeElement2);

          // when
          [resetKnowledgeElements, resetCampaignParticipation] = await scorecardService.resetScorecard({
            userId,
            competenceId,
            shouldResetCompetenceEvaluation,
            assessmentRepository,
            knowledgeElementRepository,
            competenceEvaluationRepository,
            campaignParticipationRepository,
          });
          // then
          expect(resetKnowledgeElements).to.deep.equal([resetKnowledgeElement1, resetKnowledgeElement2]);
        });
      },
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
      const shouldResetCompetenceEvaluation = false;

      beforeEach(async function () {
        const campaignParticipation1Updated = Symbol('campaign participation 1 updated');
        const campaignParticipation2Updated = Symbol('campaign participation 2 updated');
        const targetProfile = domainBuilder.buildTargetProfile({
          skills: [domainBuilder.buildSkill({ id: firstSkillId }, domainBuilder.buildSkill({ id: secondSkillId }))],
        });
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

        knowledgeElementRepository.save.withArgs(firstResetKe).resolves(firstResetKe);
        knowledgeElementRepository.save.withArgs(secondResetKe).resolves(secondResetKe);

        // when
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
          .resolves(['recbarbe', 'recbouc']);
        campaignRepository.findSkillIdsByCampaignParticipationId
          .withArgs({ campaignParticipationId: campaignParticipation2.id })
          .resolves(['recbarbe', 'recbouc']);

        knowledgeElementRepository.findUniqByUserIdAndCompetenceId
          .withArgs({ userId, competenceId })
          .resolves(knowledgeElements);
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

        expect(resetKnowledgeElements).to.deep.equal([firstResetKe, secondResetKe]);
      });

      it('should save a new Assessment', async function () {
        campaignRepository.findSkillIdsByCampaignParticipationId
          .withArgs({ campaignParticipationId: campaignParticipation1.id })
          .resolves([firstSkillId, secondSkillId]);
        campaignRepository.findSkillIdsByCampaignParticipationId
          .withArgs({ campaignParticipationId: campaignParticipation2.id })
          .resolves([firstSkillId, secondSkillId]);

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

      context("when doesn 't intersection between target skills and reset skills", function () {
        it('should return null for campaign participation', async function () {
          //given
          resetKnowledgeElement1 = domainBuilder.buildKnowledgeElement({ skillId: 'recAloevera' });
          resetKnowledgeElement2 = domainBuilder.buildKnowledgeElement({ skillId: 'recDing' });

          const resetKe1 = KnowledgeElement.reset(resetKnowledgeElement1);
          const resetKe2 = KnowledgeElement.reset(resetKnowledgeElement2);

          knowledgeElementRepository.save.withArgs(resetKnowledgeElement1).resolves(resetKe1);
          knowledgeElementRepository.save.withArgs(resetKnowledgeElement2).resolves(resetKe2);

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

        knowledgeElementRepository.save.withArgs(firstResetKe).resolves(resetKnowledgeElement1);
        knowledgeElementRepository.save.withArgs(secondResetKe).resolves(resetKnowledgeElement2);

        knowledgeElementRepository.findUniqByUserIdAndCompetenceId
          .withArgs({ userId, competenceId })
          .resolves(knowledgeElements);

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
