import sinon from 'sinon';

import { CompetenceEvaluation } from '../../../../../src/evaluation/domain/models/CompetenceEvaluation.js';
import { Scorecard } from '../../../../../src/evaluation/domain/models/Scorecard.js';
import * as scorecardService from '../../../../../src/evaluation/domain/services/scorecard-service.js';
import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

const { STARTED, SHARED } = CampaignParticipationStatuses;

describe('Unit | Service | ScorecardService', function () {
  describe('#computeScorecard', function () {
    let competenceRepository;
    let areaRepository;
    let knowledgeStateRepository;
    let competenceScoreRepository;
    let competenceEvaluationRepository;
    let buildFromStub;
    let competenceId;
    let authenticatedUserId;

    beforeEach(function () {
      competenceId = 1;
      authenticatedUserId = 1;
      competenceRepository = { get: sinon.stub() };
      areaRepository = { get: sinon.stub() };
      knowledgeStateRepository = {
        findByUserId: sinon.stub(),
      };
      competenceScoreRepository = { findByUserId: sinon.stub().resolves(new Map()) };
      competenceEvaluationRepository = { findByUserId: sinon.stub() };
      buildFromStub = sinon.stub(Scorecard, 'buildFrom');
    });

    context('And user asks for his own scorecard', function () {
      it('should return the user scorecard', async function () {
        // given
        const competence = domainBuilder.buildCompetence({
          id: 1,
          areaId: 'area',
        });
        const area = domainBuilder.buildArea({ id: 'area' });

        competenceRepository.get.resolves(competence);
        areaRepository.get.resolves(area);

        const knowledgeState = domainBuilder.buildKnowledgeState.forSkills({
          validatedSkillIds: ['skillA', 'skillB'],
          competenceId: 1,
        });
        knowledgeStateRepository.findByUserId.withArgs({ userId: authenticatedUserId }).resolves(knowledgeState);

        const assessment = domainBuilder.buildAssessment({
          state: 'completed',
          type: 'COMPETENCE_EVALUATION',
        });
        const competenceEvaluation = domainBuilder.buildCompetenceEvaluation({
          competenceId: 1,
          assessmentId: assessment.id,
          assessment,
        });

        competenceEvaluationRepository.findByUserId.resolves([competenceEvaluation]);

        const expectedUserScorecard = domainBuilder.buildUserScorecard({
          name: competence.name,
          earnedPix: 8,
          level: 1,
          pixScoreAheadOfNextLevel: 0,
        });

        buildFromStub.returns(expectedUserScorecard);

        // when
        const userScorecard = await scorecardService.computeScorecard({
          userId: authenticatedUserId,
          competenceId,
          areaRepository,
          competenceRepository,
          competenceEvaluationRepository,
          knowledgeStateRepository,
          competenceScoreRepository,
        });

        //then
        expect(userScorecard).to.deep.equal(expectedUserScorecard);
        expect(buildFromStub).to.have.been.calledWithMatch({
          userId: authenticatedUserId,
          competence,
          area,
          competenceEvaluation,
          allowExcessLevel: false,
          allowExcessPix: false,
        });
        const { knowledgeState: stateGivenToScorecard } = buildFromStub.firstCall.args[0];
        expect(stateGivenToScorecard.validatedSkills().map(({ id }) => id)).to.have.members(['skillA', 'skillB']);
      });

      it('passes the competence score balance to the scorecard', async function () {
        // given
        const competence = domainBuilder.buildCompetence({ id: 1, areaId: 'area' });
        competenceRepository.get.resolves(competence);
        areaRepository.get.resolves(domainBuilder.buildArea({ id: 'area' }));
        knowledgeStateRepository.findByUserId.resolves(domainBuilder.buildKnowledgeState());
        competenceEvaluationRepository.findByUserId.resolves([]);
        competenceScoreRepository.findByUserId.withArgs({ userId: authenticatedUserId }).resolves(new Map([[1, 12.5]]));
        buildFromStub.returns(domainBuilder.buildUserScorecard());

        // when
        await scorecardService.computeScorecard({
          userId: authenticatedUserId,
          competenceId,
          areaRepository,
          competenceRepository,
          competenceEvaluationRepository,
          knowledgeStateRepository,
          competenceScoreRepository,
        });

        // then
        expect(buildFromStub).to.have.been.calledWithMatch({ exactlyEarnedPix: 12.5 });
      });
    });
  });

  describe('#resetScorecard', function () {
    let assessmentRepository;
    let knowledgeStateRepository;
    let competenceEvaluationRepository;
    let campaignParticipationRepository;
    let campaignRepository;
    let updatedCompetenceEvaluation;
    let userId;
    let competenceId;

    const firstSkillId = 'recmoustache';
    const secondSkillId = 'rouflaquette';

    beforeEach(function () {
      updatedCompetenceEvaluation = Symbol('updated competence evaluation');
      userId = 1;
      competenceId = 2;
      knowledgeStateRepository = {
        findByUserId: sinon.stub(),
        forgetCompetence: sinon.stub().resolves(),
      };
      assessmentRepository = {
        findNotAbortedCampaignAssessmentsByUserId: sinon.stub(),
        save: sinon.stub(),
        abortByAssessmentId: sinon.stub(),
      };
      competenceEvaluationRepository = {
        updateStatusByUserIdAndCompetenceId: sinon.stub(),
      };
      campaignParticipationRepository = {
        get: sinon.stub(),
        updateAssessmentIdByOldAssessmentId: sinon.stub(),
      };

      campaignRepository = {
        findSkillIdsByCampaignParticipationId: sinon.stub(),
        get: sinon.stub(),
      };

      const knowledgeState = domainBuilder.buildKnowledgeState.forSkills({
        validatedSkillIds: [firstSkillId, secondSkillId],
        competenceId,
      });
      knowledgeStateRepository.findByUserId.withArgs({ userId }).resolves(knowledgeState);
    });

    context('when competence evaluation exists', function () {
      beforeEach(async function () {
        // when
        const shouldResetCompetenceEvaluation = true;

        competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId
          .withArgs({
            userId,
            competenceId,
            status: CompetenceEvaluation.statuses.RESET,
          })
          .resolves(updatedCompetenceEvaluation);

        await scorecardService.resetScorecard({
          userId,
          competenceId,
          shouldResetCompetenceEvaluation,
          assessmentRepository,
          knowledgeStateRepository,
          competenceEvaluationRepository,
          campaignParticipationRepository,
        });
      });

      // then
      it('should forget the competence, erasing its state', async function () {
        expect(knowledgeStateRepository.forgetCompetence).to.have.been.calledWithExactly({ userId, competenceId });
      });

      it('should reset the competence evaluation', async function () {
        expect(
          competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId.calledWithExactly({
            competenceId,
            userId,
            status: CompetenceEvaluation.statuses.RESET,
          }),
        ).true;
      });
    });

    context(
      'when competence evaluation does not exists - there is only knowledge acquired thanks to campaign',
      function () {
        it('should forget the competence without touching the competence evaluation', async function () {
          // given
          const shouldResetCompetenceEvaluation = false;

          // when
          await scorecardService.resetScorecard({
            userId,
            competenceId,
            shouldResetCompetenceEvaluation,
            assessmentRepository,
            knowledgeStateRepository,
            competenceEvaluationRepository,
            campaignParticipationRepository,
          });
          // then
          expect(knowledgeStateRepository.forgetCompetence).to.have.been.calledWithExactly({ userId, competenceId });
          expect(competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId.called).false;
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
        const targetProfile = domainBuilder.buildTargetProfile({
          skills: [domainBuilder.buildSkill({ id: firstSkillId }, domainBuilder.buildSkill({ id: secondSkillId }))],
        });
        campaign = domainBuilder.buildCampaign.ofTypeAssessment({
          targetProfileId: targetProfile.id,
          targetProfile,
        });
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

        // when
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

        campaignRepository.findSkillIdsByCampaignParticipationId
          .withArgs({ campaignParticipationId: campaignParticipation1.id })
          .resolves(['recbarbe', 'recbouc']);
        campaignRepository.findSkillIdsByCampaignParticipationId
          .withArgs({ campaignParticipationId: campaignParticipation2.id })
          .resolves(['recbarbe', 'recbouc']);
      });

      it('should not throws when a campaign assessment has been unlink with its participation', async function () {
        const anonymizedAssessment = domainBuilder.buildAssessment.ofTypeCampaign({
          id: 98765,
          state: 'started',
          userId,
        });
        anonymizedAssessment.campaignParticipationId = null;

        assessmentRepository.findNotAbortedCampaignAssessmentsByUserId
          .withArgs(userId)
          .resolves([anonymizedAssessment]);

        // when
        // then
        await expect(
          scorecardService.resetScorecard({
            userId,
            competenceId,
            shouldResetCompetenceEvaluation,
            assessmentRepository,
            knowledgeStateRepository,
            campaignParticipationRepository,
            competenceEvaluationRepository,
            campaignRepository,
          }),
        ).not.to.be.rejected;
      });

      it('should save a new Assessment', async function () {
        campaignRepository.findSkillIdsByCampaignParticipationId
          .withArgs({ campaignParticipationId: campaignParticipation1.id })
          .resolves([firstSkillId, secondSkillId]);
        campaignRepository.findSkillIdsByCampaignParticipationId
          .withArgs({ campaignParticipationId: campaignParticipation2.id })
          .resolves([firstSkillId, secondSkillId]);
        campaignRepository.get.resolves(domainBuilder.buildCampaign());

        // when
        await scorecardService.resetScorecard({
          userId,
          competenceId,
          shouldResetCompetenceEvaluation,
          assessmentRepository,
          knowledgeStateRepository,
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
          await scorecardService.resetScorecard({
            userId,
            competenceId,
            shouldResetCompetenceEvaluation,
            assessmentRepository,
            knowledgeStateRepository,
            campaignParticipationRepository,
            competenceEvaluationRepository,
            campaignRepository,
          });
          //then
          expect(campaignParticipationRepository.get.called).true;
          expect(campaignRepository.findSkillIdsByCampaignParticipationId.called).true;

          expect(campaignRepository.get.called).false;
          expect(assessmentRepository.abortByAssessmentId.called).false;
          expect(assessmentRepository.save.called).false;
        });
      });

      context("when doesn 't intersection between target skills and reset skills", function () {
        it('should return null for campaign participation', async function () {
          //given : l'état de la compétence porte d'autres acquis que ceux de la campagne
          const knowledgeState = domainBuilder.buildKnowledgeState.forSkills({
            validatedSkillIds: ['recAloevera', 'recDing'],
            competenceId,
          });
          knowledgeStateRepository.findByUserId.withArgs({ userId }).resolves(knowledgeState);

          //when
          await scorecardService.resetScorecard({
            userId,
            competenceId,
            shouldResetCompetenceEvaluation,
            assessmentRepository,
            knowledgeStateRepository,
            campaignParticipationRepository,
            competenceEvaluationRepository,
            campaignRepository,
          });

          //then
          expect(campaignParticipationRepository.get.called).true;
          expect(campaignRepository.findSkillIdsByCampaignParticipationId.called).true;

          expect(campaignRepository.get.called).false;
          expect(assessmentRepository.abortByAssessmentId.called).false;
          expect(assessmentRepository.save.called).false;
        });
      });
    });

    context('when campaign does not exists', function () {
      beforeEach(async function () {
        // when
        const shouldResetCompetenceEvaluation = false;

        assessmentRepository.findNotAbortedCampaignAssessmentsByUserId.withArgs(userId).resolves(null);

        await scorecardService.resetScorecard({
          userId,
          competenceId,
          shouldResetCompetenceEvaluation,
          assessmentRepository,
          knowledgeStateRepository,
          competenceEvaluationRepository,
          campaignRepository,
        });
      });

      // then
      it('should forget the competence', async function () {
        expect(knowledgeStateRepository.forgetCompetence).to.have.been.calledWithExactly({ userId, competenceId });
      });

      it('should not save another assessment', async function () {
        expect(campaignParticipationRepository.get.called).false;
        expect(campaignRepository.findSkillIdsByCampaignParticipationId.called).false;

        expect(campaignRepository.get.called).false;
        expect(assessmentRepository.abortByAssessmentId.called).false;
        expect(assessmentRepository.save.called).false;
      });
    });
  });

  describe('#computeLevelUpInformation', function () {
    const userId = 789;
    let area, answer, competence, competenceEvaluationForCompetence;

    const stateWithPix = (pixValues) =>
      domainBuilder.buildKnowledgeState({
        tubes: pixValues.map((_, index) => ({ tubeId: `tube${index}`, floor: 1, directLevels: [1] })),
        skills: pixValues.map((pixValue, index) =>
          domainBuilder.buildSkill({ id: `skill${index}`, tubeId: `tube${index}`, difficulty: 1, pixValue }),
        ),
      });

    beforeEach(function () {
      area = domainBuilder.buildArea({ id: 'areaABC123' });
      competence = domainBuilder.buildCompetence({
        id: 'competenceABC123',
        name: 'Nom de ma competence pour le levelup',
      });
      answer = domainBuilder.buildAnswer({ id: 777 });
      competenceEvaluationForCompetence = domainBuilder.buildCompetenceEvaluation({
        id: 555,
        status: CompetenceEvaluation.statuses.STARTED,
      });
    });

    it('should return a levelup information when a level up has occurred', function () {
      // when
      const levelupInformation = scorecardService.computeLevelUpInformation({
        answer,
        userId,
        area,
        competence,
        competenceEvaluationForCompetence,
        knowledgeStateForCompetenceBefore: stateWithPix([1]),
        knowledgeStateForCompetenceAfter: stateWithPix([1, 10]),
      });

      // then
      expect(levelupInformation).to.deep.equal({
        id: answer.id,
        competenceName: 'Nom de ma competence pour le levelup',
        level: 1,
      });
    });

    it('should return an empty object when no level up has occurred', function () {
      // when
      const levelupInformation = scorecardService.computeLevelUpInformation({
        answer,
        userId,
        area,
        competence,
        competenceEvaluationForCompetence,
        knowledgeStateForCompetenceBefore: stateWithPix([1]),
        knowledgeStateForCompetenceAfter: stateWithPix([1, 1]),
      });

      // then
      expect(levelupInformation).to.deep.equal({});
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
