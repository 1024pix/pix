import { expect, sinon, domainBuilder, catchErr } from '../../../../test-helper.js';
import { getProgression } from '../../../../../src/evaluation/domain/usecases/get-progression.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';

describe('Unit | Domain | Use Cases | get-progression', function () {
  const assessmentId = 1234;
  const progressionId = `progression-${assessmentId}`;
  const userId = 9874;

  let campaignParticipationRepository;
  let campaignRepository;
  let knowledgeElementRepository;
  let assessmentRepository;
  let competenceEvaluationRepository;
  let skillRepository;
  let improvementService;

  beforeEach(function () {
    campaignParticipationRepository = { get: sinon.stub(), isRetrying: sinon.stub() };
    campaignRepository = { findSkillIds: sinon.stub() };
    knowledgeElementRepository = { findUniqByUserId: sinon.stub().resolves([]) };
    assessmentRepository = { getByAssessmentIdAndUserId: sinon.stub() };
    competenceEvaluationRepository = { getByAssessmentId: sinon.stub() };
    skillRepository = { findActiveByCompetenceId: sinon.stub() };
    improvementService = { filterKnowledgeElementsIfImproving: sinon.stub() };
  });

  describe('#getProgression', function () {
    let assessment, campaignParticipation, skillIds, targetProfile;

    context('when the assessment exists and is campaign', function () {
      beforeEach(function () {
        targetProfile = domainBuilder.buildTargetProfile();
        assessment = domainBuilder.buildAssessment({
          id: assessmentId,
          userId,
          state: 'completed',
          type: Assessment.types.CAMPAIGN,
          campaignParticipationId: 456,
        });
        skillIds = [domainBuilder.buildSkill().id];
        const campaign = domainBuilder.buildCampaign({ id: 123, targetProfile });
        campaignParticipation = domainBuilder.buildCampaignParticipation({
          id: assessment.campaignParticipationId,
          campaign,
        });

        assessmentRepository.getByAssessmentIdAndUserId.withArgs(assessment.id, userId).resolves(assessment);
        campaignParticipationRepository.get
          .withArgs(assessment.campaignParticipationId)
          .resolves(campaignParticipation);
        campaignRepository.findSkillIds.withArgs({ campaignId: campaignParticipation.campaignId }).resolves(skillIds);
      });

      it('should return the progression associated to the assessment', async function () {
        // given
        const expectedProgression = domainBuilder.buildProgression({
          id: progressionId,
          skillIds,
          knowledgeElements: [],
          isProfileCompleted: assessment.isCompleted(),
        });

        // when
        const progression = await getProgression({
          userId,
          progressionId,
          assessmentRepository,
          campaignParticipationRepository,
          competenceEvaluationRepository,
          knowledgeElementRepository,
          skillRepository,
          campaignRepository,
          improvementService,
        });

        // then
        expect(progression).to.deep.equal(expectedProgression);
      });

      context('when the assessment is improving', function () {
        let knowledgeElements, knowledgeElementsFiltered;
        beforeEach(function () {
          assessment.state = 'improving';
          knowledgeElements = [domainBuilder.buildKnowledgeElement(), domainBuilder.buildKnowledgeElement()];
          knowledgeElementsFiltered = [knowledgeElements[0]];
          knowledgeElementRepository.findUniqByUserId.resolves(knowledgeElements);
          campaignParticipationRepository.isRetrying
            .withArgs({ campaignParticipationId: assessment.campaignParticipationId })
            .resolves(false);
        });

        it('should filter the knowledge elements', async function () {
          // when
          await getProgression({
            userId,
            progressionId,
            assessmentRepository,
            campaignParticipationRepository,
            competenceEvaluationRepository,
            knowledgeElementRepository,
            skillRepository,
            campaignRepository,
            improvementService,
          });

          // then
          expect(improvementService.filterKnowledgeElementsIfImproving).to.have.been.calledWithExactly({
            knowledgeElements,
            assessment,
            isRetrying: false,
          });
        });

        it('should return the progression associated to the assessment', async function () {
          // given
          improvementService.filterKnowledgeElementsIfImproving
            .withArgs({ knowledgeElements, assessment, isRetrying: false })
            .returns(knowledgeElementsFiltered);
          const expectedProgression = domainBuilder.buildProgression({
            id: progressionId,
            skillIds,
            knowledgeElements: knowledgeElementsFiltered,
            isProfileCompleted: assessment.isCompleted(),
          });

          // when
          const progression = await getProgression({
            userId,
            progressionId,
            assessmentRepository,
            campaignParticipationRepository,
            competenceEvaluationRepository,
            knowledgeElementRepository,
            skillRepository,
            campaignRepository,
            improvementService,
          });

          // then
          expect(progression).to.deep.equal(expectedProgression);
        });
      });

      context('when the assessment is improving because user is retrying campaign participation', function () {
        let knowledgeElements, knowledgeElementsFiltered;
        beforeEach(function () {
          assessment.state = 'improving';
          knowledgeElements = [domainBuilder.buildKnowledgeElement(), domainBuilder.buildKnowledgeElement()];
          knowledgeElementsFiltered = [knowledgeElements[0]];
          knowledgeElementRepository.findUniqByUserId.resolves(knowledgeElements);
          campaignParticipationRepository.isRetrying
            .withArgs({ campaignParticipationId: assessment.campaignParticipationId })
            .resolves(true);
        });

        it('should filter the knowledge elements', async function () {
          // when
          await getProgression({
            userId,
            progressionId,
            assessmentRepository,
            campaignParticipationRepository,
            competenceEvaluationRepository,
            knowledgeElementRepository,
            skillRepository,
            campaignRepository,
            improvementService,
          });

          // then
          expect(improvementService.filterKnowledgeElementsIfImproving).to.have.been.calledWithExactly({
            knowledgeElements,
            assessment,
            isRetrying: true,
          });
        });

        it('should return the progression associated to the assessment', async function () {
          // given
          improvementService.filterKnowledgeElementsIfImproving
            .withArgs({ knowledgeElements, assessment, isRetrying: true })
            .returns(knowledgeElementsFiltered);

          const expectedProgression = domainBuilder.buildProgression({
            id: progressionId,
            skillIds,
            knowledgeElements: knowledgeElementsFiltered,
            isProfileCompleted: assessment.isCompleted(),
          });

          // when
          const progression = await getProgression({
            userId,
            progressionId,
            assessmentRepository,
            campaignParticipationRepository,
            competenceEvaluationRepository,
            knowledgeElementRepository,
            skillRepository,
            campaignRepository,
            improvementService,
          });

          // then
          expect(progression).to.deep.equal(expectedProgression);
        });
      });

      context("campaign's method is flash", function () {
        let flashAssessment;
        beforeEach(function () {
          flashAssessment = domainBuilder.buildAssessment.ofTypeCampaign({
            userId,
            targetProfile: null,
            method: 'FLASH',
            campaignParticipationId: campaignParticipation.id,
          });

          assessmentRepository.getByAssessmentIdAndUserId
            .withArgs(flashAssessment.id, userId)
            .resolves(flashAssessment);
          campaignParticipationRepository.get
            .withArgs(flashAssessment.campaignParticipationId)
            .resolves(campaignParticipation);
        });

        it('should return the progression associated to the flash assessment', async function () {
          // given
          const flashProgressionId = `progression-${flashAssessment.id}`;
          const expectedProgression = domainBuilder.buildProgression({
            id: flashProgressionId,
            skillIds: [],
            knowledgeElements: [],
            isProfileCompleted: assessment.isCompleted(),
          });

          // when
          const progression = await getProgression({
            userId,
            progressionId: flashProgressionId,
            assessmentRepository,
            campaignParticipationRepository,
            competenceEvaluationRepository,
            knowledgeElementRepository,
            skillRepository,
            campaignRepository,
            improvementService,
          });

          // then
          expect(progression).to.deep.equal(expectedProgression);
        });
      });
    });

    context('when the assessment exists and is competence evaluation', function () {
      let competenceEvaluationAssessment, competenceEvaluation, competenceSkills;

      beforeEach(function () {
        competenceEvaluationAssessment = domainBuilder.buildAssessment({
          id: assessmentId,
          userId,
          type: Assessment.types.COMPETENCE_EVALUATION,
        });
        competenceEvaluation = domainBuilder.buildCompetenceEvaluation({
          competenceId: 1,
          assessmentId,
          userId,
        });
        competenceSkills = [domainBuilder.buildSkill()];

        assessmentRepository.getByAssessmentIdAndUserId.resolves(competenceEvaluationAssessment);
        competenceEvaluationRepository.getByAssessmentId.resolves(competenceEvaluation);
        skillRepository.findActiveByCompetenceId.resolves(competenceSkills);
        improvementService.filterKnowledgeElementsIfImproving
          .withArgs({ knowledgeElements: [], assessment: competenceEvaluationAssessment })
          .returns([]);
      });

      it('should load the right assessment', async function () {
        // when
        await getProgression({
          userId,
          progressionId,
          assessmentRepository,
          campaignParticipationRepository,
          competenceEvaluationRepository,
          knowledgeElementRepository,
          skillRepository,
          campaignRepository,
          improvementService,
        });

        // then
        expect(competenceEvaluationRepository.getByAssessmentId).to.have.been.calledWithExactly(assessmentId);
      });

      it('should return the progression associated to the assessment', async function () {
        // given
        const expectedProgression = domainBuilder.buildProgression({
          id: progressionId,
          skillIds: competenceSkills.map((skill) => skill.id),
          knowledgeElements: [],
          isProfileCompleted: competenceEvaluationAssessment.isCompleted(),
        });

        // when
        const progression = await getProgression({
          userId,
          progressionId,
          assessmentRepository,
          campaignParticipationRepository,
          competenceEvaluationRepository,
          knowledgeElementRepository,
          skillRepository,
          campaignRepository,
          improvementService,
        });

        // then
        expect(progression).to.deep.equal(expectedProgression);
      });

      context('when the assessment is improving', function () {
        let knowledgeElements, knowledgeElementsFiltered;

        beforeEach(function () {
          competenceEvaluationAssessment.state = 'improving';
          knowledgeElements = [domainBuilder.buildKnowledgeElement(), domainBuilder.buildKnowledgeElement()];
          knowledgeElementsFiltered = [knowledgeElements[0]];
          knowledgeElementRepository.findUniqByUserId.resolves(knowledgeElements);

          improvementService.filterKnowledgeElementsIfImproving
            .withArgs({ knowledgeElements, assessment: competenceEvaluationAssessment })
            .returns(knowledgeElementsFiltered);
        });

        it('should filter the knowledge elements', async function () {
          // when
          await getProgression({
            userId,
            progressionId,
            assessmentRepository,
            campaignParticipationRepository,
            competenceEvaluationRepository,
            knowledgeElementRepository,
            skillRepository,
            campaignRepository,
            improvementService,
          });

          // then
          expect(improvementService.filterKnowledgeElementsIfImproving).to.have.been.calledWithExactly({
            knowledgeElements,
            assessment: competenceEvaluationAssessment,
          });
        });

        it('should return the progression associated to the assessment', async function () {
          // given
          const expectedProgression = domainBuilder.buildProgression({
            id: progressionId,
            skillIds: competenceSkills.map((skill) => skill.id),
            knowledgeElements: knowledgeElementsFiltered,
            isProfileCompleted: competenceEvaluationAssessment.isCompleted(),
          });

          // when
          const progression = await getProgression({
            userId,
            progressionId,
            assessmentRepository,
            campaignParticipationRepository,
            competenceEvaluationRepository,
            knowledgeElementRepository,
            skillRepository,
            campaignRepository,
            improvementService,
          });

          // then
          expect(progression).to.deep.equal(expectedProgression);
        });
      });
    });

    context('when the assessment does not exist', function () {
      it('should transfer the errors', async function () {
        // given
        assessmentRepository.getByAssessmentIdAndUserId.rejects(new NotFoundError('No found Assessment for ID 1234'));

        // when
        const error = await catchErr(getProgression)({
          userId,
          progressionId,
          assessmentRepository,
          campaignParticipationRepository,
          competenceEvaluationRepository,
          knowledgeElementRepository,
          skillRepository,
          campaignRepository,
          improvementService,
        });

        // then
        return expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });
});
